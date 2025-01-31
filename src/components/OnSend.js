import { ref } from 'vue';
import axios from 'axios';

// 【async必須】sleep(ms)用
const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

// 送信ボタン処理
export async function onSend(urlVar, jsonVar) {
    // 変数宣言
    let len = 0, loop = 0, idx = 0, temp_data = [];
    const size = 20, api_url = ref(''), end_id = ref('');

    // 代入部分
    function assignData(response) {
        if (jsonVar.data.value.length === undefined) {
            jsonVar.data.value = response.data.data.list.map((value, key) => ({
                index: key + idx + 1,
                item_type: value.item_type,
                rank_type: value.rank_type,
                name: value.name,
                time: value.time,
                id: value.id
            }));
        } else {
            temp_data = response.data.data.list.map((value, key) => ({
                index: key + idx + 1,
                item_type: value.item_type,
                rank_type: value.rank_type,
                name: value.name,
                time: value.time,
                id: value.id
            }));
            jsonVar.data.value = [...jsonVar.data.value, ...temp_data];
        }
    }

    // APIを使用してガチャデータを取得
    async function getGachaData() {
        try {
            const response = await axios.get(api_url.value + '?authkey=' + authkey.value, {
                params: {
                    size: size,
                    authkey_ver: urlVar.authkey_ver.value,
                    sign_type: urlVar.sign_type.value,
                    lang: urlVar.lang.value,
                    region: urlVar.region.value,
                    game_biz: urlVar.game_biz.value,
                    real_gacha_type: urlVar.real_gacha_type.value,
                    end_id: end_id.value                               // 次ページ移行用
                },
            });

            // アクセス成功
            if (response.data.data.list.length === 0 && loop === 0) {
                jsonVar.error_message.value = "Sorry, No Data Found…";
            } else if (response.data.data.list.length < size) {
                assignData(response);
                jsonVar.success_message.value = "Completed!";
            } else {
                assignData(response);
                end_id.value = jsonVar.data.value[jsonVar.data.value.length - 1].id;
                idx += size;
            }
            len = response.data.data.list.length;
            // アクセス失敗
        } catch (error) {
            if (error.response) {
                // リクエストが行われ、サーバーは 2xx の範囲から外れるステータスコードで応答しました
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
                jsonVar.error_message.value = `Error ${error.response.status}: ${error.response.data.message || 'Unknown error'}`;
            } else if (error.request) {
                // リクエストは行われましたが、応答がありませんでした
                // `error.request` は、ブラウザでは XMLHttpRequest のインスタンスになり、
                // Node.js では http.ClientRequest のインスタンスになります。
                console.log(error.request);
                jsonVar.error_message.value = "No response from the server.";
            } else {
                // エラーをトリガーしたリクエストの設定中に何かが発生しました
                console.log('Error: ', error.message);
                jsonVar.error_message.value = error.message;
            }
            console.log(error.config);
        }
    }

    // 変数、配列初期化
    idx = 0, len = 0;
    jsonVar.data.value = [], temp_data = [];

    api_url.value = import.meta.env.API_URL;
    for (loop = 0; ; loop++) {
        if (len === size || loop === 0) {
            await sleep(500);
            await getGachaData();
        } else {
            break;
        }
    }
}