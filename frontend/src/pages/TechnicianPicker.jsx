// หน้าเลือกช่าง (UC-07 ขั้น 1 ถึง 3) รองรับ REQ-FN-008 และ REQ-FN-041 ตามแบบ UI-07-01 (CR-03)
// ที่อยู่ให้บริการ: ยังรอ Q-29 จึงใช้ที่อยู่หลักที่ส่งเข้ามา (addressId) และยังไม่แสดงบนหน้าจอ
import { useState } from 'react'
import Steps from '../components/Steps.jsx'

const CATEGORIES = ['ประปา', 'ไฟฟ้า', 'แอร์']

function fmt(iso) {
  const d = new Date(iso)
  return d.toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function TechnicianPicker({ api, customerId, addressId, onHeld }) {
  const [category, setCategory] = useState('ประปา')
  const [technicians, setTechnicians] = useState(null)
  const [error, setError] = useState('')

  async function search() {
    setError('')
    const { status, body } = await api.getTechnicians({ category, addressId, customerId })
    if (status !== 200) return setError('ค้นหาไม่สำเร็จ')
    setTechnicians(body)
  }

  async function pick(tech, slot) {
    // REQ-FN-041: เลือกช่วงเวลาแล้วล็อกทันที ถ้าคนอื่นล็อกไปก่อน (BR-02) ให้แจ้งและเลือกใหม่
    const hold = await api.holdSlot({ slotId: slot.slot_id, customerId })
    // CR-07 REQ-SEC-011 (AC-07-14): ถือล็อกช่วงอื่นอยู่ ระบบตอบ 409 hold_limit แสดงข้อความที่ระบบส่งมา
    if (hold.status === 409 && hold.body.reason === 'hold_limit') return setError(hold.body.message)
    if (hold.status === 409) return setError('ช่วงเวลานี้เพิ่งถูกจองไป')
    // REQ-BR-002: ขอยอดมัดจำจากระบบ ไม่คำนวณหรือพิมพ์ยอดเองในหน้าจอ (D-00-05)
    const quote = await api.getDepositQuote({ category })
    if (quote.status !== 200) return setError('ยังแสดงยอดมัดจำไม่ได้ กรุณาลองใหม่')
    // CR-10 REQ-FN-057 (Q-26): ราคาประเมินและข้อความกำกับมาจากคำตอบเดียวกัน
    onHeld({ slot, technician: tech, category, holdExpiresAt: hold.body.hold_expires_at, depositAmount: quote.body.deposit_amount,
      estimateAmount: quote.body.estimate_amount, estimateNote: quote.body.estimate_note })
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <Steps current={1} />
      <h2 className="text-lg font-semibold text-slate-800">เลือกประเภทงานและช่างที่ว่าง</h2>
      <p className="mt-3 text-sm text-slate-500">ประเภทงาน</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c}
            className={`rounded-full border px-4 py-1 text-sm ${category === c ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>
            {c}
          </button>
        ))}
      </div>
      <button type="button" onClick={search} className="mt-4 w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600">
        ค้นหาช่างที่ว่างใน 7 วัน
      </button>
      {error && (
        <div role="alert" className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          <p className="font-semibold">{error}</p>
          {error === 'ช่วงเวลานี้เพิ่งถูกจองไป' && <p>กรุณาเลือกช่วงเวลาใหม่</p>}
        </div>
      )}
      {technicians && technicians.length === 0 && (
        <p className="mt-3 text-sm text-slate-600">ยังไม่มีช่างว่างใน 7 วันข้างหน้า</p>
      )}
      <ul className="mt-4 space-y-3">
        {technicians?.map((t) => (
          <li key={t.technician_id} className="rounded-lg border border-slate-200 p-3">
            <p className="font-medium text-slate-800">ช่าง {t.name}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {t.slots.map((s) => (
                <button key={s.slot_id} type="button" onClick={() => pick(t, s)}
                  className="rounded-md border border-teal-600 px-3 py-1 text-sm text-teal-800 hover:bg-teal-50">
                  {fmt(s.start)}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {technicians && technicians.length > 0 && (
        <p className="mt-3 text-sm text-slate-600">แตะช่วงเวลาเพื่อเลือก ระบบจะล็อกช่วงเวลานั้นไว้ให้ระหว่างที่คุณยืนยัน</p>
      )}
    </section>
  )
}
