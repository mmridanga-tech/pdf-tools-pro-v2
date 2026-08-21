import React from 'react';
import { Languages, Sparkles } from 'lucide-react';

export interface OCRLanguage {
  code: string;
  name: string;
  nativeName?: string;
  popular?: boolean;
}

export const OCR_LANGUAGES: OCRLanguage[] = [
  { code: 'eng', name: 'English', popular: true },
  { code: 'ben', name: 'Bengali', nativeName: 'বাংলা', popular: true },
  { code: 'eng+ben', name: 'English + Bengali (Bilingual)', nativeName: 'English + বাংলা', popular: true },
  { code: 'spa', name: 'Spanish', nativeName: 'Español' },
  { code: 'fra', name: 'French', nativeName: 'Français' },
  { code: 'deu', name: 'German', nativeName: 'Deutsch' },
  { code: 'ita', name: 'Italian', nativeName: 'Italiano' },
  { code: 'por', name: 'Portuguese', nativeName: 'Português' },
  { code: 'zho', name: 'Chinese (Simplified)', nativeName: '中文' },
  { code: 'jpn', name: 'Japanese', nativeName: '日本語' },
  { code: 'hin', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ara', name: 'Arabic', nativeName: 'العربية' },
  { code: 'rus', name: 'Russian', nativeName: 'Русский' },
];

interface OcrLanguageSelectorProps {
  selectedLanguage: string;
  onChange: (langCode: string) => void;
}

export const OcrLanguageSelector: React.FC<OcrLanguageSelectorProps> = ({
  selectedLanguage,
  onChange,
}) => {
  return (
    <div className="space-y-3">
      <label htmlFor="ocr-language-select" className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
        <Languages className="w-4 h-4 text-amber-400" />
        <span>Document Language / OCR Engine</span>
      </label>

      {/* Quick Select Chips */}
      <div className="flex flex-wrap gap-2 mb-2">
        {OCR_LANGUAGES.filter((l) => l.popular).map((lang) => {
          const isActive = selectedLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onChange(lang.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {lang.code === 'eng+ben' && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              <span>{lang.name}</span>
              {lang.nativeName && <span className="opacity-70 text-[11px]">({lang.nativeName})</span>}
            </button>
          );
        })}
      </div>

      {/* Select Dropdown */}
      <select
        id="ocr-language-select"
        value={selectedLanguage}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
      >
        {OCR_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name} {lang.nativeName ? `(${lang.nativeName})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
};
