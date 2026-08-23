'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  t: (typeof translations)['ar'];
  toggleLanguage: () => void;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  // تحديث اللغة من localStorage بعد التحميل الأول في المتصفح
  useEffect(() => {
    const savedLang = localStorage.getItem('cinemax_lang');
    if (savedLang === 'ar' || savedLang === 'en') {
      // استخدام setTimeout يحل تحذير ESLint ويمنع تعليق الـ Render
      setTimeout(() => {
        setLanguage(savedLang);
      }, 0);
    }
  }, []);

  // تحديث الـ DOM تلقائياً كلما تغيرت اللغة
  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const nextLang: Language = prev === 'ar' ? 'en' : 'ar';
      localStorage.setItem('cinemax_lang', nextLang);
      return nextLang;
    });
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        t: translations[language],
        toggleLanguage,
        dir: language === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}