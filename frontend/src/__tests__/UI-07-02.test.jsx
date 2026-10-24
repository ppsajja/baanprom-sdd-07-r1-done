// ตรวจรายการ "ต้องตรง" ของ UI-07-02 ยืนยันและชำระมัดจำ (spec ส่วน 12, mockups/UI-07-02-confirm.html)
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import ConfirmBooking from '../pages/ConfirmBooking.jsx'

const held = {
  category: 'ประปา',
  technician: { technician_id: 1, name: 'ประสิทธิ์' },
  slot: { slot_id: 1, start: '2026-10-12T14:00:00', end: '2026-10-12T16:00:00' },
  depositAmount: 350,
  holdExpiresAt: '2026-10-11T10:10:00',
}

function show(h = held, api = {}) {
  render(<ConfirmBooking api={api} customerId={1} addressId={1} held={h} onConfirmed={() => {}} onPickAlternative={() => {}} />)
}

test('UI-07-02 แถบขั้นตอนอยู่ที่ขั้น 2 และมีปุ่มกลับไปเลือกช่วงเวลา', () => {
  show()
  expect(screen.getByText('2 ยืนยัน')).toHaveAttribute('aria-current', 'step')
  expect(screen.getByRole('button', { name: 'กลับไปเลือกช่วงเวลา' })).toBeInTheDocument()
})

test('UI-07-02 บอกเวลาสิ้นสุดการล็อกตามค่าที่ระบบส่งมา ไม่พิมพ์จำนวนนาทีตายตัว (REQ-FN-041, Q-18 ยังเปิด)', () => {
  show()
  expect(screen.getByText('ล็อกช่วงเวลานี้ไว้ให้คุณถึง 10:10 น.')).toBeInTheDocument()
  expect(screen.queryByText(/10 นาที/)).toBeNull()
  // เปลี่ยนค่าที่ระบบส่งมา ข้อความต้องเปลี่ยนตาม
  cleanup()
  show({ ...held, holdExpiresAt: '2026-10-11T10:25:00' })
  expect(screen.getByText('ล็อกช่วงเวลานี้ไว้ให้คุณถึง 10:25 น.')).toBeInTheDocument()
})

test('UI-07-02 เมื่อช่วงเวลาถูกจองไปก่อน แสดง "ช่วงเวลาถูกจองแล้ว" กับ "ยังไม่มีการตัดเงิน" และไม่มีปุ่มยืนยันให้กดซ้ำ (AC-07-04)', async () => {
  // หลังบ้านจำลองตอบ 409 slot_taken พร้อมช่วงใกล้เคียง 1 ช่วง
  const api = {
    createBooking: vi.fn().mockResolvedValue({
      status: 409,
      body: { reason: 'slot_taken', alternatives: [{ slot_id: 2, technician_id: 1, technician_name: 'ประสิทธิ์', start: '2026-10-12T16:00:00', end: '2026-10-12T18:00:00' }] },
    }),
  }
  show(held, api)
  fireEvent.click(screen.getByRole('button', { name: 'ยืนยันและชำระมัดจำ 350 บาท' }))
  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('ช่วงเวลาถูกจองแล้ว')
  expect(alert).toHaveTextContent('ยังไม่มีการตัดเงิน')
  expect(screen.queryByRole('button', { name: /ยืนยันและชำระมัดจำ/ })).toBeNull()
})

// CR-10 (Q-14): บรรทัดที่ 3 เปลี่ยนตาม BR-01 R3 รุ่น 1.1 (ตาราง "test เดิมที่เปลี่ยน" ของ CR-10)
test('UI-07-02 เงื่อนไขการยกเลิก 3 บรรทัดตรงตาม mockup (BR-01 R1, R2 และ R3 รุ่น 1.1)', () => {
  show()
  expect(screen.getByText('ยกเลิกก่อนนัด 24 ชั่วโมงขึ้นไป คืนมัดจำเต็มจำนวน')).toBeInTheDocument()
  expect(screen.getByText('ยกเลิกก่อนนัดน้อยกว่า 24 ชั่วโมง คืนมัดจำครึ่งหนึ่ง')).toBeInTheDocument()
  expect(screen.getByText('เมื่อช่างออกเดินทางแล้ว หักค่าเดินทางของช่าง คืนส่วนที่เหลือ')).toBeInTheDocument()
})

// CR-10 (Q-26 ปิด): เดิมตรวจว่าไม่มีราคาประเมิน ตอนนี้ตรวจว่าแสดงราคาประเมินและข้อความกำกับที่ระบบส่งมา (ตาราง "test เดิมที่เปลี่ยน" ของ CR-10)
test('UI-07-02 แสดงราคาประเมินและข้อความกำกับจากระบบ (REQ-FN-057)', () => {
  show({ ...held, estimateAmount: 700, estimateNote: 'ค่าบริการเบื้องต้น ยังไม่รวมค่าอะไหล่ ช่างแจ้งราคาจริงก่อนเริ่มงาน' })
  expect(screen.getByText('ราคาประเมิน')).toBeInTheDocument()
  expect(screen.getByTestId('estimate')).toHaveTextContent('700 บาท')
  expect(screen.getByTestId('estimate')).toHaveTextContent('ยังไม่รวมค่าอะไหล่')
})
