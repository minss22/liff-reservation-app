import liff from '@line/liff'

const BASE_URL = (import.meta as any).env.VITE_API_BASE_URL

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ path, ...params }).toString()
  const res = await fetch(`${BASE_URL}?${query}`)
  const json = await res.json()
  if (json.status !== 200) throw new Error(json.data?.error || '요청 실패')
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
  if (json.status !== 200) throw new Error(json.data?.error || '요청 실패')
  return json.data as T
}

// ── 고객 API ──────────────────────────────────────────────────

export const customerApi = {
  getProfile: () => get('customer', {
    lineUserId: liff.getContext()?.userId ?? '',
  }),

  createProfile: (data: {
    name: string
    birthDate: string
    phone: string
    notes?: string
  }) => post('customer', {
    ...data,
    displayName: liff.getContext()?.userId ?? '',
  }),
}

// ── 지점 API ──────────────────────────────────────────────────

export const branchApi = {
  getBranches: () => get('branches'),
  getBranch: (id: string) => get('branch', { id }),
}

// ── 시술 API ──────────────────────────────────────────────────

export const treatmentApi = {
  getTreatments: (branchId: string) => get('treatments', { branchId }),
}

// ── 예약 API ──────────────────────────────────────────────────

export const reservationApi = {
  getAvailableDates: (branchId: string, treatmentId: string, month: string) =>
    get('available-dates', { branchId, treatmentId, month }),

  getAvailableSlots: (branchId: string, treatmentId: string, date: string) =>
    get('available-slots', { branchId, treatmentId, date }),

  createReservation: (data: {
    branchId: string
    treatmentId: string
    date: string
    time: string
    memo?: string
  }) => post('reservation', data),

  getMyReservations: () => get('reservations', {
    lineUserId: liff.getContext()?.userId ?? '',
  }),

  cancelReservation: (reservationId: string) =>
    post('cancel', { reservationId }),
}