"""ทดสอบโหลดเต็มรูปสำหรับการตรวจรับ R1 (เงื่อนไข ค3 ใน docs/acceptance/acceptance-record-r1.md) ไม่ใช่ส่วนของระบบ
AC-07-08 (REQ-QA-003 ฉบับ CR-02): ลูกค้า 500 คนส่ง GET /technicians พร้อมกัน ทุกคำขอได้รายการช่างครบ 95 ใน 100 ไม่เกิน 2 วินาที
AC-09-12: ช่าง 50 คนกดสถานะพร้อมกัน p95 ไม่เกิน 1 วินาที | AC-08-09: ลูกค้า 50 คนยกเลิกพร้อมกัน p95 ไม่เกิน 2 วินาที (ไม่รวมเวลารอ gateway)
เวลาวัดที่ฝั่งผู้ยิงโหลด (Q-24) ตั้งแต่ส่งคำขอจนได้คำตอบครบ ใช้ asyncio กับ httpx ที่มีอยู่แล้วใน requirements.txt (ทีมเลือกเอง แทน locust หรือ k6)
ใช้: python load_test.py --base http://127.0.0.1:8000 [--users 500] [--rounds 3] [--small 50] (--small 0 วัดเฉพาะการค้นหา)
ข้อมูลต้องมาจาก uat_seed.py บนฐานข้อมูลของเครื่องทดสอบ สคริปต์สร้างงานที่ต้องใช้เองผ่าน API"""
import argparse
import asyncio
import statistics
import time

import httpx

CAT = "ประปา"


def pct(values: list[float], p: float) -> float:
    s = sorted(values)
    k = max(0, min(len(s) - 1, int(round(p / 100 * len(s) + 0.5)) - 1))
    return s[k]


def summary(name: str, times: list[float], oks: list[bool], limit: float, need_per_100: int) -> dict:
    within = sum(1 for t, ok in zip(times, oks) if ok and t <= limit)
    res = {"name": name, "n": len(times), "ok": sum(oks), "p50": statistics.median(times), "p95": pct(times, 95),
           "max": max(times), "within": within, "limit": limit,
           "pass": sum(oks) == len(oks) and within * 100 >= need_per_100 * len(times)}
    print(f"{name}: คำขอ {res['n']} สำเร็จ {res['ok']} p50 {res['p50']:.3f} s p95 {res['p95']:.3f} s "
          f"สูงสุด {res['max']:.3f} s ไม่เกิน {limit:g} s {within} จาก {res['n']} "
          f"เกณฑ์ {need_per_100} ใน 100 ผล {'ผ่าน' if res['pass'] else 'ไม่ผ่าน'}", flush=True)
    return res


async def timed(client: httpx.AsyncClient, method: str, url: str, **kw) -> tuple[float, httpx.Response | None]:
    t0 = time.perf_counter()
    try:
        r = await client.request(method, url, **kw)
    except httpx.HTTPError:
        return time.perf_counter() - t0, None
    return time.perf_counter() - t0, r


async def search_round(base: str, users: int) -> dict:
    limits = httpx.Limits(max_connections=users, max_keepalive_connections=users)
    async with httpx.AsyncClient(base_url=base, timeout=60, limits=limits) as c:
        reqs = [timed(c, "GET", "/technicians", params={"category": CAT, "address_id": i % 30 + 1, "customer_id": i % 30 + 1})
                for i in range(users)]
        out = await asyncio.gather(*reqs)
    oks = [r is not None and r.status_code == 200 and isinstance(r.json(), list) and len(r.json()) > 0 for _, r in out]
    return summary(f"AC-07-08 ค้นหาพร้อมกัน {users} คน", [t for t, _ in out], oks, 2.0, 95)


def make_jobs(base: str, n: int, start_customer: int) -> list[dict]:
    """สร้างงานยืนยันแล้ว n งานผ่าน API (ทีละงาน ไม่นับเวลา) คืน job_id และ technician_id"""
    jobs = []
    with httpx.Client(base_url=base, timeout=30) as c:
        cust = start_customer
        while len(jobs) < n:
            cid = cust % 30 + 1
            cust += 1
            techs = c.get("/technicians", params={"category": CAT, "address_id": cid, "customer_id": cid}).json()
            slots = [s["slot_id"] for t in techs for s in t["slots"]]
            if not slots:
                raise SystemExit("ช่วงเวลาว่างไม่พอ ให้รัน uat_seed.py ใหม่บนฐานว่าง")
            r = c.post("/bookings", json={"customer_id": cid, "slot_id": slots[-1], "address_id": cid, "category": CAT})
            if r.status_code == 201:
                jobs.append({"job_id": r.json()["job_id"], "technician_id": r.json()["technician_id"], "customer_id": cid})
    return jobs


async def status_round(base: str, jobs: list[dict]) -> dict:
    async with httpx.AsyncClient(base_url=base, timeout=60) as c:
        out = await asyncio.gather(*[timed(c, "POST", f"/jobs/{j['job_id']}/status",
                                           json={"technician_id": j["technician_id"], "to_status": "en_route"}) for j in jobs])
    oks = [r is not None and r.status_code == 200 for _, r in out]
    return summary(f"AC-09-12 ช่างกดสถานะพร้อมกัน {len(jobs)} งาน", [t for t, _ in out], oks, 1.0, 95)


async def cancel_round(base: str, jobs: list[dict]) -> dict:
    async with httpx.AsyncClient(base_url=base, timeout=60) as c:
        out = await asyncio.gather(*[timed(c, "POST", f"/jobs/{j['job_id']}/customer-cancel",
                                           json={"customer_id": j["customer_id"]}) for j in jobs])
    oks = [r is not None and r.status_code == 200 for _, r in out]
    return summary(f"AC-08-09 ลูกค้ายกเลิกพร้อมกัน {len(jobs)} งาน", [t for t, _ in out], oks, 2.0, 95)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="http://127.0.0.1:8000")
    ap.add_argument("--users", type=int, default=500)
    ap.add_argument("--rounds", type=int, default=3)
    ap.add_argument("--small", type=int, default=50)
    a = ap.parse_args()
    results = []
    with httpx.Client(base_url=a.base, timeout=30) as c:  # อุ่นเครื่อง 1 คำขอ ไม่นับ
        c.get("/technicians", params={"category": CAT, "address_id": 1, "customer_id": 1})
    for i in range(a.rounds):
        print(f"รอบที่ {i + 1}", flush=True)
        results.append(asyncio.run(search_round(a.base, a.users)))
    if a.small > 0:  # --small 0 วัดเฉพาะการค้นหา (ใช้หาจำนวนคนสูงสุดที่ยังผ่านเกณฑ์)
        jobs = make_jobs(a.base, 2 * a.small, 0)
        results.append(asyncio.run(status_round(a.base, jobs[:a.small])))
        results.append(asyncio.run(cancel_round(a.base, jobs[a.small:])))
    ok = all(r["pass"] for r in results)
    print(f"สรุป: {'ผ่านทุกข้อ' if ok else 'มีข้อไม่ผ่าน'}", flush=True)
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
