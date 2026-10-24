// test หน้าจอของ AC-07-19 (REQ-FN-057, REQ-BR-002, CR-10 Q-26): ราคาประเมินบนหน้ายืนยันมาจาก GET /deposit-quote ไม่มีตารางราคาในหน้าจอ
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App.jsx'

test('AC-07-19 เลือกช่วงเวลาแล้วหน้ายืนยันแสดงราคาประเมินและมัดจำที่ระบบส่งมา', async () => {
  const api = {
    getTechnicians: vi.fn().mockResolvedValue({ status: 200, body: [{ technician_id: 1, name: 'ประสิทธิ์', slots: [{ slot_id: 1, start: '2026-10-12T14:00:00', end: '2026-10-12T16:00:00' }] }] }),
    holdSlot: vi.fn().mockResolvedValue({ status: 200, body: { slot_id: 1, hold_expires_at: '2026-10-11T10:10:00' } }),
    getDepositQuote: vi.fn().mockResolvedValue({ status: 200, body: { category: 'แอร์', deposit_amount: 500, estimate_amount: 1000, estimate_note: 'ค่าบริการเบื้องต้น ยังไม่รวมค่าอะไหล่ ช่างแจ้งราคาจริงก่อนเริ่มงาน' } }),
  }
  render(<App api={api} />)
  fireEvent.click(screen.getByRole('button', { name: 'ค้นหาช่างที่ว่างใน 7 วัน' }))
  fireEvent.click(await screen.findByRole('button', { name: /14:00/ }))
  // Then หน้ายืนยันแสดงราคาประเมิน 1000 บาท พร้อมข้อความว่ายังไม่รวมค่าอะไหล่ และมัดจำ 500 บาท
  expect(await screen.findByTestId('estimate')).toHaveTextContent('1000 บาท')
  expect(screen.getByTestId('estimate')).toHaveTextContent('ยังไม่รวมค่าอะไหล่')
  expect(screen.getByTestId('deposit')).toHaveTextContent('500 บาท')
})
