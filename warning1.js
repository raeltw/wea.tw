function warning1() {
   //window.alert('hello');
   //return;
   // 這裡的區域是寫死的
   // &locationName=新北市,台北市 如果有傳進來(指定)的 affectedAreas值就不為零

   // /v1/rest/datastore/W-C0033-001 天氣特報-各別縣市地區目前之天氣警特報情形
   // 這個只有標題 沒有內容

   // /v1/rest/datastore/W-C0033-002 天氣特報-各別天氣警特報之內容及所影響之區域
   // 新北市
   // affectedAreas	{…} 可以傳值進去 如果符合 這就有長度!!
   // https://opendata.cwa.gov.tw/api/v1/rest/datastore/W-C0033-002?Authorization=???&locationName=新北市,台北市

   // /v1/rest/datastore/W-C0034-005 颱風消息與警報-熱帶氣旋路徑
   // "路徑" 太難....

    let _base = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/W-C0033-002';

    // 一定要 new 一定要先截斷到 ? 之後
    let tmp1 = new URLSearchParams(window.location.search);

    // 取得 使用者傳遞進來的參數
    let key = removeTrailingSemicolon(tmp1.get('key'));

    let _apiurl1 = _base  + '?Authorization=' + key ;
    // +'&locationName=新北市,台北市,新北市山區,台北市山區' 改成不傳 自己判斷
    //window.alert(_apiurl1);
   //return;

    // 重點!!!
    //sendmsg('3darea', '正在從氣象局 API 載入資料...'); // 假設你有一個 id 為 'api_dataw' 的元素來顯示數據

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

            //sendmsg('api_dataw', data.records.Locations[0].DatasetDescription);
            //sendmsg('api_dataw', '預報地點: ', 0);
            //sendmsg('api_dataw', data.records.Locations[0].LocationsName+' ', 0);
            //sendmsg('api_dataw', data.records.Locations[0].Location[0].LocationName);
            
            //這裡可以找到10組欄位! 然後每個欄位下有每天的資料
            let warLocations=data.records.record;

            //window.alert(warLocations.length);
            //return;


            if (warLocations && warLocations.length > 0) { // 確保 warLocations 是存在的並且有數據
                //window.alert('hello?');

                const numberOfRecords = warLocations.length; // 取得陣列的長度 
                //window.alert(numberOfRecords);
                //return;

               // sendmsg('3darea', `共找到 ${numberOfRecords} 組預報欄位資料`);
                //return '';

               var ii;
               for (ii =warLocations.length- 1; ii >= 0; ii--) {
/// move
                     var _tmp1='';
                     var jj;
                     for (jj =0; jj < warLocations[ii].hazardConditions.hazards.hazard[0].info.affectedAreas.location.length; jj++) {
                        //sendmsg('api_dataw',  ' '+warLocations[ii].hazardConditions.hazards.hazard[0].info.affectedAreas.location[jj].locationName, 0);
                        _tmp1=_tmp1+' '+warLocations[ii].hazardConditions.hazards.hazard[0].info.affectedAreas.location[jj].locationName;
                     }
                     // sendmsg('api_dataw',  _tmp1, 0);
                     var _tmp2='<span';
                     if ( _tmp1.includes("新北") || _tmp1.includes("臺北") || _tmp1.includes("台北") ) {
                        _tmp2=_tmp2+" style='color: #dd0;'";
                     }
                     _tmp2=_tmp2+'>';
         
                     //sendmsg('api_dataw',  ' '+, 0);
                     _tmp2=_tmp2+warLocations[ii].datasetInfo.datasetDescription;
                     //sendmsg('api_dataw',  ' '+, 0);
                     _tmp2=_tmp2+' '+warLocations[ii].datasetInfo.validTime.startTime.substring(8, 16);
                     //sendmsg('api_dataw',  , 1);
                     _tmp2=_tmp2+' - '+warLocations[ii].datasetInfo.validTime.endTime.substring(8, 16);
                     _tmp2=_tmp2+'<br />';
                     //sendmsg('api_dataw',  _tmp1, 0);
                     
                     //sendmsg('api_dataw',  ' '+, 1);
                     _tmp2=_tmp2+modistr1(warLocations[ii].contents.content.contentText);
                     _tmp2=_tmp2+'</span><br />';
                     sendmsg('api_dataw',  _tmp2, 1);
                     //sendmsg('api_dataw',  "<div style='clear: both;'></div>", 1);
/// move
               }


            } else {
                 sendmsg('api_dataw',  '無警/特報資料!', 1);
                 sendmsg('api_dataw',  '', 1);

                // 如果 warLocations 不存在或為空，表示 API 返回數據中沒有符合條件的預報地點列表
                //sendmsg('3darea', `<span style="color: red;">錯誤：API 返回的預報地點資料列表為空或結構不符。請檢查參數或 API 響應。</span>`);
                //console.log('API 返回的原始數據:', data);
            }
        })
        .catch(error => {
            // 捕獲任何錯誤 (例如網路問題、API 返回錯誤、解析錯誤等)
            sendmsg('api_dataw', `載入氣象數據失敗: ${error.message}`);
            console.error('API 呼叫錯誤:', error);
        });

      data=null;
}


function modistr1(_str1) {
  let result = _str1;

  // 1. 字串中如果有 '\n'，把 '\n' 前後的空白都去掉，包括全形空白
  // 這裡使用正則表達式來匹配 '\n' 前後的所有空白字元 (包括半形和全形空白)
  // \s 匹配任何空白字元 (空格、tab、換行等)
  // \u3000 是全形空白的 Unicode 編碼
  // g 表示全域匹配，i 表示不區分大小寫 (雖然這裡不影響)
  result = result.replace(/[\s\u3000]*\n[\s\u3000]*/g, '\n');

  // 2. 字串首尾如果是 '\n' 全部去掉
  // 這裡使用 trim() 來移除首尾空白字元，但為了確保只移除 '\n'，
  // 可以更精確地使用正則表達式
  // ^\n+ 匹配開頭的一個或多個換行符
  // \n+$ 匹配結尾的一個或多個換行符
  result = result.replace(/^\n+/, '').replace(/\n+$/, '');

  // 3. 字串中如果還有 '\n' 置換成 '<br />'
  result = result.replace(/\n/g, '<br />');

  return result;
}

f