import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const currentLang = i18n.language;

  return (
    <div className="language-switcher">
      <button 
        className={`btn btn-sm ${currentLang === 'zh' ? 'btn-light' : 'btn-outline-light'}`}
        onClick={() => changeLanguage('zh')}
        style={{ marginRight: '5px' }}
      >
        中文
      </button>
      <button 
        className={`btn btn-sm ${currentLang === 'en' ? 'btn-light' : 'btn-outline-light'}`}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
    </div>
  );
}

export default LanguageSwitcher;
