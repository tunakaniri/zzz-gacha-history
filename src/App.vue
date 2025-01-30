<script setup>
import { ref } from 'vue';
import axios from 'axios';

// 【async必須】Sleep(ms)用
const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

// URL関連変数
const api_url = ref(''), authkey = ref(''), real_gacha_type = ref(1), end_id = ref(''), input_end_id = ref('');
const base_url = "https://public-operation-nap-sg.hoyoverse.com/common/gacha_record/api/getGachaLog", size = 20, authkey_ver = 1, sign_type = 2, lang = "ja", region = "prod_gf_jp", game_biz = "nap_global";

// json関連変数
const data = ref([]), temp_data = ref([]), success_message = ref(''), error_message = ref('');
let len = 0, loop = 0, idx = 0;

const rankLabel = {
    "2": { rank: "B", color: "blue" },
    "3": { rank: "A", color: "fuchsia" },
    "4": { rank: "S", color: "goldenrod" }
};

// 代入部分
function assignData(response) {
    if (data.value.length === undefined) {
        data.value = response.data.data.list.map((value, key) => ({
            index: key + idx + 1,
            item_type: value.item_type,
            rank_type: value.rank_type,
            name: value.name,
            time: value.time,
            id: value.id
        }));
    } else {
        temp_data.value = response.data.data.list.map((value, key) => ({
            index: key + idx + 1,
            item_type: value.item_type,
            rank_type: value.rank_type,
            name: value.name,
            time: value.time,
            id: value.id
        }));
        data.value = [...data.value, ...temp_data.value];
    }
}


// APIを使用してガチャデータを取得
async function getGachaData() {
    await axios.get(api_url.value, {
        params: {
            end_id: end_id.value
        },
        headers: { 'Access-Control-Allow-Origin': 'https://public-operation-nap-sg.hoyoverse.com' }
    })
        // アクセス成功
        .then(function (response) {
            // console.log(response);
            if (response.data.data.list.length === 0 && loop === 0) {
                error_message.value = "Sorry, No Data Found…";
                // console.log("END!!!!");
            } else if (response.data.data.list.length < size) {
                assignData(response);
                success_message.value = "Completed!";
                // console.log("LAST!!!!");
            } else {
                assignData(response);
                // console.log("data:", data.value);
                end_id.value = data.value[data.value.length - 1].id;
                idx += size;
            }
            len = response.data.data.list.length;
            // console.log("len:", response.data.data.list.length);
        })
        // アクセス失敗
        .catch(function (error) {
            if (error.response) {
                // リクエストが行われ、サーバーは 2xx の範囲から外れるステータスコードで応答しました
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // リクエストは行われましたが、応答がありませんでした
                // `error.request` は、ブラウザでは XMLHttpRequest のインスタンスになり、
                // Node.js では http.ClientRequest のインスタンスになります。
                console.log(error.request);
            } else {
                // エラーをトリガーしたリクエストの設定中に何かが発生しました
                console.log('Error: ', error.message);
                if (response.data.message !== "OK") {
                    console.log('ServerMessage: ', response.data.message);
                    error_message.value = response.data.message;
                } else {
                    error_message.value = response.data.message;
                }
            }
            console.log(error.config);
        });
}

// 送信ボタン処理
async function onSend() {
    // 変数、配列初期化
    idx = 0, len = 0;
    data.value = [], temp_data.value = [];

    // end_id反映
    if (input_end_id.value !== '') {
        end_id.value = input_end_id.value;
    } else {
        end_id.value = 0;
    }

    api_url.value = base_url + "?authkey_ver=" + authkey_ver + "&sign_type=" + sign_type + "&lang=" + lang + "&region=" + region + "&game_biz=" + game_biz + "&size=" + size + "&authkey=" + authkey.value + "&real_gacha_type=" + real_gacha_type.value;
    // console.log(api_url.value + "&end_id=" + end_id.value);

    for (loop = 0; ; loop++) {
        if (len === size || loop === 0) {
            await sleep(1000);
            await getGachaData();
            // console.log(api_url.value + "&end_id=" + end_id.value);
            // console.log("alen:", len);
            // console.log("aloop:", loop);
        } else {
            // console.log("blen:", len);
            // console.log("bloop:", loop);
            break;
        }
    }
}
</script>

<template>
    <!-- エラー表示 -->
    <p v-if="success_message" class="success">{{ success_message }}</p>
    <p v-if="error_message" class="error">ERROR: {{ error_message }}</p>

    <!-- 入力部分 -->
    <form @submit.prevent="onSend">
        <div>
            <label for="authkey" class="form-required">AuthKey</label>
            <input v-model.trim="authkey" type="password" name="authkey" autofocus required />
        </div>

        <div>
            <label for="real_gacha_type" class="form-required">ガチャタイプ</label>
            <select v-model="real_gacha_type">
                <option value="1">常設</option>
                <option value="2">独占</option>
                <option value="3">音動機</option>
                <option value="5">ボンプ</option>
            </select>
        </div>

        <div>
            <label for="input_end_id">end_id</label>
            <input v-model.trim="input_end_id" name="end_id" />
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
                <!-- <th>id(Debug)</th> -->
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in data">
                <td>{{ item.index }}</td>
                <td>{{ item.item_type }}</td>
                <td :style="{ color: rankLabel[item.rank_type].color }">{{ rankLabel[item.rank_type].rank }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.time }}</td>
                <!-- <td>{{ item.id }}</td> -->
            </tr>
        </tbody>
    </table>
</template>

<style scoped></style>
