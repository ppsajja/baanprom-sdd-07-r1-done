# Plan: ลูกค้ายกเลิกการจองและรับเงินคืน (UC-08)

อ้างอิง: spec.md SPEC-CANCEL v0.2 (หลัง /clarify) และ v1.0 (CR-06) | Updated: 2569-10-18 | สร้างด้วย /plan แล้วทีมตรวจแล้ว (plan v1, prompt-log.md #58)
อ้างอิง Constraint กลาง: specs/000-shared/constraints.md รุ่น 1.0 (D-00-01 ถึง D-00-05 ใช้ตาม ไม่ถามซ้ำ)

plan v2 (2569-10-24): CR-07 อนุมัติ แก้เฉพาะตารางข้อ 5 ส่วนรุ่น 1.1 และเพิ่มข้อ 9 ด้วยข้อความสั่งในแชต **ไม่ได้รัน /plan ใหม่** (prompt-log.md #70) อ้างอิง spec.md 1.1 และ Constraint กลางรุ่น 1.1

## 1. สรุปแนวทาง

- ลูกค้ากรอกหมายเลขงาน ระบบตรวจว่าเป็นงานของลูกค้าคนนี้ แล้วแสดงยอดคืนจากตาราง BR-01 ตัวเดิม (refund/rules.py) ก่อนให้กดยืนยัน (REQ-FN-054, D-08-01, D-08-03)
- การยกเลิกจริงเรียก cancel_job ของ refund/service.py ตัวเดิมที่ 002 ใช้ ซึ่งรอบนี้ถูกขยายตาม CR-06 ให้ทำ BR-05 ครบ: เปลี่ยนสถานะพร้อมประวัติ ปล่อยช่วงเวลา (REQ-DAT-003) ส่งคำขอคืนเงินผ่าน Gateway.refund (REQ-IF-010) และแจ้งสองฝ่าย (REQ-FN-055) ทางระบบ (R4, R5) ได้พฤติกรรมเดียวกันโดยไม่ต้องแก้ router ของ 002 มากไปกว่าส่ง gateway เข้าไป (D-08-02)
- Payment Gateway ยังเป็นรายเดิมผ่าน interface Gateway ตัวเดียว เพิ่มแค่เมธอด refund (REQ-CON-003) FakeGateway สั่งผลคืนเงินได้
- หน้าจอ 2 หน้า (UI-08-01, UI-08-02) ในแอป React เดิม เข้าถึงผ่านแถบเมนู "ยกเลิกการจอง" ที่ CR-05 เพิ่มไว้
- R3 (ช่างกำลังเดินทาง) ยังใช้พฤติกรรมชั่วคราวของ Q-14 ข้อความเดียวกับ 002 ไม่เขียนข้อความใหม่

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| Payment Gateway รายเดิม (IF-01) | REQ-CON-003, REQ-IF-010 | interface `Gateway` เดิม เพิ่ม `refund(ref, amount)` ตอน test ใช้ `FakeGateway(refund_mode=...)` |
| Python + FastAPI | D-00-01 | เพิ่มโมดูล app/cancel/ และแก้ app/refund/service.py |
| SQLAlchemy 2 + PostgreSQL (test ใช้ SQLite ในหน่วยความจำ) | D-00-02 | ตาราง refunds เพิ่ม 2 คอลัมน์ (nullable) ตาม CR-06 ไม่มีตารางใหม่ |
| React 19 (Vite) + Tailwind CSS 4 | D-00-03 | หน้าใหม่ใน frontend/src/pages/ เรียกผ่าน api/client.js (cancelApi) |
| pytest + httpx, Vitest + RTL | D-00-04 | test ชื่อ test_AC_08_nn และ AC-08-nn.test.jsx / UI-08-nn.test.jsx |
| คิวในหน่วยความจำ (notify/queue.py) | ของเดิม | ใช้ตัวเดิม |

ไม่มี library ใหม่ รัน test ด้วยคำสั่งเดิมของโครงการ

### โครงไฟล์ (เฉพาะที่ feature นี้เพิ่มหรือแตะ)

```
backend/app/
  cancel/router.py           GET /jobs/{id}/refund-quote, POST /jobs/{id}/customer-cancel (ตรวจเจ้าของงาน แล้วเรียก refund.service)
  refund/service.py          (ของ 002 แก้ตาม CR-06) quote(), cancel_job() ทำ BR-05 ครบ ข้อความ R3 / R6 / ยกเลิกซ้ำ อยู่ที่นี่ที่เดียว
  refund/router.py           (ของ 002 แก้ตาม CR-06) ส่ง get_gateway() เข้า cancel_job
  payments/gateway.py        (ของ 002 แก้ตาม CR-06) Gateway.refund, FakeGateway.refund_mode
  db/models.py               (ของ 002 แก้ตาม CR-06) Refund.gateway_ref, Refund.result
  main.py                    include_router ของ cancel
backend/tests/test_cancel.py AC-08-01 ถึง 06
frontend/src/
  api/client.js              cancelApi (2 ฟังก์ชัน)
  pages/CancelBooking.jsx    UI-08-01
  pages/CancelResult.jsx     UI-08-02
  App.jsx                    มุมมอง "ยกเลิกการจอง" สลับระหว่างสองหน้า
  __tests__/UI-08-01.test.jsx, UI-08-02.test.jsx, AC-08-01.test.jsx, AC-08-06.test.jsx
```

## 3. โมเดลข้อมูล

| ตาราง | ฟิลด์หลัก | รองรับ |
|---|---|---|
| jobs (เดิม) | status, customer_id, slot_id, deposit_amount, scheduled_start | REQ-FN-054, REQ-DAT-002 |
| job_status_history (เดิม) | from_status, to_status, at | REQ-DAT-002 |
| time_slots (เดิม) | state กลับเป็น free | REQ-DAT-003 |
| payments (เดิม) | gateway_ref ของรายการที่ result = success | REQ-IF-010 (reference เดิม) |
| refunds (เดิม + CR-06) | amount, rule, gateway_ref (ใหม่), result (ใหม่: approved / declined / not_sent) | REQ-BR-001, REQ-IF-010 |

- ไม่มีข้อมูลส่วนบุคคลใหม่ ไม่มีตาราง log (REQ-PRV-002)
- result = not_sent เกิดเมื่อไม่มี Payment สำเร็จให้คืน (เช่น R4 ของงานที่ยังไม่เคยตัดเงินใน test) ระบบจริงไม่ควรเกิดกับ R1 / R2

## 4. API / หน้าจอ

| รายการ | input / output หลัก | รองรับ |
|---|---|---|
| GET /jobs/{job_id}/refund-quote | in: customer_id, now / out: {status, deposit_amount, scheduled_start, allowed, rule, refund_amount, message} หรือ 404 ถ้าไม่ใช่งานของลูกค้า ยอดจาก refund/rules.py ตัวเดียวกับที่ยกเลิกจริง | REQ-FN-054, REQ-BR-001, AS-13 |
| POST /jobs/{job_id}/customer-cancel | in: customer_id, now / out: 200 {status: cancelled, rule, refund_amount, refund_result} หรือ 409 {rule, outcome, message} (R3 รอ Q-14, R6, ยกเลิกไปแล้ว) หรือ 404 | REQ-FN-054, REQ-IF-010, REQ-DAT-002, REQ-DAT-003, REQ-FN-055 |
| POST /jobs/{job_id}/cancel (เดิมของ 002) | พฤติกรรมเพิ่มตาม CR-06: ส่งคำขอคืนเงินผ่าน gateway และแจ้งสองฝ่าย คำตอบเดิมไม่เปลี่ยน | REQ-BR-001 (ทางระบบ R4, R5) |
| หน้ายกเลิกการจอง CancelBooking (UI-08-01, mockups/UI-08-01-cancel.html) | กรอกหมายเลขงาน เรียก refund-quote แสดงรายละเอียดและยอดคืน กดยืนยันแล้ว POST customer-cancel ถ้า 409 แสดงข้อความจากระบบ | REQ-FN-054, REQ-BR-001, AC-08-01, AC-08-06 |
| หน้าผลการยกเลิก CancelResult (UI-08-02, mockups/UI-08-02-cancel-result.html) | แสดงสถานะ "ยกเลิก" และยอดเงินคืนจากคำตอบของ customer-cancel | REQ-FN-054, REQ-FN-055 |

สิ่งที่ mockup มีแต่ spec ไม่ได้สั่ง ไม่อยู่ในตารางนี้ ไปอยู่ข้อ 8: ยอดคืน R3 (Q-14) ช่องทางและจำนวนวันที่เงินคืนเข้า (Q-35)

## 5. ตารางตรวจ Constraints

Constraint เฉพาะ feature (spec ส่วน 4)

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| REQ-IF-010 | ข้อ 2 และ 4: Gateway.refund ด้วย reference จาก payments.gateway_ref ครั้งเดียวต่อการยกเลิก | ใช้แล้ว (กรณี gateway ปฏิเสธรอ Q-34) |
| REQ-DAT-002 | ข้อ 3: set_status เดิมบันทึกแถว "ยกเลิก" | ใช้แล้ว |
| REQ-DAT-003 | ข้อ 3 และ cancel_job ขั้น 2 ของ BR-05 | ใช้แล้ว |

Constraint กลางจาก specs/000-shared/constraints.md รุ่น 1.0 ครบทุกข้อ

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| REQ-CON-001 | ข้อ 7: ตัดการยกเลิกโดย call center แทนลูกค้า และกระบวนการร้องเรียนออกจาก R1 (EV-044) | ใช้แล้ว |
| REQ-CON-003 | ข้อ 2: คืนเงินผ่าน interface `Gateway` ตัวเดิมของ 002 เพิ่มเมธอดเดียว ไม่มี gateway รายอื่น | ใช้แล้ว |
| REQ-PRV-002 | ข้อ 2: cancel/router.py และ refund/service.py ขอ logger ผ่าน privacy.py และ log เฉพาะเลขงาน แถว ยอด ไม่มีเบอร์ | ใช้แล้ว (ตรวจด้วยการอ่านโค้ด feature นี้ไม่แตะเบอร์โทร) |
| D-00-01 | ข้อ 2: หลังบ้าน Python + FastAPI โมดูล app/cancel | ใช้แล้ว |
| D-00-02 | ข้อ 3: 2 คอลัมน์ใหม่ใน refunds ผ่าน SQLAlchemy เดิม ไม่สร้าง engine เอง | ใช้แล้ว |
| D-00-03 | ข้อ 2: หน้าจอ React + Tailwind เรียกผ่าน api/client.js (cancelApi) | ใช้แล้ว |
| D-00-04 | ข้อ 6: ชื่อ test ตาม AC และ UI รันด้วยคำสั่งเดิม | ใช้แล้ว |
| D-00-05 | ข้อ 1 และ 4: ตาราง BR-01 อยู่ refund/rules.py ที่เดียว หน้าจอรับยอดคืนจาก refund-quote และหน้าผลรับจากคำตอบยกเลิก ไม่มีตัวเลขเงื่อนไขบนหน้าจอ | ใช้แล้ว |

ข้อเสนอ Constraint กลางรุ่น 1.1 (specs/000-shared/constraints.md ส่วน 6, CR-07 สถานะ Proposed) เพิ่มแถวไว้ให้ Impact Analysis มองเห็น ยังไม่มี task โค้ด หรือ test จนกว่า CR-07 จะอนุมัติ (เพิ่มในรอบ Failure Day ไม่ได้รัน /plan ใหม่)

| Constraint ID | ถ้าอนุมัติ จะใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| REQ-OP-001 | เวลาล่มนับทั้งระบบ endpoint ของ feature นี้ (GET /jobs/{id}/refund-quote, POST /jobs/{id}/customer-cancel) อยู่ใต้ /health ตัวเดียวกับ 002 เวลาตอบของการยกเลิกรอ Q-42 (ดู quality-requirements.md QAS-3) | ใช้แล้ว (T-09 AC-08-09 ย่อส่วน Q-42 ปิดแล้ว) |
| REQ-OP-005 | middleware ตัวนับของ 002 คลุม router ของ cancel โดยอัตโนมัติ คำขอคืนเงินที่ gateway ตอบ declined หรือไม่ตอบ ควรนับเป็น "ล้มเหลว" ของ endpoint นี้ด้วย เพื่อให้คนเวรรู้ก่อนลูกค้าโทร | ใช้แล้ว (middleware ของ 002 นับ endpoint นี้แยก T-10 log เป็น log_event) คำขอคืนเงินที่ไม่ตอบไม่นับเป็นล้มเหลวของ endpoint เพราะลูกค้าได้ 200 นับจาก refunds.result = unknown แทน (คู่มือเหตุการณ์ที่ 1) |
| REQ-OP-006 | เหตุ "gateway ไม่ตอบเกิน 5 นาที" กระทบ Gateway.refund ใน cancel_job (ข้อ 1) คู่มือใน docs/srs/operations.md เหตุการณ์ที่ 1 ต้องบอกว่าระหว่างนั้นรับยกเลิกต่อหรือหยุด และใครตัดสิน ไม่มีโค้ด | ใช้แล้ว (operations.md เหตุการณ์ที่ 1 ส่วนการคืนเงิน: รับยกเลิกต่อ Finance ปิดรายการ unknown ภายใน 1 วันทำการ Q-41) |
| REQ-OP-007 | ตาราง refunds (รวม 2 คอลัมน์ใหม่ตาม CR-06) อยู่ในฐานข้อมูลเดียวที่ถูกสำรอง การซ้อมกู้คืนต้องเทียบ refunds.gateway_ref กับรายการฝั่ง gateway เพื่อหารายการที่หาย | ใช้แล้ว (คู่มือส่วนซ้อมกู้คืนเทียบ refunds.gateway_ref กับรายการฝั่ง gateway) |
| REQ-QA-010 | Gateway.refund ในข้อ 1 ยังไม่มี timeout และยังไม่กำหนดว่าถ้าไม่ตอบต้องบันทึก Refund.result อะไร (Q-34, Q-41) reference เดิมและห้ามส่งซ้ำมีแล้วตาม REQ-IF-010 (AC-08-03, AC-08-04) IF-02 ใช้คิวเดิมของ 002 (quality-requirements.md QAS-1 และ QAS-2) | ใช้แล้ว (T-08 Gateway.refund มี timeout_seconds ไม่ตอบบันทึก unknown ไม่ส่งซ้ำ AC-08-08, T-07 AC-08-07) |
| REQ-SEC-010 | POST /jobs/{id}/customer-cancel และ GET /jobs/{id}/refund-quote ตรวจ customer_id แล้วตอบ 404 (AC-08-01) ต้องเพิ่มการบันทึกความพยายามใน cancel/router.py และรหัสตอบ 403 หรือ 404 รอ Q-47 (ถ้า 403 ต้องมี CR แก้ AC-08-01 ก่อน) MU-01 ใน CR-07 เล่าเหตุนี้ผ่าน POST /jobs/{id}/cancel ของ 002 ซึ่งไม่ใช่ endpoint ของ feature นี้ | ใช้แล้ว (T-10 ตอบ 403 และบันทึก AC-08-10 ตาม MU-01 AC-08-01 ข้อความไม่เปลี่ยน test เปลี่ยน assert) POST /jobs/{id}/cancel ของ 002 ถูกปิด (T-21 ของ 002) ทางยกเลิกของลูกค้าเหลือ endpoint ของ feature นี้ทางเดียว |
| REQ-SEC-011 | ไม่เกี่ยวกับ feature นี้ เพราะ feature นี้ปล่อยช่วงเวลาให้กลับเป็น "ว่าง" (REQ-DAT-003) ไม่ได้ล็อกช่วงเวลา | ไม่เกี่ยวกับ feature นี้ (ยืนยันหลัง CR-07) |
| REQ-PRV-010 | ไม่เกี่ยวกับ feature นี้ เพราะไม่มีข้อมูลส่วนบุคคลใหม่ (spec ส่วน 7) ตาราง refunds อ้างงานด้วย job_id ไม่มีชื่อหรือเบอร์ การลบทำที่ตาราง customers ของ 002 | ไม่เกี่ยวกับ feature นี้ (ยืนยันหลัง CR-07) |
| REQ-CMP-001 | ไม่มีโค้ด REQ-PRV-002 ที่ feature นี้ใช้ (T-02, T-03) ต้องมีบรรทัด "ผลการตรวจโดยฝ่ายกฎหมาย" ตอนนี้คือ "รอการตรวจ" | ใช้แล้ว (REQ-PRV-002 ตรวจโดย SH-05 แล้ว) |
| REQ-SEC-012 (เพิ่มในประชุม EV-045) | endpoint ของ feature นี้ 2 ตัวอยู่ในบัญชี endpoint ของ operations.md ช่อง now= ใช้ได้เฉพาะโหมด test | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-08-01 | test_AC_08_01_quote_equals_actual_refund (R1, R2), test_AC_08_01_other_customer_cannot_see_or_cancel | GET refund-quote ที่ 48 และ 5 ชั่วโมงก่อนนัด ตรวจ allowed แถว ยอด แล้ว POST customer-cancel ตรวจยอดเท่ากัน ลูกค้าอื่นได้ 404 ทั้งสอง endpoint |
| AC-08-01 (หน้าจอ) | AC-08-01.test.jsx | API จำลองตอบ quote 350 ตรวจว่าแสดง 350 กดยืนยันแล้วเรียก cancelByCustomer ครั้งเดียวและส่งผลต่อ |
| AC-08-02 | test_AC_08_02_cancel_sets_status_history_and_frees_slot | ยกเลิกแล้วตรวจ job cancelled, แถวประวัติล่าสุด, slot free และ GET /technicians ของลูกค้าอื่นเห็น slot นั้น |
| AC-08-03 | test_AC_08_03_refund_sent_via_gateway_with_same_ref | ตรวจ FakeGateway.calls มี refund:{ref เดิม}:350 ครั้งเดียว และ Refund.gateway_ref, result, rule |
| AC-08-04 | test_AC_08_04_second_cancel_rejected_no_double_refund | ยกเลิก 2 ครั้ง ครั้งที่สอง 409 "ยกเลิกไปแล้ว" refund call ยัง 1 ครั้ง quote ตอบ allowed false |
| AC-08-05 | test_AC_08_05_notify_customer_and_technician_within_60s | ตรวจคิวมีข้อความถึง customer และ technician due_at ไม่เกิน 60 วินาที และข้อความลูกค้ามี 180 |
| AC-08-06 | test_AC_08_06_not_cancellable_returns_message (R3, R6) | ตั้งสถานะ en_route / in_progress ตรวจ quote allowed false พร้อมข้อความ POST ได้ 409 สถานะเดิม ไม่มี refund call |
| AC-08-06 (หน้าจอ) | AC-08-06.test.jsx (2 ตัว) | API จำลองตอบ allowed false พร้อมข้อความ R3 / R6 ตรวจ "ยกเลิกไม่ได้" ข้อความ และไม่มีปุ่มยืนยัน |
| UI-08-01, UI-08-02 | UI-08-01.test.jsx (2 ตัว), UI-08-02.test.jsx (1 ตัว) | ตรวจรายการ "ต้องตรง" ของแต่ละหน้าตาม spec ส่วน 12 (UI-08-01 ใช้ยอด 210 ที่ไม่มีในตารางจริง พิสูจน์ว่าหน้าจอไม่คำนวณเอง) |
| AC-07-10 (ใช้ร่วม) | test_AC_07_10_refund ของ 002 | ยอดทุกแถว BR-01 ตรวจที่นี่แล้ว ไม่เขียนซ้ำ ต้องรันซ้ำเพราะ cancel_job ถูกแก้ |

หลักแยก (เดิมของโครงการ): AC ที่ Then บอกว่า "บันทึก" หรือ "สถานะ" ตรวจที่หลังบ้าน AC ที่ Then บอกว่า "แจ้ง" "เห็น" หรือ "แสดง" บนหน้าจอ ต้องมี test หน้าจอด้วย

## 7. ลำดับงาน

ไม่มีงานของการยกเลิกโดย call center แทนลูกค้า และกระบวนการร้องเรียน ตัดออกตาม EV-044 เพื่อให้ทัน 8 สัปดาห์ (REQ-CON-001)

หลังบ้าน
1. Gateway.refund และคอลัมน์ผลคืนเงิน (REQ-IF-010, REQ-CON-003)
2. ขยาย cancel_job ให้ทำ BR-05 ครบ และ quote (REQ-BR-001, REQ-DAT-003, REQ-FN-055, D-08-02) แล้วรัน test ของ 002 ซ้ำ
3. endpoint ของลูกค้า refund-quote และ customer-cancel (REQ-FN-054, AC-08-01 ถึง 06)

หน้าจอ (ใช้ API จำลองตามสัญญาข้อ 4 จึงเริ่มพร้อมหลังบ้านได้)
4. หน้ายกเลิกการจองตาม UI-08-01 (AC-08-01, AC-08-06 หน้าจอ)
5. หน้าผลการยกเลิกตาม UI-08-02 และต่อเข้าแถบเมนู
6. รัน test ทั้งชุด (รวม 002 และ 003) และตรวจหน้าจอจริงเทียบ mockup ด้วยคน

## 8. สิ่งที่ยังไม่ทำ

- Q-14 R3: ลูกค้าเห็น "ติดต่อ call center" ส่วนที่เกี่ยวข้องกับยอดคืน R3 จะยังไม่สร้างจนกว่าจะได้คำตอบ (test R3 ของ 002 ยังข้าม)
- Q-33 คิวรอ (waitlist) ใน UC-07 A1 ยังไม่มีรหัส UC (UC-07.md แก้ให้ไม่ใช้ UC-08 แล้ว): รอ RE lead ตัดสินว่าจะเป็น UC ใหม่หรือไม่
- Q-34 gateway ปฏิเสธคำขอคืนเงิน: บันทึกผลลง Refund.result ไม่ส่งซ้ำ ไม่มี AC ไม่มี test ส่วนนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-35 ช่องทางและจำนวนวันที่เงินคืนเข้า: หน้าจอไม่แสดงจำนวนวัน จะยังไม่สร้างจนกว่าจะได้คำตอบ

## 9. ปรับตาม CR-07 (plan v2, 24 ต.ค. 2569)

ข้อ 1 ถึง 8 ไม่แก้

### 9.1 โมเดลข้อมูล
refunds.result เพิ่มค่า unknown (gateway ไม่ตอบคำขอคืนเงินภายใน 30 วินาที) ไม่มีคอลัมน์ใหม่

### 9.2 API ที่เปลี่ยน
| รายการ | เปลี่ยนอย่างไร | รองรับ |
|---|---|---|
| GET /jobs/{job_id}/refund-quote, POST /jobs/{job_id}/customer-cancel | ไม่ใช่งานของลูกค้าหรือไม่มีงาน ตอบ 403 เหมือนกัน (เดิม 404) และบันทึกความพยายาม | REQ-SEC-010, AC-08-01, AC-08-10 |
| POST /jobs/{job_id}/customer-cancel | refund_result เป็น unknown เมื่อ gateway ไม่ตอบ ข้อความถึงลูกค้าบอก "กำลังตรวจสอบการคืนเงิน" | REQ-QA-010, AC-08-08 |
| Gateway.refund | เพิ่มพารามิเตอร์ timeout_seconds (ค่าเดียวกับ GATEWAY_TIMEOUT_SECONDS) | REQ-QA-010 |
| หน้ายกเลิก UI-08-01 | ได้ 403 แสดง "ไม่พบงานหมายเลขนี้" เหมือนสถานะ 3 เดิม | AC-08-10 (หน้าจอ) |

### 9.3 แผนทดสอบที่เพิ่ม
| AC | test | ตรวจอย่างไร |
|---|---|---|
| AC-08-01 (assert เปลี่ยน) | test_AC_08_01_other_customer_cannot_see_or_cancel | assert 403 แทน 404 |
| AC-08-07 | test_AC_08_07_two_concurrent_cancels_refund_once | 2 thread พร้อมกัน บน SQLite ผ่านโดยโครงสร้าง (GAP-15) |
| AC-08-08 | test_AC_08_08_refund_timeout_recorded_unknown_not_resent | FakeGateway(refund_mode=timeout) |
| AC-08-09 | test_AC_08_09_cancel_under_load_scaled | 10 คำขอพร้อมกัน (ย่อจาก 50) |
| AC-08-10 | test_AC_08_10_customer_cannot_cancel_other_customers_job, AC-08-10.test.jsx | ลูกค้า A ยกเลิกงาน B ได้ 403 งาน B ไม่เปลี่ยน บันทึก 1 แถว |

## 10. ปรับตาม CR-10 (plan v3, 3 พ.ย. 2569)

ข้อนี้เพิ่มใหม่ ข้อ 1 ถึง 9 ไม่แก้

| รายการ | เปลี่ยนอย่างไร | รองรับ |
|---|---|---|
| GET /jobs/{id}/refund-quote | เพิ่มช่อง note (ข้อความเหตุที่ยอดคืนถูกหัก มีเฉพาะ R3) | REQ-BR-001, AC-08-12 |
| POST /jobs/{id}/customer-cancel | เพิ่มช่อง refund_message (ไม่ว่างเมื่อ gateway ปฏิเสธหรือไม่ตอบ) | REQ-IF-010, AC-08-11 |
| refund/service.py cancel_job | R3 ยกเลิกได้ (ใช้ rules.py ของ 002) ข้อความถึงลูกค้าเมื่อ declined ไม่บอกว่าคืนแล้ว ข้อความถึงช่างเมื่อ R3 | REQ-IF-010, REQ-FN-055 |
| GET /ops/refunds/follow-up | ใหม่ รายการคืนเงิน declined และ unknown ให้ Finance ใช้กุญแจ X-Ops-Token ในโหมด production ไม่มีข้อมูลส่วนบุคคล | REQ-IF-010 (Q-34), REQ-SEC-012 (บัญชี endpoint) |
| หน้ายกเลิก UI-08-01 และหน้าผล UI-08-02 | แสดง note และ refund_message จากระบบ บรรทัดช่องทางคืนเงินตาม Q-35 | REQ-FN-054, REQ-IF-010 |

test ใหม่: test_AC_08_11_gateway_declines_refund_no_retry_finance_follow_up, test_AC_08_12_cancel_while_en_route_deducts_travel_fee (backend/tests/test_cancel_cr10.py), AC-08-11.test.jsx, AC-08-12.test.jsx และ test ใหม่ใน UI-08-02.test.jsx
ตารางตรวจ Constraints: ไม่มีข้อใหม่ในไฟล์กลาง endpoint ใหม่เพิ่มในบัญชี endpoint ของ operations.md ใน commit เดียวกัน (REQ-SEC-012)
