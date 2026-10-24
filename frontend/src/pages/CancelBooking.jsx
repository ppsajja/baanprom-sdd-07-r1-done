// หน้ายกเลิกการจอง (UC-08) ตามแบบ UI-08-01 (CR-06) รองรับ REQ-FN-054, REQ-BR-001, REQ-IF-010
// ยอดคืนมาจาก GET /jobs/{id}/refund-quote (ตาราง BR-01 อยู่หลังบ้านที่เดียว D-00-05) หน้าจอไม่มีตารางยอดของตัวเอง
// เมื่อยกเลิกไม่ได้ (R3 รอ Q-14, R6, ยกเลิกไปแล้ว) แสดงข้อความที่ระบบส่งมา ไม่มีปุ่มยืนยัน
// กล่อง "รอ Q-14" (ยอดคืน R3) และ "รอ Q-35" (ช่องทางและระยะเวลาเงินคืน) ใน mockup ไม่สร้าง
// CR-10 (Q-14, AC-08-12): R3 ยกเลิกได้แล้ว แสดง quote.note (เหตุที่ยอดคืนถูกหัก) ที่ระบบส่งมา
// CR-10 (Q-35): บอกว่าระยะเวลาเงินเข้าขึ้นกับธนาคารผู้ออกบัตร ไม่บอกจำนวนวัน
import { useState } from 'react'
import { statusTh, fmtDateTime } from '../statusNames.js'

export default function CancelBooking({ api, customerId, initialJobId = '', onCancelled }) {
  const [jobId, setJobId] = useState(initialJobId)
  const [quote, setQuote] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function lookup(e) {
    e?.preventDefault()
    setError('')
    setQuote(null)
    const { status, body } = await api.getRefundQuote({ jobId, customerId })
    // CR-07 REQ-SEC-010 (AC-08-10): ระบบตอบ 403 ทั้งงานของคนอื่นและงานที่ไม่มี หน้าจอแสดงข้อความเดิมของ UI-08-01 สถานะ 3
    if (status === 404 || status === 403) return setError('ไม่พบงานหมายเลขนี้')
    if (status !== 200) return setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    setQuote(body)
  }

  async function confirmCancel() {
    setLoading(true)
    const { status, body } = await api.cancelByCustomer({ jobId: quote.job_id, customerId })
    setLoading(false)
    if (status === 200) return onCancelled(body)
    if (status === 409) return setQuote({ ...quote, allowed: false, message: body.message })
    setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
  }

  const canCancel = quote?.allowed === true && typeof quote.refund_amount === 'number'

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">ยกเลิกการจอง</h2>
      <form onSubmit={lookup} className="mt-3 flex gap-2">
        <label className="flex-1 text-sm text-slate-600">
          หมายเลขงาน
          <input value={jobId} onChange={(e) => setJobId(e.target.value)} inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" />
        </label>
        <button type="submit" className="self-end rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">ดูเงื่อนไขการยกเลิก</button>
      </form>
      {error && <p role="alert" className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {quote && (
        <div className="mt-4">
          <h3 className="text-xl font-bold text-slate-900">งาน #{quote.job_id}</h3>
          <dl className="mt-2 grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-slate-500">สถานะ</dt><dd className="font-semibold text-slate-900">{statusTh(quote.status)}</dd>
            {quote.scheduled_start && (<><dt className="text-slate-500">นัดหมาย</dt><dd className="text-slate-800">{fmtDateTime(quote.scheduled_start)}</dd></>)}
            {typeof quote.deposit_amount === 'number' && (<><dt className="text-slate-500">มัดจำที่ชำระแล้ว</dt><dd className="text-slate-800">{quote.deposit_amount} บาท</dd></>)}
          </dl>

          {quote.allowed ? (
            <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4">
              <p className="text-sm text-teal-900">คุณจะได้รับเงินคืน <b data-testid="refund-amount">{quote.refund_amount} บาท</b></p>
              {quote.note && <p className="mt-1 text-sm text-teal-900" data-testid="refund-note">{quote.note}</p>}
              <p className="mt-1 text-xs text-teal-800">คืนผ่านช่องทางที่ชำระมัดจำ ระยะเวลาที่เงินเข้าบัญชีขึ้นกับธนาคารผู้ออกบัตร</p>
            </div>
          ) : (
            <div role="alert" className="mt-4 rounded-lg border border-orange-300 bg-orange-50 p-4 text-sm text-orange-800">
              <p className="font-medium">ยกเลิกไม่ได้</p>
              <p className="mt-1">{quote.message}</p>
            </div>
          )}

          {quote.allowed && (
            <button type="button" onClick={confirmCancel} disabled={loading || !canCancel}
              className="mt-5 w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300">
              {loading ? 'กำลังยกเลิก...' : `ยืนยันยกเลิกและรับเงินคืน ${quote.refund_amount} บาท`}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
