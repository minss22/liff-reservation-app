import { Button } from '../components/ui'

interface LoginPageProps {
  onLogin: () => void
  isLoading: boolean
}

export default function LoginPage({ onLogin, isLoading }: LoginPageProps) {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      background: '#fff',
      gap: 32,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: '#E1F5EE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          margin: '0 auto 20px',
        }}>
          🏥
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>
          簡単予約サービス
        </h1>
        <p style={{ fontSize: 14, color: '#888', margin: 0, lineHeight: 1.6 }}>
          LINEアカウントでログインして<br />すぐに予約できます
        </p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { icon: '📅', text: 'ご希望の日時を直接選択' },
          { icon: '💬', text: 'LINEで予約確定のお知らせを受け取れます' },
          { icon: '🔄', text: '予約の変更・キャンセルも簡単に' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            background: '#F8F8F8',
            borderRadius: 12,
          }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 14, color: '#444' }}>{item.text}</span>
          </div>
        ))}
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={onLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 12,
            border: 'none',
            background: '#06C755',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'opacity 0.15s',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 5.92 2 10.76c0 3.03 1.68 5.7 4.24 7.4L5.5 22l4.56-2.4c.63.17 1.28.26 1.94.26 5.52 0 10-3.92 10-8.76C22 5.92 17.52 2 12 2z"/>
          </svg>
          {isLoading ? 'ログイン中...' : 'LINEでログイン'}
        </button>
        <p style={{ fontSize: 11, color: '#BBB', textAlign: 'center', margin: 0 }}>
          ログインすることで、利用規約およびプライバシーポリシーに同意したものとみなされます
        </p>
      </div>
    </div>
  )
}
