<script setup>
import { useI18n } from 'vue-i18n'
import { loadLangMessages, langList } from '@/components/i18n/i18n.js'

// 現在のロケールを取得
const { locale } = useI18n()

// 言語変更
async function changeLang(event) {
  const selectedLang = event.target.value
  await loadLangMessages(selectedLang) // 言語を切り替え
}
</script>

<template>
  <select @change="changeLang" :value="locale" name="language">
    <option v-for="(label, code) in langList" :key="code" :value="code">
      {{ label }}
    </option>
  </select>
</template>