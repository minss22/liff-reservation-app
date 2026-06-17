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
  branchId: string   // LINE 병원 채널 ID (branches.branch_id)
  name: string
  address: string
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
  visitType: 'first' | 'return'
  desiredTreatment: string
  budget?: string
  surgeryHistory?: string
  hasCompanion: boolean
  companions: Companion[]
}

// 예약 결과
export interface Reservation {
  id: string
  customerName?: string
  branchName: string
  date: string
  time: string
  visitType: string
  desiredTreatment: string
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'
  createdAt: string
}

// 예약 신청 단계 (기획서 화면 1~6 — 지점 선택 없음, 채널로 단일 병원 자동 연결)
export type ReservationStep =
  | 'login'
  | 'profile'
  | 'select-datetime'
  | 'consultation'
  | 'confirm'
  | 'complete'
