import { createContext, useContext, useState, useCallback } from 'react'
import ko from '../locales/ko'
import en from '../locales/en'

const locales = { ko, en }

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('lang') || 'ko'
    })

    const toggleLang = useCallback(() => {
        setLang((prev) => {
            const next = prev === 'ko' ? 'en' : 'ko'
            localStorage.setItem('lang', next)
            return next
        })
    }, [])

    const t = useCallback(
        (key) => {
            return locales[lang]?.[key] || locales.ko[key] || key
        },
        [lang]
    )

    return (
        <LanguageContext.Provider value={{ lang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const ctx = useContext(LanguageContext)
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
    return ctx
}
