import { ref } from 'vue'
// day.jsのプラグインごとimport(ここ以外で使うものも全て)
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

// プラグイン読み込み
dayjs.extend(localizedFormat)

// day.jsのlocaleを動的読み込み
const localizedFormatImporter = {
  'zh-cn': () => import('dayjs/locale/zh-cn'),
  'zh-tw': () => import('dayjs/locale/zh-tw'),
  en: () => import('dayjs/locale/en'),
  ko: () => import('dayjs/locale/ko'),
  ja: () => import('dayjs/locale/ja'),
  es: () => import('dayjs/locale/es'),
  ru: () => import('dayjs/locale/ru'),
  th: () => import('dayjs/locale/th'),
  vi: () => import('dayjs/locale/vi'),
  id: () => import('dayjs/locale/id'),
  fr: () => import('dayjs/locale/fr'),
  de: () => import('dayjs/locale/de'),
  pt: () => import('dayjs/locale/pt'),
}

export default dayjs
export const reRenderKey = ref(0)

// dayjsのロケール変更
export async function setDayJSLocale(lang) {
  if (localizedFormatImporter[lang]) {
    await localizedFormatImporter[lang]()
    dayjs.locale(lang)
  } else {
    console.warn(`dayjs: unsupported language key "${lang}"`)
    dayjs.locale('en')
  }
  // ApiForm.vue用(templateで使うのでref)
  reRenderKey.value++
}
