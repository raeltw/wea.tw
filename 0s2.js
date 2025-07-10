function s1() {
   //window.alert('hello');

    // 氣象局 日出
    
    // w253.html?key=CWB-A0E4FCC7-9BF5-4ABB-A778-3DB913641D8D;&station1=466881;&rep3=069;&rep7=071;&city1=新北市;&town1=新店區;
    //?&limit=1&CountyName=新北市&Date=2025-07-10

    var _base = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/A-B0062-001';

    // 一定要 new 一定要先截斷到 ? 之後
    var tmp1 = new URLSearchParams(window.location.search);

    // 取得 使用者傳遞進來的參數
    var key1 = removeTrailingSemicolon(tmp1.get('key'));
    var city1 = removeTrailingSemicolon(tmp1.get('city1'));

    var _today = new Date();
    _today = _today.getFullYear().toString().padStart(4, '0')+'-'+(_today.getMonth() + 1).toString().padStart(2, '0')+'-'+_today.getDate().toString().padStart(2, '0');
    //window.alert(_today);
    //return ;

    var _apiurl1 = _base+ '?Authorization=' + key1 + '&limit=1&CountyName=' + city1 + '&Date='+_today;
    //window.alert(_apiurl1);
    //return ;

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
             //window.alert('hello');
            // API 數據成功獲取後，在這裡處理並顯示
            //sendmsg('3darea', '資料載入成功！');

            var _tmp1=data.records.locations.location[0].time[0];

           //window.alert(_tmp1.Date);
           //return ;

           sendmsg('sun_data0', `日出: ${_tmp1.SunRiseTime}`, 0);
           sendmsg('sun_data0', ` ${toDir(_tmp1.SunRiseAZ)} (${_tmp1.SunRiseAZ})`);
           sendmsg('sun_data0', `日過中天: ${_tmp1.SunTransitTime}`, 0);
           sendmsg('sun_data0', ` (${_tmp1.SunTransitAlt})`);
           sendmsg('sun_data0', `日落: ${_tmp1.SunSetTime}`, 0);
           sendmsg('sun_data0', ` ${toDir(_tmp1.SunSetAZ)} (${_tmp1.SunSetAZ})`);
           sendmsg('sun_data0', `日長: ${calcdura(_tmp1.SunRiseTime, _tmp1.SunSetTime)}`);
           sendmsg('sun_data0', ``);

           sendmsg('sun_data0', `黎明: ${_tmp1.BeginCivilTwilightTime}`);
           sendmsg('sun_data0', `黃昏: ${_tmp1.EndCivilTwilightTime}`);
        })
        .catch(error => {
            // 捕獲任何錯誤 (例如網路問題、API 返回錯誤、解析錯誤等)
            sendmsg('api_data3', `載入氣象數據失敗: ${error.message}`);
            console.error('API 呼叫錯誤:', error);
        });

      data=null;

/// ------------------------
    // 氣象局 月出
    
    var _base = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/A-B0063-001';

    // 一定要 new 一定要先截斷到 ? 之後
    var tmp1 = new URLSearchParams(window.location.search);

    // 取得 使用者傳遞進來的參數
    var key1 = removeTrailingSemicolon(tmp1.get('key'));
    var city1 = removeTrailingSemicolon(tmp1.get('city1'));

    var _today = new Date();
    _today = _today.getFullYear().toString().padStart(4, '0')+'-'+(_today.getMonth() + 1).toString().padStart(2, '0')+'-'+_today.getDate().toString().padStart(2, '0');
    //window.alert(_today);
    //return ;

    var _apiurl1 = _base+ '?Authorization=' + key1 + '&limit=1&CountyName=' + city1 + '&Date='+_today;
    //window.alert(_apiurl1);
    //return ;

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
             //window.alert('hello');
            // API 數據成功獲取後，在這裡處理並顯示
            //sendmsg('3darea', '資料載入成功！');

            var _tmp1=data.records.locations.location[0].time[0];

           //window.alert(_tmp1.Date);
           //return ;

           //https://www.cwa.gov.tw/Data/astronomy/moon/20250710.jpg
           //偷用氣象局的月亮
           var _today = new Date();
           _today = _today.getFullYear().toString().padStart(4, '0')+(_today.getMonth() + 1).toString().padStart(2, '0')+_today.getDate().toString().padStart(2, '0');
           //_today = '20250701';

           //20250710
           sendmsg('moon_data0', "<img style='filter: sepia(50%) saturate(100%); float:right; width: 128px;' src='https://www.cwa.gov.tw/Data/astronomy/moon/"+_today+".jpg'>", 0 );

           sendmsg('moon_data0', `月出: ${_tmp1.MoonRiseTime}`, 0);
           sendmsg('moon_data0', ` ${toDir(_tmp1.MoonRiseAZ)} (${_tmp1.MoonRiseAZ})`);
           sendmsg('moon_data0', `月過中天: ${_tmp1.MoonTransitTime}`, 0);
           sendmsg('moon_data0', ` (${_tmp1.MoonTransitAlt})`);
           sendmsg('moon_data0', `月落: ${_tmp1.MoonSetTime}`, 0);
           sendmsg('moon_data0', ` ${toDir(_tmp1.MoonSetAZ)} (${_tmp1.MoonSetAZ})`);
           sendmsg('moon_data0', `月長: ${calcdura(_tmp1.MoonRiseTime, _tmp1.MoonSetTime)}`);
           sendmsg('moon_data0', ``);

           //sendmsg('sun_data0', `黎明: ${_tmp1.BeginCivilTwilightTime}`);
           //sendmsg('sun_data0', `黃昏: ${_tmp1.EndCivilTwilightTime}`);
        })
        .catch(error => {
            // 捕獲任何錯誤 (例如網路問題、API 返回錯誤、解析錯誤等)
            sendmsg('api_data3', `載入氣象數據失敗: ${error.message}`);
            console.error('API 呼叫錯誤:', error);
        });

      data=null;


}

function calcdura(_start, _end) {
    // 檢查輸入是否為 null, undefined 或空字串
    if (!_start || typeof _start !== 'string' || !_end || typeof _end !== 'string') {
        return '---';
    }

    // 驗證 HH:MM 格式的正規表達式
    const timeRegex = /^(?:2[0-3]|[01]?[0-9]):(?:[0-5]?[0-9])$/;

    if (!timeRegex.test(_start) || !timeRegex.test(_end)) {
        return '---'; // 格式不符合 HH:MM
    }

    // 將 HH:MM 字串解析為分鐘數
    const parseTimeToMinutes = (timeStr) => {
        const parts = timeStr.split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        return hours * 60 + minutes;
    };

    let startMinutes = parseTimeToMinutes(_start);
    let endMinutes = parseTimeToMinutes(_end);

    let durationMinutes;

    // 判斷是否跨日
    if (endMinutes < startMinutes) {
        // 如果結束時間小於開始時間，表示跨日了
        // 例如：_start = "22:00", _end = "02:00"
        // 計算到午夜的時長 + 從午夜到結束的時長
        durationMinutes = (24 * 60 - startMinutes) + endMinutes;
    } else {
        // 沒有跨日
        durationMinutes = endMinutes - startMinutes;
    }

    // 將總分鐘數轉換回 HH:MM 格式
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    // 格式化為兩位數
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
}

function toDir(_AZ) {
    const fineDirections = [
        "正北方", "北北東", // 0 - 22.5
        "東北偏北", "東北方", // 22.5 - 45
        "東北偏東", "東南東", // 45 - 67.5
        "東偏北", "正東方", // 67.5 - 90

        "東偏南", "東南東", // 90 - 112.5 (這裡指的是偏向東南的東方)
        "東南偏東", "東南方", // 112.5 - 135
        "東南偏南", "南南東", // 135 - 157.5
        "南偏東", "正南方", // 157.5 - 180

        "南偏西", "南南西", // 180 - 202.5
        "西南偏南", "西南方", // 202.5 - 225
        "西南偏西", "西西南", // 225 - 247.5
        "西偏南", "正西方", // 247.5 - 270

        "西偏北", "西北西", // 270 - 292.5
        "西北偏西", "西北方", // 292.5 - 315
        "西北偏北", "北北西", // 315 - 337.5
        "北偏西", "正北方" // 337.5 - 360 (與開始的北重疊)
    ];

    // 如果 _AZ 是 null 或 undefined，返回 '---'
    if (_AZ === null || typeof _AZ === 'undefined') {
        return '---';
    }

    // 將輸入轉換為數字
    let az = parseFloat(_AZ);

    // 檢查是否是有效的數字
    if (isNaN(az)) {
        return '---';
    }

    // 處理負數角度，將其轉換為 0 到 360 之間的正數
    while (az < 0) {
        az += 360;
    }
    // 處理大於 360 的角度
    az = az % 360;

    // 計算索引
    // 每個方向區間是 360 / 32 = 11.25 度
    // fineDirections 陣列有 32 個元素，每個代表一個 11.25 度的範圍
    // 所以我們將角度除以 11.25 來得到對應的索引
    let index = Math.round(az / 11.25);

    // 確保索引在陣列範圍內 (0 到 31)
    if (index >= fineDirections.length) {
        index = 0; // 360 度會回到正北方
    }

    return fineDirections[index];
}
