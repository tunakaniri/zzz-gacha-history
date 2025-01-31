<script setup>
import { ref } from 'vue';
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
    data: ref([]),
    success_message: ref(''),
    error_message: ref('')
};

// ランク表示用
const rankLabel = {
    "2": { rank: "B", color: "blue" },
    "3": { rank: "A", color: "fuchsia" },
    "4": { rank: "S", color: "goldenrod" }
};

// フォーム関連変数
const isShow = ref(false), isDisable = ref(false), authkey_form_type = ref('password'), visibility = ref('visibility');

async function onSendPre() {
    isDisable.value = !isDisable.value;
    await onSend(urlVar, jsonVar);
    isDisable.value = !isDisable.value;
}

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
    <!-- エラー表示 -->
    <p v-if="jsonVar.success_message.value" class="success">{{ jsonVar.success_message.value }}</p>
    <p v-if="jsonVar.error_message.value" class="error">ERROR: {{ jsonVar.error_message.value }}</p>

    <!-- 入力部分 -->
    <p>※AuthKeyは「&lt;ZZZInstallDirectory&gt;/ZenlessZoneZero_Data/webCaches/2.31.12.0/Cache/Cache_Data/data2」に記載された最新(一番下)のものを使用してください。(<a
            href="https://marketplace.visualstudio.com/items?itemName=ms-vscode.hexeditor">Hex
            Editor</a>等のバイナリエディタが必要)<br>検索用ワード(正規表現)「gacha_record.+authkey=」
    </p>
    <label for="urlVar.authkey.value" class="form-required">AuthKey</label>
    <div class="form">
        <input v-model.trim="urlVar.authkey.value" :type="authkey_form_type" name="authkey" class="password" autofocus
            required />
        <button class="material-symbols-outlined button-toggle" @click="toggleShow">
            {{ visibility }}
        </button>
    </div>

    <div>
        <label for="urlVar.real_gacha_type.value" class="form-required">ガチャタイプ</label>
        <div class="form">
            <select v-model="urlVar.real_gacha_type.value">
                <option value="1">常設</option>
                <option value="2">独占</option>
                <option value="3">音動機</option>
                <option value="5">ボンプ</option>
            </select>
        </div>
    </div>
    <button @click="onSendPre" :disabled="isDisable">送信</button>

    <!-- 表示部分 -->
    <table>
        <thead>
            <tr>
                <th>idx</th>
                <th>ランク</th>
                <th>名前</th>
                <th>種類(エージェント/音動機)</th>
                <th>引いた日付と時間</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in jsonVar.data.value">
                <td>{{ item.index }}</td>
                <td :style="{ color: rankLabel[item.rank_type].color }">{{ rankLabel[item.rank_type].rank }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.item_type }}</td>
                <td>{{ item.time }}</td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped></style>
