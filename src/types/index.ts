export interface UserProfile {
  lineUserId: string
  displayName: string
  pictureUrl?: string
  name?: string
  birthDate?: string
  gender?: 'male' | 'female'
  isProfileComplete: boolean
}

export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  operatingHours: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface Companion {
  name: string
  birthDate: string
  gender: 'male' | 'female' | null
}

export interface ReservationDetail {
  visitType: 'first' | 'revisit'
  treatmentRequest: string
  budget?: string
  surgeryHistory?: string
  hasCompanion: boolean
  companions: Companion[]
}

export interface ReservationRequest {
  branchId: string
  date: string
  time: string
  detail: ReservationDetail
}

export interface Reservation {
  id: string
  branchName: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'
  createdAt: string
}

export type ReservationStep =
  | 'login'
  | 'profile'
  | 'select-branch-datetime'
  | 'reservation-detail'
  | 'confirm'
  | 'complete'
