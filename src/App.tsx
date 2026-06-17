import { useState, useEffect } from 'react'
import { useLiff } from './hooks/useLiff'
import { customerApi, branchApi } from './utils/api'

import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import MyPage from './pages/MyPage'
import SelectDatetimePage from './pages/SelectDatetimePage'
import ConsultationPage from './pages/ConsultationPage'
import ConfirmPage from './pages/ConfirmPage'
import CompletePage from './pages/CompletePage'
import { LoadingSpinner } from './components/ui'

import type { ReservationStep, Branch, ConsultationData, Reservation, UserProfile } from './types'

// 병원 식별자(branch_id) 결정
//  1순위: LIFF URL 쿼리 ?branch=xxx
//         예) 리치 메뉴 → https://liff.line.me/{liffId}?branch=2008835257
//         LIFF 리다이렉트로 원본 쿼리가 liff.state 안에 감싸지는 경우도 함께 처리
//  2순위: VITE_BRANCH_ID 환경변수 (단일 병원 / 로컬 개발 기본값)
function resolveBranchId(): string {
  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('branch')
  if (fromUrl) return fromUrl

  const liffState = params.get('liff.state')
  if (liffState) {
    const inner = new URLSearchParams(liffState.charAt(0) === '?' ? liffState.slice(1) : liffState)
    const fromState = inner.get('branch')
    if (fromState) return fromState
  }

  return ((import.meta as any).env.VITE_BRANCH_ID as string) || ''
}

const BRANCH_ID = resolveBranchId()

export default function App() {
  const { isReady, isLoggedIn, error, lineUserId, displayName, pictureUrl, login } = useLiff()

  const [step, setStep] = useState<ReservationStep>('login')
  const [isCheckingProfile, setIsCheckingProfile] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // 예약 플로우 상태
  const [branch, setBranch] = useState<Branch | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null)
  const [completedReservation, setCompletedReservation] = useState<Reservation | null>(null)

  // 마이페이지 표시 여부 + 프로필 편집 여부
  const [showMyPage, setShowMyPage] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  useEffect(() => {
    if (!isReady || !isLoggedIn) return
    setIsCheckingProfile(true)
    // 병원 정보 자동 로드 (채널 ID 기준) + 프로필 조회를 병행
    branchApi.getBranch(BRANCH_ID)
      .then((b: any) => setBranch(b))
      .catch(console.error)
    customerApi.getProfile()
      .then((profile: any) => {
        if (profile) {
          setUserProfile(profile)
          setStep('select-datetime')   // 프로필 있으면 바로 날짜·시간 선택
        } else {
          setStep('profile')           // 첫 방문: 기본 정보 입력
        }
      })
      .catch(() => setStep('profile'))
      .finally(() => setIsCheckingProfile(false))
  }, [isReady, isLoggedIn])

  if (!isReady || isCheckingProfile) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <LoadingSpinner message="読み込み中..." />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 }}>
        <div style={{ fontSize: 40 }}>⚠️</div>
        <p style={{ color: '#DC2626', textAlign: 'center', fontSize: 14 }}>{error}</p>
      </div>
    )
  }

  // ── 병원 식별 불가 (잘못된 예약 링크) ─────────────────────────
  if (isLoggedIn && !BRANCH_ID) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 }}>
        <div style={{ fontSize: 40 }}>⚠️</div>
        <p style={{ color: '#DC2626', textAlign: 'center', fontSize: 14 }}>
          予約リンクが正しくありません。<br />クリニックの公式アカウントからもう一度お試しください。
        </p>
      </div>
    )
  }

  // ── 로그인 ────────────────────────────────────────────────────
  if (!isLoggedIn || step === 'login') {
    return <LoginPage onLogin={() => login()} isLoading={false} />
  }

  // ── 마이페이지 (프로필 편집 모드) ─────────────────────────────
  if (showMyPage && isEditingProfile) {
    return (
      <ProfilePage
        isEditMode
        initialName={userProfile?.name ?? ''}
        initialBirthDate={userProfile?.birthDate ?? ''}
        initialGender={userProfile?.gender ?? null}
        onBack={() => setIsEditingProfile(false)}
        onComplete={async ({ name, birthDate, gender }) => {
          await customerApi.createProfile({
            displayName: displayName ?? '',
            name,
            birthDate,
            gender: gender === 'male' ? '남성' : '여성',
          })
          setUserProfile(prev => ({
            lineUserId: prev?.lineUserId ?? lineUserId ?? '',
            displayName: prev?.displayName ?? displayName ?? '',
            pictureUrl: prev?.pictureUrl,
            name,
            birthDate,
            gender,
            isProfileComplete: true,
          }))
          setIsEditingProfile(false)
        }}
      />
    )
  }

  // ── 마이페이지 (프로필 조회) ──────────────────────────────────
  if (showMyPage) {
    return (
      <MyPage
        userProfile={userProfile}
        displayName={displayName}
        pictureUrl={pictureUrl}
        onClose={() => setShowMyPage(false)}
        onEdit={() => setIsEditingProfile(true)}
      />
    )
  }

  // ── 기본 정보 입력 (첫 방문) ──────────────────────────────────
  if (step === 'profile') {
    return (
      <ProfilePage
        initialName={userProfile?.name ?? ''}
        initialBirthDate={userProfile?.birthDate ?? ''}
        initialGender={userProfile?.gender ?? null}
        onComplete={async ({ name, birthDate, gender }) => {
          await customerApi.createProfile({
            displayName: displayName ?? '',
            name,
            birthDate,
            gender: gender === 'male' ? '남성' : '여성',
          })
          setUserProfile(prev => ({
            lineUserId: prev?.lineUserId ?? lineUserId ?? '',
            displayName: prev?.displayName ?? displayName ?? '',
            pictureUrl: prev?.pictureUrl,
            name,
            birthDate,
            gender,
            isProfileComplete: true,
          }))
          setStep('select-datetime')
        }}
      />
    )
  }

  const openMyPage = () => {
    setIsEditingProfile(false)
    setShowMyPage(true)
  }

  // ── 날짜·시간 선택 (1/2) ─────────────────────────────────────
  if (step === 'select-datetime') {
    return (
      <SelectDatetimePage
        branchId={BRANCH_ID}
        onNext={(date, time) => {
          setSelectedDate(date)
          setSelectedTime(time)
          setStep('consultation')
        }}
        onOpenMyPage={openMyPage}
        initialDate={selectedDate || undefined}
        initialTime={selectedTime || undefined}
      />
    )
  }

  // ── 상담 정보 입력 (3/3) ─────────────────────────────────────
  if (step === 'consultation') {
    return (
      <ConsultationPage
        onNext={(data) => {
          setConsultationData(data)
          setStep('confirm')
        }}
        onBack={() => setStep('select-datetime')}
        onOpenMyPage={openMyPage}
        initialData={consultationData}
      />
    )
  }

  // ── 예약 확인·제출 ────────────────────────────────────────────
  if (step === 'confirm' && branch && consultationData) {
    return (
      <ConfirmPage
        branch={branch}
        date={selectedDate}
        time={selectedTime}
        consultation={consultationData}
        onConfirmed={(reservation) => {
          setCompletedReservation(reservation)
          setStep('complete')
        }}
        onBack={() => setStep('consultation')}
      />
    )
  }

  // ── 접수 완료 ─────────────────────────────────────────────────
  if (step === 'complete' && completedReservation) {
    return <CompletePage reservation={completedReservation} />
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner />
    </div>
  )
}
