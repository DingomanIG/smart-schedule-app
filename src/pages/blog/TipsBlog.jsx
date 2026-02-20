import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Zap, Target, Star } from 'lucide-react';
import SEO from '../../components/SEO';
import AdSenseAd from '../../components/AdSenseAd';

const TipsBlog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <SEO title="스케줄 관리 꿀팁" description="효율적인 일정 관리를 위한 꿀팁 모음. AI 스케줄러를 200% 활용하는 방법을 알려드립니다." path="/blog/tips" type="article" />
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Y-schedule 200% 활용하는 숨은 기능과 팁
          </h1>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <time dateTime="2026-02-17">2026년 2월 17일</time>
            <span className="mx-2">·</span>
            <span>12분 읽기</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <img
          src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=600&fit=crop"
          alt="실전 팁"
          className="w-full h-96 object-cover rounded-lg mb-8"
        />

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Y-schedule을 더 효율적으로 사용하고 싶으신가요?
            파워 유저들이 사용하는 숨겨진 기능과 실전 팁을 공개합니다.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            <Lightbulb className="inline w-8 h-8 mr-2 text-yellow-600 dark:text-yellow-400" />
            AI 채팅 고급 활용법
          </h2>

          {/* Tip Category 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-8 rounded-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              1. 자연스러운 표현 활용하기
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              AI는 다양한 한국어 표현을 이해합니다. 자연스럽게 말하세요!
            </p>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">✅ 좋은 예시:</p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>💬 "모레 저녁 7시에 친구랑 저녁 약속"</li>
                  <li>💬 "다음 주 월요일 오전에 중요한 발표"</li>
                  <li>💬 "매주 수요일 오후 3시 팀 미팅"</li>
                  <li>💬 "3일 후 오후 2시에 병원 가야 해"</li>
                  <li>💬 "이번 주 금요일 밤 9시 영화 보기"</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">❌ 불필요한 형식:</p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>⚠️ "2026-02-19 19:00 친구 저녁 약속" (너무 딱딱함)</li>
                  <li>⚠️ "일정: 발표, 날짜: 다음주 월요일" (형식적임)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-8 rounded-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              2. 우선순위 자동 인식 키워드
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              특정 단어를 사용하면 AI가 자동으로 우선순위를 설정합니다.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">높음 우선순위</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• 중요한</li>
                  <li>• 급한</li>
                  <li>• 긴급</li>
                  <li>• 필수</li>
                  <li>• 마감</li>
                </ul>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">중간 우선순위</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• 회의</li>
                  <li>• 미팅</li>
                  <li>• 약속</li>
                  <li>• 준비</li>
                  <li>• 제출</li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">낮음 우선순위</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• 여유있게</li>
                  <li>• 틈나면</li>
                  <li>• 가능하면</li>
                  <li>• 한번</li>
                  <li>• 보기</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-8 rounded-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              3. 카테고리 자동 분류 키워드
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">📊 업무</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  회의, 미팅, 프레젠테이션, 보고, 업무, 작업, 제출, 마감, 검토
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">👤 개인</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  운동, 병원, 취미, 쇼핑, 영화, 외식, 친구, 가족, 데이트
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">📚 학습</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  공부, 수업, 강의, 시험, 과제, 독서, 세미나, 스터디
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">📌 기타</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  위 카테고리에 속하지 않는 모든 일정
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            <Zap className="inline w-8 h-8 mr-2 text-yellow-600 dark:text-yellow-400" />
            캘린더 뷰 활용 팁
          </h2>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-8 rounded-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              4. 색상 코딩으로 한눈에 파악하기
            </h3>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">우선순위별 색상</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-500 rounded mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>빨강:</strong> 높은 우선순위 (긴급하고 중요한 일정)
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-500 rounded mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>노랑:</strong> 중간 우선순위 (일반적인 일정)
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>파랑:</strong> 낮은 우선순위 (여유있는 일정)
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                💡 Pro Tip
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                한 주를 시작할 때 빨간색 일정부터 처리 계획을 세우면
                중요한 일을 놓치지 않을 수 있습니다.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 p-8 rounded-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              5. 주간 뷰 vs 월간 뷰 활용 전략
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3">
                  주간 뷰 사용 시점
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>✓ 매일 아침 오늘의 일정 확인</li>
                  <li>✓ 시간대별 세부 계획 수립</li>
                  <li>✓ 일정 간 충돌 확인</li>
                  <li>✓ 이번 주 우선순위 재조정</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3">
                  월간 뷰 사용 시점
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>✓ 월초에 한 달 전체 계획 수립</li>
                  <li>✓ 중요한 마감일 한눈에 파악</li>
                  <li>✓ 장기 프로젝트 일정 관리</li>
                  <li>✓ 월별 업무량 균형 확인</li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            <Target className="inline w-8 h-8 mr-2 text-blue-600 dark:text-blue-400" />
            주간 리포트 200% 활용하기
          </h2>

          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 p-8 rounded-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              6. AI 분석 결과 해석하기
            </h3>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                주간 리포트에서 확인해야 할 핵심 지표
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">
                    1. 일정 완료율
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• 90% 이상: 훌륭한 시간 관리</li>
                    <li>• 70-89%: 개선 필요, 일정 조정 고려</li>
                    <li>• 70% 미만: 일정을 과도하게 계획하고 있을 수 있음</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">
                    2. 카테고리별 시간 분배
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• 업무 60% 이상: 번아웃 주의, 휴식 필요</li>
                    <li>• 개인 10% 미만: 자기관리 시간 부족</li>
                    <li>• 학습 0%: 성장 기회 부족</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">
                    3. 우선순위별 분포
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• 높음 50% 이상: 모든 게 급하면 우선순위가 아님</li>
                    <li>• 낮음 50% 이상: 중요한 일을 미루고 있지는 않은가?</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 p-8 rounded-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              7. 주간 리포트로 다음 주 계획하기
            </h3>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                매주 금요일 오후 루틴
              </h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">주간 리포트 확인</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      이번 주 달성률과 시간 사용 패턴 파악
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">미완료 일정 처리</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      다음 주로 이동 or 삭제 결정
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">다음 주 핵심 목표 3가지 설정</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      채팅에 "다음 주 핵심 목표" 메모
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">시간 블록 미리 배정</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      중요한 일정을 먼저 캘린더에 고정
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            <Star className="inline w-8 h-8 mr-2 text-yellow-600 dark:text-yellow-400" />
            파워 유저 비법
          </h2>

          <div className="space-y-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                💡 비법 1: 아침 5분 루틴
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                매일 아침 커피를 마시며 주간 뷰를 확인하세요.
                오늘의 우선순위를 머릿속에 각인시키면 하루 생산성이 30% 향상됩니다.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                💡 비법 2: 버퍼 타임 활용
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                일정과 일정 사이에 15-30분 여유를 두세요.
                예상치 못한 일이나 이동 시간을 고려하면 스트레스가 줄어듭니다.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                💡 비법 3: 템플릿 활용
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                반복되는 일정(예: 매주 월요일 팀 미팅)은 한 번만 등록하고
                "매주 월요일"이라고 말하면 자동으로 반복 일정이 생성됩니다.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                💡 비법 4: 다크 모드 활용
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                저녁 시간에는 다크 모드를 켜서 눈의 피로를 줄이세요.
                설정에서 자동 전환도 가능합니다.
              </p>
            </div>

            <div className="bg-pink-50 dark:bg-pink-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                💡 비법 5: 주말 계획하기
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                업무 일정뿐만 아니라 주말 개인 일정도 등록하세요.
                워라밸을 지키는 데 큰 도움이 됩니다.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-lg text-white my-8">
            <h2 className="text-2xl font-bold mb-4">더 많은 팁이 궁금하신가요?</h2>
            <p className="mb-6">
              Y-schedule 사용자 커뮤니티에서 다양한 활용 사례와 팁을 공유하고 있습니다.
              여러분의 노하우도 함께 나눠주세요!
            </p>
            <Link
              to="/contact"
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              커뮤니티 참여하기
            </Link>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              다음 글 읽기
            </h3>
            <Link
              to="/blog/comparison"
              className="inline-block text-blue-600 dark:text-blue-400 hover:underline"
            >
              → Y-schedule vs. 다른 스케줄러: 무엇이 다를까?
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

export default TipsBlog;
