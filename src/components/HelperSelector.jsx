import { useState, useRef, useEffect } from 'react'
import { Sparkles, Sun, Flag, PawPrint, Briefcase, Baby } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'

export default function HelperSelector({ onSelectHelper, disabled }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (type) => {
    setOpen(false)
    onSelectHelper(type)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="p-2.5 rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title={t('helperSelectTitle')}
      >
        <Sparkles size={16} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            {t('helperSelectTitle')}
          </div>
          <button
            onClick={() => handleSelect('daily')}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Sun size={14} className="text-amber-500" />
            {t('helperDaily')}
          </button>
          <button
            onClick={() => handleSelect('major')}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Flag size={14} className="text-red-500" />
            {t('helperMajorEvents')}
          </button>
          <button
            onClick={() => handleSelect('petcare')}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <PawPrint size={14} className="text-teal-500" />
            {t('helperPetCare')}
          </button>
          <button
            onClick={() => handleSelect('work')}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Briefcase size={14} className="text-indigo-500" />
            {t('helperWork')}
          </button>
          <button
            onClick={() => handleSelect('childcare')}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Baby size={14} className="text-pink-500" />
            {t('helperChildcare')}
          </button>
        </div>
      )}
    </div>
  )
}
