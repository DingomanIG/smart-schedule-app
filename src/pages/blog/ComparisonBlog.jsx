import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import SEO from '../../components/SEO';
import AdSenseAd from '../../components/AdSenseAd';

const ComparisonBlog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <SEO title="앱 비교 분석" description="스마트 스케줄과 구글 캘린더, 네이버 캘린더 등 주요 일정 관리 앱을 비교 분석합니다." path="/blog/comparison" type="article" />
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Y-schedule vs. 다른 스케줄러: 무엇이 다를까?
          </h1>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <time dateTime="2026-02-17">2026년 2월 17일</time>
            <span className="mx-2">·</span>
            <span>10분 읽기</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <img
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop"
          alt="비교 분석"
          className="w-full h-96 object-cover rounded-lg mb-8"
        />

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            시중에는 수많은 스케줄 관리 앱이 있습니다.
            Y-schedule이 왜 특별한지, 주요 경쟁 서비스와 비교하여 알아보세요.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            비교 대상 서비스
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Google Calendar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">전통적 캘린더</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Notion Calendar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">올인원 워크스페이스</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Todoist</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">할일 관리 중심</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            핵심 기능 비교표
          </h2>
          <div className="overflow-x-auto mb-12">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-left text-gray-900 dark:text-white">
                    기능
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-center bg-blue-50 dark:bg-blue-900/20">
                    <strong className="text-blue-600 dark:text-blue-400">Y-schedule</strong>
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-center text-gray-700 dark:text-gray-300">
                    Google Calendar
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-center text-gray-700 dark:text-gray-300">
                    Notion Calendar
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-center text-gray-700 dark:text-gray-300">
                    Todoist
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold text-gray-900 dark:text-white">
                    AI 자연어 입력
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center bg-blue-50 dark:bg-blue-900/10">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <span className="text-gray-600 dark:text-gray-400">부분 지원</span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <span className="text-gray-600 dark:text-gray-400">부분 지원</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold text-gray-900 dark:text-white">
                    채팅 기반 UI
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center bg-blue-50 dark:bg-blue-900/10">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <X className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto" />
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <X className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto" />
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <X className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold text-gray-900 dark:text-white">
                    AI 분석 리포트
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center bg-blue-50 dark:bg-blue-900/10">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <X className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto" />
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <span className="text-gray-600 dark:text-gray-400">부분 지원</span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <span className="text-gray-600 dark:text-gray-400">통계만</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold text-gray-900 dark:text-white">
                    무료 사용
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center bg-blue-50 dark:bg-blue-900/10">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <span className="text-gray-600 dark:text-gray-400">제한적</span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <span className="text-gray-600 dark:text-gray-400">제한적</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold text-gray-900 dark:text-white">
                    한국어 최적화
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center bg-blue-50 dark:bg-blue-900/10">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <span className="text-gray-600 dark:text-gray-400">부분 지원</span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <span className="text-gray-600 dark:text-gray-400">부분 지원</span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <span className="text-gray-600 dark:text-gray-400">부분 지원</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold text-gray-900 dark:text-white">
                    학습 곡선
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center bg-blue-50 dark:bg-blue-900/10">
                    <span className="text-green-600 dark:text-green-400 font-semibold">쉬움</span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <span className="text-yellow-600 dark:text-yellow-400">보통</span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <span className="text-orange-600 dark:text-orange-400">복잡함</span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                    <span className="text-yellow-600 dark:text-yellow-400">보통</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            상세 비교 분석
          </h2>

          {/* Comparison 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-8 rounded-lg mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              vs. Google Calendar
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3">
                  Y-schedule의 장점
                </h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✓ AI 채팅으로 5초 만에 일정 등록</li>
                  <li>✓ 한국어 자연어 처리 완벽 지원</li>
                  <li>✓ 주간 AI 분석 리포트 제공</li>
                  <li>✓ 학습 없이 바로 사용 가능</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3">
                  Google Calendar의 장점
                </h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✓ 다른 Google 서비스와 연동</li>
                  <li>✓ 팀 캘린더 공유 기능</li>
                  <li>✓ 모바일 앱 성숙도</li>
                  <li>✓ 오랜 사용 기간과 신뢰성</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>추천:</strong> 개인 일정 관리에 집중하고 AI 분석이 필요하다면 Y-schedule,
                팀 협업이 많고 Google 생태계를 사용한다면 Google Calendar
              </p>
            </div>
          </div>

          {/* Comparison 2 */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-8 rounded-lg mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              vs. Notion Calendar
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3">
                  Y-schedule의 장점
                </h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✓ 일정 관리에만 집중한 단순함</li>
                  <li>✓ 더 빠른 AI 처리 속도</li>
                  <li>✓ 학습 곡선 거의 없음</li>
                  <li>✓ 완전 무료</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-3">
                  Notion Calendar의 장점
                </h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✓ Notion과 완벽 통합</li>
                  <li>✓ 문서/위키 기능</li>
                  <li>✓ 데이터베이스 기능</li>
                  <li>✓ 템플릿 다양성</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>추천:</strong> 단순하고 빠른 일정 관리만 원한다면 Y-schedule,
                문서 작성과 프로젝트 관리까지 원한다면 Notion Calendar
              </p>
            </div>
          </div>

          {/* Comparison 3 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-8 rounded-lg mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              vs. Todoist
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3">
                  Y-schedule의 장점
                </h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✓ 시간 기반 스케줄 관리</li>
                  <li>✓ 캘린더 시각화</li>
                  <li>✓ AI 리포트와 분석</li>
                  <li>✓ 채팅 UI의 편리함</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3">
                  Todoist의 장점
                </h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✓ 할일 관리에 특화</li>
                  <li>✓ 프로젝트 단위 관리</li>
                  <li>✓ 레이블/필터 시스템</li>
                  <li>✓ 생산성 점수</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>추천:</strong> 시간 기반 일정 관리가 중요하다면 Y-schedule,
                프로젝트 단위의 할일 관리가 중요하다면 Todoist
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            가격 비교
          </h2>
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg text-center border-2 border-blue-600 dark:border-blue-400">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Y-schedule</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">무료</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">모든 기능 제한 없음</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Google Calendar</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">무료</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">기본 기능만</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notion Calendar</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">$10/월</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Notion Plus 필요</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Todoist</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">$5/월</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pro 버전</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-lg text-white my-8">
            <h2 className="text-2xl font-bold mb-4">결론: Y-schedule을 선택해야 하는 이유</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 flex-shrink-0">⭐</span>
                <span>완전 무료로 모든 AI 기능 사용 가능</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 flex-shrink-0">⭐</span>
                <span>한국어 자연어 처리에 최적화</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 flex-shrink-0">⭐</span>
                <span>학습 없이 바로 사용할 수 있는 직관적 UI</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 flex-shrink-0">⭐</span>
                <span>AI 분석 리포트로 생산성 향상</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 flex-shrink-0">⭐</span>
                <span>채팅 기반 인터페이스로 가장 빠른 일정 등록</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              다음 글 읽기
            </h3>
            <Link
              to="/blog/future"
              className="inline-block text-blue-600 dark:text-blue-400 hover:underline"
            >
              → Y-schedule의 미래: 2026년 로드맵
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

export default ComparisonBlog;
