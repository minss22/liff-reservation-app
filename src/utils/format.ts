export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`
}

export function formatDate(date: string): string {
  return date.replace(/-/g, '.')
}

export function formatDateTime(date: string, time: string): string {
  return `${formatDate(date)} ${time}`
}

export function formatDuration(min: number): string {
  if (min < 60) return `약 ${min}분`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `약 ${h}시간 ${m}분` : `약 ${h}시간`
}

export function formatStatus(
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'
): string {
  const map = {
    pending: '검토 중',
    confirmed: '예약 확정',
    rejected: '거절됨',
    cancelled: '취소됨',
    completed: '방문 완료',
  }
  return map[status]
}

export function addMonth(yearMonth: string, delta: number): string {
  const [year, month] = yearMonth.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function getCalendarDays(yearMonth: string): (number | null)[] {
  const [year, month] = yearMonth.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1).getDay()
  const lastDate = new Date(year, month, 0).getDate()
  const days: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= lastDate; d++) days.push(d)
  return days
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function currentYearMonth(): string {
  return today().slice(0, 7)
}
