import { SummaryCard } from '../components/ui'
import { formatDate, formatStatus } from '../utils/format'
import type { Reservation } from '../types'

interface CompletePageProps {
  reservation: Reservation
}

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#FFFBEB', color: '#92400E' },
  confirmed: { bg: '#E1F5EE', color: '#085041' },
  rejected:  { bg: '#FEF2F2', color: '#991B1B' },
  cancelled: { bg: '#F3F4F6', color: '#6B7280' },
  completed: { bg: '#F3F4F6', color: '#6B7280' },
}

const VISIT_TYPE_JP: Record<string, string> = {
  '초진': '初診',
  '재진': '再診',
}

export default function CompletePage({ reservation }: CompletePageProps) {
  const badge = STATUS_BADGE[reservation.status] ?? STATUS_BADGE.pending

  const summaryRows = [
    { label: '店舗', value: reservation.branchName },
    { label: '日時', value: `${formatDate(reservation.date)} ${reservation.time}` },
    { label: '初診・再診', value: VISIT_TYPE_JP[reservation.visitType] ?? reservation.visitType },
    { label: 'ご希望の施術', value: reservation.desiredTreatment },
    { label: 'ステータス', value: formatStatus(reservation.status) },
  ]

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      gap: 24,
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: '#E1F5EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 36,
      }}>
        ✅
      </div>

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>
          予約受付完了
        </h1>
        <p style={{ fontSize: 14, color: '#888', margin: 0, lineHeight: 1.6 }}>
          クリニックが確認後、LINEで<br />結果をお知らせします
        </p>
      </div>

      <div style={{ width: '100%' }}>
        <SummaryCard rows={summaryRows} />
      </div>

      <div style={{
        display: 'inline-block',
        padding: '6px 18px',
        borderRadius: 20,
        background: badge.bg,
        color: badge.color,
        fontSize: 13,
        fontWeight: 600,
      }}>
        {formatStatus(reservation.status)}
      </div>

      <div style={{
        width: '100%',
        padding: '12px 16px',
        background: '#F0FDF8',
        borderRadius: 12,
        border: '1px solid #9FE1CB',
        fontSize: 13,
        color: '#085041',
        lineHeight: 1.6,
        textAlign: 'center',
      }}>
        予約確定後、前日と当日に<br />リマインダーをお送りします
      </div>
    </div>
  )
}
