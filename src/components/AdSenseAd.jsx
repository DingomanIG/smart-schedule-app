import { useEffect, useRef } from 'react'

const CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-7402435256033328'

export default function AdSenseAd({ slot, format = 'auto', responsive = true, className = '' }) {
  const adRef = useRef(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (!slot || pushed.current || !adRef.current) return
    try {
      const adsbygoogle = window.adsbygoogle || []
      adsbygoogle.push({})
      window.adsbygoogle = adsbygoogle
      pushed.current = true
    } catch (e) {
      // 광고 로드 실패 시 무시
    }
  }, [slot])

  // slot이 없으면 렌더링하지 않음 (auto-ads가 자동 배치)
  if (!slot) return null

  return (
    <div className={`ad-container my-6 ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}
