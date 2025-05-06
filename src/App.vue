<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ApiForm from '@/components/api/ApiForm.vue'
import LanguageSelector from '@/components/i18n/LanguageSelector.vue'

// 【async必須】sleep(ms)用
// const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

// 翻訳用(v-html="$t('meta.title')"などで使える)
const { t } = useI18n()

// 固有名詞(検索避け)
const name_mi = ref(
    '&#19978;&#28023;&#31859;&#21704;&#28216;&#32593;&#32476;&#31185;&#25216;&#32929;&#20221;&#26377;&#38480;&#20844;&#21496;&#40;&#83;&#104;&#97;&#110;&#103;&#104;&#97;&#105;&#32;&#109;&#105;&#72;&#111;&#89;&#111;&#32;&#89;&#105;&#110;&#103;&#84;&#105;&#101;&#32;&#84;&#101;&#99;&#104;&#110;&#111;&#108;&#111;&#103;&#121;&#32;&#67;&#111;&#46;&#44;&#76;&#116;&#100;&#46;&#41;',
  ),
  name_cog = ref(
    '&#67;&#79;&#71;&#78;&#79;&#83;&#80;&#72;&#69;&#82;&#69;&#80;&#84;&#69;&#46;&#76;&#84;&#68;&#46;',
  ),
  name_hyv = ref('&#72;&#111;&#89;&#111;&#118;&#101;&#114;&#115;&#101;')

// 数値文字参照変換
function decodeHtmlEntities(str) {
  const txt = document.createElement('textarea')
  txt.innerHTML = str
  return txt.value
}

// プレーンテキストに変換して表示
onMounted(async function () {
  name_mi.value = decodeHtmlEntities(name_mi.value)
  name_cog.value = decodeHtmlEntities(name_cog.value)
  name_hyv.value = decodeHtmlEntities(name_hyv.value)
})

// フッターのHTMLコンテンツを生成
const footerContent = computed(() => {
  return t('message.footer', {
    mi: name_mi.value,
    cog: name_cog.value,
    hyv: name_hyv.value,
    unOfficial: `<span style="color: red;">${t('message.unOfficial')}</span>`,
    sendProxy: `<span style="color: red;">${t('message.sendProxy')}</span>`,
    br: `<br />`,
  })
})
</script>

<template>
  <div style="text-align: right">
    <LanguageSelector />
  </div>

  <div class="app-container">
    <ApiForm />
  </div>

  <div>
    <footer v-html="footerContent"></footer>
  </div>
</template>
