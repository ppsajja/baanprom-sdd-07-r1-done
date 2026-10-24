# Plan: ช่างอัปเดตสถานะงานภาคสนาม (UC-09)

อ้างอิง: spec.md SPEC-JOB-STATUS v0.2 (หลัง /clarify) และ v1.0 (CR-05) | Updated: 2569-10-18 | สร้างด้วย /plan แล้วทีมตรวจแล้ว (plan v1, prompt-log.md #47)
อ้างอิง Constraint กลาง: specs/000-shared/constraints.md รุ่น 1.0 (D-00-01 ถึง D-00-05 ใช้ตาม ไม่ถามซ้ำ)

plan v2 (2569-10-24): CR-07 อนุมัติ แก้เฉพาะตารางข้อ 5 ส่วนรุ่น 1.1 และเพิ่มข้อ 9 ด้วยข้อความสั่งในแชต **ไม่ได้รัน /plan ใหม่** (prompt-log.md #70) อ้างอิง spec.md 1.1 และ Constraint กลางรุ่น 1.1

## 1. สรุปแนวทาง

- ช่างเปิดรายการงานของตัวเอง (REQ-FN-050) แล้วกดปุ่มเปลี่ยนสถานะตามลูกศร BR-04 (REQ-FN-051) ระบบบันทึกประวัติ (REQ-DAT-002) และแจ้งลูกค้า (REQ-FN-053)
- ใช้โค้ดของ SPEC-BOOKING ที่มีอยู่ต่อ: ตาราง jobs และ job_status_history, ฟังก์ชัน set_status (ที่เดียวทั้งระบบ), technician_view (กฎเบอร์โทร REQ-SEC-004), คิวแจ้งเตือน notify/queue.py ไม่สร้างซ้ำ
- ตารางลูกศรฝั่งช่าง (BR-04) อยู่ใน backend/app/jobstatus/transitions.py ที่เดียว (D-09-01) หน้าจอรับปุ่มที่กดได้จาก API
- ลูกค้าและ call center ใช้ endpoint อ่านอย่างเดียวชุดเดียวกัน (GET /jobs/{id} ของ SPEC-BOOKING และ GET /jobs/{id}/history ใหม่) จึงเห็นสถานะเดียวกับช่างโดยไม่มี logic ฝั่งหน้าจอ (REQ-FN-052)
- หน้าจอ 2 หน้า (UI-09-01, UI-09-02) อยู่ในแอป React เดิม เพิ่มแถบเมนูด้านบนเพื่อสลับหน้า (ปุ่มนำทาง ไม่ต้องมี REQ)

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| Python + FastAPI | D-00-01 | โครงเดิมใน backend/ เพิ่มโมดูล app/jobstatus/ |
| SQLAlchemy 2 + PostgreSQL (test ใช้ SQLite ในหน่วยความจำ) | D-00-02 | ไม่สร้างตารางใหม่ ใช้ jobs และ job_status_history เดิม |
| React 19 (Vite) + Tailwind CSS 4 | D-00-03 | เพิ่มหน้าใน frontend/src/pages/ เรียก API ผ่าน api/client.js ที่เดียว |
| pytest + httpx, Vitest + RTL | D-00-04 | test ชื่อ test_AC_09_nn และ AC-09-nn.test.jsx / UI-09-nn.test.jsx |
| คิวในหน่วยความจำ (notify/queue.py) | ของเดิมจาก plan ของ 002-booking (ทีมเลือกเอง) | ใช้ตัวเดิม ไม่เพิ่ม |
| ระบบส่งข้อความ (IF-02) | REQ-FN-053 | วางข้อความลงคิวเดิม ตัวส่งแยกทำงาน |

ไม่มีเทคโนโลยีใหม่ library ทั้งหมดอยู่ใน backend/requirements.txt และ frontend/package.json เดิม
รัน test: `cd backend && pytest -v -k "AC_"` และ `cd frontend && npm test` (คำสั่งเดิมของโครงการ รันได้ทุก feature)

### โครงไฟล์ (เฉพาะที่ feature นี้เพิ่มหรือแตะ)

```
backend/app/
  jobstatus/transitions.py   BR-04 ตารางลูกศรฝั่งช่าง, ชื่อปุ่ม, ชื่อสถานะไทยสำหรับข้อความแจ้งเตือน (D-09-01, D-09-03)
  jobstatus/service.py       list_jobs_for_technician (REQ-FN-050), change_status (REQ-FN-051, REQ-DAT-002, REQ-FN-053), history_for (REQ-FN-052)
  jobstatus/router.py        GET /technicians/{id}/jobs, POST /jobs/{id}/status, GET /jobs/{id}/history
  main.py                    include_router ของ jobstatus
backend/tests/
  test_job_status.py         AC-09-01 ถึง 08 และ 10
  test_job_status_privacy.py AC-09-09
frontend/src/
  statusNames.js             ชื่อสถานะไทยตาม glossary ที่เดียวของหน้าจอ (BookingResult.jsx เปลี่ยนมาใช้ตัวนี้ พฤติกรรมไม่เปลี่ยน)
  api/client.js              jobStatusApi (4 ฟังก์ชัน)
  pages/TechnicianJobs.jsx   UI-09-01
  pages/JobStatus.jsx        UI-09-02
  App.jsx                    แถบเมนูสลับหน้า
  __tests__/UI-09-01.test.jsx, UI-09-02.test.jsx, AC-09-02.test.jsx, AC-09-05.test.jsx
```

## 3. โมเดลข้อมูล

| ตาราง | ฟิลด์หลัก | รองรับ |
|---|---|---|
| jobs (เดิม) | id, technician_id, customer_id, status (8 ค่า), scheduled_start | REQ-FN-050, REQ-FN-051, REQ-DAT-002 |
| job_status_history (เดิม) | id, job_id, from_status, to_status, at | REQ-DAT-002, REQ-FN-052 |
| customers (เดิม) | name, phone (PII) | REQ-SEC-004, REQ-PRV-002 |

- ไม่มีตารางใหม่ ไม่มีฟิลด์ใหม่ ไม่มีตาราง log (REQ-PRV-002 ใช้ privacy.py เดิม)
- "เก็บประวัติ 24 เดือน": ไม่มีการลบในโค้ด จึงเก็บไว้ทั้งหมด (เกิน 24 เดือน) ยังไม่มี AC ตรวจ (rtm.md F-10)

## 4. API / หน้าจอ

| รายการ | input / output หลัก | รองรับ |
|---|---|---|
| GET /technicians/{technician_id}/jobs | in: now / out: งานของช่างคนนี้ทุกงาน เรียงตามเวลานัด แต่ละงานมี status, customer_name, next_statuses[{status,label}] และ customer_phone เฉพาะช่วง 2 ชั่วโมงก่อนนัดจนปิดงาน หรือ 404 ถ้าไม่มีช่าง | REQ-FN-050, REQ-SEC-004, AS-12 |
| POST /jobs/{job_id}/status | in: technician_id, to_status, now / out: 200 งานพร้อม next_statuses ใหม่ หรือ 409 {reason: transition_not_allowed} หรือ 404 ถ้าไม่ใช่งานของช่าง หรือ 422 ถ้าสถานะไม่อยู่ใน 8 ค่า | REQ-FN-051, REQ-DAT-002, REQ-FN-053 |
| GET /jobs/{job_id}/history | out: {job_id, status, history[{from_status,to_status,at}]} เรียงตามเวลา | REQ-DAT-002, REQ-FN-052 |
| GET /jobs/{job_id} (เดิมของ 002) | out: สถานะมุมมองลูกค้า ใช้ร่วม ไม่แก้ | REQ-FN-052 |
| หน้างานของช่าง TechnicianJobs (UI-09-01, mockups/UI-09-01-technician-jobs.html) | เรียก GET /technicians/{id}/jobs แสดงงานและปุ่มจาก next_statuses กดแล้ว POST /jobs/{id}/status ถ้า 409 แสดง "เปลี่ยนสถานะนี้ไม่ได้" | REQ-FN-050, REQ-FN-051, REQ-SEC-004 |
| หน้าสถานะงาน JobStatus (UI-09-02, mockups/UI-09-02-job-status.html) | กรอกหมายเลขงาน เรียก GET /jobs/{id}/history แสดงสถานะปัจจุบันและประวัติเป็นคำไทย | REQ-FN-052, REQ-DAT-002 |

สิ่งที่ mockup มีแต่ spec ไม่ได้สั่ง ไม่อยู่ในตารางนี้ ไปอยู่ข้อ 8: ปุ่มย้อนสถานะ (Q-30) ปุ่มลูกค้ายืนยันงานเสร็จ (Q-31) ตัวกรองซ่อนงานที่ปิดแล้ว (Q-32)

## 5. ตารางตรวจ Constraints

Constraint เฉพาะ feature (spec ส่วน 4 และ 8)

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| REQ-SEC-004 | ข้อ 4: GET /technicians/{id}/jobs และ POST /jobs/{id}/status ใส่ customer_phone ผ่าน technician_view ตัวเดิม (D-09-02) | ใช้แล้ว |
| REQ-DAT-002 | ข้อ 3: ใช้ jobs.status 8 ค่า และ job_status_history เดิม ทุกการเปลี่ยนผ่าน set_status | ใช้แล้ว |

Constraint กลางจาก specs/000-shared/constraints.md รุ่น 1.0 ครบทุกข้อ

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| REQ-CON-001 | ข้อ 7: ตัด UC-05 (ช่างปฏิเสธและจับคู่ใหม่) และ sign-in ของแอปช่างออกจาก R1 ตาม EV-044 ให้ทัน 8 สัปดาห์ | ใช้แล้ว |
| REQ-CON-003 | ไม่เกี่ยวกับ feature นี้ เพราะ feature นี้ไม่มีการตัดเงินหรือคืนเงิน ไม่เรียก Payment Gateway เลย (ค้น "gateway" ใน app/jobstatus ต้องไม่เจอ) | ไม่เกี่ยวกับ feature นี้ |
| REQ-PRV-002 | ข้อ 2 และ 4: router ของ jobstatus ขอ logger ผ่าน privacy.py และ test_AC_09_09 ตรวจว่า log ไม่มีเบอร์ | ใช้แล้ว |
| D-00-01 | ข้อ 2: หลังบ้าน Python + FastAPI โมดูล app/jobstatus | ใช้แล้ว |
| D-00-02 | ข้อ 3: ใช้ตารางเดิมผ่าน SQLAlchemy ไม่สร้าง engine เอง | ใช้แล้ว |
| D-00-03 | ข้อ 2: หน้าจอ React + Tailwind เรียกผ่าน api/client.js (jobStatusApi) | ใช้แล้ว |
| D-00-04 | ข้อ 6: ชื่อ test ตาม AC และ UI รันด้วยคำสั่งเดิม | ใช้แล้ว |
| D-00-05 | ข้อ 4: ตาราง BR-04 และชื่อปุ่มอยู่หลังบ้านที่เดียว หน้าจอรับ next_statuses จาก API ตัวเลข "2 ชั่วโมง" ใช้ PHONE_REVEAL_HOURS เดิมใน config.py หน้าจอพิมพ์ได้เฉพาะข้อความในรายการ "ต้องตรง" | ใช้แล้ว |

ข้อเสนอ Constraint กลางรุ่น 1.1 (specs/000-shared/constraints.md ส่วน 6, CR-07 สถานะ Proposed) เพิ่มแถวไว้ให้ Impact Analysis มองเห็น ยังไม่มี task โค้ด หรือ test จนกว่า CR-07 จะอนุมัติ (เพิ่มในรอบ Failure Day ไม่ได้รัน /plan ใหม่)

| Constraint ID | ถ้าอนุมัติ จะใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| REQ-OP-001 | เวลาล่มนับทั้งระบบ endpoint ของ feature นี้ (GET /technicians/{id}/jobs, POST /jobs/{id}/status, GET /jobs/{id}/history) อยู่ใต้ /health ตัวเดียวกับ 002 ไม่มี SLO เฉพาะของ feature จนกว่า Q-39 จะตอบ (ดู quality-requirements.md QAS-2) | ใช้แล้ว (T-09 AC-09-12 ย่อส่วน Q-39 ปิดแล้ว) |
| REQ-OP-005 | middleware ตัวนับของ 002 คลุม router ของ jobstatus โดยอัตโนมัติ ไม่มีโค้ดเพิ่มใน feature นี้ แต่ต้องตรวจว่าชื่อ endpoint แยกกันในตัวนับ | ใช้แล้ว (middleware ของ 002 นับ POST /jobs/{job_id}/status แยกแล้ว T-11 เปลี่ยน log ของ router เป็น log_event) |
| REQ-OP-006 | เหตุ "ฐานข้อมูลเต็ม" ทำให้ set_status บันทึกประวัติไม่ได้ ช่างกดแล้วได้ข้อผิดพลาด คู่มือใน docs/srs/operations.md เหตุการณ์ที่ 2 ต้องบอกว่าช่างควรทำอย่างไรระหว่างนั้น ไม่มีโค้ด | ใช้แล้ว (operations.md เหตุการณ์ที่ 2 ขั้นที่ 4 และเหตุการณ์ที่ 4) |
| REQ-OP-007 | ตาราง job_status_history ที่ feature นี้เขียน อยู่ในฐานข้อมูลเดียวที่ถูกสำรอง (D-00-02) การซ้อมกู้คืนต้องนับแถวประวัติที่หายด้วย ไม่ใช่เฉพาะการจอง | ใช้แล้ว (AC-00-05 นับงาน คู่มือส่วนซ้อมกู้คืนนับแถวประวัติด้วย) |
| REQ-QA-010 | feature นี้เรียกระบบภายนอกตัวเดียวคือ IF-02 ผ่าน notify/queue.py (REQ-FN-053) timeout 10 วินาทีและส่งซ้ำทุก 5 นาที 6 ครั้ง (Q-40) ทำที่คิวเดิมของ 002 ที่เดียว สถานะงานต้องบันทึกสำเร็จแม้ IF-02 ไม่ตอบ (quality-requirements.md QAS-3) | ใช้แล้ว (T-08 delivered_at และ Notifier, T-10 ส่งซ้ำทุก 5 นาที ไม่เกิน 6 ครั้ง ทำที่ notify/queue.py ที่เดียว) |
| REQ-SEC-010 | POST /jobs/{id}/status ตรวจ technician_id แล้วตอบ 404 (AC-09-06) GET /technicians/{id}/jobs รับ id ใดก็ได้เพราะยังไม่มี sign-in ต้องเพิ่มการบันทึกความพยายาม (ผู้ส่ง เวลา เลขงาน) ใน jobstatus/router.py และรหัสตอบ 403 หรือ 404 รอ Q-47 (ถ้า 403 ต้องมี CR แก้ AC-09-06 ก่อน) | ใช้แล้ว (T-11 ตอบ 403 ตาม Q-47 แก้ AC-09-06 ใน CR-07 และบันทึกความพยายาม AC-09-14) GET /technicians/{id}/jobs ยังรับ id ใดก็ได้ รอ UC-01 (TH-01) |
| REQ-SEC-011 | ไม่เกี่ยวกับ feature นี้ เพราะไม่มีการล็อกช่วงเวลา (ค้น "hold" ใน app/jobstatus ต้องไม่เจอ) | ไม่เกี่ยวกับ feature นี้ (ยืนยันหลัง CR-07) |
| REQ-PRV-010 | รายการงานของช่าง (customer_name ในข้อ 4) และข้อความแจ้งเตือนถึงลูกค้า ต้องแสดงรหัสลูกค้าแทนชื่อหลังลูกค้าขอลบ จุดที่ต้องแก้คือ list_jobs_for_technician ใน jobstatus/service.py ซึ่งอ่านชื่อจากตาราง customers ของ 002 ถ้า 002 ลบชื่อแล้ว feature นี้ได้ค่าว่าง ต้องตกลงว่าจะแสดงอะไร | ใช้แล้ว (ตกลงใน EV-045: หลังลบ customers.name เป็น "ลูกค้า #รหัส" รายการงานของช่างแสดงค่านั้น ไม่ต้องแก้ jobstatus/service.py ข้อความแจ้งเตือนมีแค่เลขงานอยู่แล้ว) |
| REQ-CMP-001 | ไม่มีโค้ด REQ-PRV-002 ที่ feature นี้ใช้ (T-02, T-04) ต้องมีบรรทัด "ผลการตรวจโดยฝ่ายกฎหมาย" ตอนนี้คือ "รอการตรวจ" | ใช้แล้ว (REQ-PRV-002 ตรวจโดย SH-05 แล้ว) |
| REQ-SEC-012 (เพิ่มในประชุม EV-045) | endpoint ของ feature นี้ 3 ตัวอยู่ในบัญชี endpoint ของ operations.md ช่อง now= ของ POST /jobs/{id}/status ใช้ได้เฉพาะโหมด test | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-09-01 | test_AC_09_01_technician_sees_only_own_jobs | สร้างงานของช่าง 2 คน แล้ว GET /technicians/{id}/jobs ของประสิทธิ์ ตรวจว่ามีเฉพาะงานตัวเอง สถานะ confirmed และ next_statuses = [en_route] |
| AC-09-02 | test_AC_09_02_en_route_recorded | POST status en_route ตรวจสถานะและแถวประวัติล่าสุด (from, to, at) |
| AC-09-03, AC-09-04 | test_AC_09_03_check_in_then_AC_09_04_close | ไล่ en_route, in_progress, done ตรวจสถานะทีละขั้น และ done ไม่มีปุ่ม |
| AC-09-05 | test_AC_09_05_transition_not_allowed (parametrize 5 แถว) | ตั้งสถานะตามแถว ขอเปลี่ยนเป็นปลายทางที่ไม่อนุญาต ตรวจ 409 สถานะเดิม และจำนวนแถวประวัติเท่าเดิม |
| AC-09-06 | test_AC_09_06_other_technician_cannot_change | ช่างคนอื่น POST status ตรวจ 404 และสถานะเดิม |
| AC-09-07 | test_AC_09_07_customer_and_call_center_see_same_status | หลังช่างเปลี่ยน GET /jobs/{id} และ GET /jobs/{id}/history ตรวจสถานะเท่ากัน และไม่มี customer_phone |
| AC-09-08 | test_AC_09_08_notify_customer_within_60s_on_each_change | เปลี่ยน 2 ครั้ง ตรวจข้อความถึงลูกค้า 2 ข้อความ due_at ไม่เกิน now + 60 วินาที |
| AC-09-09 | test_AC_09_09_phone_in_job_list_only_from_2h_until_closed | รายการงานที่ 11:30 ไม่มีเบอร์ ที่ 12:00 มี หลัง done ไม่มี และ caplog ไม่มีเบอร์ |
| AC-09-10 | test_AC_09_10_history_complete_in_order | ไล่จนเสร็จสิ้น ตรวจแถวประวัติครบ 5 แถวและเรียงตามเวลา |
| AC-09-02 (หน้าจอ) | AC-09-02.test.jsx | API จำลองตอบงานหลังกด ออกเดินทาง ตรวจว่าหน้าจอแสดง "ช่างกำลังเดินทาง" และปุ่มถัดไปเปลี่ยนตามระบบ |
| AC-09-05 (หน้าจอ) | AC-09-05.test.jsx | API จำลองตอบ 409 ตรวจ "เปลี่ยนสถานะนี้ไม่ได้" และสถานะเดิมคงอยู่ |
| UI-09-01, UI-09-02 | UI-09-01.test.jsx (3 ตัว), UI-09-02.test.jsx (2 ตัว) | ตรวจรายการ "ต้องตรง" ของแต่ละหน้าตาม spec ส่วน 12 (UI-09-02 ครอบคลุม AC-09-07 ส่วนหน้าจอด้วย) |

หลักแยก (เดิมของโครงการ): AC ที่ Then บอกว่า "บันทึก" หรือ "สถานะ" ตรวจที่หลังบ้าน AC ที่ Then บอกว่า "แจ้ง" "เห็น" หรือ "ปฏิเสธ" บนหน้าจอ ต้องมี test หน้าจอด้วย

## 7. ลำดับงาน

ไม่มีงานของ UC-05 (ช่างปฏิเสธและจับคู่ใหม่) และไม่มี sign-in ของแอปช่าง ตัดออกตาม EV-044 เพื่อให้ทัน 8 สัปดาห์ (REQ-CON-001)

หลังบ้าน
1. ตาราง BR-04 และชื่อปุ่ม (REQ-FN-051, D-09-01)
2. รายการงานของช่าง และประวัติ (REQ-FN-050, REQ-FN-052, REQ-DAT-002, AC-09-01, AC-09-07, AC-09-10)
3. เปลี่ยนสถานะ บันทึกประวัติ แจ้งลูกค้า (REQ-FN-051, REQ-FN-053, AC-09-02 ถึง 06, AC-09-08)
4. เบอร์ลูกค้าในรายการงานและ log (REQ-SEC-004, REQ-PRV-002, AC-09-09)

หน้าจอ (ใช้ API จำลองตามสัญญาข้อ 4 จึงเริ่มพร้อมหลังบ้านได้)
5. หน้างานของช่างตาม UI-09-01 (AC-09-02, AC-09-05 หน้าจอ)
6. หน้าสถานะงานตาม UI-09-02 และแถบเมนูใน App.jsx
7. รัน test ทั้งชุด (รวมของ 002-booking) และตรวจหน้าจอจริงเทียบ mockup ด้วยคน

## 8. สิ่งที่ยังไม่ทำ

- Q-30 ย้อนสถานะ: ไม่มีปุ่มย้อน ระบบตอบ 409 ส่วนนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-31 ลูกค้ายืนยันงานเสร็จ: ไม่มีปุ่มบนหน้าสถานะงาน "ปิดงาน" โดยช่างเป็น "เสร็จสิ้น" ทันที (AS-11) จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-32 ซ่อนงานที่ปิดแล้ว: รายการแสดงทุกงาน (AS-12) ไม่มีตัวกรอง จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-36 ย้าย REQ-SEC-004 ไปไฟล์กลาง: ไม่แตะไฟล์กลาง รอ RE lead
- "เก็บประวัติ 24 เดือน" ของ REQ-DAT-002 ยังไม่มี AC และไม่มี task (rtm.md F-10)

## 9. ปรับตาม CR-07 (plan v2, 24 ต.ค. 2569)

ข้อ 1 ถึง 8 ไม่แก้

### 9.1 โมเดลข้อมูล
ไม่มีตารางใหม่ของ feature นี้ ข้อความในคิว (notify/queue.py ของ 002) เพิ่ม attempts, last_attempt_at, delivered_at, gave_up ตาราง security_events ใช้ร่วมกับทั้งระบบ

### 9.2 API ที่เปลี่ยน
| รายการ | เปลี่ยนอย่างไร | รองรับ |
|---|---|---|
| POST /jobs/{job_id}/status | ไม่ใช่งานของช่างหรือไม่มีงาน ตอบ 403 เหมือนกัน (เดิม 404 และไม่มีงานตอบ 404 "ไม่พบงาน") ตรวจสิทธิ์ก่อนตรวจชื่อสถานะ และบันทึกความพยายาม ส่งเบอร์ในคำตอบเมื่อไรบันทึก phone_revealed | REQ-SEC-010, AC-09-06, AC-09-14 |
| GET /technicians/{technician_id}/jobs | บันทึก phone_revealed ของทุกงานที่มีเบอร์ในคำตอบ log เหลือรหัสช่างและจำนวน | REQ-SEC-010, REQ-OP-005 |
| ตัวส่งข้อความ (queue.deliver_due) | ใหม่ เรียก IF-02 timeout 10 วินาที ส่งซ้ำทุก 5 นาที ไม่เกิน 6 ครั้ง งานเบื้องหลังเรียกทุก 1 นาที | REQ-QA-010, AC-09-11, AC-09-13 |

### 9.3 แผนทดสอบที่เพิ่ม
| AC | test | ตรวจอย่างไร |
|---|---|---|
| AC-09-06 (แก้) | test_AC_09_06_other_technician_cannot_change | assert 403 แทน 404 (CR-07 ตาราง test เดิมที่เปลี่ยน) |
| AC-09-11 | test_AC_09_11_messages_accepted_by_if02_within_60s | FakeNotifier ตอบทันที ตรวจ delivered_at ห่างจากเวลากดไม่เกิน 60 วินาที (ย่อส่วน 3 ครั้ง) |
| AC-09-12 | test_AC_09_12_status_change_under_load_scaled | 10 คำขอพร้อมกัน (ย่อจาก 50) |
| AC-09-13 | test_AC_09_13_if02_down_status_saved_message_resent_once, test_AC_09_13_if02_down_beyond_retries_gives_up_after_6 | FakeNotifier(mode=down) เดินนาฬิกาทีละ 1 นาที |
| AC-09-14 | test_AC_09_14_denied_status_change_logged_without_leaking_existence | 403 สองกรณี security_events 2 แถว |

## 10. ปรับตาม CR-10 (plan v3, 3 พ.ย. 2569)

ข้อนี้เพิ่มใหม่ ข้อ 1 ถึง 9 ไม่แก้
- ข้อความถึงลูกค้าเมื่อเปลี่ยนเป็น "เสร็จสิ้น" ต่อท้ายด้วยช่องทางแจ้งปัญหา เลขโทรจาก config.call_center_tel() และจำนวนวันจาก JOB_ISSUE_REPORT_DAYS (D-09-04) แก้ที่ jobstatus/service.py change_status จุดเดียว
- ไม่มีลูกศรใหม่ ไม่มีปุ่มใหม่ (Q-31 ปิดว่าไม่มีขั้นลูกค้ายืนยัน) BR-04 ไม่เปลี่ยน
- test: test_AC_09_15_done_without_customer_confirm_and_message_tells_how_to_report ใน backend/tests/test_job_status_cr10.py
