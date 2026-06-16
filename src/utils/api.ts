import liff from '@line/liff'

const BASE_URL = (import.meta as any).env.VITE_API_BASE_URL

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ path, ...params }).toString()
  const res = await fetch(`${BASE_URL}?${query}`)
  const json = await res.json()
  if (json.status !== 200) throw new Error(json.data?.error || '요청 실패')
  return json.data as T
}

async function post<T>(path: string, body: Record<string, any>): Promise<T> {
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

export const customerApi = {
  getProfile: () => get('customer', { lineUserId: liff.getContext()?.userId ?? '' }),
  createProfile: (data: { name: string; birthDate: string; gender: string; displayName?: string }) =>
    post('customer', { ...data }),
}

export const branchApi = {
  getBranches: () => get('branches'),
  getBranch: (id: string) => get('branch', { id }),
}

export const reservationApi = {
  getAvailableDates: (branchId: string, month: string) =>
    get('available-dates', { branchId, month }),
  getAvailableSlots: (branchId: string, date: string) =>
    get('available-slots', { branchId, date }),
  createReservation: (data: Record<string, any>) => post('reservation', data),
}