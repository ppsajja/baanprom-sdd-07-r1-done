"""AC-07-19 จาก booking.feature v1.5 (CR-10, Q-26 ปิดใน EV-048) ราคาประเมินและยอดมัดจำมาจากตารางเดียวกัน"""
import pytest

from app import config


# รองรับ AC-07-19 (REQ-FN-057, REQ-BR-002)
@pytest.mark.parametrize("category,estimate,deposit", [("ประปา", 700, 350), ("ไฟฟ้า", 800, 400), ("แอร์", 1000, 500)],
                         ids=["plumbing-700", "electric-800", "aircon-1000"])
def test_AC_07_19_estimate_and_deposit_from_same_table(client, db, seed, category, estimate, deposit):
    # Given ลูกค้าเลือกประเภทงาน <ประเภทงาน> และล็อกช่วงเวลาไว้
    # When ระบบแสดงหน้ายืนยัน (หน้าจอขอยอดจาก GET /deposit-quote)
    r = client.get(f"/deposit-quote?category={category}")
    # Then หน้ายืนยันแสดงราคาประเมิน <ราคาประเมิน> บาท พร้อมข้อความว่ายังไม่รวมค่าอะไหล่
    assert r.status_code == 200
    body = r.json()
    assert body["estimate_amount"] == estimate
    assert "ยังไม่รวมค่าอะไหล่" in body["estimate_note"]
    # Then ยอดมัดจำ <มัดจำ> บาท เท่ากับ 50 ใน 100 ของราคาประเมิน ปัดขึ้นหลักสิบ
    assert body["deposit_amount"] == deposit
    assert body["deposit_amount"] == -(-(estimate * config.DEPOSIT_PER_100_OF_ESTIMATE) // 1000) * 10
