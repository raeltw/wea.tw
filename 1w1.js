function w11() {

   
    // 氣象局 1周預報
    // wea3.html?key=CWA-422C592A-18E7-4C2E-BBD2-003CCC1F18D4;&rep7=071;&town1=新店區;
    //https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-071?Authorization=CWA-422C592A-18E7-4C2E-BBD2-003CCC1F18D4&LocationName=%E6%96%B0%E5%BA%97%E5%8D%80

    let _base = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-';

    // 一定要 new 一定要先截斷到 ? 之後
    let tmp1 = new URLSearchParams(window.location.search);

    // 取得 使用者傳遞進來的參數
    let key1 = removeTrailingSemicolon(tmp1.get('key'));
    let rep7 = removeTrailingSemicolon(tmp1.get('rep7'));
    let town1 = removeTrailingSemicolon(tmp1.get('town1'));

    //sendmsg('1warea', _base);
    //sendmsg('1warea', key1);
    //sendmsg('1warea', rep7);
    //sendmsg('1warea', town1);

    let _apiurl1 = _base + rep7 + '?Authorization=' + key1 + '&LocationName=' + town1;

    tmp2 = makeA('(原始連結)', _apiurl1);
    //window.alert(tmp2);
    sendmsg('1warea', tmp2, 0);
    sendmsg('1warea', ' ' + _apiurl1);
    
    // 重點!!!
    sendmsg('1warea', '正在從氣象局 API 載入資料...'); // 假設你有一個 id 為 'api_data7' 的元素來顯示數據

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
            sendmsg('1warea', '資料載入成功！');

            // 根據氣象局 API 的 JSON 結構來解析數據並顯示
            // F-D0047-XXX (鄉鎮未來3天_逐3小時預報) 的常見結構
            // 數據路徑通常是 data.records.locations[0].location[0] 或類似

            //let forecastLocations = null;
            //// 更穩健地檢查路徑，確保每一層都存在
            //if (data && data.records && Array.isArray(data.records.locations) && data.records.locations.length > 0 && data.records.locations[0].location && Array.isArray(data.records.locations[0].location)) {
            //    forecastLocations = data.records.locations[0].location;
            //}

            //window.alert('');
            //報表名稱
            //sendmsg('api_data7', data.records.Locations[0].DatasetDescription);
            sendmsg('api_data7', '預報地點: ', 0);
            sendmsg('api_data7', data.records.Locations[0].LocationsName+' ', 0);
            sendmsg('api_data7', data.records.Locations[0].Location[0].LocationName);
            
            //這裡可以找到15組欄位! 然後每個欄位下有每天的資料
            let forecastLocations=data.records.Locations[0].Location[0].WeatherElement;

            if (forecastLocations && forecastLocations.length > 0) { // 確保 forecastLocations 是存在的並且有數據
                //window.alert('hello?');

                const numberOfRecords = forecastLocations.length; // 取得陣列的長度 

                sendmsg('api_data7', `共找到 ${numberOfRecords} 組預報欄位資料`);
                //return '';

/// move
               var _first= 1;
               
               var ii;
               for (ii = 0; ii < forecastLocations.length; ii++) {
                   //forecastLocations[0].ElementName;
                   //window.alert();
                   //sendmsg('1warea', '');
                   //sendmsg('1warea', forecastLocations[ii].ElementName+"數據讀取中... ", 0);
                   sendmsg('1warea', forecastLocations[ii].ElementName+"... ", 0);
                   sendmsg('1warea', "取得 "+forecastLocations[ii].Time.length+" 紀錄");
                   if (_first==1) {
                      //window.alert('第一次');
                      _first= 0;
                      _hi0=[]; _dt0=[]; _dt1=[]; _temph=[]; _templ=[]; _tempa=[]; _dew0=[]; _humi0=[]; _prec0=[]; _descl=[]; _weat0=[]; _weat1=[]; _comf0=[]; _plot0=[];
                      // 日期0(原始), 日期1(精簡), 高溫, 低溫, 均溫, 露點溫度, 相對濕度, 降雨機率
                   }
                   var jj;
                   for (jj = 0; jj < forecastLocations[ii].Time.length; jj++) {
                      if (forecastLocations[ii].Time[0].StartTime !== undefined) {
                        // sendmsg('1warea', forecastLocations[ii].Time[jj].StartTime+'  ', 0);
                            if ( _dt0.length < (jj+1) ) {
                               _hi0[jj]=100;
                               _dt0[jj]=forecastLocations[ii].Time[jj].StartTime.replace('T', '-').substring(0, 13);
                               //window.alert();
                               //sendmsg('api_data7', '新增陣列 '+jj+' '+_dt0[jj]);
                           }
                      }

                      if (forecastLocations[ii].Time[0].StartTime !== undefined) {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].StartTime+' ', 0);
                      }
                      if (forecastLocations[ii].Time[0].EndTime !== undefined) {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].EndTime+'  ', 0);
                      }
                   
                      if (forecastLocations[ii].ElementName == '平均溫度') {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].Temperature+' '+jj+' ');
                         _tempa[jj]=forecastLocations[ii].Time[jj].ElementValue[0].Temperature;
                      }
                      if (forecastLocations[ii].ElementName == '最高溫度') {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].MaxTemperature+' '+jj+' ');
                         _temph[jj]=forecastLocations[ii].Time[jj].ElementValue[0].MaxTemperature;
                      }
                      if (forecastLocations[ii].ElementName == '最低溫度') {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].MinTemperature+' '+jj+' ');
                        _templ[jj]=forecastLocations[ii].Time[jj].ElementValue[0].MinTemperature;
                      }
                      if (forecastLocations[ii].ElementName == '平均露點溫度') {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].DewPoint+' '+jj+' ');
                         _dew0[jj]=forecastLocations[ii].Time[jj].ElementValue[0].DewPoint
                      }

                      if (forecastLocations[ii].ElementName == '平均相對濕度') {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].RelativeHumidity+' '+jj+' ');
                         _humi0[jj]=forecastLocations[ii].Time[jj].ElementValue[0].RelativeHumidity;
                      }
                      if (forecastLocations[ii].ElementName == '最高體感溫度') {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].MaxApparentTemperature+' '+jj+' ');
                         //_temp1[jj]=forecastLocations[ii].Time[jj].ElementValue[0].MaxApparentTemperature;
                      }
                      if (forecastLocations[ii].ElementName == '最低體感溫度') {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].MinApparentTemperature+' '+jj+' ');
                         //_temp1[jj]=forecastLocations[ii].Time[jj].ElementValue[0].MinApparentTemperature;
                      }
                      if (forecastLocations[ii].ElementName == '最大舒適度指數') {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].MaxComfortIndex+' ', 0);
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].MaxComfortIndexDescription+' '+jj+' ');
                         _comf0[jj]=forecastLocations[ii].Time[jj].ElementValue[0].MaxComfortIndexDescription;
                      }
                      if (forecastLocations[ii].ElementName == '最小舒適度指數') {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].MinComfortIndex+' ', 0);
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].MinComfortIndexDescription+' '+jj+' ');
                         if  ( _comf0[jj] != forecastLocations[ii].Time[jj].ElementValue[0].MinComfortIndexDescription )  {
                             _comf0[jj]=forecastLocations[ii].Time[jj].ElementValue[0].MinComfortIndexDescription+'-'+_comf0[jj];
                         }
                      }
                      if (forecastLocations[ii].ElementName == '風速') {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].WindSpeed+' ', 0);
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].BeaufortScale+' '+jj+' ');
                      }
                      if (forecastLocations[ii].ElementName == '風向') {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].WindDirection+' '+jj+' ');
                      }
                      if (forecastLocations[ii].ElementName == '12小時降雨機率') {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].ProbabilityOfPrecipitation+' '+jj+' ');
                         //_prec0[jj]=forecastLocations[ii].Time[jj].ElementValue[0].ProbabilityOfPrecipitation;
                         _prec0[jj] = forecastLocations?.[ii]?.Time?.[jj]?.ElementValue?.[0]?.ProbabilityOfPrecipitation ?? 0;
                         //有可能是 '-' 沒預測吧?
                      }
                      if (forecastLocations[ii].ElementName == '天氣現象') {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].Weather+' ', 0);
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].WeatherCode+' '+jj+' ');
                         _weat0[jj]=forecastLocations[ii].Time[jj].ElementValue[0].Weather;
                      }
                      if (forecastLocations[ii].ElementName == '紫外線指數') {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].UVIndex+' ', 0);
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].UVExposureLevel+' '+jj+' ');
                         //這是只有白天 要用就要算位置
                      }
                      if (forecastLocations[ii].ElementName == '天氣預報綜合描述') {
                         //sendmsg('1warea', forecastLocations[ii].Time[jj].ElementValue[0].WeatherDescription+' '+jj+' ');
                         _descl[jj]=forecastLocations[ii].Time[jj].ElementValue[0].WeatherDescription;
                      }
                   }
               }
/// move

                //檢查陣列 同時產生 _dt1 所以不能整段mark掉!!
                sendmsg('1warea', '欄位處理完畢！');
                //sendmsg('1warea', '長日期 [短日期] 高溫, 低溫, 均溫, 露點. 濕度: 降雨-');
                //sendmsg('1warea', '_dt0 [_dt1] _temph, _templ, _tempa,_dew0. _humi0: _prec0- _descl');
      // 日期0(原始), 日期1(精簡), 高溫, 低溫, 均溫, 露點溫度, 相對濕度, 降雨機率


                _tmp1="  ";
                var _dd, _hh; 
                currentDataIndex = -1; 
                const now = new Date(); 
                const currentDD = String(now.getDate()).padStart(2, '0'); 
                const currentHH = String(now.getHours()).padStart(2, '0'); 
                //sendmsg('1warea', 'current DD HH '+currentDD+' '+currentHH);
   
                for (jj = 0; jj < _dt0.length; jj++) {
                   _dd=_dt0[jj].substring(8, 10);
                   // 第8位開始取 第10位不算!!
                   _hh=_dt0[jj].substring(11, 13);

                   if ( (currentDD >= _dd) && (currentHH >= _hh) ) {
                      currentDataIndex= jj
                      //sendmsg('1warea', 'currentDataIndex 1 '+currentDataIndex);
                      //sendmsg('1warea', '*** ', 0);
                   }

                   _dt1[jj]='';
                   if ( _tmp1 !== _dd ) {
                      _tmp1=_dd;
                      _dt1[jj]=_dd;
                   }
                   _dt1[jj]=_dt1[jj]+' '+_hh;

                   //sendmsg('1warea', ' D:'+_dd+' ', 0);
                   //sendmsg('1warea', ' H:'+_hh+' ', 0);

                   //sendmsg('1warea', ' '+_dt0[jj]+' ', 0);
                   //sendmsg('1warea', '['+_dt1[jj]+'] ', 0);
                   //sendmsg('1warea', _temph[jj]+', ', 0);
                   //sendmsg('1warea', _templ[jj]+', ', 0);
                   //sendmsg('1warea', _tempa[jj]+', ', 0);

                  _plot0[jj]=createBoxplotData(_templ[jj], _temph[jj]);
                  //sendmsg('1warea', _plot0[jj]+'! ', 0);
                   //sendmsg('1warea', _dew0[jj]+'.. ', 0);
                   //sendmsg('1warea', _humi0[jj]+': ', 0);
                   //sendmsg('1warea', _prec0[jj]+'- ', 0);
                   //sendmsg('1warea', _weat0[jj]+'\\ ', 0);
                   //sendmsg('1warea', _comf0[jj]+'\\\\ ', 0);
                   //sendmsg('1warea', _descl[jj]+' ', 0);

                   //sendmsg('1warea', jj);
                   //做最後組合 在圖表上使用
                   _weat1[jj]=_dt1[jj]+' : '+_weat0[jj]+' | '+_comf0[jj];
                   //sendmsg('1warea', _weat0[jj]+' ');
                }

                ///在最後終於要畫圖
                w11chart();
     
                //不要浪費記憶體
                //sendmsg('1warea', '(完整數據請按[F12]至Console頁面查看)<br />');
                //console.log(data); // 將完整數據物件輸出到瀏覽器控制台
            } else {
                // 如果 forecastLocations 不存在或為空，表示 API 返回數據中沒有符合條件的預報地點列表
                sendmsg('1warea', `<span style="color: red;">錯誤：API 返回的預報地點資料列表為空或結構不符。請檢查參數或 API 響應。</span>`);
                console.log('API 返回的原始數據:', data);
            }
        })
        .catch(error => {
            // 捕獲任何錯誤 (例如網路問題、API 返回錯誤、解析錯誤等)
            sendmsg('api_data7', `載入氣象數據失敗: ${error.message}`);
            console.error('API 呼叫錯誤:', error);
        });

}