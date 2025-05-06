import { createI18n } from 'vue-i18n'
import { setDayJSLocale } from '@/components/i18n/dayjs.js'
import Cookies from 'js-cookie'

// export const SUPPORT_LOCALES = ['en', 'ja']
// export const localeList = {
//     "zh-cn": "简体中文",
//     "zh-tw": "繁體中文",
//     "en-us": "English",
//     "ko-kr": "한국어",
//     "ja-jp": "日本語",
//     "es-es": "Español",
//     "ru-ru": "русский",
//     "th-th": "ภาษาไทย",
//     "vi-vn": "Tiếng Việt",
//     "id-id": "Bahasa Indonesia",
//     "fr-fr": "Français",
//     "de-de": "Deutsch",
//     "pt-pt": "Português"
// }
// 言語リスト(APIサーバーとday.jsの形式に統一)
export const langList = {
  'zh-cn': '简体中文',
  'zh-tw': '繁體中文',
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  es: 'Español',
  ru: 'русский',
  th: 'ภาษาไทย',
  vi: 'Tiếng Việt',
  id: 'Bahasa Indonesia',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
}

// ブラウザの言語設定を検出し、langList に一致する言語コードを返す
function detectBrowserLanguage() {
  // ブラウザのロケール設定取得
  let browserLocale = navigator.language.toLowerCase()
  // zh-TW以外のzh-TWへのルーティング用
  // if (browserLocale.startsWith("言語コード"))と併用すること！
  const langAlias = {
    // ブラウザの言語: 置換後の言語(langListから取得すること)
    'zh-hk': 'zh-tw',
    'zh-mo': 'zh-tw',
  }

  // 言語自動選択
  // 完全一致検索
  if (langList[browserLocale]) {
    return browserLocale
  }
  // ルーティングのリストに存在すれば置換して終了
  if (langAlias[browserLocale]) {
    return langAlias[browserLocale]
  }
  // 残りのzhをzh-cnにルーティング
  if (browserLocale.startsWith('zh')) {
    return 'zh-cn'
  }
  // ロケールから言語部分の抽出
  const browserLang = browserLocale.split('-')[0]
  // 言語一致検索
  if (langList[browserLang]) {
    return browserLang
  }
  // フォールバック
  return 'en'
}

// インスタンスをこのファイル内で使えるように(letで宣言しているけど、setupI18n()以外では直接触らないこと！)
let i18n = null
// 外部からアクセス用
export function getI18nInstance() {
  return i18n
}

// Cookie から保存された言語を取得。なければブラウザから取得
function getLanguage() {
  const cookieLang = Cookies.get('language')

  // Cookieに保存した言語がlangListにあるときのみCookieの言語を利用
  if (cookieLang && langList[cookieLang]) {
    return cookieLang
  }

  return detectBrowserLanguage()
}

export async function setupI18n() {
  const lang = getLanguage()
  // ソース言語
  const fallbackLocale = 'ja'

  // i18nインスタンス作成
  const i18nI = createI18n({
    legacy: false,
    locale: lang,
    fallbackLocale,
    messages: {},
    globalInjection: true,
    formatFallbackMessages: true,
  })
  i18n = i18nI
  // フォールバック用(1回のみでいいのでここ)
  const fallbackMessages = await import(`../../i18n/${fallbackLocale}.json`)
  i18n.global.setLocaleMessage(fallbackLocale, fallbackMessages.default)

  await loadLangMessages(lang)
  return i18n
}

// export function setI18nLanguage(locale) {
//     i18n.global.locale.value = locale
//     /**
//      * NOTE:
//      * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
//      * The following is an example for axios.
//      *
//      * axios.defaults.headers.common['Accept-Language'] = locale
//      */
// document.querySelector('html').setAttribute('lang', locale)
// }

export async function loadLangMessages(lang) {
  // load locale messages with dynamic import
  /* webpackChunkName: "locale-[request]" */
  const messages = await import(`../../i18n/${lang}.json`)

  // 取得したデータを vue-i18n に登録
  i18n.global.setLocaleMessage(lang, messages.default)
  // vue-i18n に現在の言語を設定
  i18n.global.locale.value = lang
  // dayjs に現在の言語を設定
  await setDayJSLocale(lang)

  // Cookie に言語設定を保存(1年)
  Cookies.set('language', lang, { expires: 365 })
  // HTML のメタデータを更新
  // <html lang=""> の更新
  document.querySelector('html').setAttribute('lang', lang)
  // <title> の更新
  document.title = i18n.global.t('meta.title', {
    gameTitle: i18n.global.t('game.title'),
    gameGachaHistory: i18n.global.t('game.gachaHistory'),
  })
  // <meta name="description"> の更新
  document.querySelector('meta[name="description"]').setAttribute(
    'content',
    i18n.global.t('meta.description', {
      gameTitle: i18n.global.t('game.title'),
      gameGachaHistory: i18n.global.t('game.gachaHistory'),
    }),
  )
}
