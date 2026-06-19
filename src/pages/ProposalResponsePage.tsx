import { useState, useEffect } from 'react'
import liff from '@line/liff'
import { TopBar, Button, LoadingSpinner } from '../components/ui'
import { reservationApi } from '../utils/api'

const dot = (d?: string) => (d ? d.replace(/-/g, '.') : '')

interface Info {
  ok: boolean
  reason?: string
  branchNameJa?: string
  date?: string
  times?: string[]
}

export default function ProposalResponsePage({ reservationId }: { reservationId: string }) {
  const [info, setInfo] = useState<Info | null>(null) // null = 로딩
  const [picked, setPicked] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<null | { status: string; date?: string; time?: string }>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    reservationApi.getProposalInfo(reservationId)
      .then((d) => setInfo(d as Info))
      .catch(() => setInfo({ ok: false, reason: 'error' }))
  }, [reservationId])

  const closeWindow = () => { try { liff.closeWindow() } catch { /* noop */ } }

  const accept = async () => {
    if (!picked) return
    setBusy(true); setErr('')
    try {
      const r = await reservationApi.respondProposal(reservationId, 'accept', picked)
      setDone(r)
    } catch (e: any) {
      setErr(e?.message || 'エラーが発生しました')
    } finally { setBusy(false) }
  }

  const decline = async () => {
    setBusy(true); setErr('')
    try {
      const r = await reservationApi.respondProposal(reservationId, 'decline')
      setDone(r)
    } catch (e: any) {
      setErr(e?.message || 'エラーが発生しました')
    } finally { setBusy(false) }
  }

  // 결과 화면
  if (done) {
    const ok = done.status === 'confirmed'
    return (
      <Screen>
        <div style={{ fontSize: 44 }}>{ok ? '✅' : '🚫'}</div>
        <h2 style={{ fontSize: 18, margin: '6px 0' }}>{ok ? 'ご予約が確定しました' : 'ご予約をキャンセルしました'}</h2>
        {ok && <p style={{ color: '#555', fontSize: 14 }}>{dot(done.date)} {done.time}<br />当日お待ちしております。</p>}
        {!ok && <p style={{ color: '#888', fontSize: 14 }}>またのご利用をお待ちしております。</p>}
        <Button onClick={closeWindow}>閉じる</Button>
      </Screen>
    )
  }

  if (!info) return <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner message="読み込み中..." /></div>

  if (!info.ok) {
    const msg = info.reason === 'forbidden' ? 'この予約はお客様のものではありません。'
      : info.reason === 'expired' ? 'このご提案はすでに処理されています。'
      : '予約が見つかりません。'
    return (
      <Screen>
        <div style={{ fontSize: 40 }}>🕒</div>
        <p style={{ color: '#666', fontSize: 14 }}>{msg}</p>
        <Button onClick={closeWindow}>閉じる</Button>
      </Screen>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="日時のご提案" />
      <div style={{ flex: 1, padding: '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#F8F8F8', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, color: '#555' }}>
          <div>{info.branchNameJa}</div>
          <div style={{ marginTop: 4, fontWeight: 700, color: '#222' }}>{dot(info.date)}</div>
        </div>

        <label style={{ fontSize: 14, fontWeight: 600, color: '#444' }}>ご希望の時間をお選びください</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {info.times?.map((t) => {
            const on = picked === t
            return (
              <button key={t} onClick={() => setPicked(t)} style={{
                padding: '11px 18px', borderRadius: 10, fontSize: 15, fontWeight: on ? 700 : 400, cursor: 'pointer',
                border: `1.5px solid ${on ? '#1D9E75' : '#E0E0E0'}`, background: on ? '#E1F5EE' : '#fff', color: on ? '#085041' : '#555',
              }}>{t}</button>
            )
          })}
        </div>

        {err && <p style={{ color: '#DC2626', fontSize: 13 }}>{err}</p>}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px', background: '#fff', borderTop: '1px solid #F0F0F0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button fullWidth onClick={accept} disabled={!picked || busy}>{busy ? '送信中...' : 'この時間で確定する'}</Button>
        <button onClick={decline} disabled={busy} style={{ padding: '12px', borderRadius: 10, border: '1px solid #E0E0E0', background: '#fff', color: '#999', fontSize: 14, cursor: 'pointer' }}>お断りする</button>
      </div>
    </div>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32, textAlign: 'center' }}>
      {children}
    </div>
  )
}
