import { useState } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { VERSIONS } from '../data/versionHistory'
import { useLanguage } from '../hooks/useLanguage'

export default function UpdatePopup({ onClose }) {
  const { t } = useLanguage()
  const [expandedPrev, setExpandedPrev] = useState(null)

  const current = VERSIONS[0]
  const previous = VERSIONS.slice(1)

  const togglePrev = (index) => {
    setExpandedPrev(expandedPrev === index ? null : index)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('updateTitle')}
            </h2>
            <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
              v{current.version}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Date */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {current.date}
          </p>

          {/* Major Changes */}
          {current.major.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                {t('updateMajor')}
              </h3>
              <ul className="space-y-1.5">
                {current.major.map((item, i) => (
                  <li key={i} className="text-sm text-gray-800 dark:text-gray-200 pl-3 border-l-2 border-blue-400 dark:border-blue-500">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Minor Changes */}
          {current.minor.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                {t('updateMinor')}
              </h3>
              <ul className="space-y-1.5">
                {current.minor.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-3 border-l-2 border-gray-300 dark:border-gray-600">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Previous Versions Accordion */}
          {previous.length > 0 && (
            <>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  {t('updatePrevious')}
                </h3>
                <div className="space-y-2">
                  {previous.map((ver, idx) => (
                    <div key={ver.version} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => togglePrev(idx)}
                        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            v{ver.version}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {ver.date}
                          </span>
                        </div>
                        {expandedPrev === idx
                          ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
                          : <ChevronDown size={16} className="text-gray-400 shrink-0" />
                        }
                      </button>
                      {expandedPrev === idx && (
                        <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 space-y-2">
                          {ver.major.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                                {t('updateMajor')}
                              </p>
                              <ul className="space-y-1">
                                {ver.major.map((item, i) => (
                                  <li key={i} className="text-xs text-gray-700 dark:text-gray-300 pl-2 border-l-2 border-blue-300">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {ver.minor.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                {t('updateMinor')}
                              </p>
                              <ul className="space-y-1">
                                {ver.minor.map((item, i) => (
                                  <li key={i} className="text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
