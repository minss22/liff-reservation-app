import { useState, useEffect } from 'react'
import { useLiff } from './hooks/useLiff'
import { customerApi, branchApi } from './utils/api'

import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import SelectTreatmentPage from './pages/SelectTreatmentPage'
import SelectDatetimePage from './pages/SelectDatetimePage'
import ConsultationPage from './pages/ConsultationPage'
import ConfirmPage from './pages/ConfirmPage'
import CompletePage from './pages/CompletePage'
import { LoadingSpinner } from './components/ui'

import type { ReservationStep, Branch, ConsultationData, Reservation, UserProfile } from './types'

export default function App() {
  const { isReady, isLoggedIn, error, lineUserId: _lineUserId, displayName, login } = useLiff()

  const [step, setStep] = useState<ReservationStep>('login')
  const [isCheckingProfile, setIsCheckingProfile] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null)
  const [completedReservation, setCompletedReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    if (!isReady || !isLoggedIn) return
    setIsCheckingProfile(true)
    customerApi.getProfile()
      .then((profile: any) => {
        if (profile) {
          setUserProfile(profile)
          setStep('select-branch')
        } else {
          setStep('profile')
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

  // ── 로그인 ────────────────────────────────────────────────────
  if (!isLoggedIn || step === 'login') {
    return <LoginPage onLogin={() => login()} isLoading={false} />
  }

  // ── 기본 정보 입력 ────────────────────────────────────────────
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
          setStep('select-branch')
        }}
      />
    )
  }

  // ── 지점 선택 ─────────────────────────────────────────────────
  if (step === 'select-branch') {
    return (
      <SelectTreatmentPage
        onNext={(branch) => {
          setSelectedBranch(branch)
          setStep('select-datetime')
        }}
        onBack={() => setStep('profile')}
      />
    )
  }

  // ── 날짜·시간 선택 ────────────────────────────────────────────
  if (step === 'select-datetime' && selectedBranch) {
    return (
      <SelectDatetimePage
        branchId={selectedBranch.id}
        onNext={(date, time) => {
          setSelectedDate(date)
          setSelectedTime(time)
          setStep('consultation')
        }}
        onBack={() => setStep('select-branch')}
      />
    )
  }

  // ── 상담 정보 입력 ────────────────────────────────────────────
  if (step === 'consultation') {
    return (
      <ConsultationPage
        onNext={(data) => {
          setConsultationData(data)
          setStep('confirm')
        }}
        onBack={() => setStep('select-datetime')}
      />
    )
  }

  // ── 예약 확인·제출 ────────────────────────────────────────────
  if (step === 'confirm' && selectedBranch && consultationData) {
    return (
      <ConfirmPage
        branch={selectedBranch}
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
