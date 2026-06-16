import { useState, useEffect } from 'react'
import { TopBar, StepIndicator, Chip, Button, LoadingSpinner } from '../components/ui'
import { branchApi, treatmentApi } from '../utils/api'
import { formatPrice, formatDuration } from '../utils/format'
import type { Branch, Treatment } from '../types'

interface SelectTreatmentPageProps {
  onNext: (branchId: string, treatmentId: string) => void
  onBack: () => void
}

export default function SelectTreatmentPage({ onNext, onBack }: SelectTreatmentPageProps) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null)
  const [isLoadingBranches, setIsLoadingBranches] = useState(true)
  const [isLoadingTreatments, setIsLoadingTreatments] = useState(false)

  useEffect(() => {
    branchApi.getBranches()
      .then((res: any) => setBranches(res))
      .catch(console.error)
      .finally(() => setIsLoadingBranches(false))
  }, [])

  useEffect(() => {
    if (!selectedBranchId) return
    setIsLoadingTreatments(true)
    setSelectedTreatmentId(null)
    setTreatments([])
    treatmentApi.getTreatments(selectedBranchId)
      .then((res: any) => setTreatments(res))
      .catch(console.error)
      .finally(() => setIsLoadingTreatments(false))
  }, [selectedBranchId])

  const canProceed = selectedBranchId && selectedTreatmentId

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="지점 · 시술 선택" onBack={onBack} />

      <div style={{ flex: 1, padding: '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <StepIndicator total={4} current={2} />

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 12px' }}>지점 선택</h2>
          {isLoadingBranches ? (
            <LoadingSpinner message="지점 불러오는 중..." />
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {branches.map(branch => (
                <Chip
                  key={branch.id}
                  label={branch.name}
                  selected={selectedBranchId === branch.id}
                  onClick={() => setSelectedBranchId(branch.id)}
                />
              ))}
            </div>
          )}
        </section>

        {selectedBranchId && (
          <section>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 12px' }}>시술 선택</h2>
            {isLoadingTreatments ? (
              <LoadingSpinner message="시술 항목 불러오는 중..." />
            ) : treatments.length === 0 ? (
              <p style={{ fontSize: 14, color: '#999', textAlign: 'center', padding: 24 }}>예약 가능한 시술이 없습니다</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {treatments.map(treatment => {
                  const isSelected = selectedTreatmentId === treatment.id
                  return (
                    <button
                      key={treatment.id}
                      onClick={() => setSelectedTreatmentId(treatment.id)}
                      style={{
                        padding: '14px 16px', borderRadius: 12,
                        border: `1.5px solid ${isSelected ? '#1D9E75' : '#E0E0E0'}`,
                        background: isSelected ? '#E1F5EE' : '#fff',
                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#085041' : '#111', marginBottom: 4 }}>
                            {treatment.name}
                          </div>
                          <div style={{ fontSize: 12, color: isSelected ? '#0F6E56' : '#999' }}>
                            소요시간 {formatDuration(treatment.durationMin)}
                          </div>
                          {treatment.description && (
                            <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{treatment.description}</div>
                          )}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: isSelected ? '#1D9E75' : '#333', flexShrink: 0, marginLeft: 12 }}>
                          {formatPrice(treatment.price)}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px', background: '#fff', borderTop: '1px solid #F0F0F0' }}>
        <Button fullWidth disabled={!canProceed} onClick={() => canProceed && onNext(selectedBranchId!, selectedTreatmentId!)}>
          날짜 선택하기
        </Button>
      </div>
    </div>
  )
}