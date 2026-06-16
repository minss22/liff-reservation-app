import { useState } from 'react'
import { TopBar, StepIndicator, Button, SummaryCard, InfoBox } from '../components/ui'
import { reservationApi } from '../utils/api'
import { formatDate } from '../utils/format'
import type { ReservationDetail, Reservation } from '../types'

interface ConfirmPageProps {
  branchName: string
  date: string
  time: string
  detail: ReservationDetail
  onConfirmed: (reservation: Reservation) => void
  onBack: () => void
}

export default function ConfirmPage({ branchName, date, time, detail, onConfirmed, onBack }: ConfirmPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const res: any = await reservationApi.createReservation({
        branchName,
        date,
        time,
        visitType: detail.visitType,
        treatmentRequest: detail.treatmentRequest,
        budget: detail.budget,
        surgeryHistory: detail.surgeryHistory,
        hasCompanion: detail.hasCompanion,
        companions: detail.companions,
      })
      onConfirmed(res)
    } catch (e: any) {
      setError(e.message || '예약 신청 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const summaryRows = [
    { label: '지점', value: branchName },
    { label: '일시', value: `${formatDate(date)} ${time}` },
    { label: '초진/재진', value: detail.visitType === 'first' ? '초진' : '재진' },
    { label: '희망 시술', value: detail.treatmentRequest },
    ...(detail.budget ? [{ label: '희망 예산', value: detail.budget }] : []),
    ...(detail.surgeryHistory ? [{ label: '시술 이력', value: detail.surgeryHistory }] : []),
    { label: '동반자', value: detail.hasCompanion ? `${detail.companions.length}명` : '없음' },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="예약 확인" onBack={onBack} />
      <div style={{ flex: 1, padding: '20px 20px 140px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <StepIndicator total={4} current={4} />
        <SummaryCard rows={summaryRows} />

        {/* 동반자 상세 */}
        {detail.hasCompanion && detail.companions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>동반자 정보</span>
            {detail.companions.map((c, i) => (
              <div key={i} style={{ background: '#F8F8F8', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#555', display: 'flex', gap: 12 }}>
                <span style={{ fontWeight: 600, color: '#111' }}>{c.name}</span>
                <span>{c.birthDate}</span>
                <span>{c.gender === 'female' ? '여' : '남'}</span>
              </div>
            ))}
          </div>
        )}

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
        <Button fullWidth variant="ghost" onClick={onBack} disabled={isSubmitting}>이전으로</Button>
      </div>
    </div>
  )
}
