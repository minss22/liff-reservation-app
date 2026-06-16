import { useState, useEffect } from 'react'
import { useLiff } from './hooks/useLiff'
import { customerApi, branchApi, treatmentApi, reservationApi } from './utils/api'

import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import SelectTreatmentPage from './pages/SelectTreatmentPage'
import SelectDatetimePage from './pages/SelectDatetimePage'
import ConfirmPage from './pages/ConfirmPage'
import CompletePage from './pages/CompletePage'
import { LoadingSpinner } from './components/ui'

import type { ReservationStep, UserProfile, Branch, Treatment, Reservation } from './types'

export default function App() {
  const { isReady, isLoggedIn, error, lineUserId, displayName, pictureUrl, login } = useLiff()

  const [step, setStep] = useState<ReservationStep>('login')
  const [isCheckingProfile, setIsCheckingProfile] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [completedReservation, setCompletedReservation] = useState<Reservation | null>(null)

  // 로그인 완료 시 프로필 확인
  useEffect(() => {
    if (!isReady || !isLoggedIn) return
    setIsCheckingProfile(true)
    customerApi.getProfile()
      .then((profile: any) => {
        if (profile) {
          setStep('select-branch-treatment')
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
        <LoadingSpinner message="앱을 불러오는 중..." />
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

  // ── 로그인 ───────────────────────────────────────────────────
  if (!isLoggedIn || step === 'login') {
    return (
      <LoginPage
        onLogin={() => login()}
        isLoading={false}
      />
    )
  }

  // ── 기본 정보 입력 ───────────────────────────────────────────
  if (step === 'profile') {
    return (
      <ProfilePage
        displayName={displayName ?? ''}
        onComplete={async (profileData) => {
          await customerApi.createProfile({
            name: profileData.name!,
            birthDate: profileData.birthDate!,
            phone: profileData.phone!,
            notes: profileData.notes,
          })
          setStep('select-branch-treatment')
        }}
      />
    )
  }

  // ── 지점·시술 선택 ──────────────────────────────────────────
  if (step === 'select-branch-treatment') {
    return (
      <SelectTreatmentPage
        onNext={async (branchId, treatmentId) => {
          const [branchRes, treatmentsRes]: any = await Promise.all([
            branchApi.getBranch(branchId),
            treatmentApi.getTreatments(branchId),
          ])
          setSelectedBranch(branchRes)
          setSelectedTreatment((treatmentsRes as Treatment[]).find((t) => t.id === treatmentId) ?? null)
          setStep('select-datetime')
        }}
        onBack={() => setStep('login')}
      />
    )
  }

  // ── 날짜·시간 선택 ──────────────────────────────────────────
  if (step === 'select-datetime' && selectedBranch && selectedTreatment) {
    return (
      <SelectDatetimePage
        branchId={selectedBranch.id}
        treatmentId={selectedTreatment.id}
        onNext={(date, time) => {
          setSelectedDate(date)
          setSelectedTime(time)
          setStep('confirm')
        }}
        onBack={() => setStep('select-branch-treatment')}
      />
    )
  }

  // ── 예약 확인·제출 ──────────────────────────────────────────
  if (step === 'confirm' && selectedBranch && selectedTreatment) {
    return (
      <ConfirmPage
        branch={selectedBranch}
        treatment={selectedTreatment}
        date={selectedDate}
        time={selectedTime}
        onConfirmed={(reservation) => {
          setCompletedReservation(reservation)
          setStep('complete')
        }}
        onBack={() => setStep('select-datetime')}
      />
    )
  }

  // ── 접수 완료 ────────────────────────────────────────────────
  if (step === 'complete' && completedReservation) {
    return (
      <CompletePage
        reservation={completedReservation}
        onViewHistory={() => setStep('select-branch-treatment')}
        onGoHome={() => {
          setSelectedBranch(null)
          setSelectedTreatment(null)
          setSelectedDate('')
          setSelectedTime('')
          setCompletedReservation(null)
          setStep('select-branch-treatment')
        }}
      />
    )
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner />
    </div>
  )
}