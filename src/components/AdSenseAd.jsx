export default function AdSenseAd({ slot }) {
  return (
    <div className="border border-gray-300 rounded p-4 text-center bg-gray-50">
      <p className="text-sm text-gray-500">광고 영역 ({slot})</p>
      {/* 애드센스 승인 후 스크립트 삽입 */}
    </div>
  )
}
