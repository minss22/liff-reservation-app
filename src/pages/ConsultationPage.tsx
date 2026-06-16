import { useState } from 'react'
import { TopBar, StepIndicator, Button, Input } from '../components/ui'
import type { Companion, ConsultationData } from '../types'

interface ConsultationPageProps {
  onNext: (data: ConsultationData) => void
  onBack: () => void
}

const ROMAJI_REGEX = /^[A-Za-z\s\-'.]+$/

interface CompanionFormProps {
  companion: Companion
  index: number
  nameError?: string
  birthError?: string
  onChange: (updated: Companion) => void
  onRemove: () => void
}

function CompanionForm({ companion, index, nameError, birthError, onChange, onRemove }: CompanionFormProps) {
  return (
    <div style={{
      padding: '16px',
      background: '#F8F8F8',
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      border: '1px solid #E8E8E8',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#444' }}>同伴者 {index + 1}</span>
        <button
          onClick={onRemove}
          style={{
            background: 'none',
            border: 'none',
            color: '#E53E3E',
            cursor: 'pointer',
            fontSize: 13,
            padding: '2px 8px',
          }}
        >
          削除
        </button>
      </div>

      <Input
        label="お名前（ローマ字）"
        value={companion.name}
        onChange={e => onChange({ ...companion, name: e.target.value })}
        placeholder="YAMADA HANAKO"
        error={nameError}
        autoCapitalize="characters"
      />

      <Input
        label="生年月日"
        value={companion.birthDate}
        onChange={e => onChange({ ...companion, birthDate: e.target.value })}
        type="date"
        error={birthError}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>性別</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['male', 'female'] as const).map(g => (
            <button
              key={g}
              onClick={() => onChange({ ...companion, gender: g })}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 10,
                border: `1.5px solid ${companion.gender === g ? '#1D9E75' : '#E0E0E0'}`,
                background: companion.gender === g ? '#E1F5EE' : '#fff',
                color: companion.gender === g ? '#085041' : '#666',
                fontSize: 14,
                fontWeight: companion.gender === g ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {g === 'male' ? '男性' : '女性'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ConsultationPage({ onNext, onBack }: ConsultationPageProps) {
  const [visitType, setVisitType] = useState<'first' | 'return' | null>(null)
  const [desiredTreatment, setDesiredTreatment] = useState('')
  const [budget, setBudget] = useState('')
  const [surgeryHistory, setSurgeryHistory] = useState('')
  const [hasCompanion, setHasCompanion] = useState<boolean | null>(null)
  const [companions, setCompanions] = useState<Companion[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addCompanion = () => {
    setCompanions(prev => [...prev, { name: '', birthDate: '', gender: 'female' }])
    if (errors.companions) setErrors(e => ({ ...e, companions: '' }))
  }

  const updateCompanion = (index: number, updated: Companion) => {
    setCompanions(prev => prev.map((c, i) => i === index ? updated : c))
    setErrors(e => ({ ...e, [`companion_name_${index}`]: '', [`companion_birth_${index}`]: '' }))
  }

  const removeCompanion = (index: number) => {
    setCompanions(prev => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!visitType) errs.visitType = '選択してください'
    if (!desiredTreatment.trim()) errs.desiredTreatment = 'ご希望の施術内容を入力してください'
    if (hasCompanion === null) errs.hasCompanion = '選択してください'
    if (hasCompanion && companions.length === 0) errs.companions = '同伴者情報を追加してください'
    if (hasCompanion) {
      companions.forEach((c, i) => {
        if (!c.name.trim()) errs[`companion_name_${i}`] = 'お名前を入力してください'
        else if (!ROMAJI_REGEX.test(c.name.trim())) errs[`companion_name_${i}`] = 'ローマ字で入力してください'
        if (!c.birthDate) errs[`companion_birth_${i}`] = '生年月日を入力してください'
      })
    }
    return errs
  }

  const handleNext = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onNext({
      visitType: visitType!,
      desiredTreatment: desiredTreatment.trim(),
      budget: budget.trim(),
      surgeryHistory: surgeryHistory.trim(),
      hasCompanion: hasCompanion!,
      companions: hasCompanion ? companions : [],
    })
  }

  const selectButtonStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '13px 0',
    borderRadius: 10,
    border: `1.5px solid ${active ? '#1D9E75' : '#E0E0E0'}`,
    background: active ? '#E1F5EE' : '#fff',
    color: active ? '#085041' : '#666',
    fontSize: 15,
    fontWeight: active ? 700 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="カウンセリング情報" onBack={onBack} />

      <div style={{ flex: 1, padding: '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <StepIndicator total={4} current={4} />

        {/* 초진/재진 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
            初診・再診 <span style={{ color: '#E53E3E' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['first', 'return'] as const).map(v => (
              <button
                key={v}
                onClick={() => { setVisitType(v); if (errors.visitType) setErrors(e => ({ ...e, visitType: '' })) }}
                style={selectButtonStyle(visitType === v)}
              >
                {v === 'first' ? '初診' : '再診'}
              </button>
            ))}
          </div>
          {errors.visitType && <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors.visitType}</span>}
        </div>

        {/* 희망 시술 내용 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
            ご希望の施術内容 <span style={{ color: '#E53E3E' }}>*</span>
          </label>
          <textarea
            value={desiredTreatment}
            onChange={e => { setDesiredTreatment(e.target.value); if (errors.desiredTreatment) setErrors(ex => ({ ...ex, desiredTreatment: '' })) }}
            placeholder="例：目の下のクマ改善、ヒアルロン酸注入など"
            rows={3}
            style={{
              padding: '11px 14px',
              borderRadius: 10,
              border: `1.5px solid ${errors.desiredTreatment ? '#E53E3E' : '#E0E0E0'}`,
              fontSize: 14,
              color: '#111',
              background: '#FAFAFA',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          {errors.desiredTreatment && <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors.desiredTreatment}</span>}
        </div>

        {/* 희망 예산 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
            ご希望の予算 <span style={{ color: '#999', fontWeight: 400 }}>(任意)</span>
          </label>
          <input
            value={budget}
            onChange={e => setBudget(e.target.value)}
            placeholder="例：5万円〜10万円"
            style={{
              padding: '11px 14px',
              borderRadius: 10,
              border: '1.5px solid #E0E0E0',
              fontSize: 14,
              color: '#111',
              background: '#FAFAFA',
              outline: 'none',
            }}
          />
        </div>

        {/* 시술 이력 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
            美容施術の履歴または予定 <span style={{ color: '#999', fontWeight: 400 }}>(任意)</span>
          </label>
          <textarea
            value={surgeryHistory}
            onChange={e => setSurgeryHistory(e.target.value)}
            placeholder="例：3年前に目の整形、来月に別のクリニックで施術予定など"
            rows={2}
            style={{
              padding: '11px 14px',
              borderRadius: 10,
              border: '1.5px solid #E0E0E0',
              fontSize: 14,
              color: '#111',
              background: '#FAFAFA',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* 동반자 여부 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
            ご来院時の同伴者 <span style={{ color: '#E53E3E' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {([true, false] as const).map(v => (
              <button
                key={String(v)}
                onClick={() => {
                  setHasCompanion(v)
                  if (!v) setCompanions([])
                  if (errors.hasCompanion) setErrors(e => ({ ...e, hasCompanion: '' }))
                }}
                style={selectButtonStyle(hasCompanion === v)}
              >
                {v ? 'はい' : 'いいえ'}
              </button>
            ))}
          </div>
          {errors.hasCompanion && <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors.hasCompanion}</span>}
        </div>

        {/* 동반자 정보 */}
        {hasCompanion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {companions.map((companion, index) => (
              <CompanionForm
                key={index}
                companion={companion}
                index={index}
                nameError={errors[`companion_name_${index}`]}
                birthError={errors[`companion_birth_${index}`]}
                onChange={(updated) => updateCompanion(index, updated)}
                onRemove={() => removeCompanion(index)}
              />
            ))}
            {errors.companions && (
              <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors.companions}</span>
            )}
            <button
              onClick={addCompanion}
              style={{
                padding: '13px',
                borderRadius: 10,
                border: '1.5px dashed #1D9E75',
                background: '#F0FDF8',
                color: '#1D9E75',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              ＋ 同伴者を追加
            </button>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px', background: '#fff', borderTop: '1px solid #F0F0F0' }}>
        <Button fullWidth onClick={handleNext}>次へ</Button>
      </div>
    </div>
  )
}
