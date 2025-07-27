<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

// 翻訳用
const { t } = useI18n()

const isDragging = ref(false),
  selectedFileName = ref(''),
  emit = defineEmits(['authkey-found'])

function handleFile(file) {
  if (!file) return

  const reader = new FileReader()
  reader.onload = function () {
    // data_2 のみ許可
    if (file.name !== 'data_2' || file.name.includes('.')) {
      alert('data_2 ファイルのみ許可されています')
      selectedFileName.value = ''
      return
    }
    const data2 = new TextDecoder('utf-8').decode(new Uint8Array(reader.result))
    // console.log('ファイル読み込み成功:', data2)

    // ここに正規表現などの処理
    const regex = /gacha_record\/.*?[?&]authkey=([^&]+)/g
    let match, authkey
    // 最新のauthkeyを取得
    while ((match = regex.exec(data2)) !== null) {
      // 見つかるたびに上書き
      authkey = match[1]
      // console.log("authkey: " + match[1])
    }
    // console.log("authkey: " + authkey)
    emit('authkey-found', authkey)
  }
  reader.readAsArrayBuffer(file)
}

// input用
function onFileSelected(e) {
  const file = e.target.files[0]
  handleFile(file)
}

function onDragOver() {
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

// dropzone用
function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  selectedFileName.value = file.name
  handleFile(file)
}

// ドラッグ状態検出（全体に対して）
function globalDragEnter() {
  isDragging.value = true
}
function globalDragLeave(e) {
  if (e.relatedTarget === null || !e.currentTarget.contains(e.relatedTarget)) {
    isDragging.value = false
  }
}
function preventDefaults(e) {
  e.preventDefault()
}

onMounted(() => {
  document.addEventListener('dragover', preventDefaults, false)
  document.addEventListener('drop', preventDefaults, false)
  document.addEventListener('dragenter', globalDragEnter)
  document.addEventListener('dragleave', globalDragLeave)
})
onBeforeUnmount(() => {
  document.removeEventListener('dragover', preventDefaults)
  document.removeEventListener('drop', preventDefaults)
  document.removeEventListener('dragenter', globalDragEnter)
  document.removeEventListener('dragleave', globalDragLeave)
})
</script>

<template>
  <div>
    <!-- 通常表示：inputでファイル選択 -->
    <div v-if="!isDragging">
      <label for="upload">{{ $t('label.fileData_2') }}</label
      ><br />
      <label for="upload">
        <span class="no-select">{{ $t('label.path') }}</span
        >&lt;ZZZInstallLocation&gt;/ZenlessZoneZero_Data/webCaches/&lt;LatestVersion&gt;/Cache/Cache_Data/data_2 </label
      ><br />
      <label for="upload" class="pseudo-button">{{ $t('label.uploadHere') }}</label>
      <input type="file" id="upload" @change="onFileSelected" />
      <div v-if="selectedFileName">選択されたファイル: {{ selectedFileName }}</div>
      <span class="material-symbols-outlined" style="color: green">check_circle</span>
      <span class="material-symbols-outlined" style="color: red">cancel</span>
    </div>

    <!-- ドロップゾーン表示 -->
    <div
      v-else
      class="dropzone"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <p>ここに <strong>data_2</strong> ファイルをドロップしてください</p>
    </div>
  </div>
  <!-- <p>
    ※AuthKeyは「&lt;ZZZInstallDirectory&gt;/ZenlessZoneZero_Data/webCaches/&lt;VERSION&gt;/Cache/Cache_Data/data2」に記載された最新(一番下)のものを使用してください。(<a
      href="https://marketplace.visualstudio.com/items?itemName=ms-vscode.hexeditor">Hex
      Editor</a>等のバイナリエディタが必要)<br />検索用ワード(正規表現)「gacha_record/.*?authkey=」
  </p> -->
</template>
