import { useState, useEffect } from 'react'
import { TopBar, StepIndicator, Button, LoadingSpinner } from '../components/ui'
import { reservationApi } from '../utils/api'
import { addMonth, getCalendarDays, currentYearMonth, today } from '../utils/format'
import type { TimeSlot } from '../types'

interface SelectDatetimePageProps {
  branchId: string
  onNext: (date: string, time: string) => void
  onBack: () => void
}

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

export default function SelectDatetimePage({ branchId, onNext, onBack }: SelectDatetimePageProps) {
  const [yearMonth, setYearMonth] = useState(currentYearMonth())
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isLoadingDates, setIsLoadingDates] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  useEffect(() => {
    setIsLoadingDates(true)
    setSelectedDate(null)
    setSlots([])
    setSelectedTime(null)
    reservationApi.getAvailableDates(branchId, yearMonth)
      .then((res: any) => setAvailableDates(res))
      .catch(console.error)
      .finally(() => setIsLoadingDates(false))
  }, [yearMonth, branchId])

  useEffect(() => {
    if (!selectedDate) return
    setIsLoadingSlots(true)
    setSelectedTime(null)
    reservationApi.getAvailableSlots(branchId, selectedDate)
      .then((res: any) => setSlots(res))
      .catch(console.error)
      .finally(() => setIsLoadingSlots(false))
  }, [selectedDate, branchId])

  const days = getCalendarDays(yearMonth)
  const todayStr = today()
  const [year, month] = yearMonth.split('-').map(Number)

  const isDateAvailable = (d: number) => {
    const dateStr = `${yearMonth}-${String(d).padStart(2, '0')}`
    return dateStr >= todayStr && availableDates.includes(dateStr)
  }

  const isDatePast = (d: number) => {
    const dateStr = `${yearMonth}-${String(d).padStart(2, '0')}`
    return dateStr < todayStr
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="日時の選択" onBack={onBack} />

      <div style={{ flex: 1, padding: '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <StepIndicator total={4} current={3} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setYearMonth(addMonth(yearMonth, -1))}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: '4px 8px', color: '#333' }}
          >‹</button>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{year}年{month}月</span>
          <button
            onClick={() => setYearMonth(addMonth(yearMonth, 1))}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: '4px 8px', color: '#333' }}
          >›</button>
        </div>

        {isLoadingDates ? (
          <LoadingSpinner message="日付を読み込み中..." />
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
              {DAY_LABELS.map((d, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  color: i === 0 ? '#EF4444' : i === 6 ? '#3B82F6' : '#999',
                  padding: '4px 0',
                }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {days.map((d, i) => {
                if (!d) return <div key={i} />
                const dateStr = `${yearMonth}-${String(d).padStart(2, '0')}`
                const available = isDateAvailable(d)
                const past = isDatePast(d)
                const selected = selectedDate === dateStr
                return (
                  <button
                    key={i}
                    disabled={!available}
                    onClick={() => setSelectedDate(dateStr)}
                    style={{
                      padding: '8px 0',
                      borderRadius: 8,
                      border: 'none',
                      background: selected ? '#1D9E75' : available ? '#F0FDF8' : 'transparent',
                      color: selected ? '#fff' : past ? '#CCC' : available ? '#111' : '#CCC',
                      fontSize: 13,
                      fontWeight: selected ? 700 : 400,
                      cursor: available ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s',
                    }}
                  >{d}</button>
                )
              })}
            </div>
          </div>
        )}

        {selectedDate && (
          <section>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 12px' }}>
              {selectedDate.replace(/-/g, '/')} の予約可能時間
            </h2>
            {isLoadingSlots ? (
              <LoadingSpinner message="時間を読み込み中..." />
            ) : slots.length === 0 ? (
              <p style={{ fontSize: 14, color: '#999', textAlign: 'center', padding: 16 }}>
                選択できる時間がありません
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {slots.map((slot, i) => {
                  const isSelected = selectedTime === slot.time
                  return (
                    <button
                      key={i}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      style={{
                        padding: '10px 0',
                        borderRadius: 10,
                        border: `1.5px solid ${isSelected ? '#1D9E75' : slot.available ? '#E0E0E0' : '#F0F0F0'}`,
                        background: isSelected ? '#1D9E75' : slot.available ? '#fff' : '#F8F8F8',
                        color: isSelected ? '#fff' : slot.available ? '#111' : '#CCC',
                        fontSize: 14,
                        fontWeight: isSelected ? 700 : 400,
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        textDecoration: slot.available ? 'none' : 'line-through',
                        transition: 'all 0.15s',
                      }}
                    >{slot.time}</button>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px', background: '#fff', borderTop: '1px solid #F0F0F0' }}>
        <Button
          fullWidth
          disabled={!selectedDate || !selectedTime}
          onClick={() => selectedDate && selectedTime && onNext(selectedDate, selectedTime)}
        >
          次へ
        </Button>
      </div>
    </div>
  )
}
