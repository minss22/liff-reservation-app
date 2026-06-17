// 사용자 프로필
export interface UserProfile {
  lineUserId: string
  displayName: string
  pictureUrl?: string
  name?: string
  birthDate?: string
  gender?: 'male' | 'female'
  isProfileComplete: boolean
}

// 병원 지점
export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  operatingHours: string
}

// 예약 가능 슬롯
export interface TimeSlot {
  time: string       // "10:00"
  available: boolean
}

// 동반자 정보
export interface Companion {
  name: string
  birthDate: string
  gender: 'male' | 'female'
  visitType: 'first' | 'return' | null
  desiredTreatment: string
  budget: string
  surgeryHistory: string
}

// 상담 정보
export interface ConsultationData {
  visitType: 'first' | 'return'
  desiredTreatment: string
  budget: string
  surgeryHistory: string
  hasCompanion: boolean
  companions: Companion[]
}

// 예약 신청 데이터
export interface ReservationRequest {
  branchId: string
  date: string
  time: string
  visitType: string
  desiredTreatment: string
  budget?: string
  surgeryHistory?: string
  hasCompanion: boolean
  companionInfo?: string
}

// 예약 결과
export interface Reservation {
  id: string
  branchName: string
  date: string
  time: string
  visitType: string
  desiredTreatment: string
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'
  createdAt: string
}

// 예약 신청 단계
export type ReservationStep =
  | 'login'
  | 'profile'
  | 'select-branch'
  | 'select-datetime'
  | 'consultation'
  | 'confirm'
  | 'complete'
