import { useState, useEffect } from 'react'
import { TopBar, Button, LoadingSpinner } from '../components/ui'
import { CompanionForm, emptyCompanion, ROMAJI_REGEX } from './ConsultationPage'
import { useDialog } from '../components/Dialog'
import { reservationApi } from '../utils/api'
import { formatDate, formatStatus } from '../utils/format'
import type { Reservation, Companion } from '../types'

interface ReservationHistoryPageProps {
  onBack: () => void
  onNewReservation: () => void
  onReschedule: (reservation: Reservation) => void
  onOpenDetail: (reservationId: string) => void
}

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#FFFBEB', color: '#92400E' },
  confirmed: { bg: '#E1F5EE', color: '#085041' },
  rejected:  { bg: '#FEF2F2', color: '#991B1B' },
  cancelled: { bg: '#F3F4F6', color: '#6B7280' },
  completed: { bg: '#F0FDF4', color: '#166534' },
}

const VISIT_TYPE_JP: Record<string, string> = {
  first: '初診',
  return: '再診',
}

// 예약 일시(현지=JST/KST)가 지났는지
const isPastReservation = (date: string, time: string) =>
  new Date(`${date}T${(time || '23:59')}:00`).getTime() < Date.now()

type CompanionRow = { id: string; name: string; visitType: 'first' | 'return'; desiredTreatment: string; status: string }

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000,
}
const sheetStyle: React.CSSProperties = {
  background: '#fff', width: '100%', maxWidth: 480, maxHeight: '88dvh',
  overflowY: 'auto', borderRadius: '16px 16px 0 0', padding: '20px 20px 28px',
}

function validateCompanions(list: Companion[]) {
  const errs: Record<string, string> = {}
  list.forEach((c, i) => {
    if (!c.name.trim()) errs[`c_${i}_name`] = 'お名前を入力してください'
    else if (!ROMAJI_REGEX.test(c.name.trim())) errs[`c_${i}_name`] = 'ローマ字で入力してください'
    if (!c.birthDate) errs[`c_${i}_birth`] = '生年月日を入力してください'
    if (!c.gender) errs[`c_${i}_gender`] = '選択してください'
    if (!c.visitType) errs[`c_${i}_visitType`] = '選択してください'
    if (!c.desiredTreatment.trim()) errs[`c_${i}_treatment`] = 'ご希望の施術内容を入力してください'
  })
  return errs
}

export default function ReservationHistoryPage({ onBack, onNewReservation, onReschedule, onOpenDetail }: ReservationHistoryPageProps) {
  const dialog = useDialog()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 동반자 추가 모달
  const [addTarget, setAddTarget] = useState<Reservation | null>(null)
  const [addList, setAddList] = useState<Companion[]>([])
  const [addErrors, setAddErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const loadReservations = (silent = false) => {
    if (!silent) setIsLoading(true)
    reservationApi.getMyReservations()
      .then((res: any) => setReservations(res))
      .catch(console.error)
      .finally(() => { if (!silent) setIsLoading(false) })
  }
  useEffect(() => { loadReservations() }, [])

  // 자동 새로고침: 앱 복귀 시 즉시 + 15초마다 (조용히)
  useEffect(() => {
    const tick = () => { if (document.visibilityState === 'visible') loadReservations(true) }
    const iv = setInterval(tick, 15000)
    window.addEventListener('focus', tick)
    document.addEventListener('visibilitychange', tick)
    return () => { clearInterval(iv); window.removeEventListener('focus', tick); document.removeEventListener('visibilitychange', tick) }
  }, [])

  const handleCancel = async (id: string) => {
    if (!(await dialog.confirm({ message: '予約をキャンセルしますか？', okText: 'はい', cancelText: 'いいえ', danger: true }))) return
    try {
      await reservationApi.cancelReservation(id)
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r))
    } catch {
      dialog.alert('キャンセル処理中にエラーが発生しました。')
    }
  }

  const handleRebook = async (id: string) => {
    if (!(await dialog.confirm({ message: '同じ内容で予約しますか？', okText: 'はい', cancelText: 'いいえ' }))) return
    try {
      await reservationApi.rebook(id)
      loadReservations()
      dialog.alert('ご予約を受け付けました。\nクリニックの確認後にお知らせします。')
    } catch (e: any) {
      dialog.alert(e?.message || '予約に失敗しました')
    }
  }

  const openAdd = (r: Reservation) => {
    setAddTarget(r)
    setAddList([emptyCompanion()])
    setAddErrors({})
  }

  const submitAdd = async () => {
    if (!addTarget) return
    const errs = validateCompanions(addList)
    if (Object.keys(errs).length > 0) { setAddErrors(errs); return }
    setSubmitting(true)
    try {
      await reservationApi.addCompanions(addTarget.id, addList)
      setAddTarget(null)
      dialog.alert('同行者の追加を申請しました。\nクリニックの承認後にお知らせします。')
    } catch (e: any) {
      dialog.alert(e?.message || '申請中にエラーが発生しました。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#F8F8F8', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="予約履歴" onBack={onBack} />

      <div style={{ flex: 1, padding: '16px' }}>
        {isLoading ? (
          <LoadingSpinner message="予約履歴を読み込み中..." />
        ) : reservations.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>📋</div>
            <p style={{ fontSize: 15, color: '#888', margin: 0 }}>予約履歴がありません</p>
            <Button onClick={onNewReservation}>予約する</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reservations.map(r => {
              const badge = STATUS_BADGE[r.status] ?? STATUS_BADGE.pending
              const canManage = (r.status === 'pending' || r.status === 'confirmed') && !isPastReservation(r.date, r.time)
              return (
                <div key={r.id} style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #F0F0F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 3 }}>
                        {r.desiredTreatment.length > 20 ? r.desiredTreatment.slice(0, 20) + '…' : r.desiredTreatment}
                      </div>
                      <div style={{ fontSize: 13, color: '#888' }}>{r.branchName}</div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: 12, background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>
                      {formatStatus(r.status)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8F8F8', borderRadius: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: '#666' }}>{formatDate(r.date)} {r.time}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>{VISIT_TYPE_JP[r.visitType] ?? r.visitType}</span>
                  </div>

                  {/* 상세 보기 / 동반자 추가 */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: canManage ? 8 : 0 }}>
                    <button onClick={() => onOpenDetail(r.id)} style={ghostBtn('#555', '#E0E0E0')}>詳細を見る</button>
                    {canManage && (
                      <button onClick={() => openAdd(r)} style={ghostBtn('#1D9E75', '#1D9E75')}>＋ 同行者追加</button>
                    )}
                  </div>

                  {canManage && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => onReschedule(r)} style={ghostBtn('#1D9E75', '#1D9E75')}>時間変更</button>
                      <button onClick={() => handleCancel(r.id)} style={ghostBtn('#999', '#E0E0E0')}>キャンセル</button>
                    </div>
                  )}

                  {r.status === 'cancelled' && !isPastReservation(r.date, r.time) && (
                    <button onClick={() => handleRebook(r.id)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: '#1D9E75', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      同じ内容で再予約
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ padding: '16px 16px 32px', background: '#F8F8F8', borderTop: '1px solid #EEEEEE' }}>
        <Button fullWidth onClick={onNewReservation}>新しく予約する</Button>
      </div>

      {/* ── 동반자 추가 모달 ── */}
      {addTarget && (
        <div style={overlayStyle} onClick={() => !submitting && setAddTarget(null)}>
          <div style={sheetStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>同行者を追加</h3>
              <button onClick={() => !submitting && setAddTarget(null)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
            </div>
            <p style={{ fontSize: 12.5, color: '#888', margin: '0 0 14px' }}>
              {formatDate(addTarget.date)} {addTarget.time}・追加分はクリニックの承認後に確定します（既存のご予約には影響しません）。
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {addList.map((c, i) => (
                <CompanionForm
                  key={i}
                  companion={c}
                  index={i}
                  errors={addErrors}
                  onChange={updated => {
                    setAddList(prev => prev.map((x, idx) => idx === i ? updated : x))
                    setAddErrors(e => { const n = { ...e }; delete n[`c_${i}_name`]; delete n[`c_${i}_birth`]; delete n[`c_${i}_gender`]; delete n[`c_${i}_visitType`]; delete n[`c_${i}_treatment`]; return n })
                  }}
                  onRemove={() => setAddList(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev)}
                />
              ))}
              <button
                onClick={() => setAddList(prev => [...prev, emptyCompanion()])}
                style={{ padding: '13px', borderRadius: 10, border: '1.5px dashed #1D9E75', background: '#F0FDF8', color: '#1D9E75', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                ＋ 同行者を追加
              </button>
            </div>

            <div style={{ marginTop: 18 }}>
              <Button fullWidth onClick={submitAdd} disabled={submitting}>
                {submitting ? '申請中...' : '追加を申請する'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ghostBtn(color: string, border: string): React.CSSProperties {
  return {
    flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${border}`,
    background: 'transparent', color, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  }
}
