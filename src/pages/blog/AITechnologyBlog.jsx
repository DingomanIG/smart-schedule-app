import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Cpu, Database, Zap } from 'lucide-react';

const AITechnologyBlog = () => {
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
            AI 기술로 실현하는 스마트 스케줄 관리
          </h1>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <time dateTime="2026-02-17">2026년 2월 17일</time>
            <span className="mx-2">·</span>
            <span>6분 읽기</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <img
          src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop"
          alt="AI 기술"
          className="w-full h-96 object-cover rounded-lg mb-8"
        />

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Y-schedule은 최신 AI 기술을 활용하여 스케줄 관리를 혁신합니다.
            어떻게 AI가 당신의 시간을 더 가치있게 만드는지 알아보세요.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            핵심 기술 스택
          </h2>

          {/* Technology 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-8 rounded-lg mb-8">
            <div className="flex items-center mb-4">
              <Brain className="w-10 h-10 text-blue-600 dark:text-blue-400 mr-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                OpenAI GPT-4o-mini
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Y-schedule의 핵심은 OpenAI의 GPT-4o-mini 모델입니다.
            </p>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">주요 역할</h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>✓ <strong>자연어 처리 (NLP):</strong> 사용자의 일상적인 말투를 이해</li>
                <li>✓ <strong>날짜/시간 추출:</strong> "내일", "다음 주 월요일" 같은 표현 해석</li>
                <li>✓ <strong>의도 파악:</strong> 일정의 목적과 중요도 판단</li>
                <li>✓ <strong>카테고리 분류:</strong> 업무/개인/학습/기타 자동 분류</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>예시:</strong> "내일 오후 3시에 중요한 클라이언트 미팅" <br/>
                → AI가 자동으로 날짜(2026-02-18), 시간(15:00), 우선순위(높음), 카테고리(업무)를 인식합니다.
              </p>
            </div>
          </div>

          {/* Technology 2 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-8 rounded-lg mb-8">
            <div className="flex items-center mb-4">
              <Database className="w-10 h-10 text-green-600 dark:text-green-400 mr-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Firebase Firestore
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              실시간 NoSQL 데이터베이스로 빠르고 안전한 데이터 관리를 제공합니다.
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>✓ <strong>실시간 동기화:</strong> 모든 기기에서 즉시 일정 업데이트</li>
              <li>✓ <strong>오프라인 지원:</strong> 인터넷 연결 없이도 사용 가능</li>
              <li>✓ <strong>확장성:</strong> 사용자 증가에도 안정적인 성능</li>
              <li>✓ <strong>보안:</strong> 사용자별 데이터 격리 및 암호화</li>
            </ul>
          </div>

          {/* Technology 3 */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-8 rounded-lg mb-8">
            <div className="flex items-center mb-4">
              <Cpu className="w-10 h-10 text-purple-600 dark:text-purple-400 mr-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                React + Vite
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              현대적인 프론트엔드 스택으로 빠르고 반응성 있는 UI를 구현합니다.
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>✓ <strong>빠른 개발:</strong> Vite의 HMR(Hot Module Replacement)</li>
              <li>✓ <strong>컴포넌트 기반:</strong> 재사용 가능하고 유지보수 쉬운 코드</li>
              <li>✓ <strong>반응형 디자인:</strong> 모든 디바이스에서 최적화된 경험</li>
              <li>✓ <strong>성능 최적화:</strong> 코드 스플리팅과 레이지 로딩</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            AI 파싱 프로세스
          </h2>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">사용자 입력</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    사용자가 채팅창에 자연스러운 언어로 일정을 입력합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AI 분석</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    GPT-4o-mini가 텍스트를 분석하여 날짜, 시간, 제목, 우선순위, 카테고리를 추출합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">데이터 검증</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    추출된 정보의 유효성을 검증하고, 필요시 사용자에게 추가 정보를 요청합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">일정 생성</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    검증된 데이터를 기반으로 Firestore에 일정을 저장합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                  5
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">실시간 반영</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    캘린더에 즉시 반영되어 사용자가 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            성능 최적화
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
              <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                빠른 응답 시간
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                평균 AI 파싱 시간: <strong>1.5초 이하</strong>
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                최적화된 API 호출과 캐싱 전략으로 빠른 응답을 보장합니다.
              </p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
              <Database className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                효율적인 데이터 관리
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                Firestore 인덱싱으로 <strong>99.9% 가용성</strong>
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                최적화된 쿼리와 인덱싱으로 빠른 데이터 검색을 제공합니다.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-lg my-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              보안 및 프라이버시
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Y-schedule은 사용자의 데이터 보안과 프라이버시를 최우선으로 생각합니다.
            </p>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">🔒</span>
                <span><strong>End-to-End 암호화:</strong> 전송 중 데이터 암호화</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">🛡️</span>
                <span><strong>Firebase Authentication:</strong> 안전한 사용자 인증</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">🔐</span>
                <span><strong>데이터 격리:</strong> 사용자별 독립적인 데이터 저장</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">📜</span>
                <span><strong>GDPR 준수:</strong> 개인정보 보호 규정 준수</span>
              </li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
            미래 기술 로드맵
          </h2>
          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                🔮 2026 Q2: 음성 입력 지원
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Whisper AI를 활용한 음성 인식으로 더 편리한 일정 등록
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                🤖 2026 Q3: 스마트 추천 시스템
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                머신러닝 기반 최적 일정 시간 추천
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                🌐 2026 Q4: 다국어 지원
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                영어, 일본어, 중국어 등 다양한 언어 지원
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              다음 글 읽기
            </h3>
            <Link
              to="/blog/productivity"
              className="inline-block text-blue-600 dark:text-blue-400 hover:underline"
            >
              → Y-schedule로 생산성 2배 높이는 법
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

export default AITechnologyBlog;
