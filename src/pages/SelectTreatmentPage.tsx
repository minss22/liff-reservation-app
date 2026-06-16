import { useState, useEffect } from 'react'
import { TopBar, StepIndicator, Button, LoadingSpinner } from '../components/ui'
import { branchApi } from '../utils/api'
import type { Branch } from '../types'

interface SelectTreatmentPageProps {
  onNext: (branch: Branch) => void
  onBack: () => void
}

export default function SelectTreatmentPage({ onNext, onBack }: SelectTreatmentPageProps) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    branchApi.getBranches()
      .then((res: any) => setBranches(res))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const selectedBranch = branches.find(b => b.id === selectedBranchId) ?? null

  return (
    <div style={{ minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="店舗の選択" onBack={onBack} />

      <div style={{ flex: 1, padding: '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <StepIndicator total={4} current={2} />

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 12px' }}>
            ご希望の店舗を選択してください
          </h2>
          {isLoading ? (
            <LoadingSpinner message="店舗を読み込み中..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {branches.map(branch => {
                const isSelected = selectedBranchId === branch.id
                return (
                  <button
                    key={branch.id}
                    onClick={() => setSelectedBranchId(branch.id)}
                    style={{
                      padding: '16px',
                      borderRadius: 12,
                      border: `1.5px solid ${isSelected ? '#1D9E75' : '#E0E0E0'}`,
                      background: isSelected ? '#E1F5EE' : '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      fontSize: 15,
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#085041' : '#111',
                      marginBottom: 4,
                    }}>
                      {branch.name}
                    </div>
                    {branch.address && (
                      <div style={{ fontSize: 12, color: isSelected ? '#0F6E56' : '#999', marginBottom: 2 }}>
                        {branch.address}
                      </div>
                    )}
                    {branch.operatingHours && (
                      <div style={{ fontSize: 12, color: '#aaa' }}>{branch.operatingHours}</div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px', background: '#fff', borderTop: '1px solid #F0F0F0' }}>
        <Button
          fullWidth
          disabled={!selectedBranchId}
          onClick={() => selectedBranch && onNext(selectedBranch)}
        >
          日時を選択する
        </Button>
      </div>
    </div>
  )
}
