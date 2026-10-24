# ตารางผล AC หลังรัน test ทั้งชุด (specs/004-cancel-refund/test-run.txt)

รอบที่ 1 รันวันที่ 18 ต.ค. 2569 หลัง /implement T-01 ถึง T-05 รอบที่ 2 รันจาก export สะอาด (git archive) บน Python 3.11 และ 3.12 หลังปิดงานทั้ง 003 และ 004
คำสั่ง: cd backend && pytest -v -k "AC_" | cd frontend && npm test (รันทั้งโครงการ)
สถานะที่ใช้: ผ่าน | ไม่ผ่าน | ยังไม่มี test | รอ Q-xx

## รอบที่ 1 (18 ต.ค. 2569 รันทั้งชุดครั้งแรกหลัง /implement)

รอบนี้สำคัญกว่า 003 เพราะ T-01 และ T-02 แก้ไฟล์ของ 002 ถึง 4 ไฟล์ (gateway.py, models.py, refund/service.py, refund/router.py) ต้องดูว่า AC-07-10 ทุกแถวยังผ่าน

| AC หรือ UI | REQ ที่พิสูจน์ | test | task | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| AC-08-01 R1, R2 | REQ-FN-054, REQ-BR-001 | test_AC_08_01_quote_equals_actual_refund (parametrize) | T-03 | ผ่าน | ยอดจาก quote เท่ากับยอดจาก cancel เพราะใช้ decide ตัวเดียว |
| AC-08-01 (เจ้าของงาน) | REQ-FN-054 | test_AC_08_01_other_customer_cannot_see_or_cancel | T-03 | ผ่าน | |
| AC-08-01 (หน้าจอ) | REQ-FN-054 | AC-08-01.test.jsx | T-04 | ผ่าน | |
| AC-08-02 | REQ-FN-054, REQ-DAT-002, REQ-DAT-003 | test_AC_08_02_cancel_sets_status_history_and_frees_slot | T-02, T-03 | ผ่าน | รวมการค้นหาของลูกค้าอื่นเห็น slot อีกครั้ง |
| AC-08-03 | REQ-IF-010, REQ-CON-003 | test_AC_08_03_refund_sent_via_gateway_with_same_ref | T-01, T-02, T-03 | ผ่าน | |
| AC-08-04 | REQ-IF-010 | test_AC_08_04_second_cancel_rejected_no_double_refund | T-02, T-03 | ผ่าน | |
| AC-08-05 | REQ-FN-055 | test_AC_08_05_notify_customer_and_technician_within_60s | T-02, T-03 | ผ่าน | |
| AC-08-06 R3, R6 | REQ-BR-001, REQ-FN-054 | test_AC_08_06_not_cancellable_returns_message (parametrize) | T-03 | ผ่าน | R3 ตรวจพฤติกรรมชั่วคราวของ Q-14 ยอดคืนจริงยังไม่รู้ |
| AC-08-06 (หน้าจอ) | REQ-BR-001 | AC-08-06.test.jsx (2 ตัว) | T-04 | ผ่าน | |
| UC-08 E1 gateway ปฏิเสธ | REQ-IF-010 | ไม่มี | ไม่มี | ยังไม่มี test | รอ Q-34 (rtm.md F-13) |
| AC-07-10 ทุกแถว (002) | REQ-BR-001 | test_AC_07_10_refund (4 แถว), _R6_not_allowed, _R3_temporary_behaviour, _R3 (ข้าม) | T-02 | ผ่าน 6 ข้าม 1 | เหมือนรอบที่ 4 ของ 002 แม้ cancel_job เปลี่ยนไปมาก เพราะคำตอบของ endpoint เดิมไม่เปลี่ยน |
| AC-07-01 ถึง 09, 11 (002) และ AC-09-01 ถึง 10 (003) | | 13 และ 13 ตัว | | ผ่าน | ไม่มีของเดิมพัง |

รายการ "ต้องตรง" ของหน้าจอ (ไม่ใช่ AC แต่อยู่ใน Baseline B2)

| UI ID | test | task | ผล test | ผลตรวจด้วยคน 6 ข้อ |
|---|---|---|---|---|
| UI-08-01 | UI-08-01.test.jsx (2 ตัว) | T-04 | ผ่าน | ตรง 6 จาก 6 |
| UI-08-02 | UI-08-02.test.jsx (1 ตัว) | T-05 | ผ่าน | ตรง 6 จาก 6 |

ผลตรวจด้วยคนอยู่ใน ui-review/ui-review.md

สรุปรอบที่ 1: AC ทั้งหมด 6 ข้อ | มี test 6 | ผ่าน 6 | ไม่ผ่าน 0 | รอ Q 1 (R3 ของ BR-01 ยังข้ามใน 002 และ E1 ของ UC-08 ยังไม่มี AC รอ Q-34)
ไม่ผ่านเพราะสเปก 0 | เพราะ AI 0 | เพราะ test 0

## รอบที่ 2 (18 ต.ค. 2569 รันจาก export สะอาดของ branch r1) = test-run.txt ปัจจุบัน

| | ผล |
|---|---|
| pytest (Python 3.11) | 41 passed, 1 skipped (20 ของ 002 รวมข้าม 1, 13 ของ 003, 9 ของ 004) |
| pytest (Python 3.12) | 41 passed, 1 skipped (เท่ากัน) |
| vitest | 27 passed, 14 ไฟล์ (14 ของ 002, 7 ของ 003, 6 ของ 004) |
| เปลี่ยนจากรอบที่ 1 | ไม่มี |

## เทียบก่อนและหลัง R1

| | B2 เดิม (11 ต.ค.) | R1 (18 ต.ค. หลัง CR-05, CR-06) |
|---|---|---|
| feature ใน Baseline | 1 (UC-07) | 3 (UC-07, UC-09, UC-08) |
| AC ในสเปก | 11 | 27 (11 + 10 + 6) |
| test หลังบ้าน | 19 ผ่าน 1 ข้าม | 41 ผ่าน 1 ข้าม |
| test หน้าจอ | 14 ผ่าน (6 ไฟล์) | 27 ผ่าน (14 ไฟล์) |
| ของเดิมที่พังเพราะการเปลี่ยนแปลง | | 0 |
| ข้อค้นพบที่เปิดอยู่ | F-05 ถึง F-08 | F-05, F-06, F-07 (002) F-09, F-10, F-11 (003) F-13, F-14 (004) ปิด F-08 และ F-12 |

สรุปสามบรรทัด
1. สิ่งที่ขอทำครบไหม: ครบ AC-08-01 ถึง 06 ผ่านทั้งหลังบ้านและหน้าจอ และทางระบบ (R4, R5) ได้การคืนเงินผ่าน gateway ด้วยโดยไม่ต้องแก้ test ของ 002
2. ของเดิมพังไหม: ไม่พัง แม้แก้ไฟล์ของ 002 สี่ไฟล์ เพราะ CR-06 ระบุไฟล์และ test ที่ต้องรันซ้ำไว้ก่อน และคำตอบของ endpoint เดิมไม่เปลี่ยน
3. ยังเหลืออะไร: Q-14 (R3), Q-33, Q-34 (E1 ไม่มี AC), Q-35 และ F-13, F-14

## รอบ CR-07 (24 ต.ค. 2569 หลัง T-07 ถึง T-11) = specs/000-shared/test-run.txt

| AC หรือ UI | REQ ที่พิสูจน์ | test | task | ผล | หมายเหตุ |
|---|---|---|---|---|---|
| AC-08-01 R1, R2 และ AC-08-02 ถึง AC-08-06 | REQ-FN-054, REQ-FN-055, REQ-BR-001, REQ-IF-010, REQ-DAT-002, REQ-DAT-003 | test_cancel.py | T-02, T-03 | ผ่าน | ไม่แตะ |
| AC-08-01 (เจ้าของงาน) | REQ-FN-054, REQ-SEC-010 | test_AC_08_01_other_customer_cannot_see_or_cancel | T-10 | ผ่าน | assert 404 เป็น 403 สองบรรทัด (GAP-23) |
| AC-08-07 | REQ-IF-010, REQ-QA-010 | test_AC_08_07_two_concurrent_cancels_refund_once | T-07 | ผ่าน (SQLite ไม่พิสูจน์การชนกัน) | ผลตรวจรับจริงต้องรันบน PostgreSQL (GAP-15) |
| AC-08-08 | REQ-QA-010, REQ-IF-010 | test_AC_08_08_refund_timeout_recorded_unknown_not_resent | T-08 | ผ่าน | ใหม่ |
| AC-08-09 | REQ-OP-001 | test_AC_08_09_cancel_under_load_scaled | T-09 | ผ่าน (ย่อส่วน 10 จาก 50) | ยังไม่ใช่ผลตรวจรับจริง |
| AC-08-10 | REQ-SEC-010 (MU-01) | test_AC_08_10_customer_cannot_cancel_other_customers_job, AC-08-10.test.jsx | T-10 | ผ่าน | ใหม่ พิสูจน์ชั้น 3: ตัดเงื่อนไขเจ้าของใน audit.py แล้ว test นี้กับ AC-08-01 พังทั้งคู่ |
| UI-08-01, UI-08-02, AC-08-01, AC-08-06 (หน้าจอ) | | test หน้าจอเดิม | T-04, T-05 | ผ่าน | ไม่แตะ |

สรุปสามบรรทัด
1. สิ่งที่ขอทำครบไหม: ครบ AC-08-01 ถึง 10 ผ่าน และ MU-01 ปิดทั้งสองทาง (customer-cancel ตอบ 403 และ POST /jobs/{id}/cancel ของ 002 ถูกปิด)
2. ของเดิมพังไหม: พัง 1 ตัวตามที่ CR-07 คาด (AC-08-01 ส่วนเจ้าของงาน) แก้ตาม CR ที่เหลือไม่แตะ
3. ยังเหลืออะไร: Q-14, Q-33, Q-34, Q-35, AS-13 และ F-13, F-14 หน้าผลยังไม่บอกเมื่อคืนเงินไม่ทราบผล (GAP-26)

## รอบ CR-10 (3 พ.ย. 2569)

ผลของ AC ที่ CR-10 และ CR-02 เพิ่มหรือแก้ อยู่ในตารางรวมที่ specs/000-shared/ac-results.md ส่วน "รอบ CR-10 และ CR-02" AC อื่นของ feature นี้ผลเท่ารอบก่อน และ test ไม่ถูกแตะ ผลระหว่างตรวจรับ R1 อยู่ใน docs/acceptance/acceptance-record-r1.md

## รอบตรวจรับ R1 รอบสอง (16 พ.ย. 2569)

AC ของ feature นี้ไม่เปลี่ยนและ test ไม่ถูกแตะ ผลทดสอบโหลดเต็มรูป (AC-08-09 ผ่าน p95 0.39 วินาที) อยู่ในตารางรวมที่ specs/000-shared/ac-results.md ส่วน "รอบตรวจรับ R1 รอบสอง"
