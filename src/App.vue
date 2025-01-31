<script setup>
import { ref } from 'vue';
import { onSend } from './components/OnSend';

// // 【async必須】sleep(ms)用
// const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

// onSend用変数宣言
const urlVar = {
    authkey: ref(''),
    real_gacha_type: ref(1),

    // 未使用
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
</script>

<template>
    <!-- エラー表示 -->
    <p v-if="jsonVar.success_message.value" class="success">{{ jsonVar.success_message.value }}</p>
    <p v-if="jsonVar.error_message.value" class="error">ERROR: {{ jsonVar.error_message.value }}</p>

    <!-- 入力部分 -->
    <form @submit.prevent="onSend(urlVar, jsonVar)">
        <div>
            <p>※AuthKeyは「&lt;ZZZInstallDirectory&gt;/ZenlessZoneZero_Data/webCaches/2.31.12.0/Cache/Cache_Data/data2」に記載された最新(一番下)のものを使用してください。(<a
                    href="https://marketplace.visualstudio.com/items?itemName=ms-vscode.hexeditor">Hex
                    Editor</a>等のバイナリエディタが必要)<br>検索用ワード(正規表現)「gacha_record.+authkey=」
            </p>
            <label for="urlVar.authkey.value" class="form-required">AuthKey</label>
            <input v-model.trim="urlVar.authkey.value" :type="authkey_form_type" name="authkey" autofocus required />
        </div>

        <div>
            <label for="urlVar.real_gacha_type.value" class="form-required">ガチャタイプ</label>
            <select v-model="urlVar.real_gacha_type.value">
                <option value="1">常設</option>
                <option value="2">独占</option>
                <option value="3">音動機</option>
                <option value="5">ボンプ</option>
            </select>
        </div>
        <button>送信</button>
    </form>

    <!-- 表示部分 -->
    <table>
        <thead>
            <tr>
                <th>idx</th>
                <th>種類(エージェント/音動機)</th>
                <th>ランク</th>
                <th>名前</th>
                <th>引いた日付と時間</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in jsonVar.data.value">
                <td>{{ item.index }}</td>
                <td>{{ item.item_type }}</td>
                <td :style="{ color: rankLabel[item.rank_type].color }">{{ rankLabel[item.rank_type].rank }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.time }}</td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped></style>
