import { useState, useEffect } from 'react'
import { useLiff } from './hooks/useLiff'
import { customerApi } from './utils/api'

import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import SelectBranchDatetimePage from './pages/SelectBranchDatetimePage'
import ReservationDetailPage from './pages/ReservationDetailPage'
import ConfirmPage from './pages/ConfirmPage'
import CompletePage from './pages/CompletePage'
import { LoadingSpinner } from './components/ui'

import type { ReservationStep, ReservationDetail, Reservation } from './types'

export default function App() {
  const { isReady, isLoggedIn, error, lineUserId, displayName, login } = useLiff()

  const [step, setStep] = useState<ReservationStep>('login')
  const [isCheckingProfile, setIsCheckingProfile] = useState(false)

  // 예약 흐름 데이터
  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [selectedBranchName, setSelectedBranchName] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [reservationDetail, setReservationDetail] = useState<ReservationDetail | null>(null)
  const [completedReservation, setCompletedReservation] = useState<Reservation | null>(null)

  // 로그인 완료 시 프로필 확인
  useEffect(() => {
    if (!isReady || !isLoggedIn) return
    setIsCheckingProfile(true)
    customerApi.getProfile()
      .then((profile: any) => {
        setStep(profile ? 'select-branch-datetime' : 'profile')
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

  // 로그인
  if (!isLoggedIn || step === 'login') {
    return <LoginPage onLogin={() => login()} isLoading={false} />
  }

  // 기본 정보 입력
  if (step === 'profile') {
    return (
      <ProfilePage
        displayName={displayName ?? ''}
        onComplete={async (data) => {
          await customerApi.createProfile({
            name: data.name,
            birthDate: data.birthDate,
            gender: data.gender,
          })
          setStep('select-branch-datetime')
        }}
      />
    )
  }

  // 지점·날짜·시간 선택
  if (step === 'select-branch-datetime') {
    return (
      <SelectBranchDatetimePage
        onNext={(branchId, branchName, date, time) => {
          setSelectedBranchId(branchId)
          setSelectedBranchName(branchName)
          setSelectedDate(date)
          setSelectedTime(time)
          setStep('reservation-detail')
        }}
        onBack={() => setStep('login')}
      />
    )
  }

  // 예약 상세 정보
  if (step === 'reservation-detail') {
    return (
      <ReservationDetailPage
        onNext={(detail) => {
          setReservationDetail(detail)
          setStep('confirm')
        }}
        onBack={() => setStep('select-branch-datetime')}
      />
    )
  }

  // 예약 확인·제출
  if (step === 'confirm' && reservationDetail) {
    return (
      <ConfirmPage
        branchName={selectedBranchName}
        date={selectedDate}
        time={selectedTime}
        detail={reservationDetail}
        onConfirmed={(reservation) => {
          setCompletedReservation(reservation)
          setStep('complete')
        }}
        onBack={() => setStep('reservation-detail')}
      />
    )
  }

  // 접수 완료
  if (step === 'complete' && completedReservation) {
    return <CompletePage reservation={completedReservation} />
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner />
    </div>
  )
}
