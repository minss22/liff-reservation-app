import { useState } from 'react'
import { TopBar, StepIndicator, Button, InfoBox } from '../components/ui'

interface ProfilePageProps {
  displayName: string
  onComplete: (data: { name: string; birthDate: string; gender: 'male' | 'female' }) => Promise<void>
  onBack?: () => void
}

export default function ProfilePage({ displayName, onComplete, onBack }: ProfilePageProps) {
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRoman = (str: string) => /^[a-zA-Z\s]+$/.test(str.trim())

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = '성함을 입력해주세요'
    else if (!isRoman(name)) errs.name = '로마자로 작성해야 합니다.'
    if (!birthDate) errs.birthDate = '생년월일을 입력해주세요'
    if (!gender) errs.gender = '성별을 선택해주세요'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setIsSubmitting(true)
    try {
      await onComplete({ name: name.trim().toUpperCase(), birthDate, gender: gender! })
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="기본 정보 입력" onBack={onBack} />
      <div style={{ flex: 1, padding: '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <StepIndicator total={4} current={1} />
        <InfoBox type="info">
          처음 이용하시는군요! 기본 정보를 입력해주세요.<br />
          다음 방문부터는 입력하지 않아도 됩니다.
        </InfoBox>

        {/* 성함 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>성함 (로마자)</label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); if (errors.name) setErrors(ex => ({ ...ex, name: '' })) }}
            placeholder="예) HONG GIL DONG"
            style={{
              padding: '11px 14px', borderRadius: 10,
              border: `1.5px solid ${errors.name ? '#E53E3E' : '#E0E0E0'}`,
              fontSize: 15, color: '#111', background: '#FAFAFA', outline: 'none',
            }}
          />
          {errors.name && <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors.name}</span>}
        </div>

        {/* 생년월일 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>생년월일</label>
          <input
            type="date"
            value={birthDate}
            onChange={e => { setBirthDate(e.target.value); if (errors.birthDate) setErrors(ex => ({ ...ex, birthDate: '' })) }}
            style={{
              padding: '11px 14px', borderRadius: 10,
              border: `1.5px solid ${errors.birthDate ? '#E53E3E' : '#E0E0E0'}`,
              fontSize: 15, color: '#111', background: '#FAFAFA', outline: 'none',
            }}
          />
          {errors.birthDate && <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors.birthDate}</span>}
        </div>

        {/* 성별 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>성별</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['female', 'male'] as const).map(g => (
              <button
                key={g}
                onClick={() => { setGender(g); if (errors.gender) setErrors(ex => ({ ...ex, gender: '' })) }}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10,
                  border: `1.5px solid ${gender === g ? '#1D9E75' : '#E0E0E0'}`,
                  background: gender === g ? '#E1F5EE' : '#fff',
                  color: gender === g ? '#085041' : '#666',
                  fontSize: 15, fontWeight: gender === g ? 700 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {g === 'female' ? '여' : '남'}
              </button>
            ))}
          </div>
          {errors.gender && <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors.gender}</span>}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px', background: '#fff', borderTop: '1px solid #F0F0F0' }}>
        <Button fullWidth onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '다음으로'}
        </Button>
      </div>
    </div>
  )
}
