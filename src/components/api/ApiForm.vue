<script setup>
  import { ref, computed, reactive } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { reRenderKey } from '../i18n/dayjs'
  import dayjs from '../i18n/dayjs'
  import { onSend } from './onSend'

  // onSend用変数宣言
  const urlVar = reactive({
    authkey: '',
    real_gacha_type: '',
    lang: '',

    // 未変更
    authkey_ver: 1,
    sign_type: 2,
    game_biz: 'nap_global',
  })

  // APIサーバーからのレスポンス保存用変数
  const jsonVar = reactive({
    idx: 0,
    data: [],
    uid: 0,
    region: '',
    announce_message: '',
    success_message: '',
    error_message: '',
    error_message_t: '',
  })

  // サーバーリスト(全言語で英語表記なのでハードコート)
  const serverList = {
    prod_gf_eu: 'Europe',
    prod_gf_us: 'America',
    prod_gf_jp: 'Asia',
    prod_gf_sg: 'TW,HK,MO',
  }

  // ランク表示用
  const rankLabel = {
    2: { rank: 'B', color: '#00A9FF' },
    3: { rank: 'A', color: '#E900FF' },
    4: { rank: 'S', color: '#FFB500' },
  }

  // ガチャチャンネル用(翻訳キー)
  const channelList = {
    0: 'game.channel.all',
    1: 'game.channel.stable',
    2: 'game.channel.exclusive',
    3: 'game.channel.w-engine',
    5: 'game.channel.bangboo',
    102: 'game.channel.exclusiveRescreening',
    103: 'game.channel.w-engineReverberation',
  }

  // 【async必須】sleep(ms)用
  // const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

  // 翻訳用
  const { t, locale } = useI18n()

  // フォーム関連変数
  const input_authkey = ref(''),
    input_real_gacha_type = ref(2),
    isShow = ref(false),
    isProsessing = ref(false),
    isFirst = ref(true),
    authkey_form_type = ref('password'),
    visibility = ref('visibility')

  // jsonVarの初期化
  function resetJsonVar() {
    Object.keys(jsonVar).forEach((key) => {
      if (Array.isArray(jsonVar[key])) {
        // 配列か否か
        jsonVar[key] = []
      } else if (Number.isInteger(jsonVar[key])) {
        // 数値か否か
        jsonVar[key] = 0
      } else {
        jsonVar[key] = ''
      }
    })
  }

  // API通信前処理/管理
  async function onSendPre() {
    // 処理中フラグ
    isProsessing.value = true
    // 初回フラグ(uidとregionを取得するか)
    isFirst.value = true
    // authkeyをデコード(パラメータとして渡すときにエンコードされるため)
    urlVar.authkey = decodeURIComponent(input_authkey.value)
    // データリセット
    resetJsonVar()
    // authkeyに不正な値が含まれていないか検証(gh-pages版のみ)
    if (!/^[a-zA-Z0-9+/]+$/.test(urlVar.authkey)) {
      jsonVar.error_message_t = 'message.error.invalidAuthkey'
      // 処理中フラグ削除
      isProsessing.value = false
      return 1
    }
    // 言語設定
    urlVar.lang = locale.value

    // 送信処理
    if (input_real_gacha_type.value === 0) {
      for (let key in channelList) {
        if (key !== '0') {
          urlVar.real_gacha_type = key
          await onSend(urlVar, jsonVar, isFirst)
          // エラーがあれば終了
          if (jsonVar.error_message) {
            break
          } else {
            jsonVar.success_message = t(channelList[key]) + ' Completed!'
          }
        }
      }
    } else {
      urlVar.real_gacha_type = input_real_gacha_type.value
      await onSend(urlVar, jsonVar, isFirst)
    }

    // 処理中フラグ削除
    isProsessing.value = false
    // 終了メッセージ
    if (jsonVar.data.length !== 0) {
      jsonVar.success_message = 'Completed!'
    }
  }

  // 引いた日時をローカライズ
  function formatDate(time) {
    return dayjs(time, 'YYYY-MM-DD HH:mm:ss').locale(locale.value).format('LLL') // ロケールが常に現在の状態になる
  }

  // 送信ボタン無効化
  const isButtonDisable = computed(function () {
    return isProsessing.value || input_authkey.value.trim() === ''
  })

  // authkey非表示/表示切り替え
  function toggleShow() {
    isShow.value = !isShow.value
    if (isShow.value) {
      authkey_form_type.value = 'text'
      visibility.value = 'visibility_off'
    } else {
      authkey_form_type.value = 'password'
      visibility.value = 'visibility'
    }
  }
</script>

<template>
  <div class="app-container">
    <!-- ステータス表示 -->
    <p v-if="jsonVar.success_message" class="success">{{ jsonVar.success_message }}</p>
    <p v-if="jsonVar.error_message" class="error">
      {{ $t('message.prefix.error') }} {{ jsonVar.error_message }}
    </p>
    <p v-if="jsonVar.error_message_t" class="error">
      {{ $t('message.prefix.error') }}
      {{
        $t(jsonVar.error_message_t, {
          gameGacha: $t('game.gacha'),
          gameGachaDetails: $t('game.gachaDetails'),
          gameGachaHistory: $t('game.gachaHistory'),
        })
      }}
    </p>
    <!-- 入力部 -->
    <p>
      ※AuthKeyは「&lt;ZZZInstallDirectory&gt;/ZenlessZoneZero_Data/webCaches/&lt;VERSION&gt;/Cache/Cache_Data/data2」に記載された最新(一番下)のものを使用してください。(<a
        href="https://marketplace.visualstudio.com/items?itemName=ms-vscode.hexeditor">Hex
        Editor</a>等のバイナリエディタが必要)<br />検索用ワード(正規表現)「gacha_record/.*?authkey=」
    </p>
    <label for="authkey" class="form-required">AuthKey</label>
    <div class="input">
      <input v-model.trim="input_authkey" :type="authkey_form_type" id="authkey" name="authkey" autocomplete="authkey"
        class="password" autofocus required />
      <button class="material-symbols-outlined button-toggle" @click="toggleShow">
        {{ visibility }}
      </button>
    </div>

    <div>
      <label for="gachachannel" class="form-required">{{ $t('game.channel.type') }}</label>
      <div class="form">
        <select v-model.number="input_real_gacha_type" id="gachachannel">
          <option v-for="(value, key) in channelList" :key="key" :value="key">
            {{ $t(value) }}
          </option>
        </select>
      </div>
    </div>
    <button @click="onSendPre" :disabled="isButtonDisable">{{ $t('label.submit') }}</button>

    <!-- 表示部 -->
    <p v-if="jsonVar.uid !== 0">
      UID: {{ jsonVar.uid }}, {{ $t('game.server') }}: {{ serverList[jsonVar.region] }}
    </p>
    <table>
      <thead>
        <tr>
          <th>idx</th>
          <th>{{ $t('game.rank') }}</th>
          <th>{{ $t('game.signalList') }}</th>
          <th>{{ $t('game.signalType') }}</th>
          <th v-if="input_real_gacha_type === 0">{{ $t('game.channel.type') }}</th>
          <th>{{ $t('game.gachaTime') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in jsonVar.data" :key="item.index">
          <td>{{ item.index }}</td>
          <td :style="{ color: rankLabel[item.rank_type].color }">
            {{ rankLabel[item.rank_type].rank }}
          </td>
          <td>{{ item.name }}</td>
          <td>{{ item.item_type }}</td>
          <td v-if="input_real_gacha_type === 0">
            {{ $t(channelList[item.gacha_type]) }}
          </td>
          <!-- 【最終手段】更新を手動で行わないといけないので、言語変更後に変更されるkeyを配置 -->
          <td :key="reRenderKey">{{ formatDate(item.time) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>