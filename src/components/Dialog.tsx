import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

type ConfirmOpts = { message: string; okText?: string; cancelText?: string; danger?: boolean }
type AlertOpts = { message: string; okText?: string }

type DialogState =
  | { kind: 'confirm'; opts: ConfirmOpts; resolve: (v: boolean) => void }
  | { kind: 'alert'; opts: AlertOpts; resolve: () => void }
  | null

interface DialogApi {
  confirm: (opts: ConfirmOpts | string) => Promise<boolean>
  alert: (opts: AlertOpts | string) => Promise<void>
}

const Ctx = createContext<DialogApi | null>(null)

export function useDialog(): DialogApi {
  const c = useContext(Ctx)
  if (!c) throw new Error('useDialog must be used within DialogProvider')
  return c
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>(null)

  const confirm = useCallback((o: ConfirmOpts | string) => {
    const opts = typeof o === 'string' ? { message: o } : o
    return new Promise<boolean>(resolve => setState({ kind: 'confirm', opts, resolve }))
  }, [])

  const alert = useCallback((o: AlertOpts | string) => {
    const opts = typeof o === 'string' ? { message: o } : o
    return new Promise<void>(resolve => setState({ kind: 'alert', opts, resolve }))
  }, [])

  const close = (result: boolean) => {
    setState(prev => {
      if (prev) prev.kind === 'confirm' ? prev.resolve(result) : prev.resolve()
      return null
    })
  }

  return (
    <Ctx.Provider value={{ confirm, alert }}>
      {children}
      {state && (
        <div style={overlay} onClick={() => close(false)}>
          <div style={box} onClick={e => e.stopPropagation()}>
            <p style={msgStyle}>{state.opts.message}</p>
            <div style={btnRow}>
              {state.kind === 'confirm' && (
                <button style={btnGhost} onClick={() => close(false)}>
                  {state.opts.cancelText ?? 'いいえ'}
                </button>
              )}
              <button
                style={state.kind === 'confirm' && state.opts.danger ? btnDanger : btnPrimary}
                onClick={() => close(true)}
              >
                {state.kind === 'confirm' ? (state.opts.okText ?? 'はい') : (state.opts.okText ?? 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 24,
}
const box: React.CSSProperties = {
  background: '#fff', borderRadius: 14, padding: '22px 20px 16px',
  width: '100%', maxWidth: 320, boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
}
const msgStyle: React.CSSProperties = {
  margin: '0 0 18px', fontSize: 15, lineHeight: 1.6, color: '#222',
  textAlign: 'center', whiteSpace: 'pre-line',
}
const btnRow: React.CSSProperties = { display: 'flex', gap: 8 }
const btnBase: React.CSSProperties = {
  flex: 1, padding: '12px 0', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', border: 'none',
}
const btnPrimary: React.CSSProperties = { ...btnBase, background: '#1D9E75', color: '#fff' }
const btnDanger: React.CSSProperties = { ...btnBase, background: '#E53E3E', color: '#fff' }
const btnGhost: React.CSSProperties = { ...btnBase, background: '#F0F0F0', color: '#555' }
