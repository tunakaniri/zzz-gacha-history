import { ref } from 'vue';
import axios from 'axios';

// 【async必須】sleep(ms)用
const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

// 送信ボタン処理
export async function onSend(urlVar, jsonVar) {
    // 変数宣言
    let len = 0, temp_data = [];
    const api_url = 'https://zzz-gacha-history-proxy.tunakaniri.workers.dev', size = 20, end_id = ref('');

    for (let loop = 0; ; loop++) {
        if (len === size || loop === 0) {
            await sleep(500);
            await getGachaData(loop);
        } else {
            break;
        }
    }

    // APIを使用してガチャデータを取得
    async function getGachaData(loop) {
        try {
            const response = await axios.get(api_url, {
                params: {
                    authkey_ver: urlVar.authkey_ver.value,
                    sign_type: urlVar.sign_type.value,
                    authkey: urlVar.authkey.value,
                    lang: urlVar.lang.value,
                    region: urlVar.region.value,
                    game_biz: urlVar.game_biz.value,
                    size: size,
                    real_gacha_type: urlVar.real_gacha_type.value,
                    // 次ページ移行用
                    end_id: end_id.value
                },
            });

            // authkeyの期限が切れていた場合
            if (response.data.message === "auth key time out") {
                jsonVar.announce_message.value = "authkeyの有効期限が切れています。一度ゲーム画面に戻り変調履歴画面(変調>詳細>変調履歴)を開いて、再度authkeyを取得してください。";
            }

            // アクセス成功
            if (response.data.data.list.length === 0 && loop === 0) {
                jsonVar.error_message.value = "Sorry, No Data Found…";
            } else if (response.data.data.list.length < size) {
                assignData(response);
            } else {
                assignData(response);
                end_id.value = jsonVar.data.value[jsonVar.data.value.length - 1].id;
            }
            // 画面表示用
            jsonVar.idx.value += response.data.data.list.length;
            // 終了判定用
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

    // 代入部分
    function assignData(response) {
        temp_data = response.data.data.list.map((value, key) => ({
            index: key + jsonVar.idx.value + 1,
            rank_type: value.rank_type,
            name: value.name,
            item_type: value.item_type,
            time: value.time,
            real_gacha_type: value.gacha_type,
            id: value.id
        }));
        jsonVar.data.value = [...jsonVar.data.value, ...temp_data];
    }
}