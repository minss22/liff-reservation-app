// 가격 포맷 (150000 → "150,000원")
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`
}

// 날짜 포맷 ("2026-07-15" → "2026.07.15")
export function formatDate(date: string): string {
  return date.replace(/-/g, '.')
}

// 날짜 + 시간 포맷 ("2026-07-15", "14:00" → "2026.07.15 14:00")
export function formatDateTime(date: string, time: string): string {
  return `${formatDate(date)} ${time}`
}

// 소요시간 포맷 (30 → "약 30분")
export function formatDuration(min: number): string {
  if (min < 60) return `약 ${min}분`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `약 ${h}시간 ${m}분` : `약 ${h}시간`
}

// 예약 상태 일본어 변환
export function formatStatus(
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'
): string {
  const map: Record<string, string> = {
    pending: '確認中',
    confirmed: '予約確定',
    rejected: 'お断り',
    cancelled: 'キャンセル',
    completed: '来院完了',
  }
  return map[status] ?? status
}

// 월 이동 ("2026-07" → "2026-08")
export function addMonth(yearMonth: string, delta: number): string {
  const [year, month] = yearMonth.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// 해당 월의 날짜 배열 생성
export function getCalendarDays(yearMonth: string): (number | null)[] {
  const [year, month] = yearMonth.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1).getDay() // 0=일
  const lastDate = new Date(year, month, 0).getDate()
  const days: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= lastDate; d++) days.push(d)
  return days
}

// 오늘 날짜 ("2026-07-15") — KST/JST(UTC+9) 기준. (toISOString은 UTC라 자정~오전9시에 어제로 잡히는 문제 방지)
export function today(): string {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10)
}

// 현재 년월 ("2026-07")
export function currentYearMonth(): string {
  return today().slice(0, 7)
}
