
function getSunMoon(_date, _time, _lati, _long) {
//window.alert('這裡');

  // 組合日期和時間字串，並建立 Date 物件
  const dateTimeString = `${_date}T${_time}`;
  const targetDateTime = new Date(dateTimeString);

  // 檢查日期物件是否有效
  if (isNaN(targetDateTime.getTime())) {
    console.error("錯誤：日期或時間格式無效。");
    return JSON.stringify({
      status: "error",
      message: "無效的日期或時間參數。"
    });
  }

  // 檢查經緯度是否為有效數字
  if (typeof _lati !== 'number' || typeof _long !== 'number' || isNaN(_lati) || isNaN(_long)) {
    console.error("錯誤：緯度或經度無效。");
    return JSON.stringify({
      status: "error",
      message: "無效的緯度或經度參數。"
    });
  }

  // 取得太陽相關時間 (這些是針對一整天的事件，不受精確時間點影響)
  const sunTimes = SunCalc.getTimes(targetDateTime, _lati, _long);
  // 取得太陽位置 (這是針對 `targetDateTime` 精確時間點的位置)
  const sunPosition = SunCalc.getPosition(targetDateTime, _lati, _long);
  // 取得月亮相關時間 (一整天的事件)
  const moonTimes = SunCalc.getMoonTimes(targetDateTime, _lati, _long);
  // 取得月亮位置 (針對 `targetDateTime` 精確時間點的位置)
  const moonPosition = SunCalc.getMoonPosition(targetDateTime, _lati, _long);
  // 取得月相資訊 (針對 `targetDateTime` 當天)
  const moonIllumination = SunCalc.getMoonIllumination(targetDateTime);

  // 輔助函數：格式化 Date 物件為 HH:MM 字串
  const formatTime = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) {
      return null;
    }
    return dateObj.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // 輔助函數：將弧度轉換為度數 (回傳數字型態)
  const toDegrees = (radians) => {
    return (radians * 180 / Math.PI); // 不使用 toFixed()
  };

  // 輔助函數：計算時間長度 (HH:MM)
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return null;
    }
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${String(diffHours).padStart(2, '0')}:${String(diffMinutes).padStart(2, '0')}`;
  };

  // 輔助函數：判斷月相名稱 (8 種) 和編號 (00-16 共 17 種)
  const getMoonPhaseInfo = (phase) => {
    let name = "未知";
    let code = "00";

    // --- 計算月相編號 (00-16，基於 Math.round(phase * 16)) ---
    const phaseIndex = Math.round(phase * 16);
    // 確保 phaseIndex 不會超過 16 (理論上 Math.round(1*16) = 16，但以防萬一)
    const clampedPhaseIndex = Math.min(phaseIndex, 16);
    code = String(clampedPhaseIndex).padStart(2, '0'); // 格式化為兩位數字串

    // --- 判斷月相名稱 (維持最初的 8 種區間定義) ---
    if (phase < 0.03 || phase >= 0.97) {
      name = "新月";
    } else if (phase >= 0.03 && phase < 0.22) {
      name = "眉月";
    } else if (phase >= 0.22 && phase < 0.28) {
      name = "上弦月";
    } else if (phase >= 0.28 && phase < 0.47) {
      name = "盈凸月";
    } else if (phase >= 0.47 && phase < 0.53) {
      name = "滿月";
    } else if (phase >= 0.53 && phase < 0.72) {
      name = "虧凸月";
    } else if (phase >= 0.72 && phase < 0.78) {
      name = "下弦月";
    } else if (phase >= 0.78 && phase < 0.97) {
      name = "殘月";
    }

    return {
      name: name,
      code: code
    };
  };

  // 判斷南北半球
  const hemisphere = _lati >= 0 ? "Nor" : "Sou";

  // 計算日長
  const dayLength = calculateDuration(sunTimes.sunrise, sunTimes.sunset);

  // 計算月長和月亮可見性狀態
  let moonLengthCalculated = null;
  let moonVisibilityStatus = "正常";

  if (moonTimes.alwaysUp) {
    moonVisibilityStatus = "整日可見";
    moonLengthCalculated = null; // 或者您可以設定為 '24:00' 如果需要
  } else if (moonTimes.alwaysDown) {
    moonVisibilityStatus = "整日不可見";
    moonLengthCalculated = null; // 或者您可以設定為 '00:00' 如果需要
  } else {
    moonLengthCalculated = calculateDuration(moonTimes.rise, moonTimes.set);
  }

  // 獲取月相名稱和編號
  const moonPhaseInfo = getMoonPhaseInfo(moonIllumination.phase);


  // 建構結果物件
  const resultData = {
    "日期": _date,
    "時間": _time,
    "日期時間": targetDateTime.toISOString(),
    "緯度": _lati,
    "經度": _long,
    "半球": hemisphere,
    "sun": {
      "日出": formatTime(sunTimes.sunrise),
      "日落": formatTime(sunTimes.sunset),
      "日長": dayLength,
      "正午": formatTime(sunTimes.solarNoon),
      "曙光": formatTime(sunTimes.dawn),
      "黃昏": formatTime(sunTimes.dusk),
      "黃金時段結束": formatTime(sunTimes.goldenHourEnd),
      "黃金時段開始": formatTime(sunTimes.goldenHour),
      "夜晚": formatTime(sunTimes.night),
      "高度角": toDegrees(sunPosition.altitude),
      "方位角": toDegrees(sunPosition.azimuth)
    },
    "moon": {
      "月出": formatTime(moonTimes.rise),
      "月落": formatTime(moonTimes.set),
      "狀態": moonVisibilityStatus, // 新增：月長狀態 (正常, 整日可見, 整日不可見)
      "月長": moonLengthCalculated, // 新增：HH:MM 格式的月長，非正常情況為 null
      "被照亮比例": moonIllumination.fraction.toFixed(2),
      "月相進程": moonIllumination.phase,
      "月相": moonPhaseInfo.name,
      "月相編號": moonPhaseInfo.code,
      "高度角": toDegrees(moonPosition.altitude),
      "方位角": toDegrees(moonPosition.azimuth)
    }
  };
  // 將物件轉換為 JSON 字串並回傳
  return JSON.stringify(resultData, null, 2);
}

function atos0(_num) {
    let angle = parseFloat(_num); // 將輸入轉換為浮點數，接受數字和字串
    
    // 檢查轉換後的角度是否是有效數字
    if (isNaN(angle)) {
        return "無效角度";
    }

    // 將角度正規化到 0 到 360 度之間
    // 讓 -61.92 變成 298.08
    angle = (angle % 360 + 360) % 360;

    // 定義主方位和次方位
    const directions = [
        "正北方", "北偏東", "東北方", "東偏北", // 0 - 90
        "正東方", "東偏南", "東南方", "南偏東", // 90 - 180
        "正南方", "南偏西", "西南方", "西偏南", // 180 - 270
        "正西方", "西偏北", "西北方", "北偏西"  // 270 - 360
    ];

    // 每個主/次方位之間的度數間隔是 360 / 16 = 22.5 度
    const interval = 22.5;

    // 計算索引
    // 為了處理邊界，特別是 0 度和 360 度都指向正北方，
    // 我們可以將角度加上 interval / 2 後再進行計算，
    // 這樣 0 度到 11.25 度會對應到第一個索引。
    const index = Math.floor((angle + interval / 2) / interval);

    // 處理特殊情況，當角度非常接近 360 時，index 可能會是 16
    // 為了讓 359.x 仍對應到 正北方 (index 0) 或 北偏西 (index 15)，
    // 我們讓 index 模 16。
    const finalIndex = index % 16;

    // 精細化到 32 個方位 (每個 interval 再細分為兩半)
    // 每個 11.25 度為一個單位
    const subInterval = 11.25;

    // 計算更精細的索引
    const fineIndex = Math.floor((angle + subInterval / 2) / subInterval);
    
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

    // 處理 32 個方位，確保索引落在 0-31 之間
    const finalFineIndex = (fineIndex % 32 + 32) % 32;

    return fineDirections[finalFineIndex];
}