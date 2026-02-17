import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Calendar, BarChart3, Zap, Shield, Smartphone } from 'lucide-react';

const FeaturesBlog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Y-schedule 주요 기능: 당신의 시간을 더 가치있게
          </h1>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <time dateTime="2026-02-17">2026년 2월 17일</time>
            <span className="mx-2">·</span>
            <span>7분 읽기</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop"
          alt="스마트 기능"
          className="w-full h-96 object-cover rounded-lg mb-8"
        />

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Y-schedule은 단순한 캘린더가 아닙니다.
            AI 기술과 사용자 중심 디자인이 결합된 차세대 스케줄 관리 플랫폼입니다.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            핵심 기능
          </h2>

          {/* Feature 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-8 rounded-lg mb-8">
            <div className="flex items-center mb-4">
              <MessageCircle className="w-10 h-10 text-blue-600 dark:text-blue-400 mr-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                1. AI 채팅 기반 일정 등록
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              복잡한 폼을 작성할 필요가 없습니다. 자연스러운 대화로 일정을 등록하세요.
            </p>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">사용 예시:</p>
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">💬</span>
                  <p className="text-gray-800 dark:text-gray-200">"내일 오후 3시에 팀 미팅"</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                  <p className="text-gray-600 dark:text-gray-400">→ 2026-02-18 15:00 "팀 미팅" 일정 등록 완료</p>
                </div>
              </div>
            </div>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>✓ 한국어 자연어 처리 (GPT-4o-mini 기반)</li>
              <li>✓ 날짜, 시간 자동 인식</li>
              <li>✓ 우선순위 및 카테고리 자동 분류</li>
              <li>✓ 반복 일정 지원</li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-8 rounded-lg mb-8">
            <div className="flex items-center mb-4">
              <Calendar className="w-10 h-10 text-green-600 dark:text-green-400 mr-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                2. 스마트 캘린더 뷰
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              월간/주간 뷰를 자유롭게 전환하며 일정을 한눈에 파악하세요.
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>✓ 월간 캘린더: 한 달 전체 일정 조망</li>
              <li>✓ 주간 뷰: 시간대별 상세 일정 확인</li>
              <li>✓ 우선순위별 색상 구분 (높음/중간/낮음)</li>
              <li>✓ 카테고리 필터링 (업무/개인/학습/기타)</li>
              <li>✓ 드래그 앤 드롭으로 일정 이동</li>
              <li>✓ 클릭 한 번으로 일정 수정/삭제</li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-8 rounded-lg mb-8">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-10 h-10 text-purple-600 dark:text-purple-400 mr-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                3. 주간 리포트 & 분석
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              AI가 분석한 당신의 시간 사용 패턴과 개선 제안을 받아보세요.
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>✓ 주간 일정 통계 (완료율, 카테고리별 시간 분배)</li>
              <li>✓ 우선순위별 일정 분석</li>
              <li>✓ 시간대별 생산성 인사이트</li>
              <li>✓ AI 기반 개선 제안</li>
              <li>✓ 트렌드 그래프 (월별 비교)</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            추가 기능
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
              <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                빠른 일정 추가
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                채팅 외에도 캘린더에서 날짜를 클릭하여 바로 일정을 추가할 수 있습니다.
              </p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-red-600 dark:text-red-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                안전한 데이터 관리
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Firebase 기반 클라우드 저장으로 언제 어디서나 안전하게 일정을 관리하세요.
              </p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
              <Smartphone className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                반응형 디자인
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                PC, 태블릿, 모바일 모든 기기에서 최적화된 경험을 제공합니다.
              </p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 rounded mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                다크 모드
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                눈의 피로를 줄이는 다크 모드를 지원합니다.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg my-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              💡 Pro Tip
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              채팅에서 "다음 주 월요일 오전 10시에 중요한 프레젠테이션"처럼 구체적으로 말하면,
              AI가 자동으로 우선순위를 '높음'으로 설정하고 '업무' 카테고리로 분류합니다.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            곧 출시될 기능
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-8">
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">🔔</span>
              <span>일정 알림 (이메일, 푸시 알림)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">📤</span>
              <span>캘린더 공유 및 내보내기</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">🔗</span>
              <span>Google 캘린더 연동</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">🎨</span>
              <span>커스텀 테마 및 색상</span>
            </li>
          </ul>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              다음 글 읽기
            </h3>
            <Link
              to="/blog/use-cases"
              className="inline-block text-blue-600 dark:text-blue-400 hover:underline"
            >
              → 실제 활용 사례: Y-schedule이 바꾼 일상
            </Link>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>Y-schedule - AI 기반 스마트 스케줄 관리</p>
            <p className="mt-2">© 2026 Y-schedule. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesBlog;
