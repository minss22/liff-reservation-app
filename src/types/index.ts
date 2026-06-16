// 사용자 프로필
export interface UserProfile {
  lineUserId: string
  displayName: string
  pictureUrl?: string
  name?: string
  birthDate?: string
  phone?: string
  notes?: string
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

// 시술 카테고리
export interface TreatmentCategory {
  id: string
  name: string
}

// 시술 항목
export interface Treatment {
  id: string
  branchId: string
  categoryId: string
  name: string
  price: number
  durationMin: number
  description: string
  isAvailable: boolean
}

// 예약 가능 슬롯
export interface TimeSlot {
  time: string       // "10:00"
  available: boolean
}

// 예약 신청 데이터
export interface ReservationRequest {
  branchId: string
  treatmentId: string
  date: string       // "2026-07-15"
  time: string       // "14:00"
  memo?: string
}

// 예약 결과
export interface Reservation {
  id: string
  branchName: string
  treatmentName: string
  price: number
  durationMin: number
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'
  createdAt: string
}

// 예약 신청 단계
export type ReservationStep =
  | 'login'
  | 'profile'
  | 'select-branch-treatment'
  | 'select-datetime'
  | 'confirm'
  | 'complete'
