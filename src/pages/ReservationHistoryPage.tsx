import { useState, useEffect } from 'react'
import { TopBar, Button, LoadingSpinner } from '../components/ui'
import { reservationApi } from '../utils/api'
import { formatDate, formatStatus } from '../utils/format'
import type { Reservation } from '../types'

interface ReservationHistoryPageProps {
  onBack: () => void
  onNewReservation: () => void
}

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#FFFBEB', color: '#92400E' },
  confirmed: { bg: '#E1F5EE', color: '#085041' },
  rejected:  { bg: '#FEF2F2', color: '#991B1B' },
  cancelled: { bg: '#F3F4F6', color: '#6B7280' },
  completed: { bg: '#F0FDF4', color: '#166534' },
}

const VISIT_TYPE_JP: Record<string, string> = {
  '초진': '初診',
  '재진': '再診',
}

export default function ReservationHistoryPage({ onBack, onNewReservation }: ReservationHistoryPageProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    reservationApi.getMyReservations()
      .then((res: any) => setReservations(res))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const handleCancel = async (id: string) => {
    if (!window.confirm('予約をキャンセルしますか？')) return
    try {
      await reservationApi.cancelReservation(id)
      setReservations(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r)
      )
    } catch {
      alert('キャンセル処理中にエラーが発生しました。')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#F8F8F8', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="予約履歴" onBack={onBack} />

      <div style={{ flex: 1, padding: '16px' }}>
        {isLoading ? (
          <LoadingSpinner message="予約履歴を読み込み中..." />
        ) : reservations.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            gap: 16,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48 }}>📋</div>
            <p style={{ fontSize: 15, color: '#888', margin: 0 }}>予約履歴がありません</p>
            <Button onClick={onNewReservation}>予約する</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reservations.map(r => {
              const badge = STATUS_BADGE[r.status] ?? STATUS_BADGE.pending
              const canCancel = r.status === 'pending' || r.status === 'confirmed'
              return (
                <div key={r.id} style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: '16px',
                  border: '1px solid #F0F0F0',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 3 }}>
                        {r.desiredTreatment.length > 20 ? r.desiredTreatment.slice(0, 20) + '…' : r.desiredTreatment}
                      </div>
                      <div style={{ fontSize: 13, color: '#888' }}>{r.branchName}</div>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      background: badge.bg,
                      color: badge.color,
                      fontSize: 12,
                      fontWeight: 600,
                      flexShrink: 0,
                      marginLeft: 8,
                    }}>
                      {formatStatus(r.status)}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: '#F8F8F8',
                    borderRadius: 8,
                    marginBottom: canCancel ? 12 : 0,
                  }}>
                    <span style={{ fontSize: 13, color: '#666' }}>
                      {formatDate(r.date)} {r.time}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>
                      {VISIT_TYPE_JP[r.visitType] ?? r.visitType}
                    </span>
                  </div>

                  {canCancel && (
                    <button
                      onClick={() => handleCancel(r.id)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: 8,
                        border: '1px solid #E0E0E0',
                        background: 'transparent',
                        color: '#999',
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      キャンセル
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={{
        padding: '16px 16px 32px',
        background: '#F8F8F8',
        borderTop: '1px solid #EEEEEE',
      }}>
        <Button fullWidth onClick={onNewReservation}>
          新しく予約する
        </Button>
      </div>
    </div>
  )
}
