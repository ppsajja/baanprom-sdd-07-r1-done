# baanprom-sdd-07-r1-done

repo ตัวอย่างของรายวิชา 517511-266 Requirement Engineering (AI-Native RE)
ภาควิชาคอมพิวเตอร์ คณะวิทยาศาสตร์ มหาวิทยาลัยศิลปากร

เคส: บ้านพร้อม (แพลตฟอร์มจองช่างซ่อมบ้าน) มี 4 feature คือ UC-07 จองงานบริการซ่อมบำรุง UC-09 ช่างอัปเดตสถานะงาน UC-08 ลูกค้ายกเลิกการจองและรับเงินคืน และ UC-14 ผู้ช่วยตอบคำถามลูกค้าและเลื่อนนัด
ข้อมูลทั้งหมดในเคสนี้เป็นข้อมูลสมมติเพื่อการสอน

## repo นี้คืออะไร

repo นี้คือสภาพงานของกลุ่มตัวอย่าง (กลุ่ม X) หลังบทเรียน RE in One Line และการตรวจรับ เมื่อเจ้าของลงนามรับ R1 แล้ว
ต่อจาก baanprom-sdd-06-accept (ประวัติ commit ของ repo 06 อยู่ครบใน repo นี้) และเพิ่ม 3 commit ที่อ่านแยกกันได้

- commit ที่ 1 "RE in One Line และการตรวจรับ: แผนตรวจรับ R1 และ CR-10 ตอบเงื่อนไขก่อนเปิด R1" คือก่อนวันตรวจรับ: ตอบคำถามที่เป็นเงื่อนไขก่อนเปิด R1 ในประชุม EV-048 (Q-14, Q-18, Q-19, Q-23, Q-24, Q-26, Q-27, Q-31, Q-34, Q-35 และ F-15) เป็น CR-10 อนุมัติ CR-02 ทำ /plan /tasks /implement test eval แล้วเขียนแผนตรวจรับ R1 scenario และแผน OAT
- commit ที่ 2 "ตรวจรับ R1 รอบแรก" คือวันตรวจรับ: เดิน scenario OAT 7 ข้อบนเครื่องทดสอบที่ติดตั้งจากของที่ส่งมอบ (PostgreSQL โหมด production) คัดแยกสิ่งที่พบเป็นข้อบกพร่อง (DEF-01 DEF-02) คำขอเปลี่ยนแปลง (CR-08 Proposed) และคำถาม (Q-67) ผลคือรับแบบมีเงื่อนไข 3 ข้อ
- commit ที่ 3 "ตรวจรับ R1 รอบสอง" คือหลังวันตรวจรับ: แก้ DEF-01 DEF-02 ด้วย test ที่ไม่ผ่านก่อน ทดสอบโหลดเต็มรูป ตรวจซ้ำ ลงนามรับ R1 ตั้ง Baseline B5 และเอกสารส่งมอบ

หน้าบทเรียน RE in One Line และการตรวจรับ หัวข้อ 6 ให้ทำแผนตรวจรับบนกระดาษ repo นี้ทำต่อจนจบจริง ไว้ให้เทียบ
การเดินของคน คำตอบของเจ้าของเรื่อง และการลงนาม เป็นข้อมูลสมมติ ผลที่วัดด้วยเครื่อง (test eval OAT ทดสอบโหลด) มาจากการรันจริงทุกตัว รวมทั้งผลที่ไม่ผ่าน

## ใช้เริ่มบทเรียนไหน และเป็นเฉลยของบทไหน

- ใช้เริ่มบทเรียน **บทเสริม การตรวจรับและการส่งมอบในงานจ้าง**
- เป็นเฉลยของบทเรียน **RE in One Line และการตรวจรับ** (หัวข้อ 6 แผนตรวจรับ R1)

## ชุด repo ทั้ง 8

แต่ละ repo คือจุดเริ่มของบทหนึ่ง และเป็นเฉลยของบทก่อนหน้า

| ลำดับ | ชื่อ repo | ใช้เริ่มบท |
|---|---|---|
| 01 | baanprom-sdd-01-spec | Modern Specification และ SDD |
| 02 | baanprom-sdd-02-build | AI Build from Spec |
| 03 | baanprom-sdd-03-vv | Verification, Validation และ Change |
| 04 | baanprom-sdd-04-ops | Operational, Security และ Privacy |
| 05 | baanprom-sdd-05-ai | Data, AI และ Agent |
| 06 | baanprom-sdd-06-accept | RE in One Line และการตรวจรับ |
| 07 | baanprom-sdd-07-r1-done (repo นี้) | บทเสริม การตรวจรับและการส่งมอบ |
| 08 | baanprom-sdd-08-complete | สภาพสุดท้ายหลังจบวิชา |

## อะไรใหม่เมื่อเทียบกับ repo ก่อนหน้า (baanprom-sdd-06-accept)

commit ที่ 1 (ก่อนวันตรวจรับ)

| ไฟล์ | สิ่งที่เพิ่มหรือแก้ | เพราะอะไร |
|---|---|---|
| specs/000-shared/changes/CR-10.md | ใหม่ Approved บันทึกประชุม EV-048 คำตอบ 10 ข้อ ตาราง "test เดิมที่เปลี่ยน" Q-64 Q-65 | คำถามที่เป็นเงื่อนไขก่อนเปิด R1 ต้องมีคำตอบก่อนตรวจรับ (B4) |
| specs/002-booking/changes/CR-02.md | Approved (Q-24 ปิด) AC-07-08 ฉบับวัดได้ | CR ที่รอ SH-01 ตั้งแต่ B1 |
| docs/srs/catalogue.md | v1.6 REQ-FN-057 ใหม่ REQ-BR-002 REQ-IF-010 แก้ข้อความ REQ-FN-041 REQ-IF-005 REQ-QA-003 Approved EV-048 EV-049 | CR-10, CR-02 |
| spec feature rules models ของ 002 ถึง 005 | BR-01 รุ่น 1.1 (R3 หักค่าเดินทาง 100 บาท) MD-STM-01 ไม่มีขั้นลูกค้ายืนยัน AC-07-19 AC-08-11 AC-08-12 AC-09-15 | CR-10 |
| mockups UI-07-02 UI-07-03 UI-08-01 UI-08-02 UI-09-02 | ข้อความใหม่ ภาพ .png ใหม่ | รายการต้องตรงที่ CR-10 แก้ |
| plan.md tasks.md ของ 002 ถึง 005 | T-28 ถึง T-31 (002) T-13 (003) T-12 ถึง T-14 (004) T-13 (005) | /plan /tasks ของ CR-10 |
| backend/app/ config booking refund cancel jobstatus ops payments | ราคาประเมินตารางเดียว R3 ข้อความเงินคืน webhook ถึงคนเวร GET /ops/refunds/follow-up | CR-10 (GAP-28 ปิด) |
| backend/tests/*_cr10.py, frontend/src/__tests__/ | test ใหม่ test เดิมแก้ 5 จุดตามตารางของ CR-10 | กติกา Baseline ข้อ 8 |
| specs/005-ai-assistant/eval/, policies | eval set 1.1 (4 ข้อ) cancel-policy.md refund-timing.md | GAP-35 การวิเคราะห์ผลกระทบพลาด eval set |
| specs/000-shared/test-run-cr10.txt, test-run-cr10-round1.txt | ผลรันรอบ CR-10 และรอบแรกที่ test เดิมพัง | หลักฐานตามกติกาข้อ 8 |
| docs/acceptance/uat-plan-r1.md, uat-scenarios-r1.md, oat-plan-r1.md | แผนตรวจรับ R1 (อ้าง B4 และ CR-10) scenario U-01 ถึง U-14 แผน OAT-1 ถึง OAT-7 ตารางความรุนแรง | เฉลยหัวข้อ 6 ของบทเรียน |
| backend/uat_seed.py, uat_replay.py | ข้อมูลทดสอบสมมติ และสคริปต์เดินซ้อม scenario ผ่าน API | เกณฑ์เริ่มของแผนตรวจรับ |

commit ที่ 2 (ตรวจรับรอบแรก)

| ไฟล์ | สิ่งที่เพิ่มหรือแก้ | เพราะอะไร |
|---|---|---|
| docs/acceptance/acceptance-record-r1.md | รอบแรก ผลตามเกณฑ์จบ การคัดแยก การตัดสินผู้ช่วย รับแบบมีเงื่อนไข ค1 ถึง ค3 | EV-049 |
| docs/acceptance/oat-results-r1.md, oat-raw-r1.txt, uat-dryrun-r1.txt | ผล OAT จริง 6 จาก 7 (OAT-6 ไม่ผ่าน) ผลเดินซ้อม 13 จาก 13 | รันบนเครื่องทดสอบจริง |
| docs/srs/incidents/INC-01.md | ซ้อมกู้คืนครั้งแรกบน PostgreSQL | OAT-4 |
| specs/002-booking/changes/CR-08.md | ลูกค้าเลือกช่างคนเดิมได้ Proposed สำหรับ R2 Q-66 | คำขอของ SH-01 ระหว่างตรวจรับ |
| gaps.md ของ 002 และ 000-shared | GAP-36 (DEF-01) GAP-37 (DEF-02) GAP-38 (Q-67) | สิ่งที่พบ |

commit ที่ 3 (ตรวจรับรอบสองและส่งมอบ)

| ไฟล์ | สิ่งที่เพิ่มหรือแก้ | เพราะอะไร |
|---|---|---|
| frontend/src/App.jsx, pages/ConfirmBooking.jsx, __tests__/UI-07-02-DEF-01.test.jsx | ล็อกช่วงใกล้เคียงและแสดงเวลาหมดล็อก | DEF-01 (T-32) |
| backend/app/main.py, tests/test_cross_cutting_def02.py | log ของแอปออก stdout ในระบบจริง | DEF-02 (T-33) |
| docs/acceptance/def-fix-red-r1.txt | ผลรัน test ใหม่ที่ไม่ผ่านก่อนแก้ | หลักฐานว่า test จับข้อบกพร่องได้จริง |
| backend/load_test.py, docs/acceptance/load-test-r1.md, load-test-r1-raw.txt | ทดสอบโหลดเต็มรูป AC-07-08 ไม่ผ่านบนเครื่องทดสอบ AC-09-12 AC-08-09 ผ่าน | เงื่อนไข ค3 |
| docs/acceptance/ รอบสอง | acceptance-record รอบสอง (รับ ลงนาม SH-01 และ Ops lead Q-68) oat-results 7 จาก 7 uat-dryrun-r2.txt ภาพหน้าจอจริงของ DEF-01 | EV-050 |
| docs/handover/ | README (รายการส่งมอบ) คู่มือผู้ใช้สั้น คู่มือติดตั้ง ของจำลองและข้อจำกัด เกณฑ์ก่อนเปิดใช้จริงและแผน hypercare 2 สัปดาห์ | ส่งมอบ (บทเสริม หัวข้อ 6.3) |
| docs/srs/baseline.md | Baseline B5 = R1 ที่รับแล้ว ตาราง "B5 ต่างจาก B4" สิ่งที่เลื่อนไป R2 คำถามเปิดพร้อมเจ้าของ | จุดตั้งต้นของ TOR ของ R2 |
| docs/srs/catalogue.md, operations.md | EV-050 log และ process เดียวในคู่มือ | |
| specs/000-shared/test-run.txt, ac-results rtm gaps tasks | ผลรันล่าสุด T-32 T-33 แถวตรวจรับ | |
| prompt-log.md | เพิ่ม #79 ถึง #88 | ทุกคำสั่งและการตัดสินของบทนี้ |

ดู diff ของทั้งบท: `git diff uat-plan~1 b5 --stat` และของแต่ละ commit: `git show --stat uat-plan` `uat-round1` `b5`

> แท็ก (เช่น uat-plan, uat-round1, b5) ใช้ได้เมื่อ clone repo นี้ ถ้าสร้างด้วยปุ่ม Use this template บน GitHub จะไม่ได้ประวัติ commit และแท็กมาด้วย


## งานของบทนี้ที่นักศึกษาต้องทำต่อ

บทเสริม การตรวจรับและการส่งมอบในงานจ้าง เปลี่ยนมุมจาก "ทีมพัฒนาให้เจ้าของตรวจ" เป็น "ผู้ว่าจ้างตรวจรับตามสัญญา"

1. เขียน TOR ของ R2 ฉบับย่อ อ้าง Baseline B5 ของ repo นี้ (ไม่ใช่ B3 อย่างตัวอย่างในหน้าบทเรียน หัวข้อ 8.1) ขอบเขตมาจากส่วน "สิ่งที่เลื่อนไป R2" ใน docs/srs/baseline.md
2. Studio: เลือกหนึ่งงวด เขียนสิ่งที่ส่งมอบเป็นรายการนับได้ และเกณฑ์ 4 ถึง 6 ข้อ ทุกข้ออ้าง AC หรือ REQ ใน B5 และตอบว่า วัดอะไร วัดอย่างไร หลักฐานคืออะไร ใครรัน
3. ตารางความรุนแรงสี่ระดับพร้อมคำถามที่ใช้ตัดสิน เทียบกับตารางใน docs/acceptance/uat-plan-r1.md ส่วน 7 แล้วเพิ่มคอลัมน์เวลาเริ่มแก้ในระยะรับประกัน
4. ตัดสินว่า AC-07-08 ที่ไม่ผ่านบนเครื่องทดสอบ ควรอยู่ใน TOR อย่างไร (เกณฑ์ของงวดไหน เครื่องของใคร ใครยิงโหลด) ใช้ Q-68 ประกอบ
5. ผู้ช่วย UC-14 ที่ไม่รับใน R1: เขียนเกณฑ์ของงวดผู้ช่วยแบบสามชั้น (บทเสริม หัวข้อ 7) และบรรทัดว่าทำอะไรเมื่อโมเดลเปลี่ยนรุ่น
6. สลับกันตรวจแบบคณะกรรมการ ข้อที่ตอบไม่ได้ว่าหลักฐานคืออะไร ให้แก้เป็นฉบับหลัง

ผลลัพธ์อยู่ใน repo ถัดไป (baanprom-sdd-08-complete): TOR ของ R2 และระบบที่ครบทั้ง R2
ใน repo นี้ยังไม่มีไฟล์เหล่านี้ ตั้งใจให้เป็นอย่างนั้น ทำของตัวเองก่อน แล้วค่อยเปิดเฉลย

## ถ้าทำของตัวเองพลาดหรือไม่ทัน

เอา repo นี้ไปทำต่อได้สองทาง

ทางที่ 1 บน GitHub

- เปิดหน้า repo นี้ กด Use this template แล้วเลือก Create a new repository
- ตั้งชื่อ repo ของกลุ่ม แล้วเปิดด้วย Codespaces

ทางที่ 2 clone แล้วเปลี่ยน remote

```
git clone https://github.com/ppsajja/baanprom-sdd-07-r1-done.git baanprom-group
cd baanprom-group
git remote set-url origin https://github.com/<บัญชีของกลุ่ม>/<ชื่อ repo ของกลุ่ม>.git
git push -u origin main
```

`git remote set-url origin` เปลี่ยนปลายทางของ push จาก repo ของผู้สอนเป็น repo ของกลุ่ม (ต้องสร้าง repo เปล่าบน GitHub ไว้ก่อน)
ถ้าอยากเริ่มจากสภาพก่อนวันตรวจรับ ใช้ `git checkout uat-plan` หรือสภาพรับแบบมีเงื่อนไข ใช้ `git checkout uat-round1` แล้วสร้าง branch ของกลุ่มจากจุดนั้น

## ทีม

- ชื่อทีม: กลุ่ม X (ตัวอย่างของรายวิชา)
- สมาชิก: สมาชิก A, สมาชิก B, สมาชิก C, สมาชิก D
- เครื่องมือ AI ที่ใช้: Copilot Chat โหมด Agent ใน GitHub Codespaces (รอบนี้ผู้สอนเดโมด้วย Claude Code)

## โครงของ repo

```
README.md                      ไฟล์นี้
AGENTS.md                      กติกาที่ AI ต้องทำตาม 10 ข้อ (agent-pack รุ่น 2)
CLAUDE.md                      ชี้ไป AGENTS.md (สำหรับ Claude Code)
prompt-log.md                  บันทึกทุกคำสั่ง (เพิ่มต่อท้ายเท่านั้น ล่าสุด #88)
docs/acceptance/               แผนตรวจรับ R1 scenario แผนและผล OAT ทดสอบโหลด บันทึกการตรวจรับสองรอบ
docs/handover/                 เอกสารส่งมอบ R1 (เริ่มอ่านที่ docs/handover/README.md)
docs/srs/                      catalogue v1.6, UC-07, 08, 09, 14, baseline (B5 ด้านบน), operations.md รุ่น 1.2, incidents/INC-01.md
specs/000-shared/              Constraint กลางรุ่น 1.2 AC ข้ามทุก feature CR-10 test-run ของทั้งโครงการ
specs/002-booking/             UC-07 spec 1.6 changes/CR-08.md (Proposed)
specs/003-job-status/          UC-09 spec 1.2
specs/004-cancel-refund/       UC-08 spec 1.2
specs/005-ai-assistant/        UC-14 spec 1.1 eval set 1.1
backend/                       Python FastAPI + SQLAlchemy uat_seed.py uat_replay.py load_test.py (ใช้ตอนตรวจรับ ไม่ใช่ส่วนของระบบ)
frontend/                      React (Vite) + Tailwind CSS + Vitest
```

อ่านรอบนี้ตามลำดับนี้

1. specs/000-shared/changes/CR-10.md (คำถามที่เป็นเงื่อนไข และคำตอบของเจ้าของ)
2. docs/acceptance/uat-plan-r1.md แล้ว uat-scenarios-r1.md และ oat-plan-r1.md
3. docs/acceptance/acceptance-record-r1.md รอบแรก (การคัดแยก DEF-01 DEF-02 CR-08 Q-67)
4. docs/acceptance/load-test-r1.md แล้ว acceptance-record-r1.md รอบสอง
5. docs/srs/baseline.md ส่วน B5 แล้ว docs/handover/README.md

## วิธีรัน

หลังบ้าน

```
cd backend
pip install -r requirements.txt
python -m pytest -v -k "AC_"
python eval_run.py
APP_ENV=development uvicorn app.main:app --reload --port 8000
```

ระบบตั้งค่าตั้งต้นเป็นโหมด production (REQ-SEC-012) ถ้ารัน uvicorn โดยไม่ตั้ง APP_ENV หน้า /docs จะปิด และ endpoint ของ ops ต้องมี header X-Ops-Token ที่ตรงกับตัวแปร OPS_TOKEN
ติดตั้งแบบระบบจริงบน PostgreSQL: ทำตาม docs/handover/install-guide.md

หน้าจอ

```
cd frontend
npm install
npm test
npm run dev
```

ถ้าเปิดด้วย GitHub Codespaces คำสั่ง pip install และ npm install ถูกรันให้แล้วตอนสร้างเครื่อง

ทำซ้ำการตรวจรับบนเครื่องทดสอบ (ต้องมี PostgreSQL และฐานข้อมูลว่าง)

```
cd backend
export DATABASE_URL=postgresql+psycopg://<ผู้ใช้>@<เครื่อง>/<ฐานว่าง> OPS_TOKEN=<กุญแจทดสอบ>
python uat_seed.py
uvicorn app.main:app --port 8000 --workers 1 &
python uat_replay.py --base http://127.0.0.1:8000 --ops-token $OPS_TOKEN --db $DATABASE_URL
python load_test.py --base http://127.0.0.1:8000 --users 500 --rounds 3
```

ผลที่ควรเห็น (รันจริงจาก repo นี้ ตรงกับ specs/000-shared/test-run.txt และ specs/005-ai-assistant/eval-results.md)

- Python 3.11 และ 3.12: บรรทัดสุดท้าย `105 passed, 1 warning` ไม่มี test ข้าม
- หน้าจอ: `Test Files 25 passed (25)` และ `Tests 42 passed (42)`
- eval: `prompt P-1.1: 20/20 เกณฑ์ผ่าน`
- uat_replay.py: 13 จาก 13 scenario ผ่าน (docs/acceptance/uat-dryrun-r2.txt)
- load_test.py: ตัวเลขขึ้นกับเครื่อง บนเครื่องทดสอบ CPU 2 ตัวที่ยิงโหลดจากเครื่องเดียวกัน AC-07-08 ไม่ผ่าน (p95 ราว 7.5 ถึง 8 วินาที) ถ้าเครื่องของนักศึกษาได้ผลต่างออกไป เป็นเรื่องปกติ อ่านส่วน "วิเคราะห์" ใน load-test-r1.md
- ถ้าเปิด commit ที่ 2 (`git checkout uat-round1`) จะได้ 104 passed และ 40 passed เพราะยังไม่มี test ของ DEF-01 DEF-02

## สิ่งที่รู้อยู่แล้วว่ายังไม่ใช่ของจริง

รายการเต็มพร้อมผู้รับผิดชอบเปลี่ยนอยู่ที่ docs/handover/mocks-and-limits.md สรุปสั้น

- Payment Gateway (FakeGateway) ระบบส่งข้อความ (FakeNotifier) LLM ของผู้ช่วย (MockLLM) บริการแผนที่ (สูตร haversine) ยังเป็นของจำลอง ช่องทางถึงคนเวรส่ง webhook จริงแล้ว แต่ทดสอบกับเครื่องรับทดสอบเท่านั้น
- การเดินของผู้ตรวจรับ (SH-01 call center ช่าง Finance) และการลงนามเป็นข้อมูลสมมติ ผลที่ปรากฏในบันทึกการตรวจรับเป็นผลของสคริปต์เดินซ้อมผ่าน API และ OAT ที่รันจริง ไม่มีคนจริงเดินบนหน้าจอ
- เครื่องทดสอบคือเครื่องเดียว CPU 2 ตัว ไม่ใช่เครื่องขนาดจริง ผลทดสอบโหลดจึงบอกได้แค่ว่าเครื่องนี้ทำได้เท่าไร
- คิวข้อความ ตัวนับ /metrics และสถานะการเตือนอยู่ในหน่วยความจำ หายเมื่อหลังบ้านเริ่มใหม่ ต้องรัน process เดียว (Q-67)
- ยังไม่มีการเข้าสู่ระบบ (TH-01 GAP-24) R1 ที่รับแล้วจึงยังเปิดให้ลูกค้าจริงไม่ได้ จนกว่า UC-02 มาใน R2
- ผู้ช่วย UC-14 ส่งมอบแบบปิดอยู่ ไม่อยู่ในสิ่งที่รับ
- คู่มือผู้ใช้ยังไม่ได้ตรวจกับผู้ใช้จริง cron สำรองข้อมูลและซ้อมกู้คืนบนเครื่องจริงยังไม่ทำ (เกณฑ์ก่อนเปิดใช้จริง)
- เลขโทรของ call center เป็นเลขสมมติ 02-000-0000 เบอร์ลูกค้าทดสอบทุกเบอร์ขึ้นต้นด้วย 000-000

## คำถามที่ยังเปิด และจะได้คำตอบใน repo ไหน

ตารางเต็มพร้อมเจ้าของอยู่ที่ docs/srs/baseline.md ส่วน B5

| คำถาม | เรื่อง | สถานะ |
|---|---|---|
| Q-14, Q-18, Q-19, Q-23, Q-24, Q-26, Q-27, Q-31, Q-34, Q-35, F-15 | เงื่อนไขก่อนเปิด R1 | ปิดแล้วใน repo นี้ (CR-10 EV-048) |
| CR-02 | ทำให้ REQ-QA-003 วัดได้ | Approved ใน repo นี้ |
| CR-08 และ Q-66 | ลูกค้าเลือกช่างคนเดิมได้ | Proposed ตัดสินใน TOR ของ R2 (repo 08) |
| Q-67 | คิวข้อความไม่หายเมื่อเครื่องดับ | Ops lead ก่อนเปิดให้ลูกค้าจริง (repo 08) |
| Q-68 | ขนาดเครื่องจริงและความหมายของ "500 คนพร้อมกัน" | Ops lead กับ SH-01 ก่อนวัด AC-07-08 บนเครื่องจริง (repo 08) |
| Q-64, Q-20, Q-22, Q-28, Q-29, Q-30, Q-32, Q-33, Q-36, Q-37 | เรื่องของ R2 (ปุ่มลูกค้าหลังเข้าสู่ระบบ rating พิกัด คิวรอ หลายที่อยู่ สถานะย้อนกลับ ฯลฯ) | ยังเปิด ทุกข้อมีเจ้าของ ตอบในงวด 1 ของ R2 (repo 08) |
| Q-56, Q-57, Q-65 และการเลือก LLM (IF-05) | เงื่อนไขของผู้ช่วย | ยังเปิด งวดของผู้ช่วยใน R2 (repo 08) |
| GAP-24, GAP-26, GAP-31, GAP-32, GAP-33, GAP-38, F-05, F-06, F-14, F-16 | สิทธิ์ของ GET /jobs/{id} mockup เครื่องมือของ call center กุญแจแยกบทบาท คิวในหน่วยความจำ เส้นทาง A1 | ยังเปิด |

## Reflection ของกลุ่ม X รอบการตรวจรับ R1 (5 บรรทัด)

1. test เขียวทั้งชุดและรายการต้องตรงผ่านครบ แต่ผู้ตรวจรับเจอ DEF-01 ในทางเข้าหน้าที่ไม่มีใน mockup ทางเดียวที่เจอคือให้คนในบทบาทจริงเดินเส้นทางของตัวเอง
2. OAT-6 "ไม่พบข้อมูลส่วนบุคคลใน log" เกือบถูกเขียนว่าผ่าน ทั้งที่ไม่มี log ของแอปให้ค้นเลย การค้นที่ไม่มีอะไรให้ค้นไม่ใช่หลักฐาน
3. ความรุนแรงกับลำดับการแก้แยกกันจริง DEF-01 ระดับกลาง แต่เจ้าของให้แก้ด่วนเพราะผลคือสายเข้า call center ซึ่งเป็นปัญหาตั้งต้นของโครงการ
4. AC-07-08 ไม่ผ่าน และเราเขียนว่าไม่ผ่าน การรับ R1 เป็นการตัดสินของเจ้าของจากเกณฑ์จบที่เขียนไว้ก่อน ไม่ใช่การปรับเกณฑ์ให้ผ่าน
5. รับแล้วยังไม่เท่ากับเปิดใช้ได้ รายการก่อนเปิดใช้จริงยาวกว่ารายการที่ตรวจรับ และส่วนใหญ่เป็นงานของฝ่ายปฏิบัติการ ไม่ใช่โค้ด
