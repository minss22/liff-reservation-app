import liff from '@line/liff'
import type { Companion, Reservation } from '../types'

const BASE_URL = (import.meta as any).env.VITE_API_BASE_URL

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ path, ...params }).toString()
  const res = await fetch(`${BASE_URL}?${query}`)
  const json = await res.json()
  if (json.status !== 200) throw new Error(json.data?.error || 'リクエスト失敗')
  return json.data as T
}

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const lineUserId = liff.getContext()?.userId ?? ''
  const res = await fetch(`${BASE_URL}?path=${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ ...body, lineUserId }),
    redirect: 'follow',
  })
  const json = await res.json()
  if (json.status !== 200) throw new Error(json.data?.error || 'リクエスト失敗')
  return json.data as T
}

// ── 고객 API ──────────────────────────────────────────────────

export const customerApi = {
  getProfile: async () => {
    const raw: any = await get('customer', { lineUserId: liff.getContext()?.userId ?? '' })
    if (!raw) return null
    return {
      lineUserId: raw.line_user_id ?? '',
      displayName: raw.display_name ?? '',
      name: raw.name ?? '',
      birthDate: raw.birth_date ?? '',
      gender: raw.gender === '남성' ? 'male' : raw.gender === '여성' ? 'female' : undefined,
      isProfileComplete: !!(raw.name && raw.birth_date && raw.gender),
    }
  },

  createProfile: (data: {
    displayName: string
    name: string
    birthDate: string
    gender: string
  }) => post('customer', data),
}

// ── 지점 API ──────────────────────────────────────────────────

export const branchApi = {
  getBranches: () => get('branches'),
  getBranch: (id: string) => get('branch', { id }),
}

// ── 예약 API ──────────────────────────────────────────────────

export const reservationApi = {
  getAvailableDates: (branchId: string, month: string) =>
    get('available-dates', { branchId, month }),

  getAvailableSlots: (branchId: string, date: string) =>
    get('available-slots', { branchId, date }),

  createReservation: async (data: {
    branchId: string
    date: string
    time: string
    visitType: 'first' | 'return'
    desiredTreatment: string
    budget?: string
    surgeryHistory?: string
    companions: Companion[]
  }): Promise<Reservation> => {
    // 프론트 필드명(desiredTreatment 등) → 백엔드 필드명(treatment_request 등) 매핑
    const raw: any = await post('reservation', {
      branchId: data.branchId,
      date: data.date,
      time: data.time,
      visitType: data.visitType,
      treatmentRequest: data.desiredTreatment,
      budget: data.budget ?? '',
      surgeryHistory: data.surgeryHistory ?? '',
      companions: data.companions.map(c => ({
        name: c.name,
        birthDate: c.birthDate,
        // 성별은 예약자(customers)와 동일하게 한국어로 저장
        gender: c.gender === 'male' ? '남성' : c.gender === 'female' ? '여성' : '',
        visitType: c.visitType,
        treatmentRequest: c.desiredTreatment,
        budget: c.budget,
        surgeryHistory: c.surgeryHistory,
      })),
    })
    return {
      id: raw.id,
      branchName: raw.branchName,
      date: raw.date,
      time: raw.time,
      visitType: raw.visitType,
      desiredTreatment: raw.treatmentRequest,
      status: raw.status,
      createdAt: raw.createdAt,
    }
  },

  getMyReservations: async (): Promise<Reservation[]> => {
    const rows: any[] = await get('reservations', {
      lineUserId: liff.getContext()?.userId ?? '',
    })
    return rows.map(r => ({
      id: r.id,
      customerName: r.customerName,
      branchName: r.branchName,
      date: r.date,
      time: r.time,
      visitType: r.visitType,
      desiredTreatment: r.treatmentRequest,
      status: r.status,
      createdAt: r.createdAt,
    }))
  },

  cancelReservation: (reservationId: string) =>
    post('cancel', { reservationId }),

  // 예약 시간 변경 요청 (병원 확인 후 확정/거절)
  rescheduleReservation: (reservationId: string, date: string, time: string) =>
    post('reschedule', { reservationId, date, time }),
}
