
function nowwea1() {
    // 氣象局 現在天氣觀測 API 的基本 URL
    // wea.html?key=CWA-422C592A-18E7-4C2E-BBD2-003CCC1F18D4;&station1=466881;

    let _base = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001';

    // 一定要 new 一定要先截斷到 ? 之後
    let tmp1 = new URLSearchParams(window.location.search);

    // 取得 使用者傳遞進來的參數
    let key1 = removeTrailingSemicolon(tmp1.get('key'));
    let station1 = removeTrailingSemicolon(tmp1.get('station1')); 

    //sendmsg('nowarea', _base);
    //sendmsg('nowarea', key1);
    //sendmsg('nowarea', station1);

    let _apiurl1 = _base + '?Authorization=' + key1 + '&StationId=' + station1;

    tmp2 = makeA('(原始連結)', _apiurl1);
    //window.alert(tmp2);
    sendmsg('nowarea', tmp2, 0);
    sendmsg('nowarea', ' ' + _apiurl1);

    // 重點!!!
    sendmsg('nowarea', '正在從氣象局 API 載入資料...'); // 假設你有一個 id 為 'api_data1' 的元素來顯示數據

    fetch(_apiurl1) // 使用 fetch 呼叫 API
        .then(response => {
            // 檢查 HTTP 響應是否成功 (例如：200 OK)
            if (!response.ok) {
                // 如果響應不成功，拋出錯誤
                throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
            }
            // 將響應轉換為 JSON 格式
            return response.json();
        })
        .then(data => {
            // API 數據成功獲取後，在這裡處理並顯示
            sendmsg('nowarea', '資料載入成功！');

            // 根據氣象局 API 的 JSON 結構來解析數據並顯示
            // O-A0003-001 (自動氣象站資料) 的常見結構

            if (data && data.records && Array.isArray(data.records.Station)) {
                const stationRecords = data.records.Station; // 這是一個包含測站資料的陣列
                const numberOfRecords = stationRecords.length; // 取得陣列的長度

                sendmsg('api_data1', `共找到 ${numberOfRecords} 筆測站資料`);

                // --- 新增的警告訊息邏輯 ---
                if (numberOfRecords > 1) {
                    sendmsg('nowarea', `<span style="color: yellow;">警告：檢測到多於一筆資料，將只顯示第一筆。</span>`); // 以黃色字體警告
                }
                // --- 警告訊息邏輯結束 ---

                if (numberOfRecords > 0) {
                    // 確保有資料才嘗試取第一筆
                    const staData = stationRecords[0]; // 總是取第一筆測站的資料 站點資料
                    const wadData = stationRecords[0].WeatherElement; // 氣象資料

                    sendmsg('api_data1', '<br />現在天氣: ');
                    sendmsg('api_data1', `觀測地點: ${staData.GeoInfo.CountyName} ${staData.GeoInfo.TownName}`);
                    sendmsg('api_data1', `時間: ${staData.ObsTime.DateTime.replace('T', ' ').substring(0, 19)}`);
                    sendmsg('api_data1', `天氣: ${wadData.Weather}`);
                    sendmsg('api_data1', `溫度: ${wadData.AirTemperature} 度`);
                    sendmsg('api_data1', `相對濕度: ${wadData.RelativeHumidity}%`);
                    sendmsg('api_data1', `當日降雨量: ${wadData.Now.Precipitation} 毫米`);
                    sendmsg('api_data1', `當日最高溫: ${wadData.DailyExtreme.DailyHigh.TemperatureInfo.AirTemperature} 度 (發生時間: ${wadData.DailyExtreme.DailyHigh.TemperatureInfo.Occurred_at.DateTime.replace('T', ' ').substring(0, 19)})`);
                    sendmsg('api_data1', `當日最低溫: ${wadData.DailyExtreme.DailyLow.TemperatureInfo.AirTemperature} 度 (發生時間: ${wadData.DailyExtreme.DailyLow.TemperatureInfo.Occurred_at.DateTime.replace('T', ' ').substring(0, 19)})`);
                    sendmsg('api_data1', `日照時數: ${wadData.SunshineDuration} 小時`);
                    sendmsg('api_data1', ' ');

                    // (這是我想的) 如果想 冒號對齊
                    // 改寫 sendmsg('api_data1', `<div class="defzz">觀測地點</div>: ${staData.GeoInfo.CountyName} ${staData.GeoInfo.TownName}`); 
                    // class="defzz" 定義 width: 120px; text-align: right; display: inline-block;

                    // Gemini 是建議 這樣寫
                    // sendmsg('api_data1', `
                    //    <div class="data-row-flex">
                    //        <div class="defzz">觀測地點</div>: <span class="data-value">${staData.GeoInfo.CountyName} ${staData.GeoInfo.TownName}</span>
                    //    </div>
                    // `);
                    // 為了正確對齊，冒號後的內容最好還是包裹在一個 <span> 裡
                    // 並且，data-row-flex 是必須的外部 flex 容器

                    // .data-row-flex {
                    //     display: flex; /* 父容器啟用 Flexbox */
                    //     align-items: baseline; /* 讓內容基線對齊 */
                    // }

                    // .defzz {
                    //     /* 這裡的 display: inline-block 讓 div 表現得像行內元素但可以設定寬高 */
                    //     /* 也可以直接讓 .data-label 成為 flex item，而無需 inline-block */
                    //     /* display: inline-block; */ /* 如果不使用 flex，這個才有用 */

                    //     width: 120px; /* 設定固定寬度 */
                    //     text-align: right; /* 文字右對齊 */
                    //     padding-right: 5px; /* 冒號前的間距 */
                    // }
                    
                    // 不然就用 table 看似複雜 實則很單純

                    sendmsg('nowarea', '(完整數據請按[F12]至Console頁面查看)<br />');
                    console.log(data); // 將完整數據物件輸出到瀏覽器控制台
                } else {
                    sendmsg('nowarea', 'API 返回的測站資料列表為空。');
                    console.log('API 返回的原始數據:', data);
                }
            } else {
                // 如果數據結構不符合預期，例如沒有 records 或 Station 陣列
                sendmsg('nowarea', 'API 返回的數據結構不符預期。');
                console.log('API 返回的原始數據:', data);
            }
        })
        .catch(error => {
            // 捕獲任何錯誤 (例如網路問題、API 返回錯誤、解析錯誤等)
            sendmsg('api_data1', `載入氣象數據失敗: ${error.message}`);
            console.error('API 呼叫錯誤:', error);
        });
    // 呼叫 API 的核心程式碼結束
}