"""AC-08-11 และ AC-08-12 จาก cancel-refund.feature v1.2 (CR-10 อนุมัติ EV-048)
AC-08-11: gateway ปฏิเสธคำขอคืนเงิน (Q-34) | AC-08-12: ยกเลิกขณะช่างกำลังเดินทาง หักค่าเดินทาง (Q-14, BR-01 R3 รุ่น 1.1)"""
from datetime import timedelta

from sqlalchemy import select

from app import config
from app.db.models import Job, Refund, TimeSlot, set_status, SLOT_FREE
from app.notify.queue import queue
from tests.conftest import NOW
from tests.test_cancel import confirmed_job, quote, cancel


# รองรับ AC-08-11 (REQ-IF-010 ฉบับ CR-10)
def test_AC_08_11_gateway_declines_refund_no_retry_finance_follow_up(client, db, seed, gateway):
    # Given งานมัดจำ 350 บาท สถานะ "ยืนยันแล้ว" นัดอีก 48 ชั่วโมง และ Payment Gateway จะปฏิเสธคำขอคืนเงิน
    job = confirmed_job(client, db, seed)
    gateway.refund_mode = "declined"
    now = job.scheduled_start - timedelta(hours=48)
    queue.clear()
    # When ลูกค้า "สมชาย" ยืนยันยกเลิก
    r = cancel(client, job.id, seed["somchai"].id, now)
    # Then งานเป็น "ยกเลิก" ช่วงเวลากลับเป็น "ว่าง" (ไม่ย้อนการยกเลิก)
    assert r.status_code == 200, r.text
    db.refresh(job)
    assert job.status == "cancelled" and db.get(TimeSlot, job.slot_id).state == SLOT_FREE
    # Then รายการคืนเงินบันทึกผล "declined" พร้อม reference เดิม และระบบไม่ส่งคำขอคืนเงินซ้ำเอง
    refunds = db.scalars(select(Refund).where(Refund.job_id == job.id)).all()
    assert len(refunds) == 1 and refunds[0].result == "declined" and refunds[0].gateway_ref
    assert len([c for c in gateway.calls if c.startswith("refund:")]) == 1
    # Then หน้าผลการยกเลิกและข้อความถึงลูกค้าไม่บอกว่าคืนแล้ว แต่บอกว่าเจ้าหน้าที่จะติดต่อภายใน 1 วันทำการ
    assert r.json()["refund_result"] == "declined"
    assert f"{config.REFUND_FOLLOWUP_BUSINESS_DAYS} วันทำการ" in r.json()["refund_message"]
    texts = [m.text for m in queue.items if m.to_role == "customer"]
    assert texts and all("คืนมัดจำ" not in t for t in texts) and any("ตรวจสอบเพิ่ม" in t for t in texts)
    # Then รายการนี้อยู่ในรายการที่ Finance ต้องปิด (GET /ops/refunds/follow-up) โดยไม่มีข้อมูลส่วนบุคคล
    rows = client.get("/ops/refunds/follow-up").json()
    assert [(x["job_id"], x["result"], x["amount"]) for x in rows] == [(job.id, "declined", 350)]
    assert "phone" not in str(rows) and seed["somchai"].phone not in str(rows)


# รองรับ AC-08-12 (REQ-BR-001, REQ-FN-054, REQ-FN-055 ฉบับ CR-10)
def test_AC_08_12_cancel_while_en_route_deducts_travel_fee(client, db, seed, gateway):
    # Given งานมัดจำ 350 บาท สถานะ "ช่างกำลังเดินทาง" นัดอีก 1 ชั่วโมง
    job = confirmed_job(client, db, seed)
    set_status(db, job, "en_route", NOW); db.commit()
    now = job.scheduled_start - timedelta(hours=1)
    queue.clear()
    # When ลูกค้า "สมชาย" เปิดหน้ายกเลิก
    q = quote(client, job.id, seed["somchai"].id, now).json()
    # Then เห็นยอดคืน 250 บาท ตามแถว R3 พร้อมเหตุที่หักค่าเดินทางของช่าง และกดยกเลิกได้
    assert q["allowed"] is True and q["rule"] == "R3" and q["refund_amount"] == 250
    assert f"ค่าเดินทางของช่าง {config.TRAVEL_FEE_BAHT} บาท" in q["note"]
    # When ลูกค้ายืนยันยกเลิก
    r = cancel(client, job.id, seed["somchai"].id, now)
    # Then งานเป็น "ยกเลิก" คำขอคืนเงิน 250 บาทส่งผ่าน gateway ด้วย reference เดิม ครั้งเดียว
    assert r.status_code == 200 and r.json()["refund_amount"] == 250
    db.refresh(job); assert job.status == "cancelled"
    assert [c for c in gateway.calls if c.startswith("refund:")] == [f"refund:{db.scalar(select(Refund.gateway_ref).where(Refund.job_id == job.id))}:250"]
    # Then ช่างได้ข้อความว่าลูกค้ายกเลิกระหว่างเดินทาง และได้ค่าเดินทางผ่าน Finance ภายใน 60 วินาที
    tech = [m for m in queue.items if m.to_role == "technician"]
    assert len(tech) == 1 and "ระหว่างที่คุณกำลังเดินทาง" in tech[0].text
    assert tech[0].due_at <= now + timedelta(seconds=config.NOTIFY_WITHIN_SECONDS)
