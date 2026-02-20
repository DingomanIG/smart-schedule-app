import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageCircle, BarChart3, Clock, ArrowRight } from 'lucide-react';
import SEO from '../../components/SEO';

const IntroductionBlog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <SEO title="AI 스마트 스케줄 소개" description="AI 기반 스마트 스케줄 관리 서비스를 소개합니다. 자연어로 일정을 등록하는 새로운 방법을 알아보세요." path="/blog/introduction" />
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Y-schedule 소개: AI 기반 스마트 스케줄 관리의 시작
          </h1>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <time dateTime="2026-02-17">2026년 2월 17일</time>
            <span className="mx-2">·</span>
            <span>5분 읽기</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <img
          src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=600&fit=crop"
          alt="AI 스케줄 관리"
          className="w-full h-96 object-cover rounded-lg mb-8"
        />

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            스케줄 관리, 이제 더 쉽게
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            바쁜 일상 속에서 일정을 관리하는 것은 쉽지 않습니다. 복잡한 캘린더 앱,
            여러 번의 클릭, 반복되는 입력... Y-schedule은 이 모든 불편함을 해결하기 위해 탄생했습니다.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Y-schedule이 특별한 이유
          </h2>

          <div className="grid md:grid-cols-2 gap-6 my-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                대화형 일정 등록
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                "내일 오후 3시 회의"라고 말하면 자동으로 일정이 등록됩니다.
                복잡한 입력 폼은 잊으세요.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
              <Calendar className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                스마트 캘린더
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                일정을 한눈에 확인하고, 우선순위와 카테고리로 효율적으로 관리하세요.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
              <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                주간 리포트
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                한 주 동안의 일정을 분석하고, 생산성을 높일 수 있는 인사이트를 제공합니다.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
              <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                시간 절약
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                평균 70%의 일정 입력 시간을 절약할 수 있습니다.
                시간을 더 중요한 일에 사용하세요.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            누구를 위한 서비스인가요?
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6">
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
              <span><strong>바쁜 직장인</strong> - 회의, 업무, 개인 일정을 효율적으로 관리</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
              <span><strong>학생</strong> - 수업, 과제, 시험 일정을 놓치지 않고 관리</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
              <span><strong>프리랜서</strong> - 다양한 프로젝트와 미팅을 체계적으로 관리</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
              <span><strong>일정 관리가 서툰 분</strong> - AI가 도와주는 쉽고 직관적인 스케줄 관리</span>
            </li>
          </ul>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-lg my-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              지금 시작해보세요
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Y-schedule은 완전 무료로 제공됩니다.
              복잡한 설정 없이 바로 시작할 수 있습니다.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              무료로 시작하기
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            다음 단계
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Y-schedule의 다양한 기능이 궁금하신가요?
            아래 링크를 통해 더 자세한 정보를 확인해보세요.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/blog/features"
              className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">주요 기능 살펴보기</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Y-schedule의 핵심 기능들을 상세히 알아보세요
              </p>
            </Link>
            <Link
              to="/blog/use-cases"
              className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">실제 활용 사례</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                다양한 사용자들의 생생한 활용 사례를 확인하세요
              </p>
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

export default IntroductionBlog;
