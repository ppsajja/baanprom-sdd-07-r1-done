"""AC-09-15 จาก job-status.feature v1.2 (CR-10, Q-31 ปิดใน EV-048) งานเสร็จสิ้นเมื่อช่างปิดงาน ไม่มีขั้นลูกค้ายืนยัน"""
from app import config
from app.db.models import set_status
from app.notify.queue import queue
from tests.conftest import NOW
from tests.test_job_status import confirmed_job, change


# รองรับ AC-09-15 (REQ-FN-051, REQ-FN-053 ฉบับ CR-10)
def test_AC_09_15_done_without_customer_confirm_and_message_tells_how_to_report(client, db, seed):
    # Given งานหมายเลข 1 สถานะ "กำลังดำเนินงาน"
    job = confirmed_job(client, db, seed)
    set_status(db, job, "in_progress", NOW); db.commit()
    queue.clear()
    # When ช่าง "ประสิทธิ์" กด "ปิดงาน"
    r = change(client, job.id, seed["prasit"].id, "done")
    # Then งานหมายเลข 1 มีสถานะ "เสร็จสิ้น" ทันที โดยไม่มีขั้นลูกค้ายืนยัน
    assert r.status_code == 200
    db.refresh(job); assert job.status == "done"
    # Then ลูกค้าได้ข้อความที่บอกว่าแจ้ง call center ได้ภายใน 7 วันถ้างานยังไม่เรียบร้อย
    msgs = [m for m in queue.items if m.to_role == "customer"]
    assert len(msgs) == 1 and "เสร็จสิ้น" in msgs[0].text
    assert "call center" in msgs[0].text and f"ภายใน {config.JOB_ISSUE_REPORT_DAYS} วัน" in msgs[0].text
    assert seed["somchai"].phone not in msgs[0].text
