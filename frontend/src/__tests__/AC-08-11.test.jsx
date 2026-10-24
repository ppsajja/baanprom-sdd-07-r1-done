// test หน้าจอของ AC-08-11 (REQ-IF-010 ฉบับ CR-10, Q-34): gateway ปฏิเสธคำขอคืนเงิน หน้าผลไม่บอกว่าคืนแล้ว แสดงข้อความที่ระบบส่งมา
import { render, screen } from '@testing-library/react'
import CancelResult from '../pages/CancelResult.jsx'

test('AC-08-11 refund_result declined แสดงข้อความตรวจสอบเพิ่มจากระบบ และไม่มีบรรทัดช่องทางคืนเงินตามปกติ', () => {
  render(<CancelResult result={{ job_id: 9, status: 'cancelled', rule: 'R1', refund_amount: 350, refund_result: 'declined',
    refund_message: 'การคืนเงินต้องตรวจสอบเพิ่ม เจ้าหน้าที่จะติดต่อคุณภายใน 1 วันทำการ' }} onHome={() => {}} />)
  expect(screen.getByTestId('refund-message')).toHaveTextContent('ตรวจสอบเพิ่ม')
  expect(screen.queryByText(/ขึ้นกับธนาคารผู้ออกบัตร/)).toBeNull()
})
