import { useState } from 'react'
import { TopBar, StepIndicator, Button, Input } from '../components/ui'
import type { Companion, ConsultationData } from '../types'

interface ConsultationPageProps {
  onNext: (data: ConsultationData) => void
  onBack: () => void
  onOpenMyPage: () => void
  initialData?: ConsultationData | null
}

export const ROMAJI_REGEX = /^[A-Za-z\s\-'.]+$/

export const emptyCompanion = (): Companion => ({
  name: '', birthDate: '', gender: null,
  visitType: null, desiredTreatment: '', budget: '', surgeryHistory: '',
})

interface CompanionFormProps {
  companion: Companion
  index: number
  errors: Record<string, string>
  onChange: (updated: Companion) => void
  onRemove: () => void
}

export function CompanionForm({ companion, index, errors, onChange, onRemove }: CompanionFormProps) {
  const e = (key: string) => errors[`c_${index}_${key}`]

  const selectStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
    border: `1.5px solid ${active ? '#1D9E75' : '#E0E0E0'}`,
    background: active ? '#E1F5EE' : '#fff',
    color: active ? '#085041' : '#666',
    fontSize: 14, fontWeight: active ? 700 : 400,
  })

  return (
    <div style={{
      padding: '16px', background: '#F8F8F8', borderRadius: 12,
      display: 'flex', flexDirection: 'column', gap: 14,
      border: '1px solid #E8E8E8',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#444' }}>同伴者 {index + 1}</span>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: '#E53E3E', cursor: 'pointer', fontSize: 13, padding: '2px 8px' }}>
          削除
        </button>
      </div>

      {/* 이름 */}
      <Input
        label="お名前（ローマ字）"
        value={companion.name}
        onChange={ev => onChange({ ...companion, name: ev.target.value.toUpperCase() })}
        placeholder="YAMADA HANAKO"
        error={e('name')}
        autoCapitalize="characters"
      />

      {/* 생년월일 */}
      <Input
        label="生年月日"
        value={companion.birthDate}
        onChange={ev => onChange({ ...companion, birthDate: ev.target.value })}
        type="date"
        error={e('birth')}
      />

      {/* 성별 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
          性別 <span style={{ color: '#E53E3E' }}>*</span>
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['male', 'female'] as const).map(g => (
            <button key={g} onClick={() => onChange({ ...companion, gender: g })} style={selectStyle(companion.gender === g)}>
              {g === 'male' ? '男性' : '女性'}
            </button>
          ))}
        </div>
        {e('gender') && <span style={{ fontSize: 12, color: '#E53E3E' }}>{e('gender')}</span>}
      </div>

      {/* 초진/재진 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
          初診・再診 <span style={{ color: '#E53E3E' }}>*</span>
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['first', 'return'] as const).map(v => (
            <button key={v} onClick={() => onChange({ ...companion, visitType: v })} style={selectStyle(companion.visitType === v)}>
              {v === 'first' ? '初診' : '再診'}
            </button>
          ))}
        </div>
        {e('visitType') && <span style={{ fontSize: 12, color: '#E53E3E' }}>{e('visitType')}</span>}
      </div>

      {/* 희망 시술 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
          ご希望の施術内容 <span style={{ color: '#E53E3E' }}>*</span>
        </label>
        <textarea
          value={companion.desiredTreatment}
          onChange={ev => onChange({ ...companion, desiredTreatment: ev.target.value })}
          placeholder="例：目の下のクマ改善、ヒアルロン酸注入など"
          rows={2}
          style={{
            padding: '11px 14px', borderRadius: 10,
            border: `1.5px solid ${e('treatment') ? '#E53E3E' : '#E0E0E0'}`,
            fontSize: 14, color: '#111', background: '#fff',
            resize: 'none', outline: 'none', fontFamily: 'inherit',
          }}
        />
        {e('treatment') && <span style={{ fontSize: 12, color: '#E53E3E' }}>{e('treatment')}</span>}
      </div>

      {/* 희망 예산 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
          ご希望の予算 <span style={{ color: '#999', fontWeight: 400 }}>(任意)</span>
        </label>
        <input
          value={companion.budget}
          onChange={ev => onChange({ ...companion, budget: ev.target.value })}
          placeholder="例：5万円〜10万円"
          style={{
            padding: '11px 14px', borderRadius: 10,
            border: '1.5px solid #E0E0E0', fontSize: 14,
            color: '#111', background: '#fff', outline: 'none',
          }}
        />
      </div>

      {/* 시술 이력 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
          美容施術の履歴または予定 <span style={{ color: '#999', fontWeight: 400 }}>(任意)</span>
        </label>
        <textarea
          value={companion.surgeryHistory}
          onChange={ev => onChange({ ...companion, surgeryHistory: ev.target.value })}
          placeholder="例：3年前に目の整形など"
          rows={2}
          style={{
            padding: '11px 14px', borderRadius: 10,
            border: '1.5px solid #E0E0E0', fontSize: 14,
            color: '#111', background: '#fff',
            resize: 'none', outline: 'none', fontFamily: 'inherit',
          }}
        />
      </div>
    </div>
  )
}

export default function ConsultationPage({ onNext, onBack, onOpenMyPage, initialData }: ConsultationPageProps) {
  const [visitType, setVisitType] = useState<'first' | 'return' | null>(initialData?.visitType ?? null)
  const [desiredTreatment, setDesiredTreatment] = useState(initialData?.desiredTreatment ?? '')
  const [budget, setBudget] = useState(initialData?.budget ?? '')
  const [surgeryHistory, setSurgeryHistory] = useState(initialData?.surgeryHistory ?? '')
  const [memo, setMemo] = useState(initialData?.memo ?? '')
  const [hasCompanion, setHasCompanion] = useState<boolean | null>(initialData?.hasCompanion ?? null)
  const [companions, setCompanions] = useState<Companion[]>(initialData?.companions ?? [])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addCompanion = () => {
    setCompanions(prev => [...prev, emptyCompanion()])
    setErrors(e => ({ ...e, companions: '' }))
  }

  const updateCompanion = (index: number, updated: Companion) => {
    setCompanions(prev => prev.map((c, i) => i === index ? updated : c))
    setErrors(e => {
      const next = { ...e }
      delete next[`c_${index}_name`]
      delete next[`c_${index}_birth`]
      delete next[`c_${index}_gender`]
      delete next[`c_${index}_visitType`]
      delete next[`c_${index}_treatment`]
      return next
    })
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
        if (!c.name.trim()) errs[`c_${i}_name`] = 'お名前を入力してください'
        else if (!ROMAJI_REGEX.test(c.name.trim())) errs[`c_${i}_name`] = 'ローマ字で入力してください'
        if (!c.birthDate) errs[`c_${i}_birth`] = '生年月日を入力してください'
        if (!c.gender) errs[`c_${i}_gender`] = '選択してください'
        if (!c.visitType) errs[`c_${i}_visitType`] = '選択してください'
        if (!c.desiredTreatment.trim()) errs[`c_${i}_treatment`] = 'ご希望の施術内容を入力してください'
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
      memo: memo.trim(),
      hasCompanion: hasCompanion!,
      companions: hasCompanion ? companions : [],
    })
  }

  const selectStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '13px 0', borderRadius: 10, cursor: 'pointer',
    border: `1.5px solid ${active ? '#1D9E75' : '#E0E0E0'}`,
    background: active ? '#E1F5EE' : '#fff',
    color: active ? '#085041' : '#666',
    fontSize: 15, fontWeight: active ? 700 : 400, transition: 'all 0.15s',
  })

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="カウンセリング情報" onBack={onBack} rightAction={
        <button onClick={onOpenMyPage} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: '2px 4px', color: '#555' }}>
          👤
        </button>
      } />

      <div style={{ flex: 1, padding: '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <StepIndicator total={2} current={2} />

        {/* 초진/재진 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
            初診・再診 <span style={{ color: '#E53E3E' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['first', 'return'] as const).map(v => (
              <button key={v} onClick={() => { setVisitType(v); if (errors.visitType) setErrors(e => ({ ...e, visitType: '' })) }}
                style={selectStyle(visitType === v)}>
                {v === 'first' ? '初診' : '再診'}
              </button>
            ))}
          </div>
          {errors.visitType && <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors.visitType}</span>}
        </div>

        {/* 희망 시술 */}
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
              padding: '11px 14px', borderRadius: 10,
              border: `1.5px solid ${errors.desiredTreatment ? '#E53E3E' : '#E0E0E0'}`,
              fontSize: 14, color: '#111', background: '#FAFAFA',
              resize: 'none', outline: 'none', fontFamily: 'inherit',
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
              padding: '11px 14px', borderRadius: 10,
              border: '1.5px solid #E0E0E0', fontSize: 14,
              color: '#111', background: '#FAFAFA', outline: 'none',
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
              padding: '11px 14px', borderRadius: 10,
              border: '1.5px solid #E0E0E0', fontSize: 14,
              color: '#111', background: '#FAFAFA',
              resize: 'none', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* 기타 요청사항(메모) — 예약 단위, 임의 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
            その他ご要望・メモ <span style={{ color: '#999', fontWeight: 400 }}>(任意)</span>
          </label>
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="例：駐車場はありますか？／少し遅れて到着するかもしれません など"
            rows={2}
            style={{
              padding: '11px 14px', borderRadius: 10,
              border: '1.5px solid #E0E0E0', fontSize: 14,
              color: '#111', background: '#FAFAFA',
              resize: 'none', outline: 'none', fontFamily: 'inherit',
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
              <button key={String(v)}
                onClick={() => {
                  setHasCompanion(v)
                  if (!v) setCompanions([])
                  if (errors.hasCompanion) setErrors(e => ({ ...e, hasCompanion: '' }))
                }}
                style={selectStyle(hasCompanion === v)}>
                {v ? 'はい' : 'いいえ'}
              </button>
            ))}
          </div>
          {errors.hasCompanion && <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors.hasCompanion}</span>}
        </div>

        {/* 동반자 폼 */}
        {hasCompanion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {companions.map((companion, index) => (
              <CompanionForm
                key={index}
                companion={companion}
                index={index}
                errors={errors}
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
                padding: '13px', borderRadius: 10,
                border: '1.5px dashed #1D9E75', background: '#F0FDF8',
                color: '#1D9E75', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
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
