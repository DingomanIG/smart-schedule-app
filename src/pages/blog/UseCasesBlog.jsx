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
            Y-schedule은 다양한 상황에서 일정 관리를 도와줍니다. 어떤 유형의 사용자에게 어떻게 활용될 수 있는지 살펴보세요.
          </p>

          {/* Case Study 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-8 rounded-lg mb-12">
            <div className="flex items-center mb-6">
              <Briefcase className="w-12 h-12 text-blue-600 dark:text-blue-400 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  직장인 활용 사례
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">미팅, 업무, 출장이 많은 직장인</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                이런 분들에게 유용합니다
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• 여러 미팅 일정을 수기로 입력하던 분</li>
                <li>• 캘린더 앱과 메모 앱을 오가며 관리하던 분</li>
                <li>• 중요한 일정을 놓친 경험이 있는 분</li>
                <li>• 일정 충돌로 스트레스를 받는 분</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Y-schedule 활용 방법
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>✓ "내일 오후 2시 팀 미팅"처럼 채팅으로 빠르게 등록</li>
                <li>✓ 카테고리 자동 분류로 업무/개인 일정 구분</li>
                <li>✓ 주간 리포트로 시간 사용 패턴 파악</li>
                <li>✓ 캘린더 뷰에서 한 주 일정 한눈에 확인</li>
              </ul>
            </div>
          </div>

          {/* Case Study 2 */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-8 rounded-lg mb-12">
            <div className="flex items-center mb-6">
              <GraduationCap className="w-12 h-12 text-purple-600 dark:text-purple-400 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  학생 활용 사례
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">수업, 과제, 시험 일정이 복잡한 학생</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                이런 분들에게 유용합니다
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• 종이 플래너 분실 경험이 있는 분</li>
                <li>• 과제 마감일을 자주 놓치는 분</li>
                <li>• 동아리, 아르바이트 일정 충돌이 잦은 분</li>
                <li>• 시험 기간 계획 수립이 어려운 분</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Y-schedule 활용 방법
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>✓ 모든 일정을 클라우드에 안전하게 보관</li>
                <li>✓ "학습" 카테고리로 수업·과제·시험 일정 구분</li>
                <li>✓ 캘린더에서 마감일 한눈에 확인</li>
                <li>✓ 주간 리포트로 학습 시간 분배 파악</li>
              </ul>
            </div>
          </div>

          {/* Case Study 3 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-8 rounded-lg mb-12">
            <div className="flex items-center mb-6">
              <Users className="w-12 h-12 text-green-600 dark:text-green-400 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  프리랜서 활용 사례
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">여러 프로젝트를 동시에 진행하는 프리랜서</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                이런 분들에게 유용합니다
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• 여러 프로젝트를 동시에 진행하는 분</li>
                <li>• 클라이언트별 미팅 시간 조율이 복잡한 분</li>
                <li>• 마감일 관리에 스트레스를 받는 분</li>
                <li>• 워라밸을 지키고 싶은 분</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Y-schedule 활용 방법
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>✓ 프로젝트별 카테고리로 일정 분류</li>
                <li>✓ 채팅으로 빠르게 클라이언트 미팅 등록</li>
                <li>✓ 주간 리포트로 업무량과 여가 시간 균형 파악</li>
                <li>✓ 월간 뷰에서 마감일 전체 조망</li>
              </ul>
            </div>
          </div>

          {/* Case Study 4 */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-8 rounded-lg mb-12">
            <div className="flex items-center mb-6">
              <Coffee className="w-12 h-12 text-orange-600 dark:text-orange-400 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  육아·가사 병행 활용 사례
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">업무와 가정 일정을 함께 관리하는 분</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                이런 분들에게 유용합니다
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• 회사 일정과 가정 일정이 뒤섞이는 분</li>
                <li>• 중요한 약속을 놓친 경험이 있는 분</li>
                <li>• 일정 관리로 스트레스를 받는 분</li>
                <li>• 개인 시간이 부족한 분</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Y-schedule 활용 방법
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>✓ 업무/가정/개인 카테고리로 일정 분리</li>
                <li>✓ 자연어 입력으로 빠르게 가족 일정 등록</li>
                <li>✓ 캘린더에서 가족 일정 한눈에 확인</li>
                <li>✓ 주간 리포트로 시간 배분 파악</li>
              </ul>
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
