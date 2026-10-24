// หน้ายืนยัน (UC-07 ขั้น 4 ถึง 5) ตามแบบ UI-07-02 (CR-03)
// รองรับ REQ-BR-002 (AC-07-11): ยอดมัดจำมาจากระบบ (held.depositAmount) ไม่มีตารางยอดในหน้าจอ
// รองรับ REQ-FN-041: แสดงเวลาที่การล็อกสิ้นสุดจาก held.holdExpiresAt ไม่พิมพ์จำนวนนาทีตายตัว (Q-18 ยังเปิด)
// รองรับ AC-07-04: ได้ 409 slot_taken แสดง "ช่วงเวลาถูกจองแล้ว" และปุ่มช่วงใกล้เคียง
// รองรับ AC-07-06: ได้ 402 แสดง "ชำระมัดจำไม่สำเร็จ"
// CR-07 รองรับ AC-07-12 (REQ-QA-010): ได้ 202 payment_pending แสดงข้อความที่ระบบส่งมา และให้กดยืนยันอีกครั้งได้
// (ระบบลองใหม่ด้วย reference เดิม ไม่ตัดเงินซ้ำ AC-07-13) เวลาสิ้นสุดของล็อกมาจากคำตอบ ไม่พิมพ์ตัวเลขเอง (D-00-05)
// CR-10 รองรับ REQ-FN-057 (AC-07-19, Q-26): แสดงราคาประเมินและข้อความกำกับจากระบบ (held.estimateAmount, held.estimateNote)
// CR-10 (Q-14): บรรทัดที่ 3 ของเงื่อนไขการยกเลิกเปลี่ยนตาม BR-01 R3 รุ่น 1.1 ไม่พิมพ์ยอดเงิน (ยอดอยู่หน้ายกเลิก UI-08-01)
import { useState } from 'react'
import Steps from '../components/Steps.jsx'

export function fmt(iso) {
  const d = new Date(iso)
  return d.toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function ConfirmBooking({ api, customerId, addressId, held, onConfirmed, onPickAlternative, onBack }) {
  const [state, setState] = useState({ kind: 'idle' })
  const deposit = held.depositAmount
  const hasDeposit = typeof deposit === 'number'

  async function confirm() {
    setState({ kind: 'loading' })
    const { status, body } = await api.createBooking({
      customerId, slotId: held.slot.slot_id, addressId, category: held.category,
    })
    if (status === 201) return onConfirmed(body)
    if (status === 409 && body.reason === 'slot_taken') return setState({ kind: 'taken', alternatives: body.alternatives })
    if (status === 402) return setState({ kind: 'payment_failed' })
    if (status === 202 && body.reason === 'payment_pending') return setState({ kind: 'payment_pending', message: body.message })
    setState({ kind: 'error' })
  }

  // DEF-01: ล็อกช่วงใกล้เคียงไม่สำเร็จ (held.holdError) แสดงข้อความและห้ามยืนยัน
  const blocked = state.kind === 'taken' || state.kind === 'payment_failed'
  const holdFailed = Boolean(held.holdError)

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <Steps current={2} />
      <h2 className="text-lg font-semibold text-slate-800">ตรวจรายละเอียดและชำระมัดจำ</h2>
      <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-slate-500">ช่าง</dt><dd className="text-slate-800">{held.technician.name}</dd>
        <dt className="text-slate-500">ช่วงเวลา</dt><dd className="text-slate-800">{fmt(held.slot.start)} ถึง {fmtTime(held.slot.end)}</dd>
        <dt className="text-slate-500">ประเภทงาน</dt><dd className="text-slate-800">{held.category}</dd>
        <dt className="text-slate-500">มัดจำ</dt>
        <dd className="font-semibold text-slate-900" data-testid="deposit">{hasDeposit ? `${deposit} บาท` : 'ยังไม่ทราบยอดมัดจำ'}</dd>
        {typeof held.estimateAmount === 'number' && (<>
          <dt className="text-slate-500">ราคาประเมิน</dt>
          <dd className="text-slate-800" data-testid="estimate">{held.estimateAmount} บาท
            {held.estimateNote && <span className="block text-xs text-slate-500">{held.estimateNote}</span>}</dd>
        </>)}
      </dl>

      {holdFailed && (
        <p role="alert" className="mt-3 rounded-lg border border-orange-300 bg-orange-50 p-3 text-sm text-orange-800">{held.holdError}</p>
      )}

      {!blocked && held.holdExpiresAt && state.kind !== 'payment_pending' && (
        <p className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800">
          ล็อกช่วงเวลานี้ไว้ให้คุณถึง {fmtTime(held.holdExpiresAt)} น.
        </p>
      )}

      {!blocked && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">เงื่อนไขการยกเลิก</p>
          <ul className="list-disc pl-5">
            <li>ยกเลิกก่อนนัด 24 ชั่วโมงขึ้นไป คืนมัดจำเต็มจำนวน</li>
            <li>ยกเลิกก่อนนัดน้อยกว่า 24 ชั่วโมง คืนมัดจำครึ่งหนึ่ง</li>
            <li>เมื่อช่างออกเดินทางแล้ว หักค่าเดินทางของช่าง คืนส่วนที่เหลือ</li>
          </ul>
        </div>
      )}

      {state.kind === 'taken' && (
        <div role="alert" className="mt-4 rounded-lg border border-orange-300 bg-orange-50 p-4">
          <p className="font-medium text-orange-800">ช่วงเวลาถูกจองแล้ว</p>
          <p className="mt-1 text-sm text-orange-700">ยังไม่มีการตัดเงิน เลือกช่วงเวลาใกล้เคียงด้านล่าง หรือกลับไปค้นหาใหม่</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {state.alternatives.map((a) => (
              <li key={a.slot_id}>
                <button type="button" onClick={() => onPickAlternative(a)}
                  className="rounded-md border border-teal-600 bg-white px-3 py-1 text-sm text-teal-800 hover:bg-teal-50">
                  ช่าง {a.technician_name} {fmt(a.start)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {state.kind === 'payment_failed' && (
        <div role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          <p className="font-medium">ชำระมัดจำไม่สำเร็จ</p>
          <p className="mt-1 text-sm">การจองถูกยกเลิก ยังไม่มีการตัดเงิน ช่วงเวลากลับเป็นว่างแล้ว</p>
        </div>
      )}
      {state.kind === 'payment_pending' && (
        <p role="alert" data-testid="payment-pending" className="mt-4 rounded-lg border border-orange-300 bg-orange-50 p-3 text-sm text-orange-800">
          {state.message}
        </p>
      )}
      {state.kind === 'error' && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">เกิดข้อผิดพลาด กรุณาลองใหม่</p>
      )}

      {!blocked && (
        <button type="button" onClick={confirm} disabled={state.kind === 'loading' || !hasDeposit || holdFailed}
          className="mt-5 w-full rounded-lg bg-teal-700 px-4 py-3 font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300">
          {state.kind === 'loading' ? 'กำลังชำระมัดจำ...' : hasDeposit ? `ยืนยันและชำระมัดจำ ${deposit} บาท` : 'ยืนยันและชำระมัดจำ'}
        </button>
      )}
      <button type="button" onClick={onBack}
        className="mt-3 w-full rounded-lg border border-teal-700 px-4 py-3 font-medium text-teal-800 hover:bg-teal-50">
        กลับไปเลือกช่วงเวลา
      </button>
    </section>
  )
}
