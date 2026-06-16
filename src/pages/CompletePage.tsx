import { Button, SummaryCard } from '../components/ui'
import { formatDate, formatStatus } from '../utils/format'
import type { Reservation } from '../types'

interface CompletePage {
  reservation: Reservation
  onViewHistory: () => void
  onGoHome: () => void
}

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#FFFBEB', color: '#92400E' },
  confirmed: { bg: '#E1F5EE', color: '#085041' },
  rejected:  { bg: '#FEF2F2', color: '#991B1B' },
  cancelled: { bg: '#F3F4F6', color: '#6B7280' },
  completed: { bg: '#F3F4F6', color: '#6B7280' },
}

export default function CompletePage({ reservation, onViewHistory, onGoHome }: CompletePage) {
  const badge = STATUS_BADGE[reservation.status] ?? STATUS_BADGE.pending
  const summaryRows = [
    { label: '지점', value: reservation.branchName },
    { label: '시술', value: reservation.treatmentName },
    { label: '일시', value: `${formatDate(reservation.date)} ${reservation.time}` },
    {
      label: '상태',
      value: formatStatus(reservation.status),
    },
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
      {/* 완료 아이콘 */}
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

      {/* 타이틀 */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>
          예약 접수 완료
        </h1>
        <p style={{ fontSize: 14, color: '#888', margin: 0, lineHeight: 1.6 }}>
          병원에서 확인 후 LINE으로<br />결과를 알려드립니다
        </p>
      </div>

      {/* 예약 정보 요약 */}
      <div style={{ width: '100%' }}>
        <SummaryCard rows={summaryRows} />
      </div>

      {/* 상태 뱃지 */}
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

      {/* 안내 메시지 */}
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
        예약 확정 시 방문 전날과 당일<br />리마인더 알림이 자동으로 발송됩니다
      </div>

      {/* 버튼 */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button fullWidth onClick={onViewHistory}>
          예약 내역 보기
        </Button>
        <Button fullWidth variant="ghost" onClick={onGoHome}>
          홈으로
        </Button>
      </div>
    </div>
  )
}
