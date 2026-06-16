import { useState, useEffect } from 'react'
import { TopBar, StepIndicator, Chip, Button, LoadingSpinner } from '../components/ui'
import { branchApi, reservationApi } from '../utils/api'
import { addMonth, getCalendarDays, currentYearMonth, today } from '../utils/format'
import type { Branch, TimeSlot } from '../types'

interface SelectBranchDatetimePageProps {
  onNext: (branchId: string, branchName: string, date: string, time: string) => void
  onBack: () => void
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export default function SelectBranchDatetimePage({ onNext, onBack }: SelectBranchDatetimePageProps) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [yearMonth, setYearMonth] = useState(currentYearMonth())
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isLoadingBranches, setIsLoadingBranches] = useState(true)
  const [isLoadingDates, setIsLoadingDates] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  useEffect(() => {
    branchApi.getBranches()
      .then((res: any) => setBranches(res))
      .catch(console.error)
      .finally(() => setIsLoadingBranches(false))
  }, [])

  useEffect(() => {
    if (!selectedBranchId) return
    setIsLoadingDates(true)
    setSelectedDate(null)
    setSlots([])
    setSelectedTime(null)
    reservationApi.getAvailableDates(selectedBranchId, yearMonth)
      .then((res: any) => setAvailableDates(res))
      .catch(console.error)
      .finally(() => setIsLoadingDates(false))
  }, [yearMonth, selectedBranchId])

  useEffect(() => {
    if (!selectedDate || !selectedBranchId) return
    setIsLoadingSlots(true)
    setSelectedTime(null)
    reservationApi.getAvailableSlots(selectedBranchId, selectedDate)
      .then((res: any) => setSlots(res))
      .catch(console.error)
      .finally(() => setIsLoadingSlots(false))
  }, [selectedDate, selectedBranchId])

  const days = getCalendarDays(yearMonth)
  const todayStr = today()
  const [year, month] = yearMonth.split('-').map(Number)
  const canProceed = selectedBranchId && selectedDate && selectedTime

  const isDateAvailable = (d: number) => {
    const dateStr = `${yearMonth}-${String(d).padStart(2, '0')}`
    return dateStr >= todayStr && availableDates.includes(dateStr)
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="지점 · 날짜 · 시간 선택" onBack={onBack} />
      <div style={{ flex: 1, padding: '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <StepIndicator total={4} current={2} />

        {/* 지점 선택 */}
        <section>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 12px' }}>지점 선택</h2>
          {isLoadingBranches ? <LoadingSpinner message="지점 불러오는 중..." /> : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {branches.map(b => (
                <Chip key={b.id} label={b.name} selected={selectedBranchId === b.id}
                  onClick={() => { setSelectedBranchId(b.id); setSelectedDate(null); setSlots([]); setSelectedTime(null) }} />
              ))}
            </div>
          )}
        </section>

        {/* 날짜 선택 */}
        {selectedBranchId && (
          <section>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 12px' }}>날짜 선택</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <button onClick={() => setYearMonth(addMonth(yearMonth, -1))} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#333' }}>‹</button>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{year}년 {month}월</span>
              <button onClick={() => setYearMonth(addMonth(yearMonth, 1))} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#333' }}>›</button>
            </div>
            {isLoadingDates ? <LoadingSpinner message="날짜 조회 중..." /> : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
                  {DAY_LABELS.map((d, i) => (
                    <div key={i} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: i === 0 ? '#EF4444' : i === 6 ? '#3B82F6' : '#999', padding: '4px 0' }}>{d}</div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {days.map((d, i) => {
                    if (!d) return <div key={i} />
                    const dateStr = `${yearMonth}-${String(d).padStart(2, '0')}`
                    const available = isDateAvailable(d)
                    const past = dateStr < todayStr
                    const selected = selectedDate === dateStr
                    return (
                      <button key={i} disabled={!available} onClick={() => setSelectedDate(dateStr)} style={{
                        padding: '8px 0', borderRadius: 8, border: 'none',
                        background: selected ? '#1D9E75' : available ? '#F0FDF8' : 'transparent',
                        color: selected ? '#fff' : past ? '#CCC' : available ? '#111' : '#CCC',
                        fontSize: 13, fontWeight: selected ? 700 : 400,
                        cursor: available ? 'pointer' : 'not-allowed',
                      }}>{d}</button>
                    )
                  })}
                </div>
              </>
            )}
          </section>
        )}

        {/* 시간 선택 */}
        {selectedDate && (
          <section>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 12px' }}>
              {selectedDate.replace(/-/g, '.')} 예약 가능 시간
            </h2>
            {isLoadingSlots ? <LoadingSpinner message="시간 조회 중..." /> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {slots.map((slot, i) => {
                  const isSelected = selectedTime === slot.time
                  return (
                    <button key={i} disabled={!slot.available} onClick={() => setSelectedTime(slot.time)} style={{
                      padding: '10px 0', borderRadius: 10,
                      border: `1.5px solid ${isSelected ? '#1D9E75' : slot.available ? '#E0E0E0' : '#F0F0F0'}`,
                      background: isSelected ? '#1D9E75' : slot.available ? '#fff' : '#F8F8F8',
                      color: isSelected ? '#fff' : slot.available ? '#111' : '#CCC',
                      fontSize: 14, fontWeight: isSelected ? 700 : 400,
                      cursor: slot.available ? 'pointer' : 'not-allowed',
                      textDecoration: slot.available ? 'none' : 'line-through',
                    }}>{slot.time}</button>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px', background: '#fff', borderTop: '1px solid #F0F0F0' }}>
        <Button fullWidth disabled={!canProceed} onClick={() => {
          const branch = branches.find(b => b.id === selectedBranchId)
          if (canProceed && branch) onNext(selectedBranchId!, branch.name, selectedDate!, selectedTime!)
        }}>
          다음으로
        </Button>
      </div>
    </div>
  )
}
