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
  name: string       // 한국어 (DB 저장/예약 스냅샷용)
  nameJa?: string    // 일본어 표시용 (화면)
  address: string    // 한국어
  addressJa?: string // 일본어 표시용
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
  gender: 'male' | 'female' | null
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
  memo: string          // 예약 단위 기타 요청사항(임의)
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
  memo?: string
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

// 예약 상세 (예약자/동반자 1인)
export interface ReservationPerson {
  id?: string
  name: string
  birthDate: string | null
  gender: string
  visitType: 'first' | 'return'
  desiredTreatment: string
  budget: string
  surgeryHistory: string
  status: string
}
export interface ReservationDetail {
  ok: boolean
  reason?: string
  id?: string
  branchName?: string
  date?: string
  time?: string
  status?: string
  createdAt?: string
  memo?: string
  booker?: ReservationPerson
  companions?: ReservationPerson[]
}

// 예약 신청 단계 (기획서 화면 1~6 — 지점 선택 없음, 채널로 단일 병원 자동 연결)
export type ReservationStep =
  | 'login'
  | 'profile'
  | 'select-datetime'
  | 'consultation'
  | 'confirm'
  | 'complete'
