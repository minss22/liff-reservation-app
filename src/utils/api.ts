import liff from '@line/liff'

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
  getProfile: () => get('customer', {
    lineUserId: liff.getContext()?.userId ?? '',
  }),

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

  createReservation: (data: {
    branchId: string
    date: string
    time: string
    visitType: string
    desiredTreatment: string
    budget?: string
    surgeryHistory?: string
    hasCompanion: boolean
    companionInfo?: string
  }) => post('reservation', data as unknown as Record<string, unknown>),

  getMyReservations: () => get('reservations', {
    lineUserId: liff.getContext()?.userId ?? '',
  }),

  cancelReservation: (reservationId: string) =>
    post('cancel', { reservationId }),
}
