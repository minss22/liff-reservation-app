import { useState } from 'react'
import { TopBar, StepIndicator, Button, SummaryCard, InfoBox } from '../components/ui'
import { reservationApi } from '../utils/api'
import { formatPrice, formatDate, formatDuration } from '../utils/format'
import type { Branch, Treatment, Reservation } from '../types'

interface ConfirmPageProps {
  branch: Branch
  treatment: Treatment
  date: string
  time: string
  onConfirmed: (reservation: Reservation) => void
  onBack: () => void
  isMock?: boolean
}

export default function ConfirmPage({ branch, treatment, date, time, onConfirmed, onBack }: ConfirmPageProps) {
  const [memo, setMemo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const res: any = await reservationApi.createReservation({
        branchId: branch.id,
        treatmentId: treatment.id,
        date,
        time,
        memo: memo.trim() || undefined,
      })
      onConfirmed(res)
    } catch (e: any) {
      setError(e.message || '예약 신청 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const summaryRows = [
    { label: '지점', value: branch.name },
    { label: '주소', value: branch.address },
    { label: '시술', value: treatment.name },
    { label: '일시', value: `${formatDate(date)} ${time}` },
    { label: '소요시간', value: formatDuration(treatment.durationMin) },
    { label: '금액', value: formatPrice(treatment.price) },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="예약 확인" onBack={onBack} />
      <div style={{ flex: 1, padding: '20px 20px 140px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <StepIndicator total={4} current={4} />
        <SummaryCard rows={summaryRows} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
            요청사항 <span style={{ color: '#999', fontWeight: 400 }}>(선택)</span>
          </label>
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="시술 관련 요청사항이 있으면 입력해주세요"
            rows={3}
            style={{
              padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E0E0E0',
              fontSize: 14, color: '#111', background: '#FAFAFA',
              resize: 'none', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>
        <InfoBox type="warning">
          병원에서 예약 내용을 확인한 후 최종 확정됩니다.<br />
          결과는 LINE 메시지로 알려드립니다.
        </InfoBox>
        {error && (
          <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, color: '#DC2626', fontSize: 13 }}>
            {error}
          </div>
        )}
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px', background: '#fff', borderTop: '1px solid #F0F0F0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button fullWidth onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '신청 중...' : '예약 신청하기'}
        </Button>
        <Button fullWidth variant="ghost" onClick={onBack} disabled={isSubmitting}>
          이전으로
        </Button>
      </div>
    </div>
  )
}