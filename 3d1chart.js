function d31chart() { 
    
   //備註 
   // 陣列如果不要全部用上 要自己切 
   // const labelsForChart = _dt1_full.slice(0, 30); // 從索引 0 開始，到索引 30 (不包含) 
    
   // 獲取當前時間 
   const now = new Date(); 
   // 根據您 _dt0 的格式，生成一個匹配當前時間的完整字串 
   // 例如：'2025-06-21-21' (年-月-日-時) 
   const currentYear = now.getFullYear(); 
   const currentMonth = String(now.getMonth() + 1).padStart(2, '0'); 
   const currentDay = String(now.getDate()).padStart(2, '0'); 
   const currentHour = String(now.getHours()).padStart(2, '0'); 
    
   // 生成與 _dt0 格式完全匹配的當前時間字串 
   const currentTimeString = `${currentYear}-${currentMonth}-${currentDay}-${currentHour}`; 
    
   // 在 _dt0 陣列中尋找這個時間字串的索引 
   let currentDataIndex = _dt0.indexOf(currentTimeString); 
    
   // 檢查是否找到有效的索引 
   if (currentDataIndex === -1) { 
       console.warn(`未能在 _dt0 中找到匹配當前時間 (${currentTimeString}) 的數據點。直線可能不會顯示。`); 
       // 如果找不到精確匹配，您可以考慮以下策略： 
       // 1. 找最接近的時間點索引 
       // 2. 如果不需要精確到小時，可以只匹配到日，然後取該日的第一個或最後一個小時 
       // 3. 直接不畫線 
       // 為了範例，我們這裡假設如果找不到就讓 currentLine 註釋不顯示。 
   } 
    
   // 在這裡撰寫您的 Chart.js 繪圖程式碼 
   // 例如： 
   const ctx = document.getElementById('Chart3'); // 獲取 canvas 元素 
    
   // *** 修正點：在創建新圖表前，銷毀可能存在的舊實例 *** 
   if (Chart.getChart(ctx)) { // 檢查 Chart.js 是否已在該 canvas 上創建過圖表 
       Chart.getChart(ctx).destroy(); // 銷毀舊的圖表實例 
   } 
    
   new Chart(ctx, { 
       type: 'bar', // 圖表類型：柱狀圖 
       data: { 
           labels: _dt1, 
           datasets: [ 
               { // 這是第一個數據集：降雨機率 
                   label: '降雨機率', 
                   data: _prec0, 
                   backgroundColor: 'rgba(0, 147, 193, 1)', 
                   //最後一碼 透明度 1是不透明 
                   borderColor: 'rgba(0, 147, 193, 1)', 
                   borderWidth: 1,  
                   yAxisID: 'yRainfall', // <--- 給右側 Y 軸一個 ID 
               }, // <-- 修正：逗號是必須的，因為後面還有數據集 
    
               // ****** 新增的溫度折線圖 (綁定到左側 Y 軸) ****** 
               { // 這是第二個數據集：溫度 
                   label: '溫度', 
                   data: _temp0, 
                   type: 'line', // <--- 設置為折線圖 
                   borderColor: '#FF9900', // 橙色 
                   backgroundColor: 'transparent', // 不填充區域 
                   borderWidth: 2, 
                   tension: 0.4, // 平滑曲線 
                   fill: false,  // 不填充 
                   yAxisID: 'yTemperature', // <--- 綁定到左側溫度 Y 軸 
                   pointRadius: 0, // 數據點半徑為 3 像素 
               }, // <-- 修正：逗號是必須的，因為後面還有數據集 
    
               // ****** 新增的體感溫度折線圖 (綁定到左側 Y 軸) ****** 
               { // 這是第三個數據集：體感溫度 
                   label: '體感溫度', 
                   data: _temp1, // 注意這裡使用的是 _temp1 
                   type: 'line', 
                   borderColor: '#FF4D40', // 紅橙色 
                   backgroundColor: 'transparent', 
                   borderWidth: 2, 
                   tension: 0.4, 
                   fill: false, 
                   yAxisID: 'yTemperature', // <--- 綁定到左側溫度 Y 軸 
                   pointRadius: 0, // 數據點半徑為 3 像素 
               }, // <-- 修正：逗號是必須的，因為後面還有數據集 
    
               // ****** 新增的露點折線圖 (綁定到左側 Y 軸) ****** 
               { // 這是第四個數據集：露點 
                   label: '露點', 
                   data: _dew0, 
                   type: 'line', 
                   borderColor: '#D2B48C', // 淺褐色 
                   backgroundColor: 'transparent', 
                   borderWidth: 2, 
                   tension: 0.4, 
                   fill: false, 
                   yAxisID: 'yTemperature', // <--- 綁定到左側溫度 Y 軸 
                   pointRadius: 0, // 數據點半徑為 3 像素 
               } // <-- 修正：這是最後一個數據集，後面沒有逗號 
               // ************************************************** 
           ] 
       }, 
       options: { 
           scales: { 
               // ****** 修正：將原有的 'y' 軸更名為 'yRainfall' 並添加顏色設定 ****** 
               yRainfall: { // <--- 原來的 'y' 軸現在請命名為 'yRainfall' 
                   position: 'right',  
                   beginAtZero: true, // 確保從 0 開始，這與 min: 0 效果相似，但明確指定更佳 
                   // ****** 新增這兩行來固定 Y 軸範圍 ****** 
                   min: 0,   // Y 軸最小值 
                   max: 100, // Y 軸最大值 
                   // **************************************** 
                   title: { 
                       display: false,  // 右側Y軸說明
                       text: '降雨機率 (%)'  
                   }, 
                   grid: { // 新增：增加格線顏色，讓它在黑背景下可見 
                       //color: 'rgba(255, 255, 255, 0.1)'  
                   }, 
                   ticks: { // 新增：增加刻度文字顏色 
                       color: 'rgba(255, 255, 255, 0.8)' 
                   } 
               }, // end of yRainfall 
    
               // ****** 新增：左側的 Y 軸 (溫度) ****** 
               yTemperature: { // <--- 新的 Y 軸 ID，用於溫度相關數據 
                   position: 'left', // <--- 放置在左側 
                   beginAtZero: false, // 溫度不一定從 0 開始，所以設為 false 
                   min: 0,   // <-- 最小值 
                   max: 50,  // <-- 最大值 
                   title: { 
                       display: false,  // 左側Y軸說明
                       text: '溫度 (°C)' // <-- 標題 
                   }, 
                   grid: { // 新增：增加格線顏色 
                       //color: 'rgba(255, 255, 255, 0.1)' 
                   }, 
                   ticks: { // 新增：增加刻度文字顏色 
                       color: 'rgba(255, 255, 255, 0.8)' 
                   } 
               }, // end of yTemperature 
    
               // ****** 修正：X 軸添加顏色設定 ****** 
               x: { 
                   offset: true,  
                   title: { 
                       display: false, // 下方X軸時間點說明
                       text: '日期 時間' 
                   }, 
                   grid: { // 新增：增加 X 軸格線顏色 
                       //color: 'rgba(255, 255, 255, 0.1)' 
                   }, 
                   ticks: { // 新增：增加 X 軸刻度文字顏色 
                       color: 'rgba(255, 255, 255, 0.8)' 
                   } 
               } // end of x 
           }, // end of scales 
    
           // ****** 修正點：將 responsive 和 plugins 移到這裡，與 scales 同層級 ****** 
           // 跟瀏覽器說 讓圖表「跟著容器一起變大變小」 
           responsive: true,  
           plugins: { 
               // ****** 修正：標題文字顏色 ****** 
               title: { 
                   display: false, 
                   text: '新店區 3 小時降雨機率預報', // 可以更改總標題，以反映更多數據 
                   color: 'white', // 新增：標題文字顏色 
               }, 
               // ****** 修正：圖例文字顏色 ****** 
               legend: { 
                   display: false, // 改這裡 就能隱藏或顯示 圖例說明
                   position: 'top', 
                   labels: { 
                       color: 'white' // 新增：圖例文字顏色 
                   } 
               }, 
               annotation: { 
                   annotations: { 
                       currentLine: { 
                           type: 'line', 
                           mode: 'vertical', 
                           scaleID: 'x', 
                           // ****** 關鍵修正：直接傳遞索引值給 value ****** 
                           // 線畫在降雨機率方框的中間 
                           //value: currentDataIndex, // 使用找到的索引 
                           // 線畫在降雨機率方框的左側 
                           value: currentDataIndex - 0.5, 
                           // ******************************************** 
                           borderColor: 'rgba(255, 255, 255, 0.2)', // 白色，透明度 40% (您可以調整 0 到 1 的值) 
                           borderWidth: 1, 
                           //borderDash: [5, 5], 
                           label: { 
                               //content: '當前時間', 
                               display: (currentDataIndex !== -1), // 只有找到索引時才顯示標籤 
                               position: 'start',  
                               color: 'red', 
                               font: { 
                                   size: 12, 
                                   weight: 'bold' 
                               } 
                           } 
                       }, 
    
                       // ****** 新增的水平虛線定義 (並修正 scaleID) ****** 
                       threshold20: { // 獨特的 ID 
                           type: 'line', 
                           mode: 'horizontal', // 水平線 
                           scaleID: 'yRainfall', // <-- 修正：綁定到右側降雨機率 Y 軸！ 
                           value: 20,           // 數值是 Y 軸上的 20 
                           borderColor: 'rgba(255, 255, 255, 0.3)', // 淺灰色、半透明 
                           borderWidth: 1, 
                           borderDash: [5, 5], // 虛線效果 
                           label: { 
                               content: '20%', // 線旁邊的文字 
                               enabled: true,  // 顯示標籤 
                               position: 'end', // 標籤位置 
                               color: 'rgba(255, 255, 255, 0.6)', // 標籤顏色 
                               font: { 
                                   size: 10 
                               } 
                           } 
                       }, 
                       threshold40: { 
                           type: 'line', 
                           mode: 'horizontal', 
                           scaleID: 'yRainfall', // <-- 修正：綁定到右側降雨機率 Y 軸！ 
                           value: 40, 
                           borderColor: 'rgba(255, 255, 255, 0.3)', 
                           borderWidth: 1, 
                           borderDash: [5, 5], 
                           label: { 
                               content: '40%', 
                               enabled: true, 
                               position: 'end', 
                               color: 'rgba(255, 255, 255, 0.6)', 
                               font: { 
                                   size: 10 
                               } 
                           } 
                       }, 
                       threshold60: { 
                           type: 'line', 
                           mode: 'horizontal', 
                           scaleID: 'yRainfall', // <-- 修正：綁定到右側降雨機率 Y 軸！ 
                           value: 60, 
                           borderColor: 'rgba(255, 255, 255, 0.3)', 
                           borderWidth: 1, 
                           borderDash: [5, 5], 
                           label: { 
                               content: '60%', 
                               enabled: true, 
                               position: 'end', 
                               color: 'rgba(255, 255, 255, 0.6)', 
                               font: { 
                                   size: 10 
                               } 
                           } 
                       }, 
                       threshold80: { 
                           type: 'line', 
                           mode: 'horizontal', 
                           scaleID: 'yRainfall', // <-- 修正：綁定到右側降雨機率 Y 軸！ 
                           value: 80, 
                           borderColor: 'rgba(255, 255, 255, 0.3)', 
                           borderWidth: 1, 
                           borderDash: [5, 5], 
                           label: { 
                               content: '80%', 
                               enabled: true, 
                               position: 'end', 
                               color: 'rgba(255, 255, 255, 0.6)', 
                               font: { 
                                   size: 10 
                               } 
                           } 
                       } 
                       // **************************************** 
                   } 
               } 
           }  
           // ************************************************************************** 
       } 
   }); 
    
}