import { useState, useEffect } from 'react'
import liff from '@line/liff'
import { TopBar, LoadingSpinner, Button } from '../components/ui'
import { reservationApi } from '../utils/api'
import { formatDate, formatStatus } from '../utils/format'
import type { ReservationDetail, ReservationPerson } from '../types'

const VISIT_JP: Record<string, string> = { first: '初診', return: '再診' }
const genderJP = (g: string) => (g === 'male' ? '男性' : g === 'female' ? '女性' : '-')

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#FFFBEB', color: '#92400E' },
  confirmed: { bg: '#E1F5EE', color: '#085041' },
  rejected: { bg: '#FEF2F2', color: '#991B1B' },
  cancelled: { bg: '#F3F4F6', color: '#6B7280' },
  completed: { bg: '#F0FDF4', color: '#166534' },
}

function Row({ k, v }: { k: string; v?: string | null }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 13.5 }}>
      <span style={{ width: 96, flexShrink: 0, color: '#999' }}>{k}</span>
      <span style={{ color: '#222', wordBreak: 'break-word' }}>{v || '-'}</span>
    </div>
  )
}

function Person({ label, p }: { label: string; p: ReservationPerson }) {
  return (
    <div style={{ border: '1px solid #F0F0F0', borderRadius: 12, padding: '14px 16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1D9E75' }}>{label}</div>
      <Row k="お名前" v={p.name} />
      <Row k="生年月日" v={p.birthDate} />
      <Row k="性別" v={genderJP(p.gender)} />
      <Row k="初診・再診" v={VISIT_JP[p.visitType] ?? p.visitType} />
      <Row k="ご希望の施術" v={p.desiredTreatment} />
      <Row k="ご希望の予算" v={p.budget} />
      <Row k="施術履歴" v={p.surgeryHistory} />
    </div>
  )
}

interface Props {
  reservationId: string
  onBack?: () => void
  fromNotification?: boolean   // LINE 알림에서 진입 시 '닫기' 버튼 표시
}

export default function ReservationDetailPage({ reservationId, onBack, fromNotification }: Props) {
  const [detail, setDetail] = useState<ReservationDetail | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    reservationApi.getReservationDetail(reservationId)
      .then(setDetail)
      .catch((e: any) => setErr(e?.message || '読み込みに失敗しました'))
  }, [reservationId])

  const badge = detail?.status ? (STATUS_BADGE[detail.status] ?? STATUS_BADGE.pending) : STATUS_BADGE.pending

  return (
    <div style={{ minHeight: '100dvh', background: '#F8F8F8', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="予約詳細" onBack={onBack} />
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {err ? (
          <p style={{ color: '#E53E3E', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>{err}</p>
        ) : !detail ? (
          <LoadingSpinner message="読み込み中..." />
        ) : !detail.ok ? (
          <p style={{ color: '#888', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>予約が見つかりませんでした。</p>
        ) : (
          <>
            <div style={{ background: '#fff', borderRadius: 12, padding: '16px', border: '1px solid #F0F0F0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{detail.branchName}</span>
                <span style={{ padding: '4px 10px', borderRadius: 12, background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 600 }}>
                  {formatStatus(detail.status as any)}
                </span>
              </div>
              <div style={{ fontSize: 15, color: '#333' }}>{formatDate(detail.date as string)} {detail.time}</div>
            </div>
            {detail.booker && <Person label="ご予約者" p={detail.booker} />}
            {(detail.companions ?? []).map((c, i) => <Person key={i} label={`同行者 ${i + 1}`} p={c} />)}
          </>
        )}
      </div>
      {fromNotification && (
        <div style={{ padding: '16px 16px 32px', background: '#F8F8F8', borderTop: '1px solid #EEEEEE' }}>
          <Button fullWidth onClick={() => liff.closeWindow()}>閉じる</Button>
        </div>
      )}
    </div>
  )
}
