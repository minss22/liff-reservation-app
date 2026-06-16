import { useState } from 'react'
import { TopBar, StepIndicator, Button, Textarea } from '../components/ui'
import type { Companion, ReservationDetail } from '../types'

interface ReservationDetailPageProps {
  onNext: (detail: ReservationDetail) => void
  onBack: () => void
}

const emptyCompanion = (): Companion => ({ name: '', birthDate: '', gender: null })

export default function ReservationDetailPage({ onNext, onBack }: ReservationDetailPageProps) {
  const [visitType, setVisitType] = useState<'first' | 'revisit' | null>(null)
  const [treatmentRequest, setTreatmentRequest] = useState('')
  const [budget, setBudget] = useState('')
  const [surgeryHistory, setSurgeryHistory] = useState('')
  const [hasCompanion, setHasCompanion] = useState<boolean | null>(null)
  const [companions, setCompanions] = useState<Companion[]>([emptyCompanion()])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!visitType) errs.visitType = '초진/재진을 선택해주세요'
    if (!treatmentRequest.trim()) errs.treatmentRequest = '희망 시술 내용을 입력해주세요'
    if (hasCompanion === null) errs.hasCompanion = '동반자 여부를 선택해주세요'
    if (hasCompanion) {
      companions.forEach((c, i) => {
        if (!c.name.trim()) errs[`companion_name_${i}`] = '동반자 성함을 입력해주세요'
        if (!c.birthDate) errs[`companion_birth_${i}`] = '동반자 생년월일을 입력해주세요'
        if (!c.gender) errs[`companion_gender_${i}`] = '동반자 성별을 선택해주세요'
      })
    }
    return errs
  }

  const handleSubmit = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onNext({
      visitType: visitType!,
      treatmentRequest,
      budget: budget.trim() || undefined,
      surgeryHistory: surgeryHistory.trim() || undefined,
      hasCompanion: hasCompanion!,
      companions: hasCompanion ? companions : [],
    })
  }

  const updateCompanion = (index: number, field: keyof Companion, value: any) => {
    setCompanions(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
    const key = `companion_${field}_${index}`
    if (errors[key]) setErrors(ex => ({ ...ex, [key]: '' }))
  }

  const addCompanion = () => setCompanions(prev => [...prev, emptyCompanion()])
  const removeCompanion = (index: number) => setCompanions(prev => prev.filter((_, i) => i !== index))

  const SelectButton = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button onClick={onClick} style={{
      flex: 1, padding: '12px', borderRadius: 10,
      border: `1.5px solid ${selected ? '#1D9E75' : '#E0E0E0'}`,
      background: selected ? '#E1F5EE' : '#fff',
      color: selected ? '#085041' : '#666',
      fontSize: 15, fontWeight: selected ? 700 : 400,
      cursor: 'pointer', transition: 'all 0.15s',
    }}>{label}</button>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="예약 상세 정보" onBack={onBack} />
      <div style={{ flex: 1, padding: '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <StepIndicator total={4} current={3} />

        {/* 초진/재진 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>초진/재진 여부</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <SelectButton label="초진" selected={visitType === 'first'} onClick={() => { setVisitType('first'); setErrors(ex => ({ ...ex, visitType: '' })) }} />
            <SelectButton label="재진" selected={visitType === 'revisit'} onClick={() => { setVisitType('revisit'); setErrors(ex => ({ ...ex, visitType: '' })) }} />
          </div>
          {errors.visitType && <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors.visitType}</span>}
        </div>

        {/* 희망 시술 내용 */}
        <Textarea
          label="희망 시술 내용"
          value={treatmentRequest}
          onChange={e => { setTreatmentRequest(e.target.value); if (errors.treatmentRequest) setErrors(ex => ({ ...ex, treatmentRequest: '' })) }}
          placeholder="희망하시는 시술 내용을 자유롭게 입력해주세요"
          rows={3}
        />
        {errors.treatmentRequest && <span style={{ fontSize: 12, color: '#E53E3E', marginTop: -14 }}>{errors.treatmentRequest}</span>}

        {/* 희망 예산 */}
        <Textarea
          label="희망 예산 범위"
          optional
          value={budget}
          onChange={e => setBudget(e.target.value)}
          placeholder="예) 50만원 이하, 100만원 내외"
          rows={2}
        />

        {/* 시술 이력 */}
        <Textarea
          label="성형·시술 이력 또는 예정"
          optional
          value={surgeryHistory}
          onChange={e => setSurgeryHistory(e.target.value)}
          placeholder="기존 시술 이력이나 예정된 시술이 있으면 입력해주세요"
          rows={3}
        />

        {/* 동반자 여부 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>내원 시 동반자 여부</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <SelectButton label="네" selected={hasCompanion === true} onClick={() => { setHasCompanion(true); setErrors(ex => ({ ...ex, hasCompanion: '' })) }} />
            <SelectButton label="아니오" selected={hasCompanion === false} onClick={() => { setHasCompanion(false); setErrors(ex => ({ ...ex, hasCompanion: '' })) }} />
          </div>
          {errors.hasCompanion && <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors.hasCompanion}</span>}
        </div>

        {/* 동반자 정보 */}
        {hasCompanion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {companions.map((companion, index) => (
              <div key={index} style={{ background: '#F8F8F8', borderRadius: 12, padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>동반자 {index + 1}</span>
                  {companions.length > 1 && (
                    <button onClick={() => removeCompanion(index)} style={{ background: 'none', border: 'none', color: '#E53E3E', fontSize: 13, cursor: 'pointer' }}>삭제</button>
                  )}
                </div>

                {/* 동반자 성함 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>성함 (로마자)</label>
                  <input
                    value={companion.name}
                    onChange={e => updateCompanion(index, 'name', e.target.value)}
                    placeholder="예) HONG GIL DONG"
                    style={{
                      padding: '11px 14px', borderRadius: 10,
                      border: `1.5px solid ${errors[`companion_name_${index}`] ? '#E53E3E' : '#E0E0E0'}`,
                      fontSize: 14, color: '#111', background: '#fff', outline: 'none',
                    }}
                  />
                  {errors[`companion_name_${index}`] && <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors[`companion_name_${index}`]}</span>}
                </div>

                {/* 동반자 생년월일 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>생년월일</label>
                  <input
                    type="date"
                    value={companion.birthDate}
                    onChange={e => updateCompanion(index, 'birthDate', e.target.value)}
                    style={{
                      padding: '11px 14px', borderRadius: 10,
                      border: `1.5px solid ${errors[`companion_birth_${index}`] ? '#E53E3E' : '#E0E0E0'}`,
                      fontSize: 14, color: '#111', background: '#fff', outline: 'none',
                    }}
                  />
                  {errors[`companion_birth_${index}`] && <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors[`companion_birth_${index}`]}</span>}
                </div>

                {/* 동반자 성별 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>성별</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {(['female', 'male'] as const).map(g => (
                      <button key={g} onClick={() => updateCompanion(index, 'gender', g)} style={{
                        flex: 1, padding: '10px', borderRadius: 10,
                        border: `1.5px solid ${companion.gender === g ? '#1D9E75' : '#E0E0E0'}`,
                        background: companion.gender === g ? '#E1F5EE' : '#fff',
                        color: companion.gender === g ? '#085041' : '#666',
                        fontSize: 14, fontWeight: companion.gender === g ? 700 : 400,
                        cursor: 'pointer',
                      }}>
                        {g === 'female' ? '여' : '남'}
                      </button>
                    ))}
                  </div>
                  {errors[`companion_gender_${index}`] && <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors[`companion_gender_${index}`]}</span>}
                </div>
              </div>
            ))}

            {/* 동반자 추가 버튼 */}
            <button onClick={addCompanion} style={{
              padding: '12px', borderRadius: 10, border: '1.5px dashed #1D9E75',
              background: 'transparent', color: '#1D9E75', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              + 동반자 추가
            </button>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px', background: '#fff', borderTop: '1px solid #F0F0F0' }}>
        <Button fullWidth onClick={handleSubmit}>다음으로</Button>
      </div>
    </div>
  )
}
