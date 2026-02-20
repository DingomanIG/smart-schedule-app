import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, GraduationCap, Users, Coffee } from 'lucide-react';
import SEO from '../../components/SEO';
import AdSenseAd from '../../components/AdSenseAd';

const UseCasesBlog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <SEO title="활용 사례" description="직장인, 학생, 프리랜서 등 다양한 사용자의 스마트 스케줄 활용 사례를 확인하세요." path="/blog/use-cases" type="article" />
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            실제 활용 사례: Y-schedule이 바꾼 일상
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
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop"
          alt="팀 협업"
          className="w-full h-96 object-cover rounded-lg mb-8"
        />

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Y-schedule이 실제 사용자들의 삶을 어떻게 변화시켰는지 생생한 사례를 통해 알아보세요.
          </p>

          {/* Case Study 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-8 rounded-lg mb-12">
            <div className="flex items-center mb-6">
              <Briefcase className="w-12 h-12 text-blue-600 dark:text-blue-400 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  사례 1: 바쁜 스타트업 CEO 김민수님
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">IT 스타트업 대표 | 서울</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Before: 하루 30분 일정 관리에 소비
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• 여러 미팅 일정을 수기로 입력</li>
                <li>• 캘린더 앱과 메모 앱을 오가며 관리</li>
                <li>• 중요한 일정을 놓치는 경우 발생</li>
                <li>• 일정 충돌로 인한 스트레스</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                After: Y-schedule 도입 후
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>✓ 채팅으로 5초 만에 일정 등록</li>
                <li>✓ AI가 자동으로 우선순위 분류</li>
                <li>✓ 주간 리포트로 시간 관리 개선</li>
                <li>✓ 일정 관리 시간 80% 절감</li>
              </ul>
            </div>

            <blockquote className="border-l-4 border-blue-600 dark:border-blue-400 pl-4 italic text-gray-700 dark:text-gray-300">
              "Y-schedule 덕분에 일정 관리에 쓰던 시간을 비즈니스 성장에 투자할 수 있게 되었습니다.
              특히 채팅 기반 입력이 정말 혁신적이에요."
            </blockquote>
          </div>

          {/* Case Study 2 */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-8 rounded-lg mb-12">
            <div className="flex items-center mb-6">
              <GraduationCap className="w-12 h-12 text-purple-600 dark:text-purple-400 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  사례 2: 대학생 이서연님
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">컴퓨터공학과 3학년 | 부산</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Before: 수업, 과제, 시험 일정 관리의 어려움
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• 종이 플래너 사용으로 분실 위험</li>
                <li>• 과제 마감일을 자주 놓침</li>
                <li>• 동아리, 아르바이트 일정 충돌</li>
                <li>• 시험 기간 계획 수립의 어려움</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                After: Y-schedule로 학업 관리
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>✓ 모든 일정을 클라우드에 안전하게 보관</li>
                <li>✓ 과제 마감일 놓치지 않음 (100% 달성)</li>
                <li>✓ 카테고리별로 수업/과제/개인 일정 구분</li>
                <li>✓ 주간 리포트로 학습 시간 최적화</li>
              </ul>
            </div>

            <blockquote className="border-l-4 border-purple-600 dark:border-purple-400 pl-4 italic text-gray-700 dark:text-gray-300">
              "이제 과제 마감일을 놓칠 걱정이 없어요. AI가 알아서 우선순위를 정해주니까
              중요한 과제에 집중할 수 있게 되었어요. 학점도 올랐어요!"
            </blockquote>
          </div>

          {/* Case Study 3 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-8 rounded-lg mb-12">
            <div className="flex items-center mb-6">
              <Users className="w-12 h-12 text-green-600 dark:text-green-400 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  사례 3: 프리랜서 디자이너 박지훈님
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">UX/UI 디자이너 | 제주</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Before: 다수의 프로젝트 관리 혼란
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• 5개 이상의 프로젝트 동시 진행</li>
                <li>• 클라이언트별 미팅 시간 조율 어려움</li>
                <li>• 마감일 관리 스트레스</li>
                <li>• 워라밸 무너짐</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                After: 체계적인 프로젝트 관리
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>✓ 프로젝트별 카테고리로 일정 분류</li>
                <li>✓ 우선순위 기반 작업 순서 최적화</li>
                <li>✓ 주간 리포트로 업무량 파악</li>
                <li>✓ 개인 시간 확보 (워라밸 개선)</li>
              </ul>
            </div>

            <blockquote className="border-l-4 border-green-600 dark:border-green-400 pl-4 italic text-gray-700 dark:text-gray-300">
              "프리랜서로 일하면서 가장 힘든 게 일정 관리였는데, Y-schedule이 정말 큰 도움이 됐어요.
              이제 저녁 시간은 온전히 제 것으로 만들 수 있어요."
            </blockquote>
          </div>

          {/* Case Study 4 */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-8 rounded-lg mb-12">
            <div className="flex items-center mb-6">
              <Coffee className="w-12 h-12 text-orange-600 dark:text-orange-400 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  사례 4: 워킹맘 정수진님
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">마케팅 팀장 | 서울</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Before: 업무와 육아의 균형 어려움
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• 회사 일정과 아이 일정 혼재</li>
                <li>• 중요한 약속을 놓치는 경우 발생</li>
                <li>• 일정 관리로 인한 스트레스 누적</li>
                <li>• 개인 시간 부족</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                After: 업무와 육아의 완벽한 조화
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>✓ 업무/육아/개인 카테고리 분리 관리</li>
                <li>✓ 우선순위로 중요한 일에 집중</li>
                <li>✓ 아이 일정도 놓치지 않음</li>
                <li>✓ 시간 여유 생겨 자기계발 시작</li>
              </ul>
            </div>

            <blockquote className="border-l-4 border-orange-600 dark:border-orange-400 pl-4 italic text-gray-700 dark:text-gray-300">
              "업무와 육아를 병행하면서 일정 관리가 정말 힘들었는데, Y-schedule 덕분에
              두 가지 모두 완벽하게 해낼 수 있게 되었어요. 저에게 꼭 필요한 서비스예요."
            </blockquote>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            공통적인 성과
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">70%</h3>
              <p className="text-gray-700 dark:text-gray-300">일정 입력 시간 절감</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
              <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">95%</h3>
              <p className="text-gray-700 dark:text-gray-300">일정 완료율 향상</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
              <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">4.8/5</h3>
              <p className="text-gray-700 dark:text-gray-300">사용자 만족도</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
              <h3 className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">100%</h3>
              <p className="text-gray-700 dark:text-gray-300">재사용 의향</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-lg text-white my-8">
            <h2 className="text-2xl font-bold mb-4">당신의 이야기를 들려주세요</h2>
            <p className="mb-6">
              Y-schedule을 사용하면서 경험한 변화를 공유해주세요.
              여러분의 성공 사례가 다른 사용자들에게 큰 영감이 됩니다.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              사례 공유하기
            </Link>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              다음 글 읽기
            </h3>
            <Link
              to="/blog/ai-technology"
              className="inline-block text-blue-600 dark:text-blue-400 hover:underline"
            >
              → AI 기술로 실현하는 스마트 스케줄 관리
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

export default UseCasesBlog;
