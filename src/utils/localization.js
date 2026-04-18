export function normalizeGender(gender) {
  return gender === 'female' ? 'female' : 'male';
}

export function byGender(gender, maleText, femaleText) {
  return normalizeGender(gender) === 'female' ? femaleText : maleText;
}

export function verbByGender(gender, maleVerb, femaleVerb) {
  return byGender(gender, maleVerb, femaleVerb);
}

export function normalizeLanguage(language) {
  return String(language || '').toLowerCase().startsWith('en') ? 'en' : 'ar';
}

export function getCurrentLanguage() {
  if (typeof document === 'undefined') return 'ar';
  return normalizeLanguage(document.documentElement.lang || 'ar');
}

export function isArabic(language = null) {
  return normalizeLanguage(language || getCurrentLanguage()) === 'ar';
}

export function byLanguage(language, arText, enText) {
  return normalizeLanguage(language) === 'en' ? enText : arText;
}

export function formatTimeByLanguage(dateValue = new Date(), language = null) {
  const lang = normalizeLanguage(language || getCurrentLanguage());
  const locale = lang === 'en' ? 'en-US' : 'ar-SA';
  return new Date(dateValue).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}
