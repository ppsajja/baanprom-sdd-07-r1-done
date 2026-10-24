"""DEF-02 (ตรวจรับ R1 รอบแรก OAT-6, GAP-37): AC-00-03 ต้องเป็นจริงบนระบบที่รัน ไม่ใช่เฉพาะใน pytest
เดิม log_event ใช้ logger.info แต่แอปไม่ได้ตั้งค่า logging ตอนรันจริง Python จึงทิ้งทุกบรรทัด test เดิมผ่านเพราะ caplog จับได้เอง
test นี้สร้างแอปในโหมด production แล้วตรวจว่า log ของแอปออก stdout เป็น JSON บรรทัดละเหตุการณ์ และไม่มีข้อมูลส่วนบุคคล"""
import json
import logging

from app.privacy import get_logger, log_event


# รองรับ AC-00-03 (REQ-OP-005 บรรทัดที่ 3, REQ-PRV-002) บนแอปที่สร้างแบบระบบจริง
def test_AC_00_03_production_app_writes_structured_log_to_stdout(monkeypatch, capsys):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("OPS_TOKEN", "t")
    from app.main import create_app
    create_app()
    # When โค้ดของแอปเขียนเหตุการณ์ 1 รายการ พร้อมช่องที่ไม่อยู่ในรายการอนุญาต
    log_event(get_logger("app.booking.router"), "booking_created", job_id=7, customer_id=3, phone="081-234-5678")
    out = [ln for ln in capsys.readouterr().out.splitlines() if ln.strip()]
    # Then มีบรรทัดออก stdout 1 บรรทัดเป็น JSON มีช่องที่อนุญาต และไม่มีเบอร์
    rows = [json.loads(ln) for ln in out if ln.startswith("{")]
    assert [r["event"] for r in rows] == ["booking_created"]
    assert rows[0]["job_id"] == 7 and "phone" not in rows[0] and "081-234-5678" not in out[0]
    assert logging.getLogger("app").getEffectiveLevel() <= logging.INFO
