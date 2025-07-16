function air1() {
   //window.alert('hello');

    // 環保署
    // https://data.moenv.gov.tw/api/v2/aqx_p_432?language=zh&limit=10&api_key=bf7b6dd1-55e6-47e1-b73c-fa85366eefaf

    let _base = 'https://data.moenv.gov.tw/api/v2/aqx_p_432?language=zh&limit=10';

    // 一定要 new 一定要先截斷到 ? 之後
    let tmp1 = new URLSearchParams(window.location.search);

    // 取得 使用者傳遞進來的參數
    let key2 = removeTrailingSemicolon(tmp1.get('key2'));

    let _apiurl1 = _base  + '&api_key=' + key2 ;
    //window.alert(_apiurl1);
   //return;

    // 重點!!!
    //sendmsg('3darea', '正在從氣象局 API 載入資料...'); // 假設你有一個 id 為 'api_dataa' 的元素來顯示數據

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
            //sendmsg('3darea', '資料載入成功！');

            //sendmsg('api_dataa', data.records.Locations[0].DatasetDescription);
            //sendmsg('api_dataa', '預報地點: ', 0);
            //sendmsg('api_dataa', data.records.Locations[0].LocationsName+' ', 0);
            //sendmsg('api_dataa', data.records.Locations[0].Location[0].LocationName);
            
            //這裡可以找到10組欄位! 然後每個欄位下有每天的資料
            let airLocations=data.records;

            if (airLocations && airLocations.length > 0) { // 確保 airLocations 是存在的並且有數據
                //window.alert('hello?');

                const numberOfRecords = airLocations.length; // 取得陣列的長度 
                //window.alert(numberOfRecords);
                //return;

               // sendmsg('3darea', `共找到 ${numberOfRecords} 組預報欄位資料`);
                //return '';

               var _found= 0;
               var ii;
               for (ii = 0; ii < airLocations.length; ii++) {
                   //sendmsg('api_dataa',  airLocations[ii].sitename+"... ", 0);
/// move
                  if ( airLocations[ii].sitename == '新店' ) {
                     _found= 1;
                     
                     var _tmp1='';
                     sendmsg('api_dataa',  '觀測地點: '+airLocations[ii].county+" "+airLocations[ii].sitename, 1);
                     sendmsg('api_dataa',  '空氣品質指標值: '+airLocations[ii].aqi, 1);
                     sendmsg('api_dataa',  '狀態: '+airLocations[ii].status, 1);
                     sendmsg('api_dataa',  '空氣污染指標物: '+airLocations[ii].pollutant, 1);
                     sendmsg('api_dataa',  '風速: '+toDir(airLocations[ii].wind_direc)+' ('+airLocations[ii].wind_direc+') '+(airLocations[ii].wind_speed*3.6).toFixed(2)+' km/h', 1);
                     sendmsg('api_dataa',  '發布時間: '+airLocations[ii].publishtime, 1);
                     sendmsg('api_dataa',  '', 1);
                     _tmp1=_tmp1+ "<table style='text-align: left;'>";
                     _tmp1=_tmp1+ "<thead>";
                     _tmp1=_tmp1+ "<tr>";
                     _tmp1=_tmp1+ "<th class='air1'> </th>";
                     _tmp1=_tmp1+ "<th class='air1'>污染物</th>";
                     _tmp1=_tmp1+ "<th class='air1'>小時濃度</th>";
                     _tmp1=_tmp1+ "<th class='air1'>移動平均</th>";
                     _tmp1=_tmp1+ "<th class='air1'> 標準 - 普通</th>";
                     _tmp1=_tmp1+ "</ tr>";
                     _tmp1=_tmp1+ "</ thead>";
                     
                     _tmp1=_tmp1+ "<tbody>";

                     _tmp1=_tmp1+ "<tr>";
                     _tmp1=_tmp1+ "<td class='air1'>臭氧</td>";
                     _tmp1=_tmp1+ "<td class='air1'>O3 (ppb)</td>";
                     _tmp1=_tmp1+ "<td class='air1'>"+airLocations[ii].o3+"</td>";
                     _tmp1=_tmp1+ "<td class='air1'>"+airLocations[ii].o3_8hr+"</td>";
                     _tmp1=_tmp1+ "<td class='air1'>54 - 70</td>";
                     _tmp1=_tmp1+ "</tr>";

                     _tmp1=_tmp1+ "<tr>";
                     _tmp1=_tmp1+ "<td class='air1'>細懸浮微粒</td>";
                     _tmp1=_tmp1+ "<td class='air1'>PM2.5 (μg/m3)</td>";
                     _tmp1=_tmp1+ "<td class='air1'>"+airLocations[ii]["pm2.5"]+"</td>";
                     _tmp1=_tmp1+ "<td class='air1'>"+airLocations[ii]["pm2.5_avg"]+"</td>";
                     _tmp1=_tmp1+ "<td class='air1'>12.4 - 30.4</td>";
                     _tmp1=_tmp1+ "</tr>";

                     _tmp1=_tmp1+ "<tr>";
                     _tmp1=_tmp1+ "<td class='air1'>懸浮微粒</td>";
                     _tmp1=_tmp1+ "<td class='air1'>PM10 (μg/m3)</td>";
                     _tmp1=_tmp1+ "<td class='air1'>"+airLocations[ii].pm10+"</td>";
                     _tmp1=_tmp1+ "<td class='air1'>"+airLocations[ii].pm10_avg+"</td>";
                     _tmp1=_tmp1+ "<td class='air1'>30 - 75</td>";
                     _tmp1=_tmp1+ "</tr>";

                     _tmp1=_tmp1+ "<tr>";
                     _tmp1=_tmp1+ "<td class='air1'>一氧化碳</td>";
                     _tmp1=_tmp1+ "<td class='air1'>CO (ppm)</td>";
                     _tmp1=_tmp1+ "<td class='air1'>"+airLocations[ii].co+"</td>";
                     _tmp1=_tmp1+ "<td class='air1'>"+airLocations[ii].co_8hr+"</td>";
                     _tmp1=_tmp1+ "<td class='air1'>4.4 - 9.4</td>";
                     _tmp1=_tmp1+ "</tr>";

                     _tmp1=_tmp1+ "<tr>";
                     _tmp1=_tmp1+ "<td class='air1'>二氧化硫</td>";
                     _tmp1=_tmp1+ "<td class='air1'>SO2 (ppb)</td>";
                     _tmp1=_tmp1+ "<td class='air1'>"+airLocations[ii].so2+"</td>";
                     _tmp1=_tmp1+ "<td class='air1'>"+airLocations[ii].so2_avg+"</td>";
                     _tmp1=_tmp1+ "<td class='air1'>8 - 65</td>";
                     _tmp1=_tmp1+ "</tr>";

                     _tmp1=_tmp1+ "<tr>";
                     _tmp1=_tmp1+ "<td class='air1'>二氧化氮</td>";
                     _tmp1=_tmp1+ "<td class='air1'>NO2 (ppb)</td>";
                     _tmp1=_tmp1+ "<td class='air1'>"+airLocations[ii].no2+"</td>";
                     _tmp1=_tmp1+ "<td class='air1'>-- </td>";
                     _tmp1=_tmp1+ "<td class='air1'>22 - 100</td>";
                     _tmp1=_tmp1+ "</tr>";

                     _tmp1=_tmp1+"</tbody>" ;
                     _tmp1=_tmp1+ "</table>";
                     sendmsg('api_dataa', _tmp1 ,1);
                     //sendmsg('api_dataa', '定義參考來源: 環境部 空氣品質監測網 ' ,1);
                     //sendmsg('api_dataa', 'https://airtw.moenv.gov.tw/CHT/Information/Standard/AirQualityIndicatorNew.aspx' ,1);
                     
                  }
/// move
               }

               if ( _found == 0 ) {
                  sendmsg('api_dataa',  "觀測站資料讀取失敗!", 1);
                  sendmsg('api_dataa',  _apiurl1, 1);
               }

            } else {
                // 如果 airLocations 不存在或為空，表示 API 返回數據中沒有符合條件的預報地點列表
                sendmsg('3darea', `<span style="color: red;">錯誤：API 返回的預報地點資料列表為空或結構不符。請檢查參數或 API 響應。</span>`);
                console.log('API 返回的原始數據:', data);
            }
        })
        .catch(error => {
            // 捕獲任何錯誤 (例如網路問題、API 返回錯誤、解析錯誤等)
            sendmsg('api_dataa', `載入氣象數據失敗: ${error.message}`);
            console.error('API 呼叫錯誤:', error);
        });

      data=null;
}


