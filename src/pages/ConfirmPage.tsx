import { useState } from 'react'
import { TopBar, Button, SummaryCard, InfoBox } from '../components/ui'
import { reservationApi } from '../utils/api'
import { formatDate } from '../utils/format'
import type { Branch, ConsultationData, Reservation } from '../types'

interface ConfirmPageProps {
  branch: Branch
  date: string
  time: string
  consultation: ConsultationData
  onConfirmed: (reservation: Reservation) => void
  onBack: () => void
}

export default function ConfirmPage({ branch, date, time, consultation, onConfirmed, onBack }: ConfirmPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await reservationApi.createReservation({
        branchId: branch.branchId,
        date,
        time,
        visitType: consultation.visitType,
        desiredTreatment: consultation.desiredTreatment,
        budget: consultation.budget || undefined,
        surgeryHistory: consultation.surgeryHistory || undefined,
        memo: consultation.memo || undefined,
        companions: consultation.hasCompanion ? consultation.companions : [],
      })
      onConfirmed(res)
    } catch (e: any) {
      setError(e.message || '予約申し込み中にエラーが発生しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const summaryRows = [
    { label: '店舗', value: branch.nameJa || branch.name },
    { label: '住所', value: branch.addressJa || branch.address },
    { label: '日時', value: `${formatDate(date)} ${time}` },
    { label: '初診・再診', value: consultation.visitType === 'first' ? '初診' : '再診' },
    { label: 'ご希望の施術', value: consultation.desiredTreatment },
    ...(consultation.budget ? [{ label: '予算', value: consultation.budget }] : []),
    ...(consultation.surgeryHistory ? [{ label: '施術履歴', value: consultation.surgeryHistory }] : []),
    ...(consultation.memo ? [{ label: 'ご要望・メモ', value: consultation.memo }] : []),
    {
      label: '同伴者',
      value: consultation.hasCompanion
        ? `あり（${consultation.companions.length}名）`
        : 'なし',
    },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="予約内容の確認" onBack={onBack} />

      <div style={{ flex: 1, padding: '20px 20px 140px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <SummaryCard rows={summaryRows} />

        {consultation.hasCompanion && consultation.companions.length > 0 && (
          <div style={{ background: '#F8F8F8', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>同伴者情報</div>
            {consultation.companions.map((c, i) => (
              <div key={i} style={{
                padding: '10px 0',
                borderBottom: i < consultation.companions.length - 1 ? '1px solid #EEE' : 'none',
                display: 'flex', flexDirection: 'column', gap: 3,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
                  {i + 1}. {c.name}　{c.gender === 'male' ? '男性' : '女性'}　{c.birthDate.replace(/-/g, '/')}
                </div>
                <div style={{ fontSize: 12, color: '#555' }}>
                  {c.visitType === 'first' ? '初診' : '再診'}　{c.desiredTreatment}
                </div>
                {(c.budget || c.surgeryHistory) && (
                  <div style={{ fontSize: 12, color: '#888' }}>
                    {c.budget && `予算: ${c.budget}`}{c.budget && c.surgeryHistory && '　'}{c.surgeryHistory && `履歴: ${c.surgeryHistory}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <InfoBox type="warning">
          クリニックが内容を確認後、予約を確定いたします。<br />
          結果はLINEメッセージでお知らせします。
        </InfoBox>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 10,
            color: '#DC2626',
            fontSize: 13,
          }}>
            {error}
          </div>
        )}
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 20px 32px',
        background: '#fff',
        borderTop: '1px solid #F0F0F0',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        <Button fullWidth onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '申し込み中...' : '予約を申し込む'}
        </Button>
        <Button fullWidth variant="ghost" onClick={onBack} disabled={isSubmitting}>
          戻る
        </Button>
      </div>
    </div>
  )
}
