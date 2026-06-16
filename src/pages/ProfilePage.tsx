import { useState } from 'react'
import { TopBar, StepIndicator, Input, Textarea, Button, InfoBox } from '../components/ui'
import type { UserProfile } from '../types'

interface ProfilePageProps {
  displayName: string
  onComplete: (profile: Omit<UserProfile, 'lineUserId' | 'isProfileComplete'>) => Promise<void>
}

export default function ProfilePage({ displayName, onComplete }: ProfilePageProps) {
  const [name, setName] = useState(displayName)
  const [birthDate, setBirthDate] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = '이름을 입력해주세요'
    if (!birthDate) errs.birthDate = '생년월일을 입력해주세요'
    if (!phone.trim()) errs.phone = '연락처를 입력해주세요'
    else if (!/^010-\d{4}-\d{4}$/.test(phone)) errs.phone = '010-0000-0000 형식으로 입력해주세요'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setIsSubmitting(true)
    try {
      await onComplete({ name, birthDate, phone, notes, displayName })
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhoneChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 11)
    const formatted =
      digits.length <= 3 ? digits
      : digits.length <= 7 ? `${digits.slice(0, 3)}-${digits.slice(3)}`
      : `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
    setPhone(formatted)
    if (errors.phone) setErrors(e => ({ ...e, phone: '' }))
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="기본 정보 입력" />
      <div style={{ flex: 1, padding: '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <StepIndicator total={4} current={1} />
        <InfoBox type="info">
          처음 이용하시는군요! 예약에 필요한 기본 정보를 입력해주세요.<br />
          다음 방문부터는 입력하지 않아도 됩니다.
        </InfoBox>
        <Input
          label="이름"
          value={name}
          onChange={e => { setName(e.target.value); if (errors.name) setErrors(ex => ({ ...ex, name: '' })) }}
          placeholder="실명을 입력해주세요"
          error={errors.name}
        />
        <Input
          label="생년월일"
          value={birthDate}
          onChange={e => { setBirthDate(e.target.value); if (errors.birthDate) setErrors(ex => ({ ...ex, birthDate: '' })) }}
          placeholder="YYYY-MM-DD"
          type="date"
          error={errors.birthDate}
        />
        <Input
          label="연락처"
          value={phone}
          onChange={e => handlePhoneChange(e.target.value)}
          placeholder="010-0000-0000"
          type="tel"
          inputMode="numeric"
          error={errors.phone}
        />
        <Textarea
          label="알레르기 · 주의사항 (선택)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="특이사항이 있으면 입력해주세요"
          rows={3}
          hint="시술 전 의료진에게 전달됩니다"
        />
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px', background: '#fff', borderTop: '1px solid #F0F0F0' }}>
        <Button fullWidth onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '다음으로'}
        </Button>
      </div>
    </div>
  )
}