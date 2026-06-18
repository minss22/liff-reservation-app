import { TopBar, SummaryCard } from '../components/ui'
import type { UserProfile } from '../types'

interface MyPageProps {
  userProfile: UserProfile | null
  displayName: string | null
  pictureUrl: string | null
  onClose: () => void
  onEdit: () => void
  onOpenReservations: () => void
}

export default function MyPage({ userProfile, displayName, pictureUrl, onClose, onEdit, onOpenReservations }: MyPageProps) {
  const genderLabel =
    userProfile?.gender === 'male' ? '男性' :
    userProfile?.gender === 'female' ? '女性' : '-'

  const birthdateFormatted = userProfile?.birthDate
    ? userProfile.birthDate.replace(/-/g, '/')
    : '-'

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="マイページ" onBack={onClose} />

      <div style={{ flex: 1, padding: '32px 20px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* 아바타 + 이름 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {pictureUrl ? (
            <img
              src={pictureUrl}
              alt="プロフィール画像"
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E1F5EE' }}
            />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: '#E1F5EE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, border: '2px solid #9FE1CB',
            }}>
              👤
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111', letterSpacing: '0.3px' }}>
              {userProfile?.name || '-'}
            </div>
            {displayName && (
              <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
                LINE: {displayName}
              </div>
            )}
          </div>
        </div>

        {/* 기본 정보 카드 */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#999', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            基本情報
          </p>
          <SummaryCard rows={[
            { label: 'お名前（ローマ字）', value: userProfile?.name || '-' },
            { label: '生年月日', value: birthdateFormatted },
            { label: '性別', value: genderLabel },
          ]} />
        </div>

        {/* 예약 관리 + 편집 버튼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onOpenReservations}
            style={{
              padding: '15px',
              borderRadius: 12,
              border: 'none',
              background: '#06C755',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            予約の管理
          </button>
          <button
            onClick={onEdit}
            style={{
              padding: '15px',
              borderRadius: 12,
              border: '1.5px solid #1D9E75',
              background: '#fff',
              color: '#1D9E75',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            プロフィールを編集
          </button>
        </div>
      </div>
    </div>
  )
}
