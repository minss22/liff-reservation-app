import { useState } from 'react'
import { TopBar, Input, Button, InfoBox } from '../components/ui'

const ROMAJI_REGEX = /^[A-Za-z\s\-'.]+$/

interface ProfilePageProps {
  initialName?: string
  initialBirthDate?: string
  initialGender?: 'male' | 'female' | null
  isEditMode?: boolean
  onBack?: () => void
  onComplete: (profile: { name: string; birthDate: string; gender: 'male' | 'female' }) => Promise<void>
}

export default function ProfilePage({
  initialName = '',
  initialBirthDate = '',
  initialGender = null,
  isEditMode = false,
  onBack,
  onComplete,
}: ProfilePageProps) {
  const [name, setName] = useState(initialName)
  const [birthDate, setBirthDate] = useState(initialBirthDate)
  const [gender, setGender] = useState<'male' | 'female' | null>(initialGender)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onComplete({ name: name.trim(), birthDate, gender: gender as 'male' | 'female' })
    } catch (e: any) {
      setSubmitError(e?.message || '保存に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        title={isEditMode ? 'プロフィールの編集' : '基本情報の入力'}
        onBack={isEditMode ? onBack : undefined}
      />

      <div style={{ flex: 1, padding: '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {!isEditMode && (
          <InfoBox type="info">
            初めてのご利用ですね！予約に必要な基本情報をご入力ください。<br />
            次回からは入力不要です。
          </InfoBox>
        )}

        <Input
          label="お名前（ローマ字）　*"
          value={name}
          onChange={e => {
            setName(e.target.value.toUpperCase())
            if (errors.name) setErrors(ex => ({ ...ex, name: '' }))
          }}
          placeholder="YAMADA TARO"
          error={errors.name}
          autoCapitalize="characters"
        />

        <Input
          label="生年月日　*"
          value={birthDate}
          onChange={e => {
            setBirthDate(e.target.value)
            if (errors.birthDate) setErrors(ex => ({ ...ex, birthDate: '' }))
          }}
          type="date"
          error={errors.birthDate}
        />

        {/* 성별 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
            性別　<span style={{ color: '#E53E3E' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['male', 'female'] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGender(g)
                  if (errors.gender) setErrors(ex => ({ ...ex, gender: '' }))
                }}
                style={{
                  flex: 1,
                  padding: '13px 0',
                  borderRadius: 10,
                  border: `2px solid ${gender === g ? '#1D9E75' : '#E0E0E0'}`,
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
          {errors.gender && (
            <span style={{ fontSize: 12, color: '#E53E3E' }}>{errors.gender}</span>
          )}
        </div>

        {/* API 에러 */}
        {submitError && (
          <div style={{
            padding: '12px 14px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 10,
            color: '#DC2626',
            fontSize: 13,
            lineHeight: 1.5,
          }}>
            {submitError}
          </div>
        )}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 20px 32px', background: '#fff', borderTop: '1px solid #F0F0F0',
      }}>
        <Button fullWidth onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '保存中...' : isEditMode ? '保存する' : '次へ'}
        </Button>
      </div>
    </div>
  )
}
