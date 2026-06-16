import React from 'react'

export function StepIndicator({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', gap: 5, justifyContent: 'center', margin: '0 0 16px' }}>
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1
        return (
          <div key={i} style={{
            width: 24, height: 4, borderRadius: 2,
            background: step === current ? '#1D9E75' : step < current ? '#9FE1CB' : '#E0E0E0',
            transition: 'background 0.2s',
          }} />
        )
      })}
    </div>
  )
}

export function TopBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '12px 16px',
      borderBottom: '1px solid #F0F0F0', background: '#fff',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          background: 'none', border: 'none', padding: '4px 8px 4px 0',
          cursor: 'pointer', fontSize: 20, color: '#333', lineHeight: 1,
        }}>←</button>
      )}
      <span style={{ fontWeight: 600, fontSize: 16, color: '#111' }}>{title}</span>
    </div>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  fullWidth?: boolean
}
export function Button({ variant = 'primary', fullWidth = false, children, style, disabled, ...rest }: ButtonProps) {
  const base: React.CSSProperties = {
    padding: '13px 20px', borderRadius: 12, fontSize: 15, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: fullWidth ? '100%' : undefined,
    transition: 'opacity 0.15s', opacity: disabled ? 0.5 : 1, border: 'none',
  }
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: '#1D9E75', color: '#fff' },
    outline: { background: '#fff', color: '#1D9E75', border: '1.5px solid #1D9E75' },
    ghost: { background: 'transparent', color: '#888', border: '1px solid #E0E0E0' },
  }
  return <button style={{ ...base, ...variants[variant], ...style }} disabled={disabled} {...rest}>{children}</button>
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}
export function Input({ label, error, hint, style, ...rest }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>{label}</label>
      <input style={{
        padding: '11px 14px', borderRadius: 10,
        border: `1.5px solid ${error ? '#E53E3E' : '#E0E0E0'}`,
        fontSize: 15, color: '#111', background: '#FAFAFA', outline: 'none',
        ...style,
      }} {...rest} />
      {hint && !error && <span style={{ fontSize: 12, color: '#999' }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: '#E53E3E' }}>{error}</span>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  optional?: boolean
}
export function Textarea({ label, hint, optional, style, ...rest }: TextareaProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
        {label} {optional && <span style={{ color: '#999', fontWeight: 400 }}>(선택)</span>}
      </label>
      <textarea style={{
        padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E0E0E0',
        fontSize: 15, color: '#111', background: '#FAFAFA',
        resize: 'none', outline: 'none', fontFamily: 'inherit', ...style,
      }} {...rest} />
      {hint && <span style={{ fontSize: 12, color: '#999' }}>{hint}</span>}
    </div>
  )
}

export function Chip({ label, selected, onClick, disabled }: { label: string; selected: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '7px 14px', borderRadius: 20,
      border: `1.5px solid ${selected ? '#1D9E75' : '#E0E0E0'}`,
      background: selected ? '#E1F5EE' : '#fff',
      color: selected ? '#085041' : '#666',
      fontSize: 13, fontWeight: selected ? 600 : 400,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.15s', opacity: disabled ? 0.5 : 1,
    }}>{label}</button>
  )
}

export function LoadingSpinner({ message = '로딩 중...' }: { message?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40, color: '#999', fontSize: 14 }}>
      <div style={{ width: 32, height: 32, border: '3px solid #E0E0E0', borderTop: '3px solid #1D9E75', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span>{message}</span>
    </div>
  )
}

export function InfoBox({ type = 'info', children }: { type?: 'info' | 'warning' | 'success'; children: React.ReactNode }) {
  const colors = {
    info: { bg: '#EEF2FF', color: '#3730A3', border: '#C7D2FE' },
    warning: { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
    success: { bg: '#E1F5EE', color: '#085041', border: '#9FE1CB' },
  }
  const c = colors[type]
  return (
    <div style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, lineHeight: 1.5 }}>
      {children}
    </div>
  )
}

export function SummaryCard({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div style={{ background: '#F8F8F8', borderRadius: 12, overflow: 'hidden' }}>
      {rows.map((row, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '11px 14px',
          borderBottom: i < rows.length - 1 ? '1px solid #EEEEEE' : 'none',
        }}>
          <span style={{ fontSize: 13, color: '#888' }}>{row.label}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{row.value}</span>
        </div>
      ))}
    </div>
  )
}
