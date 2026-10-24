# Tasks: ลูกค้ายกเลิกการจองและรับเงินคืน (UC-08)

Feature: SPEC-CANCEL | อ้างอิง: plan.md (plan v1) | สร้างด้วย /tasks วันที่ 2569-10-18 (tasks v1, prompt-log.md #59)
ไม่มีการสั่งแก้รอบที่ 1: ทีมตรวจแล้วรับทั้งไฟล์ (AI ตั้ง T-02 ให้ "ต้องทำหลัง" T-01 และระบุว่าต้องรัน test ของ 002 ซ้ำใน "เสร็จเมื่อ" เพราะแตะไฟล์ของ 002 ตามตารางผลกระทบของ CR-06)

tasks v2 (2569-10-24): เพิ่ม T-07 ถึง T-11 ตาม CR-07 ด้วยข้อความสั่งในแชต **ไม่ได้รัน /tasks ใหม่** (prompt-log.md #70) เลขและสถานะของ T-01 ถึง T-06 ไม่เปลี่ยน

สรุป: 14 task (tasks v3 ดูท้ายไฟล์) | 0 task รอ Q-xx ทั้ง task (Q-14, Q-34, Q-35 ปิดใน CR-10)
สถานะปัจจุบัน: เสร็จ 11 (ทุก task ผ่านการตรวจ 5 ข้อแล้ว task หน้าจอผ่านการตรวจเทียบ mockup 6 ข้อด้วย)

### T-01 เมธอด refund ใน Gateway และคอลัมน์ผลคืนเงินในตาราง refunds
- รองรับ: REQ-IF-010, REQ-CON-003, D-08-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-02, T-03
- ไฟล์ที่แตะ: backend/app/payments/gateway.py (Gateway.refund, FakeGateway.refund และ refund_mode), backend/app/db/models.py (Refund.gateway_ref, Refund.result) ทั้งสองไฟล์เป็นของ 002 อนุญาตตามตารางผลกระทบของ CR-06
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: FakeGateway().refund("x", 100) คืน approved และบันทึก "refund:x:100" ใน calls และ test ทั้งชุดของ 002 ยังผ่าน
- สถานะ: เสร็จ

### T-02 ขยาย cancel_job ให้ทำ BR-05 ครบ และฟังก์ชัน quote
- รองรับ: REQ-BR-001, REQ-IF-010, REQ-DAT-002, REQ-DAT-003, REQ-FN-055, BR-05, D-08-01, D-08-02
- ตรวจด้วย: AC-08-02, AC-08-03, AC-08-04, AC-08-05 (ผ่าน endpoint ของ T-03) และ AC-07-10 ของ 002 ต้องยังผ่าน
- ไฟล์ที่แตะ: backend/app/refund/service.py (quote, cancel_job รับ gateway, ข้อความ R3 / R6 / ยกเลิกซ้ำ, แจ้งสองฝ่าย), backend/app/refund/router.py (ส่ง get_gateway())
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: pytest ทั้งชุดของ 002 ให้ผลเท่าเดิม (19 ผ่าน 1 ข้าม) และ cancel_job ของงาน confirmed สร้าง Refund ที่มี gateway_ref และ result
- สถานะ: เสร็จ

### T-03 endpoint ของลูกค้า refund-quote และ customer-cancel
- รองรับ: REQ-FN-054, REQ-BR-001, REQ-IF-010, REQ-FN-055, REQ-PRV-002, AS-13, D-08-03
- ตรวจด้วย: AC-08-01, AC-08-02, AC-08-03, AC-08-04, AC-08-05, AC-08-06
- ไฟล์ที่แตะ: backend/app/cancel/__init__.py, backend/app/cancel/router.py, backend/app/main.py (include_router), backend/tests/test_cancel.py
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: test_AC_08_01 ถึง test_AC_08_06 ผ่านทุกตัว และเมื่อให้ quote ใช้เวลาต่างจาก cancel (AS-13) test_AC_08_01 ยังอธิบายได้
- สถานะ: เสร็จ

### T-04 หน้ายกเลิกการจองตามแบบ UI-08-01
- รองรับ: REQ-FN-054, REQ-BR-001, REQ-IF-010, D-00-05, D-08-03
- ตรวจด้วย: AC-08-01 (หน้าจอ), AC-08-06 (หน้าจอ) และรายการ "ต้องตรง" ของ UI-08-01
- ไฟล์ที่แตะ: frontend/src/api/client.js (cancelApi), frontend/src/pages/CancelBooking.jsx, frontend/src/__tests__/UI-08-01.test.jsx, frontend/src/__tests__/AC-08-01.test.jsx, frontend/src/__tests__/AC-08-06.test.jsx
- แบบหน้าจอ: UI-08-01 mockups/UI-08-01-cancel.html
- ต้องทำหลัง: ไม่มี (ใช้ API จำลองตามสัญญาใน plan.md ข้อ 4 และ statusNames.js จาก 003 T-05 ซึ่งเสร็จแล้ว)
- เสร็จเมื่อ: npm test ผ่าน UI-08-01.test.jsx, AC-08-01.test.jsx, AC-08-06.test.jsx และไม่มีตัวเลขเงื่อนไข BR-01 ในไฟล์หน้าจอ
- สถานะ: เสร็จ

### T-05 หน้าผลการยกเลิกตามแบบ UI-08-02 และต่อเข้าแถบเมนู
- รองรับ: REQ-FN-054, REQ-FN-055, REQ-BR-001
- ตรวจด้วย: รายการ "ต้องตรง" ของ UI-08-02
- ไฟล์ที่แตะ: frontend/src/pages/CancelResult.jsx, frontend/src/App.jsx (มุมมอง "ยกเลิกการจอง"), frontend/src/__tests__/UI-08-02.test.jsx
- แบบหน้าจอ: UI-08-02 mockups/UI-08-02-cancel-result.html
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: npm test ผ่าน UI-08-02.test.jsx และไม่มีข้อความจำนวนวันของ Q-35 บนหน้าจอ
- สถานะ: เสร็จ

### T-06 รัน test ทั้งชุด และตรวจหน้าจอจริงเทียบ mockup ด้วยคน
- รองรับ: REQ-FN-054, REQ-BR-001, REQ-IF-010
- ตรวจด้วย: ทุก AC ของ UC-08, UC-09 และ UC-07 (รันซ้ำทั้งชุด) และรายการตรวจ 6 ข้อใน docs/mockup-guide.md ข้อ 9
- ไฟล์ที่แตะ: specs/004-cancel-refund/test-run.txt, ac-results.md, gaps.md, rtm.md, ui-review/ (ภาพหน้าจอจริงและ ui-review.md), docs/srs/baseline.md
- แบบหน้าจอ: UI-08-01, UI-08-02
- ต้องทำหลัง: T-03, T-04, T-05
- เสร็จเมื่อ: AC ของ 002 และ 003 ที่เคยผ่านยังผ่านทุกข้อ AC-08-01 ถึง 06 ผ่าน และรายการตรวจหน้าจอ 6 ข้อ "ตรง" ครบ 2 หน้า
- สถานะ: เสร็จ

### T-07 สองคำขอยกเลิกพร้อมกัน คืนเงินครั้งเดียว (CR-07)
- รองรับ: REQ-IF-010, REQ-QA-010 บรรทัดที่ 2
- ตรวจด้วย: AC-08-07
- ไฟล์ที่แตะ: backend/tests/test_cancel_cr07.py (โค้ดเดิมผ่านอยู่แล้วบน SQLite เพราะเข้าทีละคำขอ GAP-15)
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: test_AC_08_07 ผ่าน และบันทึกใน ac-results.md ว่า SQLite ไม่พิสูจน์การชนกัน
- สถานะ: เสร็จ

### T-08 gateway ไม่ตอบคำขอคืนเงิน (CR-07)
- รองรับ: REQ-QA-010 บรรทัดที่ 1 และ 2, REQ-IF-010, Q-41
- ตรวจด้วย: AC-08-08 (AC-08-03, AC-08-04 ต้องผ่านเหมือนเดิม)
- ไฟล์ที่แตะ: backend/app/payments/gateway.py (refund มี timeout_seconds, FakeGateway refund_mode = timeout), backend/app/refund/service.py (result = unknown และข้อความถึงลูกค้า), backend/tests/test_cancel_cr07.py
- แบบหน้าจอ: ไม่มี (หน้าผลยังไม่แสดง unknown GAP-26)
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: test_AC_08_08 ผ่าน
- สถานะ: เสร็จ

### T-09 test ย่อส่วนของการยกเลิกพร้อมกัน (CR-07)
- รองรับ: REQ-OP-001, REQ-FN-054
- ตรวจด้วย: AC-08-09
- ไฟล์ที่แตะ: backend/tests/test_cancel_cr07.py
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: test_AC_08_09 ผ่าน และบันทึกว่า "ผ่าน (ย่อส่วน 10 จาก 50)"
- สถานะ: เสร็จ

### T-10 สิทธิ์ต่องาน 403 บันทึกความพยายาม (MU-01) และหน้ายกเลิกรับ 403 (CR-07)
- รองรับ: REQ-SEC-010, REQ-FN-054, D-08-04, REQ-OP-005 บรรทัดที่ 3
- ตรวจด้วย: AC-08-10, AC-08-01 (assert เปลี่ยนตาม CR-07)
- ไฟล์ที่แตะ: backend/app/cancel/router.py, backend/tests/test_cancel.py (assert 2 บรรทัด ตาม CR-07), backend/tests/test_cancel_cr07.py, frontend/src/pages/CancelBooking.jsx, frontend/src/__tests__/AC-08-10.test.jsx
- แบบหน้าจอ: UI-08-01 (รายการ "ต้องตรง" ที่ CR-07 เพิ่ม)
- ต้องทำหลัง: T-03, T-20 ของ 002 (audit.py)
- เสร็จเมื่อ: test_AC_08_10 และ AC-08-10.test.jsx ผ่าน พิสูจน์ชั้น 3: ตัดเงื่อนไข customer_id ใน audit.py แล้ว test_AC_08_10 กับ test_AC_08_01_other_customer พังทั้งคู่
- สถานะ: เสร็จ (พิสูจน์ชั้น 3 แล้ว)

### T-11 รัน test ทั้งชุดหลัง CR-07
- รองรับ: REQ-FN-054, REQ-FN-055, REQ-IF-010, REQ-DAT-003 และข้อของ CR-07 ที่ feature นี้ใช้
- ตรวจด้วย: ทุก AC ของ UC-08 (รวมกับ T-27 ของ 002)
- ไฟล์ที่แตะ: specs/004-cancel-refund/ac-results.md, rtm.md
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-07 ถึง T-10
- เสร็จเมื่อ: AC-08-01 ถึง 10 ผ่าน
- สถานะ: เสร็จ

## ตารางตรวจความครบ

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-08-01 | T-03, T-04 (หน้าจอ) |
| AC-08-02 | T-02, T-03 |
| AC-08-03 | T-01, T-02, T-03 |
| AC-08-04 | T-02, T-03 |
| AC-08-05 | T-02, T-03 |
| AC-08-06 | T-03, T-04 (หน้าจอ) |
| AC-07-10 (ใช้ร่วม รันซ้ำ) | T-02, T-06 |
| รายการ "ต้องตรง" ของ UI-08-01, UI-08-02 | T-04, T-05 และ T-06 (ตรวจด้วยคน) |

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| REQ-IF-010 | T-01, T-02 |
| REQ-DAT-002 | T-02 |
| REQ-DAT-003 | T-02 |
| REQ-CON-001 | ทุก task ตัดการยกเลิกแทนโดย call center และการร้องเรียนออก (EV-044) |
| REQ-CON-003 | T-01 (interface Gateway ตัวเดิม) |
| REQ-PRV-002 | T-02, T-03 (logger ผ่าน privacy.py) |
| D-00-01, D-00-02, D-00-03 | T-01, T-03, T-04 (ใช้โครงเดิม) |
| D-00-04 | ทุก task ที่มี test |
| D-00-05 | T-02 (BR-01 ที่เดียว), T-04 (ยอดจาก API) |

## สิ่งที่ยังไม่ทำ

- Q-14 R3: ไม่มี task T-03 ใช้ข้อความชั่วคราวของ 002
- Q-33 คิวรอ (waitlist) ยังไม่มีรหัส UC: ไม่มี task รอ RE lead
- Q-34 gateway ปฏิเสธคำขอคืนเงิน: ไม่มี task T-02 แค่บันทึกผล
- Q-35 ช่องทางและจำนวนวัน: ไม่มี task รอ Finance

### ส่วนที่เพิ่มตาม CR-07 (tasks v2)

| AC | task |
|---|---|
| AC-08-01 (assert เปลี่ยน) | T-10 |
| AC-08-07 | T-07 |
| AC-08-08 | T-08 |
| AC-08-09 | T-09 |
| AC-08-10 | T-10 |

| Constraint ID (รุ่น 1.1) | task ที่ทำให้เป็นจริง |
|---|---|
| REQ-OP-001 | T-09 |
| REQ-OP-005 | T-10 (log) ตัวนับอยู่ที่ T-24 ของ 002 |
| REQ-OP-006, REQ-OP-007 | ไม่มี task ใน feature นี้ (T-23, T-25 ของ 002) |
| REQ-QA-010 | T-07, T-08 |
| REQ-SEC-010 | T-10 |
| REQ-SEC-011 | ไม่เกี่ยวกับ feature นี้ เพราะ feature นี้ปล่อยช่วงเวลาให้ว่าง ไม่ได้ล็อก |
| REQ-SEC-012 | ไม่มี task ใน feature นี้ (T-21, T-24 ของ 002) |
| REQ-PRV-010 | ไม่เกี่ยวกับ feature นี้ เพราะไม่มีข้อมูลส่วนบุคคลใหม่ |
| REQ-CMP-001 | ไม่มี task |

### ส่วนที่เพิ่มตาม CR-10 (tasks v3, 3 พ.ย. 2569)

tasks v3: เพิ่ม T-12 ถึง T-14 ด้วยข้อความสั่งในแชต (prompt-log.md #81) รวม 14 task เสร็จ 14

### T-12 gateway ปฏิเสธคำขอคืนเงิน และรายการที่ Finance ต้องปิด (CR-10, Q-34)
- รองรับ: REQ-IF-010
- ตรวจด้วย: AC-08-11, AC-08-03 และ AC-08-08 (เดิม ไม่แก้)
- ไฟล์ที่แตะ: backend/app/refund/service.py, backend/app/cancel/router.py, backend/app/ops/router.py, backend/tests/test_cancel_cr10.py, docs/srs/operations.md (บัญชี endpoint)
- แบบหน้าจอ: UI-08-02 สถานะ 2 (รุ่น CR-10)
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: test_AC_08_11 ผ่าน และ gateway ได้คำขอคืนเงิน 1 ครั้ง
- สถานะ: เสร็จ

### T-13 ยกเลิกขณะช่างกำลังเดินทาง และหน้าจอยกเลิกกับผลการยกเลิก (CR-10, Q-14, Q-35)
- รองรับ: REQ-BR-001, REQ-FN-054, REQ-FN-055
- ตรวจด้วย: AC-08-12, AC-08-06 (แถว R6), UI-08-01, UI-08-02
- ไฟล์ที่แตะ: backend/app/refund/service.py, backend/app/cancel/router.py, frontend/src/pages/CancelBooking.jsx, frontend/src/pages/CancelResult.jsx, frontend/src/__tests__/AC-08-11.test.jsx, AC-08-12.test.jsx, UI-08-02.test.jsx, AC-08-06.test.jsx และ backend/tests/test_cancel.py (ตาราง "test เดิมที่เปลี่ยน" ของ CR-10)
- แบบหน้าจอ: UI-08-01 และ UI-08-02 รุ่น CR-10
- ต้องทำหลัง: T-30 ของ 002
- เสร็จเมื่อ: test ทั้งหลังบ้านและหน้าจอผ่าน หน้าจอไม่มีตัวเลขค่าเดินทางหรือจำนวนวันพิมพ์เอง
- สถานะ: เสร็จ

### T-14 รัน test ทั้งชุดและ eval หลัง CR-10
- รองรับ: ทุก REQ ของ CR-10
- ตรวจด้วย: ทุก AC ของ 002 ถึง 005 และ AC-00-nn
- ไฟล์ที่แตะ: specs/000-shared/test-run.txt, specs/000-shared/test-run-cr10-round1.txt, specs/005-ai-assistant/eval-results.md และ .json, ac-results.md, rtm.md
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-28 ถึง T-31 ของ 002, T-13 ของ 003, T-12 และ T-13 ของ 004, T-13 ของ 005
- เสร็จเมื่อ: test เดิมที่ไม่อยู่ในตาราง "test เดิมที่เปลี่ยน" ของ CR-10 ผ่านโดยไม่ถูกแตะ test ใหม่ผ่าน eval ผ่าน 20 จาก 20 เกณฑ์
- สถานะ: เสร็จ
