import en from "./en";
import zh_Hans_CN from "./zh-Hans-CN";
import zh_Hant_TW from "./zh-Hant-TW";
import pt from "./pt";
import id from "./id";
import fr from "./fr";
import es from "./es";
import it from "./it";
import tr from "./tr";
import jp from "./jp";
import de from "./de";
import vi from "./vi";
import ru from "./ru";
import no from "./no";
import cs from "./cs";
import ko from "./ko";
import ar from "./ar";
import bn from "./bn";
import sk from "./sk";

import type { LocaleType } from "./en";
export type { LocaleType, PartialLocaleType } from "./en";

const ALL_LANGS = {
  zh_Hans_CN,
  en,
  zh_Hant_TW,
  pt,
  jp,
  ko,
  id,
  fr,
  es,
  it,
  tr,
  de,
  vi,
  ru,
  cs,
  no,
  ar,
  bn,
  sk,
};

export type Lang = keyof typeof ALL_LANGS;

export const AllLangs = Object.keys(ALL_LANGS) as Lang[];

export const ALL_LANG_OPTIONS: Record<Lang, string> = {
  zh_Hans_CN: "简体中文",
  en: "English",
  pt: "Português",
  zh_Hant_TW: "繁體中文",
  jp: "日本語",
  ko: "한국어",
  id: "Indonesia",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  tr: "Türkçe",
  de: "Deutsch",
  vi: "Tiếng Việt",
  ru: "Русский",
  cs: "Čeština",
  no: "Nynorsk",
  ar: "العربية",
  bn: "বাংলা",
  sk: "Slovensky",
};

const LANG_KEY = "lang";
const DEFAULT_LANG = "en";

const fallbackLang = en;
const targetLang = ALL_LANGS[getLang()] as LocaleType;

// if target lang missing some fields, it will use fallback lang string
merge(fallbackLang, targetLang);

export default fallbackLang as LocaleType;

function getItem(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function getLanguage() {
  try {
    return navigator.language.toLowerCase();
  } catch {
    return DEFAULT_LANG;
  }
}

export function getLang(): Lang {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    if (urlLang) {
      // Find matching language key (case-insensitive)
      const matchedLang = AllLangs.find(
        (lang) => lang.toLowerCase() === urlLang.toLowerCase()
      );
      if (matchedLang) {
        return matchedLang;
      }
    }
  }

  const savedLang = getItem(LANG_KEY);

  if (AllLangs.includes((savedLang ?? "") as Lang)) {
    return savedLang as Lang;
  }

  const lang = getLanguage();

  // Special handling for Chinese languages
  if (lang.includes("zh") && (lang.includes("cn") || lang.includes("hans"))) {
    return "zh_Hans_CN";
  }
  if (lang.includes("zh") && (lang.includes("tw") || lang.includes("hant"))) {
    return "zh_Hant_TW";
  }

  for (const option of AllLangs) {
    if (lang.includes(option)) {
      return option;
    }
  }

  return DEFAULT_LANG;
}

export function changeLang(lang: Lang) {
  setItem(LANG_KEY, lang);
  location.reload();
}

export function getISOLang() {
  const isoLangString: Record<string, string> = {
    zh_Hans_CN: "zh-Hans",
    zh_Hant_TW: "zh-Hant",
  };

  const lang = getLang();
  return isoLangString[lang] ?? lang;
}

export function merge(target: any, source: any) {
  Object.keys(source).forEach(function (key) {
    if (
      (source.hasOwnProperty(key) && // Check if the property is not inherited
        source[key] &&
        typeof source[key] === "object") ||
      key === "__proto__" ||
      key === "constructor"
    ) {
      merge((target[key] = target[key] || {}), source[key]);
      return;
    }
    target[key] = source[key];
  });
}
