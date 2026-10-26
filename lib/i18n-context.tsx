"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { languages, translations, type Language } from "@/lib/i18n"

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof typeof translations.en) => string
  isRTL: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

function detectUserLanguage(): Language {
  if (typeof window === "undefined") return "en"

  // Check localStorage first
  const stored = localStorage.getItem("preferred-language") as Language
  if (stored && languages[stored]) {
    return stored
  }

  // Detect from browser language
  const browserLang = navigator.language.toLowerCase()

  // Map browser locales to our supported languages
  const langMap: Record<string, Language> = {
    en: "en",
    "en-us": "en",
    "en-gb": "en",
    fr: "fr",
    "fr-fr": "fr",
    es: "es",
    "es-es": "es",
    ar: "ar",
    "ar-sa": "ar",
    zh: "zh",
    "zh-cn": "zh",
    ha: "ha",
  }

  // Try exact match first
  if (langMap[browserLang]) {
    return langMap[browserLang]
  }

  // Try language code only (e.g., "en" from "en-US")
  const langCode = browserLang.split("-")[0]
  if (langMap[langCode]) {
    return langMap[langCode]
  }

  // Default to English
  return "en"
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const detectedLang = detectUserLanguage()
    setLanguageState(detectedLang)

    // Apply RTL if needed
    if (languages[detectedLang].rtl) {
      document.documentElement.dir = "rtl"
    } else {
      document.documentElement.dir = "ltr"
    }

    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("preferred-language", lang)

    // Apply RTL direction
    if (languages[lang].rtl) {
      document.documentElement.dir = "rtl"
    } else {
      document.documentElement.dir = "ltr"
    }
  }

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key] || key
  }

  const isRTL = languages[language]?.rtl || false

  if (!mounted) {
    return null
  }

  return <I18nContext.Provider value={{ language, setLanguage, t, isRTL }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}

export const useLanguage = useI18n
