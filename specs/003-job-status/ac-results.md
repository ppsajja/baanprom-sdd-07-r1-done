# ตารางผล AC หลังรัน test ทั้งชุด (specs/003-job-status/test-run.txt)

รอบที่ 1 รันวันที่ 18 ต.ค. 2569 หลัง /implement T-01 ถึง T-06 (ก่อนแก้ GAP-18) รอบที่ 2 รันหลังแก้ GAP-18 และยืนยันจาก export สะอาด (git archive) บน Python 3.11 และ 3.12
คำสั่ง: cd backend && pytest -v -k "AC_" | cd frontend && npm test (รันทั้งโครงการ รวม test ของ 002-booking และ 004-cancel-refund)
สถานะที่ใช้: ผ่าน | ไม่ผ่าน | ยังไม่มี test | รอ Q-xx

## รอบที่ 1 (18 ต.ค. 2569 รันทั้งชุดครั้งแรกหลัง /implement)

รันทั้งชุดเพื่อดูสองอย่าง: AC ใหม่ผ่านไหม และ AC ของ 002-booking ที่เคยผ่านยังผ่านอยู่ไหม (เพราะ T-05 แตะ BookingResult.jsx และ App.jsx ของ 002)

| AC หรือ UI | REQ ที่พิสูจน์ | test | task | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| AC-09-01 | REQ-FN-050 | test_AC_09_01_technician_sees_only_own_jobs | T-02 | ผ่าน | |
| AC-09-02 | REQ-FN-051, REQ-DAT-002 | test_AC_09_02_en_route_recorded | T-03 | ผ่าน | |
| AC-09-02 (หน้าจอ) | REQ-FN-051 | AC-09-02.test.jsx | T-05 | ผ่าน | |
| AC-09-03, AC-09-04 | REQ-FN-051 | test_AC_09_03_check_in_then_AC_09_04_close | T-03 | ผ่าน | AC-09-04 ใช้ AS-11 รอ Q-31 |
| AC-09-05 (5 แถว) | REQ-FN-051 | test_AC_09_05_transition_not_allowed (parametrize) | T-03 | ผ่าน | พิสูจน์ชั้น 3: เพิ่มลูกศร confirmed ไป done ในตาราง test พัง 2 ตัว (แถว confirmed ไป done และ AC-09-01 ที่นับปุ่ม) |
| AC-09-05 (หน้าจอ) | REQ-FN-051 | AC-09-05.test.jsx | T-05 | ผ่าน | |
| AC-09-06 | REQ-FN-051 | test_AC_09_06_other_technician_cannot_change | T-03 | ผ่าน | |
| AC-09-07 | REQ-FN-052 | test_AC_09_07_customer_and_call_center_see_same_status | T-02 | ผ่าน | |
| AC-09-08 | REQ-FN-053 | test_AC_09_08_notify_customer_within_60s_on_each_change | T-03 | ผ่าน | ข้อความเป็นรหัสอังกฤษ (en_route) test ไม่ได้ตรวจข้อความ เจอตอนตรวจหน้าจอจริง GAP-18 |
| AC-09-09 | REQ-SEC-004, REQ-PRV-002 | test_AC_09_09_phone_in_job_list_only_from_2h_until_closed | T-04 | ผ่าน | |
| AC-09-10 | REQ-DAT-002 | test_AC_09_10_history_complete_in_order | T-02, T-03 | ผ่าน | แถวแรกของประวัติเป็น pending_payment ไป pending_payment (rtm.md F-11) |
| AC-07-01 ถึง AC-07-11 (002-booking) | | 20 ตัวเดิม | | ผ่าน 19 ข้าม 1 | เหมือนรอบที่ 4 ของ 002 ไม่มีของเดิมพัง |
| AC-07-04, 06, 11 และ UI-07-01 ถึง 03 (หน้าจอ 002) | | 14 ตัวเดิม | | ผ่าน | BookingResult.jsx เปลี่ยนที่มาของตารางชื่อสถานะ (T-05) UI-07-03.test.jsx ยังผ่าน |

รายการ "ต้องตรง" ของหน้าจอ (ไม่ใช่ AC แต่อยู่ใน Baseline B2)

| UI ID | test | task | ผล test | ผลตรวจด้วยคน 6 ข้อ |
|---|---|---|---|---|
| UI-09-01 | UI-09-01.test.jsx (3 ตัว) | T-05 | ผ่าน | ตรง 6 จาก 6 (หลังแก้ GAP-18 ซึ่งเป็นข้อความแจ้งเตือน ไม่ใช่หน้าจอ) |
| UI-09-02 | UI-09-02.test.jsx (2 ตัว) | T-06 | ผ่าน | ตรง 6 จาก 6 |

ผลตรวจด้วยคนอยู่ใน ui-review/ui-review.md

สรุปรอบที่ 1: AC ทั้งหมด 10 ข้อ | มี test 10 | ผ่าน 10 | ไม่ผ่าน 0 | รอ Q 0 (Q-30, Q-31, Q-32 มีพฤติกรรมชั่วคราวและ test ตรวจพฤติกรรมชั่วคราวนั้น)
ไม่ผ่านเพราะสเปก 0 | เพราะ AI 0 | เพราะ test 0
สิ่งที่ test ทั้งชุดมองไม่เห็น: GAP-18 (ข้อความแจ้งเตือนเป็นรหัสอังกฤษ) เพราะ AC-09-08 ไม่ได้กำหนดข้อความ เจอได้จากการเปิดคิวดูตอนตรวจหน้าจอจริง

## รอบที่ 2 (18 ต.ค. 2569 หลังแก้ GAP-18 รันจาก export สะอาดของ branch r1) = test-run.txt ปัจจุบัน

| | ผล |
|---|---|
| pytest (Python 3.11) | 41 passed, 1 skipped (20 ของ 002 รวมข้าม 1, 13 ของ 003, 9 ของ 004) |
| pytest (Python 3.12) | 41 passed, 1 skipped (เท่ากัน) |
| vitest | 27 passed, 14 ไฟล์ (14 ของ 002, 7 ของ 003, 6 ของ 004) |
| เปลี่ยนจากรอบที่ 1 | ไม่มี test ไหนเปลี่ยนผล GAP-18 แก้ข้อความในคิว ไม่มี test ตรวจข้อความนั้น (ดู gaps.md ว่าทำไมไม่เพิ่ม test) |

สรุปสามบรรทัด
1. สิ่งที่ขอทำครบไหม: ครบ AC-09-01 ถึง 10 ผ่านทั้งหลังบ้านและหน้าจอ หน้าจอ 2 หน้าตรงกับรายการ "ต้องตรง" ทั้ง test และตาคน
2. ของเดิมพังไหม: ไม่พัง test ของ 002-booking ทั้ง 34 ตัวให้ผลเท่ารอบที่ 4 แม้ T-05 แตะไฟล์ของ 002 สองไฟล์ (ตามตารางผลกระทบของ CR-05)
3. ยังเหลืออะไร: Q-30, Q-31, Q-32, Q-36 และข้อค้นพบ F-09 ถึง F-11 ซึ่ง test ทั้งชุดมองไม่เห็น

## รอบ CR-07 (24 ต.ค. 2569 หลัง T-08 ถึง T-12) = specs/000-shared/test-run.txt

| AC หรือ UI | REQ ที่พิสูจน์ | test | task | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| AC-09-01 ถึง AC-09-05, AC-09-07 ถึง AC-09-10 | REQ-FN-050 ถึง 053, REQ-DAT-002, REQ-SEC-004 | test_job_status.py, test_job_status_privacy.py | T-02 ถึง T-04 | ผ่าน | ไม่แตะ |
| AC-09-06 (แก้ตาม CR-07) | REQ-FN-051, REQ-SEC-010 | test_AC_09_06_other_technician_cannot_change | T-11 | ผ่าน | assert 404 เป็น 403 บรรทัดเดียว (GAP-23) รอบแรกก่อนแก้ test พังตามที่ CR-07 คาด |
| AC-09-11 | REQ-FN-053, REQ-QA-010 | test_AC_09_11_messages_accepted_by_if02_within_60s | T-08 | ผ่าน (ย่อส่วน 3 จาก 100 ครั้ง IF-02 จำลองตอบทันที) | วัดได้แค่ว่าโค้ดบันทึก delivered_at ถูก การถึงจริงวัดบนระบบจริง |
| AC-09-12 | REQ-OP-001 | test_AC_09_12_status_change_under_load_scaled | T-09 | ผ่าน (ย่อส่วน 10 จาก 50) | ยังไม่ใช่ผลตรวจรับจริง บน SQLite คำขอเข้าทีละคำขอ (GAP-15) |
| AC-09-13 | REQ-QA-010 | test_AC_09_13_if02_down_status_saved_message_resent_once, test_AC_09_13_if02_down_beyond_retries_gives_up_after_6 | T-10 | ผ่าน | ใช้ตัวเลขฉบับแก้ (GAP-25) |
| AC-09-14 | REQ-SEC-010 | test_AC_09_14_denied_status_change_logged_without_leaking_existence | T-11 | ผ่าน | ใหม่ |
| UI-09-01, UI-09-02, AC-09-02, AC-09-05 (หน้าจอ) | | test หน้าจอเดิม | T-05, T-06 | ผ่าน | ไม่แตะ |

สรุปสามบรรทัด
1. สิ่งที่ขอทำครบไหม: ครบ AC-09-01 ถึง 14 ผ่าน
2. ของเดิมพังไหม: พัง 1 ตัวตามที่ CR-07 คาด (AC-09-06) แก้ตาม CR ที่เหลือไม่แตะ
3. ยังเหลืออะไร: Q-30, Q-31, Q-32, Q-36 และ F-09, F-10, F-11 เหมือนเดิม ผลย่อส่วนของ AC-09-11 และ 12 ต้องวัดซ้ำบนระบบจริง

## รอบ CR-10 (3 พ.ย. 2569)

ผลของ AC ที่ CR-10 และ CR-02 เพิ่มหรือแก้ อยู่ในตารางรวมที่ specs/000-shared/ac-results.md ส่วน "รอบ CR-10 และ CR-02" AC อื่นของ feature นี้ผลเท่ารอบก่อน และ test ไม่ถูกแตะ ผลระหว่างตรวจรับ R1 อยู่ใน docs/acceptance/acceptance-record-r1.md

## รอบตรวจรับ R1 รอบสอง (16 พ.ย. 2569)

AC ของ feature นี้ไม่เปลี่ยนและ test ไม่ถูกแตะ ผลทดสอบโหลดเต็มรูป (AC-09-12 ผ่าน p95 0.30 วินาที) อยู่ในตารางรวมที่ specs/000-shared/ac-results.md ส่วน "รอบตรวจรับ R1 รอบสอง"
