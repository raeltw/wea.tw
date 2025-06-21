function d31() {
    // 氣象局 3日預報
    // wea3.html?key=CWA-422C592A-18E7-4C2E-BBD2-003CCC1F18D4;&city1=069;&town1=新店區;

    let _base = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-';

    // 一定要 new 一定要先截斷到 ? 之後
    let tmp1 = new URLSearchParams(window.location.search);

    // 取得 使用者傳遞進來的參數
    let key1 = removeTrailingSemicolon(tmp1.get('key'));
    let city1 = removeTrailingSemicolon(tmp1.get('city1'));
    let town1 = removeTrailingSemicolon(tmp1.get('town1'));

    //sendmsg('3darea', _base);
    //sendmsg('3darea', key1);
    //sendmsg('3darea', city1);
    //sendmsg('3darea', town1);

    let _apiurl1 = _base + city1 + '?Authorization=' + key1 + '&LocationName=' + town1;

    tmp2 = makeA('(原始連結)', _apiurl1);
    //window.alert(tmp2);
    sendmsg('3darea', tmp2, 0);
    sendmsg('3darea', ' ' + _apiurl1);

    // 重點!!!
    sendmsg('3darea', '正在從氣象局 API 載入資料...'); // 假設你有一個 id 為 'api_data2' 的元素來顯示數據

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
            sendmsg('3darea', '資料載入成功！');

            // 根據氣象局 API 的 JSON 結構來解析數據並顯示
            // F-D0047-XXX (鄉鎮未來3天_逐3小時預報) 的常見結構
            // 數據路徑通常是 data.records.locations[0].location[0] 或類似

            //let forecastLocations = null;
            //// 更穩健地檢查路徑，確保每一層都存在
            //if (data && data.records && Array.isArray(data.records.locations) && data.records.locations.length > 0 && data.records.locations[0].location && Array.isArray(data.records.locations[0].location)) {
            //    forecastLocations = data.records.locations[0].location;
            //}

            //報表名稱
            //window.alert();
            sendmsg('api_data2', data.records.Locations[0].DatasetDescription);
            sendmsg('api_data2', '預報地點: ', 0);
            sendmsg('api_data2', data.records.Locations[0].LocationsName, 0);
            sendmsg('api_data2', data.records.Locations[0].Location[0].LocationName);
            
            //這裡找到10筆欄位! 然後每個欄位下有每天的資料
            let forecastLocations=data.records.Locations[0].Location[0].WeatherElement;

            sendmsg('api_data2', `共找到 ${forecastLocations.length} 組預報欄位資料。`);

            var ii;
            for (ii = 0; ii < forecastLocations.length; ii++) {
                forecastLocations[0].ElementName;
                //window.alert();
                sendmsg('3darea', forecastLocations[ii].ElementName+"數據讀取中... ", 0);
                sendmsg('3darea', "取得 "+forecastLocations[ii].Time.length+" 紀錄",);
                var jj;
                for (jj = 0; jj < forecastLocations[ii].Time.length; jj++) {
                   if (forecastLocations[ii].Time[0].DataTime !== undefined) {
                      sendmsg('3darea', forecastLocations[ii].Time[jj].DataTime+'  ', 0);
                   }

                   if (forecastLocations[ii].Time[0].StartTime !== undefined) {
                      sendmsg('3darea', forecastLocations[ii].Time[jj].StartTime+' ', 0);
                   }
                   if (forecastLocations[ii].Time[0].EndTime !== undefined) {
                      sendmsg('3darea', forecastLocations[ii].Time[jj].EndTime+'  ', 0);
                   }
                   
                   if (forecastLocations[ii].ElementName == '溫度') {
                      sendmsg('3darea', forecastLocations[ii].Time[jj].ElementValue[0].Temperature+' '+jj+' ');
                   }
                   if (forecastLocations[ii].ElementName == '露點溫度') {
                      sendmsg('3darea', forecastLocations[ii].Time[jj].ElementValue[0].DewPoint+' '+jj+' ');
                   }
                   if (forecastLocations[ii].ElementName == '相對濕度') {
                      sendmsg('3darea', forecastLocations[ii].Time[jj].ElementValue[0].RelativeHumidity+' '+jj+' ');
                   }
                   if (forecastLocations[ii].ElementName == '體感溫度') {
                      sendmsg('3darea', forecastLocations[ii].Time[jj].ElementValue[0].ApparentTemperature+' '+jj+' ');
                   }
                   if (forecastLocations[ii].ElementName == '舒適度指數') {
                      sendmsg('3darea', forecastLocations[ii].Time[jj].ElementValue[0].ComfortIndex+' ', 0);
                      sendmsg('3darea', forecastLocations[ii].Time[jj].ElementValue[0].ComfortIndexDescription+' '+jj+' ');
                   }
                   if (forecastLocations[ii].ElementName == '風速') {
                      sendmsg('3darea', forecastLocations[ii].Time[jj].ElementValue[0].WindSpeed+' ', 0);
                      sendmsg('3darea', forecastLocations[ii].Time[jj].ElementValue[0].BeaufortScale+' '+jj+' ');
                   }
                   if (forecastLocations[ii].ElementName == '風向') {
                      sendmsg('3darea', forecastLocations[ii].Time[jj].ElementValue[0].WindDirection+' '+jj+' ');
                   }
                   if (forecastLocations[ii].ElementName == '3小時降雨機率') {
                      sendmsg('3darea', forecastLocations[ii].Time[jj].ElementValue[0].ProbabilityOfPrecipitation+' '+jj+' ');
                   }
                   if (forecastLocations[ii].ElementName == '天氣現象') {
                      sendmsg('3darea', forecastLocations[ii].Time[jj].ElementValue[0].Weather+' ', 0);
                      sendmsg('3darea', forecastLocations[ii].Time[jj].ElementValue[0].WeatherCode+' '+jj+' ');
                   }
                   if (forecastLocations[ii].ElementName == '天氣預報綜合描述') {
                      sendmsg('3darea', forecastLocations[ii].Time[jj].ElementValue[0].WeatherDescription+' '+jj+' ');
                   }
                }
            }


            if (forecastLocations && forecastLocations.length > 0) { // 確保 forecastLocations 是存在的並且有數據
                //window.alert('hello?');

                const numberOfRecords = forecastLocations.length; // 取得陣列的長度 

                sendmsg('api_data2', `共找到 ${numberOfRecords} 組預報欄位資料。`);
                //return '';

/// move
/// move

                sendmsg('api_data2', ' '); // 留白
                sendmsg('3darea', '(完整數據請按[F12]至Console頁面查看)<br />');
                console.log(data); // 將完整數據物件輸出到瀏覽器控制台
            } else {
                // 如果 forecastLocations 不存在或為空，表示 API 返回數據中沒有符合條件的預報地點列表
                sendmsg('3darea', `<span style="color: red;">錯誤：API 返回的預報地點資料列表為空或結構不符。請檢查參數或 API 響應。</span>`);
                console.log('API 返回的原始數據:', data);
            }
        })
        .catch(error => {
            // 捕獲任何錯誤 (例如網路問題、API 返回錯誤、解析錯誤等)
            sendmsg('api_data2', `載入氣象數據失敗: ${error.message}`);
            console.error('API 呼叫錯誤:', error);
        });
}