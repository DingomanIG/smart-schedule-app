import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Target, Clock, CheckCircle } from 'lucide-react';
import SEO from '../../components/SEO';
import AdSenseAd from '../../components/AdSenseAd';

const ProductivityBlog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <SEO title="생산성 향상 팁" description="AI 일정 관리로 생산성을 높이는 실용적인 팁과 시간 관리 노하우를 공유합니다." path="/blog/productivity" type="article" />
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Y-schedule로 생산성 2배 높이는 법
          </h1>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <time dateTime="2026-02-17">2026년 2월 17일</time>
            <span className="mx-2">·</span>
            <span>9분 읽기</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <img
          src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=600&fit=crop"
          alt="생산성 향상"
          className="w-full h-96 object-cover rounded-lg mb-8"
        />

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            효과적인 시간 관리는 생산성 향상의 핵심입니다.
            Y-schedule을 활용하여 당신의 생산성을 극대화하는 실전 전략을 소개합니다.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            <TrendingUp className="inline w-8 h-8 mr-2 text-blue-600 dark:text-blue-400" />
            생산성 향상 5단계 전략
          </h2>

          {/* Strategy 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-8 rounded-lg mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1단계: 우선순위 기반 시간 관리
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              모든 일이 중요해 보일 때, 진짜 중요한 일을 구분하는 것이 핵심입니다.
            </p>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                아이젠하워 매트릭스 활용법
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    긴급 + 중요
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    우선순위: 높음
                    <br />즉시 처리
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    중요 + 비긴급
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    우선순위: 중간
                    <br />계획적 처리
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    긴급 + 덜 중요
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    우선순위: 낮음
                    <br />위임 고려
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    비긴급 + 덜 중요
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    제거 또는
                    <br />나중에 처리
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                💡 Y-schedule 활용 팁
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                AI가 자동으로 우선순위를 판단하지만, 주간 리포트를 통해
                실제 중요한 일에 시간을 잘 쓰고 있는지 확인하세요.
              </p>
            </div>
          </div>

          {/* Strategy 2 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-8 rounded-lg mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2단계: 시간 블록 기법 적용
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              비슷한 유형의 작업을 모아서 한 번에 처리하면 집중력이 향상됩니다.
            </p>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                추천 시간 블록 구성
              </h4>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li>
                  <strong>9:00-11:00</strong> - 딥 워크 (Deep Work): 가장 중요하고 어려운 작업
                </li>
                <li>
                  <strong>11:00-12:00</strong> - 회의 및 커뮤니케이션
                </li>
                <li>
                  <strong>13:00-15:00</strong> - 일반 업무 처리
                </li>
                <li>
                  <strong>15:00-16:00</strong> - 이메일 및 소통
                </li>
                <li>
                  <strong>16:00-17:00</strong> - 내일 계획 및 정리
                </li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                💡 Y-schedule 활용 팁
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                주간 리포트의 '시간대별 분석'을 확인하여 본인의 생산성이
                가장 높은 시간대를 파악하고, 중요한 일을 그 시간대에 배치하세요.
              </p>
            </div>
          </div>

          {/* Strategy 3 */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-8 rounded-lg mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3단계: 포모도로 기법 통합
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              25분 집중 + 5분 휴식의 리듬으로 집중력을 유지하세요.
            </p>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                포모도로 사이클
              </h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">25분 집중 작업</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">타이머 설정 후 완전히 집중</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">5분 짧은 휴식</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">스트레칭, 물 마시기</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">4회 반복 후 긴 휴식</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">15-30분 완전한 휴식</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strategy 4 */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-8 rounded-lg mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4단계: 주간 리뷰 습관화
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              매주 금요일, Y-schedule의 주간 리포트로 한 주를 돌아보세요.
            </p>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                주간 리뷰 체크리스트
              </h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>목표 달성률은 어떠한가?</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>어떤 일에 가장 많은 시간을 썼는가?</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>불필요한 시간 낭비는 없었는가?</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>다음 주에 개선할 점은 무엇인가?</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>중요한 일에 충분한 시간을 투자했는가?</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Strategy 5 */}
          <div className="bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 p-8 rounded-lg mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5단계: 카테고리별 균형 잡기
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              업무만 하다 보면 번아웃이 찾아옵니다. 균형잡힌 시간 분배가 중요합니다.
            </p>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                이상적인 시간 배분 (주간 기준)
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">업무</span>
                    <span className="text-gray-900 dark:text-white font-semibold">40-50%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">학습/성장</span>
                    <span className="text-gray-900 dark:text-white font-semibold">15-20%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">개인/휴식</span>
                    <span className="text-gray-900 dark:text-white font-semibold">20-30%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">기타</span>
                    <span className="text-gray-900 dark:text-white font-semibold">10-15%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            실전 사례: 한 달간의 변화
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-lg mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  시작 전 (1주차)
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• 일정 관리 시간: 하루 30분</li>
                  <li>• 일정 완료율: 65%</li>
                  <li>• 중요 업무 집중: 40%</li>
                  <li>• 스트레스 지수: 높음</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  4주 후
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✓ 일정 관리 시간: 하루 5분</li>
                  <li>✓ 일정 완료율: 92%</li>
                  <li>✓ 중요 업무 집중: 75%</li>
                  <li>✓ 스트레스 지수: 낮음</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg my-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              💡 Pro Tip: 생산성의 적, 완벽주의 극복하기
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              완벽한 일정 관리는 없습니다. 80%만 달성해도 성공입니다.
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>✓ 매일 3가지 핵심 과제만 정하기</li>
              <li>✓ 일정의 80%만 계획하고 20%는 여유 두기</li>
              <li>✓ 실패한 일정은 다음 주로 이동하고 자책하지 않기</li>
            </ul>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              다음 글 읽기
            </h3>
            <Link
              to="/blog/tips"
              className="inline-block text-blue-600 dark:text-blue-400 hover:underline"
            >
              → Y-schedule 200% 활용하는 숨은 기능과 팁
            </Link>
          </div>
        </div>
      </article>

      {/* 광고 */}
      <div className="max-w-4xl mx-auto px-4">
        <AdSenseAd />
      </div>

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

export default ProductivityBlog;
