import { useEffect, useState } from 'react'
import liff from '@line/liff'

interface UseLiffReturn {
  isReady: boolean
  isLoggedIn: boolean
  isInClient: boolean
  error: string | null
  lineUserId: string | null
  displayName: string | null
  pictureUrl: string | null
  login: () => void
  logout: () => void
}

export function useLiff(): UseLiffReturn {
  const [isReady, setIsReady] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lineUserId, setLineUserId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [pictureUrl, setPictureUrl] = useState<string | null>(null)

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffId = import.meta.env.VITE_LIFF_ID
        if (!liffId) throw new Error('VITE_LIFF_ID가 설정되지 않았습니다.')

        await liff.init({ liffId })

        if (liff.isLoggedIn()) {
          setIsLoggedIn(true)
          const profile = await liff.getProfile()
          setLineUserId(profile.userId)
          setDisplayName(profile.displayName)
          setPictureUrl(profile.pictureUrl ?? null)
        }

        setIsReady(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'LIFF 초기화 실패')
        setIsReady(true)
      }
    }

    initLiff()
  }, [])

  const login = () => {
    liff.login({ redirectUri: window.location.href })
  }

  const logout = () => {
    liff.logout()
    setIsLoggedIn(false)
    setLineUserId(null)
    setDisplayName(null)
    setPictureUrl(null)
  }

  return {
    isReady,
    isLoggedIn,
    isInClient: liff.isInClient(),
    error,
    lineUserId,
    displayName,
    pictureUrl,
    login,
    logout,
  }
}
