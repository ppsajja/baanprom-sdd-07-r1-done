// test หน้าจอของ AC-08-12 (REQ-BR-001 R3 รุ่น 1.1, CR-10 Q-14): ยกเลิกขณะช่างกำลังเดินทาง เห็นยอดคืนที่หักค่าเดินทางและเหตุผลจากระบบ
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CancelBooking from '../pages/CancelBooking.jsx'

test('AC-08-12 R3 แสดงยอดคืน 250 บาท พร้อมข้อความว่าหักค่าเดินทางของช่าง และกดยืนยันได้', async () => {
  const quote = { job_id: 6, status: 'en_route', deposit_amount: 350, scheduled_start: '2026-10-19T14:00:00', allowed: true,
    rule: 'R3', refund_amount: 250, message: '', note: 'หักค่าเดินทางของช่าง 100 บาท ตามเงื่อนไขการยกเลิกขณะช่างกำลังเดินทาง' }
  const api = { getRefundQuote: vi.fn().mockResolvedValue({ status: 200, body: quote }) }
  render(<CancelBooking api={api} customerId={1} onCancelled={() => {}} />)
  fireEvent.change(screen.getByLabelText('หมายเลขงาน'), { target: { value: '6' } })
  fireEvent.click(screen.getByRole('button', { name: 'ดูเงื่อนไขการยกเลิก' }))
  await waitFor(() => expect(screen.getByTestId('refund-amount')).toHaveTextContent('250 บาท'))
  expect(screen.getByText('ช่างกำลังเดินทาง')).toBeInTheDocument()
  expect(screen.getByTestId('refund-note')).toHaveTextContent('หักค่าเดินทางของช่าง')
  expect(screen.getByRole('button', { name: 'ยืนยันยกเลิกและรับเงินคืน 250 บาท' })).toBeEnabled()
})
