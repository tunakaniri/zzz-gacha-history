<script setup>
import { ref, computed } from 'vue';
import { onSend } from './components/OnSend';

// 【async必須】sleep(ms)用
// const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

// onSend用変数宣言
const urlVar = {
    authkey: ref(''),
    real_gacha_type: ref(1),

    // 未変更
    authkey_ver: ref(1),
    sign_type: ref(2),
    lang: ref('ja'),
    region: ref('prod_gf_jp'),
    game_biz: ref('nap_global'),
};

const jsonVar = {
    idx: ref(0),
    data: ref([]),
    announce_message: ref(''),
    success_message: ref(''),
    error_message: ref('')
};

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
const input_authkey = ref(''), input_real_gacha_type = ref(0), isShow = ref(false), isProsessing = ref(false), authkey_form_type = ref('password'), visibility = ref('visibility');

// jsonVarの初期化
function resetJsonVar() {
    Object.keys(jsonVar).forEach(key => {
        // 配列か否か
        if (Array.isArray(jsonVar[key].value)) {
            jsonVar[key].value = [];
        } else if (Number.isInteger(jsonVar[key].value)) {
            jsonVar[key].value = 0;
        } else {
            jsonVar[key].value = '';
        }
    });
}

async function onSendPre() {
    // 処理中フラグ
    isProsessing.value = true;
    // authkeyをデコード(パラメータとして渡すときにエンコードされるため)
    urlVar.authkey.value = decodeURIComponent(input_authkey.value);
    // データリセット
    resetJsonVar();

    // 送信処理
    if (input_real_gacha_type.value === 0) {
        for (let key in gachaType) {
            if (key !== '0') {
                urlVar.real_gacha_type.value = key;
                await onSend(urlVar, jsonVar);
                jsonVar.success_message.value = gachaType[key] + "Completed!";
            }
        }
    } else {
        urlVar.real_gacha_type.value = input_real_gacha_type.value;
        await onSend(urlVar, jsonVar);
    }

    // 処理中フラグ削除
    isProsessing.value = false;
    // 終了メッセージ
    if (jsonVar.data.value.length !== 0) {
        jsonVar.success_message.value = "Completed!";
    }
}

const isButtonDisable = computed(function () {
    return isProsessing.value || input_authkey.value.trim() === '';
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
    <p v-if="jsonVar.announce_message.value" class="error">ANNOUNCE: {{ jsonVar.announce_message.value }}</p>
    <p v-if="jsonVar.success_message.value" class="success">{{ jsonVar.success_message.value }}</p>
    <p v-if="jsonVar.error_message.value" class="error">ERROR: {{ jsonVar.error_message.value }}</p>

    <!-- 入力部 -->
    <p>※AuthKeyは「&lt;ZZZInstallDirectory&gt;/ZenlessZoneZero_Data/webCaches/2.31.12.0/Cache/Cache_Data/data2」に記載された最新(一番下)のものを使用してください。(<a
            href="https://marketplace.visualstudio.com/items?itemName=ms-vscode.hexeditor">Hex
            Editor</a>等のバイナリエディタが必要)<br>検索用ワード(正規表現)「gacha_record/.*?authkey=」
    </p>
    <label for="input_authkey" class="form-required">AuthKey</label>
    <div class="form">
        <input v-model.trim="input_authkey" :type="authkey_form_type" name="authkey" class="password" autofocus
            required />
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
                <th>種類(エージェント/音動機)</th>
                <th v-if="input_real_gacha_type === 0">ガチャタイプ</th>
                <th>引いた日付と時間</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in jsonVar.data.value" :key="item.index">
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
