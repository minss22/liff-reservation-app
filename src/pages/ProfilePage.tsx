import { useState } from 'react'
import { TopBar, StepIndicator, Input, Button, InfoBox } from '../components/ui'

const ROMAJI_REGEX = /^[A-Za-z\s\-'.]+$/

interface ProfilePageProps {
  initialName?: string
  initialBirthDate?: string
  initialGender?: 'male' | 'female' | null
  onComplete: (profile: { name: string; birthDate: string; gender: 'male' | 'female' }) => Promise<void>
}

export default function ProfilePage({ initialName = '', initialBirthDate = '', initialGender = null, onComplete }: ProfilePageProps) {
  const [name, setName] = useState(initialName)
  const [birthDate, setBirthDate] = useState(initialBirthDate)
  const [gender, setGender] = useState<'male' | 'female' | null>(initialGender)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'お名前を入力してください'
    else if (!ROMAJI_REGEX.test(name.trim())) errs.name = 'ローマ字で入力してください'
    if (!birthDate) errs.birthDate = '生年月日を入力してください'
    if (!gender) errs.gender = '性別を選択してください'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setIsSubmitting(true)
    try {
      await onComplete({ name: name.trim(), birthDate, gender: gender! })
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNameChange = (v: string) => {
    setName(v)
    if (errors.name) setErrors(e => ({ ...e, name: '' }))
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="基本情報の入力" />
      <div style={{ flex: 1, padding: '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <StepIndicator total={4} current={1} />
        <InfoBox type="info">
          初めてのご利用ですね！予約に必要な基本情報をご入力ください。<br />
          次回からは入力不要です。
        </InfoBox>

        <Input
          label="お名前（ローマ字）"
          value={name}
          onChange={e => handleNameChange(e.target.value)}
          placeholder="YAMADA TARO"
          error={errors.name}
          autoCapitalize="characters"
        />

        <Input
          label="生年月日"
          value={birthDate}
          onChange={e => { setBirthDate(e.target.value); if (errors.birthDate) setErrors(ex => ({ ...ex, birthDate: '' })) }}
          type="date"
          error={errors.birthDate}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>性別</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['male', 'female'] as const).map(g => (
              <button
                key={g}
                onClick={() => { setGender(g); if (errors.gender) setErrors(e => ({ ...e, gender: '' })) }}
                style={{
                  flex: 1,
                  padding: '13px 0',
                  borderRadius: 10,
                  border: `1.5px solid ${gender === g ? '#1D9E75' : '#E0E0E0'}`,
                  background: gender === g ? '#E1F5EE' : '#fff',
                  color: gender === g ? '#085041' : '#666',
                  fontSize: 15,
                  fontWeight: gender === g ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {g === 'male' ? '男性' : '女性'}
              </button>
            ))}
          </div>
          {errors.gender && <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors.gender}</span>}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px', background: '#fff', borderTop: '1px solid #F0F0F0' }}>
        <Button fullWidth onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '保存中...' : '次へ'}
        </Button>
      </div>
    </div>
  )
}
