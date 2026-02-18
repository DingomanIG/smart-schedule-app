import { Globe } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'

export default function LanguageToggle() {
    const { lang, toggleLang } = useLanguage()

    return (
        <button
            onClick={toggleLang}
            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 text-sm transition-colors"
            title={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
        >
            <Globe size={16} />
            {lang === 'ko' ? 'EN' : 'KO'}
        </button>
    )
}
