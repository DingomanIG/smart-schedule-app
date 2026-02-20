import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Sparkles, Globe, Zap } from 'lucide-react';
import SEO from '../../components/SEO';

const FutureBlog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <SEO title="미래 업데이트 계획" description="스마트 스케줄의 향후 업데이트 로드맵과 새로운 기능 계획을 미리 확인하세요." path="/blog/future" />
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Y-schedule의 미래: 2026년 로드맵
          </h1>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <time dateTime="2026-02-17">2026년 2월 17일</time>
            <span className="mx-2">·</span>
            <span>8분 읽기</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <img
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop"
          alt="미래 비전"
          className="w-full h-96 object-cover rounded-lg mb-8"
        />

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Y-schedule은 단순한 스케줄 관리 앱을 넘어, 여러분의 시간을 가장 가치있게 만드는
            AI 비서로 진화할 것입니다. 2026년 우리의 여정을 소개합니다.
          </p>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-lg text-white mb-12">
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-lg">
              "모든 사람이 시간의 주인이 되는 세상"
            </p>
            <p className="mt-4">
              Y-schedule은 AI 기술을 통해 시간 관리의 혁신을 이끌어,
              전 세계 모든 사람들이 더 생산적이고 균형잡힌 삶을 살 수 있도록 돕겠습니다.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            <Rocket className="inline w-8 h-8 mr-2 text-blue-600 dark:text-blue-400" />
            2026년 분기별 로드맵
          </h2>

          {/* Q2 2026 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-8 rounded-lg mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold mr-4">
                Q2 2026
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI 기능 고도화
              </h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                <div className="flex items-start">
                  <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      음성 입력 기능
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Whisper AI를 활용한 음성 인식 기능 추가.
                      "Ok Y-schedule, 내일 오후 3시 회의"라고 말하면 자동으로 일정 등록.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                <div className="flex items-start">
                  <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      스마트 알림 시스템
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      이메일, 푸시 알림으로 일정 전 미리 알림.
                      사용자의 이동 시간과 트래픽을 고려한 맞춤형 알림 제공.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                <div className="flex items-start">
                  <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      일정 충돌 자동 감지
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      새 일정 등록 시 기존 일정과의 충돌을 AI가 자동으로 감지하고
                      최적의 시간을 제안.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Q3 2026 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-8 rounded-lg mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold mr-4">
                Q3 2026
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                연동 및 협업 기능
              </h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                <div className="flex items-start">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Google Calendar 연동
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Google Calendar와 양방향 동기화.
                      기존 Google 일정을 Y-schedule로 가져오거나 내보내기 가능.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                <div className="flex items-start">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      팀 캘린더 공유
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      팀원들과 캘린더를 공유하고, 공동 일정을 관리.
                      회의 시간 조율 기능으로 모두가 가능한 시간대 자동 추천.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                <div className="flex items-start">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Slack/Teams 연동
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Slack, Microsoft Teams와 연동하여 채팅에서 바로 일정 등록.
                      회의 링크 자동 생성 및 참석자 초대 기능.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Q4 2026 */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-8 rounded-lg mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold mr-4">
                Q4 2026
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                글로벌 확장 및 개인화
              </h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                <div className="flex items-start">
                  <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      다국어 지원
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      영어, 일본어, 중국어, 스페인어 등 10개 언어 지원.
                      각 언어별 자연어 처리 최적화로 완벽한 사용 경험 제공.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                <div className="flex items-start">
                  <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      AI 개인 비서
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      사용자의 패턴을 학습하여 최적의 일정 시간을 자동으로 제안.
                      "집중 시간", "휴식 시간"을 분석하여 맞춤형 스케줄 추천.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                <div className="flex items-start">
                  <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      커스터마이징
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      사용자 정의 테마, 색상, 폰트 선택 가능.
                      카테고리별 커스텀 아이콘 및 태그 시스템 도입.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            2027년 이후: 장기 비전
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🤖 완전 자동화된 일정 관리
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                이메일, 메시지를 분석하여 일정을 자동으로 추출하고 등록.
                회의 초대, 프로젝트 마감일 등을 AI가 알아서 관리.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🧠 예측 스케줄링
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                과거 패턴을 분석하여 미래 일정을 예측하고 미리 제안.
                "다음 주에 이런 일정이 필요할 것 같아요"라고 AI가 알림.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🌍 실시간 위치 기반 추천
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                GPS와 연동하여 현재 위치 기반으로 다음 일정까지의 이동 시간을 계산.
                교통 상황을 고려한 출발 알림 제공.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                💼 엔터프라이즈 솔루션
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                기업용 버전 출시로 팀 전체의 생산성 향상.
                관리자 대시보드, 팀 분석 리포트, 권한 관리 기능 제공.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            사용자와 함께 만드는 미래
          </h2>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              여러분의 의견이 중요합니다
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Y-schedule의 로드맵은 사용자 여러분의 피드백을 바탕으로 작성됩니다.
              여러분이 원하는 기능, 개선이 필요한 부분을 알려주세요.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  1,000+
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">수집된 피드백</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  85%
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">구현된 사용자 제안</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  매월
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">새로운 기능 업데이트</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-lg text-white my-8">
            <h2 className="text-2xl font-bold mb-4">함께 만들어가요</h2>
            <p className="mb-6">
              Y-schedule의 발전을 함께 만들어갈 얼리 어답터를 모집합니다.
              새로운 기능을 가장 먼저 사용하고, 개발 과정에 참여하세요.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                to="/contact"
                className="block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
              >
                피드백 보내기
              </Link>
              <Link
                to="/register"
                className="block bg-white bg-opacity-20 backdrop-blur text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-colors text-center border border-white"
              >
                베타 테스터 신청
              </Link>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            자주 묻는 질문
          </h2>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Q: 유료 플랜이 생길 예정인가요?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                A: 핵심 기능은 계속 무료로 제공됩니다.
                엔터프라이즈 기능(팀 관리, 고급 분석 등)만 유료로 제공할 예정입니다.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Q: 모바일 앱은 언제 출시되나요?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                A: 2026년 Q3에 iOS와 Android 네이티브 앱 출시를 목표로 개발 중입니다.
                베타 테스터로 신청하시면 우선 체험 기회를 드립니다.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Q: 기존 데이터는 계속 무료로 사용할 수 있나요?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                A: 네! 기존 사용자의 모든 데이터는 영구 무료로 제공됩니다.
                저장 용량 제한도 없습니다.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              더 알아보기
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                to="/blog/introduction"
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Y-schedule 소개</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Y-schedule이 무엇인지, 왜 특별한지 알아보세요
                </p>
              </Link>
              <Link
                to="/faq"
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">자주 묻는 질문</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  사용자들이 가장 많이 하는 질문과 답변
                </p>
              </Link>
            </div>
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

export default FutureBlog;
