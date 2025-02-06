<script setup>
import { ref, computed, reactive } from 'vue';
import { onSend } from './components/OnSend';

// 【async必須】sleep(ms)用
// const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

// onSend用変数宣言
const urlVar = reactive({
    authkey: '',
    real_gacha_type: '',

    // 未変更
    authkey_ver: 1,
    sign_type: 2,
    lang: 'ja',
    region: 'prod_gf_jp',
    game_biz: 'nap_global',
});

const jsonVar = reactive({
    idx: 0,
    data: [],
    announce_message: '',
    success_message: '',
    error_message: ''
});

// ランク表示用
const rankLabel = {
    2: { rank: "B", color: "blue" },
    3: { rank: "A", color: "fuchsia" },
    4: { rank: "S", color: "goldenrod" }
};

// ガチャタイプ用
const gachaType = {
    0: "全部",
    1: "常設",
    2: "独占",
    3: "音動機",
    5: "ボンプ"
};

// フォーム関連変数
const input_authkey = ref(''), input_real_gacha_type = ref(0), isShow = ref(false), isProsessing = ref(false), authkey_form_type = ref('password'), authkeyPattern = ref(/^(?:[a-zA-Z0-9]|%2B|%2F)+$/), visibility = ref('visibility');

// jsonVarの初期化
function resetJsonVar() {
    Object.keys(jsonVar).forEach(key => {
        // 配列か否か
        if (Array.isArray(jsonVar[key])) {
            jsonVar[key] = [];
        } else if (Number.isInteger(jsonVar[key])) {
            jsonVar[key] = 0;
        } else {
            jsonVar[key] = '';
        }
    });
}

async function onSendPre() {
    // 処理中フラグ
    isProsessing.value = true;
    // authkeyをデコード(パラメータとして渡すときにエンコードされるため)
    urlVar.authkey = decodeURIComponent(input_authkey.value);
    // データリセット
    resetJsonVar();

    // authkeyに不正な値が含まれていないか検証
    if (!/^[a-zA-Z0-9+/]+$/.test(urlVar.authkey)) {
        jsonVar.error_message = "The authkey you entered appears to be an invalid value. Sorry, please try again.";
        return (1);
    }
    // 送信処理
    if (input_real_gacha_type.value === 0) {
        for (let key in gachaType) {
            if (key !== '0') {
                urlVar.real_gacha_type = key;
                await onSend(urlVar, jsonVar);
                // エラーがあれば終了
                if (jsonVar.error_message) {
                    break;
                } else {
                    jsonVar.success_message = gachaType[key] + "Completed!";
                }
            }
        }
    } else {
        urlVar.real_gacha_type = input_real_gacha_type.value;
        await onSend(urlVar, jsonVar);
    }

    // 処理中フラグ削除
    isProsessing.value = false;
    // 終了メッセージ
    if (jsonVar.data.length !== 0) {
        jsonVar.success_message = "Completed!";
    }
}

// 送信ボタン無効化
const isButtonDisable = computed(function () {
    return isProsessing.value || !input_authkey.value.trim().match(authkeyPattern.value);
});

// authkey非表示/表示切り替え
function toggleShow() {
    isShow.value = !isShow.value;
    if (isShow.value) {
        authkey_form_type.value = 'text';
        visibility.value = 'visibility_off';
    } else {
        authkey_form_type.value = 'password';
        visibility.value = 'visibility';
    }
}
</script>

<template>
    <!-- ステータス表示 -->
    <p v-if="jsonVar.announce_message" class="error">ANNOUNCE: {{ jsonVar.announce_message }}</p>
    <p v-if="jsonVar.success_message" class="success">{{ jsonVar.success_message }}</p>
    <p v-if="jsonVar.error_message" class="error">ERROR: {{ jsonVar.error_message }}</p>

    <!-- 入力部 -->
    <p>※AuthKeyは「&lt;ZZZInstallDirectory&gt;/ZenlessZoneZero_Data/webCaches/2.31.12.0/Cache/Cache_Data/data2」に記載された最新(一番下)のものを使用してください。(<a
            href="https://marketplace.visualstudio.com/items?itemName=ms-vscode.hexeditor">Hex
            Editor</a>等のバイナリエディタが必要)<br>検索用ワード(正規表現)「gacha_record/.*?authkey=」
    </p>
    <label for="input_authkey" class="form-required">AuthKey</label>
    <div class="input">
        <input v-model.trim="input_authkey" :type="authkey_form_type" name="authkey" class="password"
            :pattern="authkeyPattern.value" autofocus required />
        <button class="material-symbols-outlined button-toggle" @click="toggleShow">
            {{ visibility }}
        </button>
    </div>

    <div>
        <label for="input_real_gacha_type" class="form-required">ガチャタイプ</label>
        <div class="form">
            <select v-model.number="input_real_gacha_type">
                <option v-for="(value, key) in gachaType" :key="key" :value="key">
                    {{ value }}
                </option>
            </select>
        </div>
    </div>
    <button @click="onSendPre" :disabled="isButtonDisable">送信</button>

    <!-- 表示部 -->
    <table>
        <thead>
            <tr>
                <th>idx</th>
                <th>ランク</th>
                <th>名前</th>
                <th>種別</th>
                <th v-if="input_real_gacha_type === 0">ガチャタイプ</th>
                <th>引いた日付と時間</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in jsonVar.data" :key="item.index">
                <td>{{ item.index }}</td>
                <td :style="{ color: rankLabel[item.rank_type].color }">{{ rankLabel[item.rank_type].rank }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.item_type }}</td>
                <td v-if="input_real_gacha_type === 0">{{ gachaType[item.real_gacha_type] }}</td>
                <td>{{ item.time }}</td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped></style>
