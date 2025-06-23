function d31chart() { 
    
   //備註 
   // 陣列如果不要全部用上 要自己切 
   // const labelsForChart = _dt1_full.slice(0, 30); // 從索引 0 開始，到索引 30 (不包含) 
    
   // 250622 我上層已經有了
   //// 獲取當前時間 
   //const now = new Date(); 
   //// 根據您 _dt0 的格式，生成一個匹配當前時間的完整字串 
   //// 例如：'2025-06-21-21' (年-月-日-時) 
   //const currentYear = now.getFullYear(); 
   //const currentMonth = String(now.getMonth() + 1).padStart(2, '0'); 
   //const currentDay = String(now.getDate()).padStart(2, '0'); 
   //const currentHour = String(now.getHours()).padStart(2, '0'); 
    //
   //// 生成與 _dt0 格式完全匹配的當前時間字串 
   //const currentTimeString = `${currentYear}-${currentMonth}-${currentDay}-${currentHour}`; 
    //
   //// 在 _dt0 陣列中尋找這個時間字串的索引 
   //let currentDataIndex = _dt0.indexOf(currentTimeString); 
   //sendmsg('3darea', 'currentDataIndex 2  '+currentDataIndex);
    
    // 250622 這檢查就留著 
   // 檢查是否找到有效的索引 
   if (currentDataIndex === -1) { 
       // console.warn(`未能在 _dt0 中找到匹配當前時間的數據點。直線可能不會顯示。`); 
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
                   borderWidth: 0,  
                   yAxisID: 'yRainfall', // <--- 給右側 Y 軸一個 ID 
                   z: 1,
                   order:50, // <-- 修正點：設定為 0，作為中層繪圖
                    //maxBarThickness: 50, // <--- 設置最大寬度為 50 像素 (您可以根據需要調整這個值)
                    stack: 'rainStack', // <--- 關鍵：為這組堆疊的長條圖設定一個共同的堆疊ID
                   barPercentage: 1.0, 
                   categoryPercentage: 0.9,
               }, // <-- 修正：逗號是必須的，因為後面還有數據集 

               { // 這是第0個數據集：我想偷藏一個
                   label: '天氣', 
                   data: _hi0,
                   //讓每小時的背景變色 在這裡傳顏色的陣列
                   //backgroundColor: _darkside, 
                   backgroundColor: 'rgba(4,4,4,1)', 
                   //最後一碼 透明度 1是不透明 
                   borderColor: 'rgba(0,0,0,0)', 
                   borderWidth: 0,  
                   yAxisID: 'yRainfall', // <--- 給右側 Y 軸一個 ID 
                   z: 1,
                   order:55, // <-- 修正點：設定為 0，作為中層繪圖
                   stack: 'rainStack', // <--- 關鍵：為這組堆疊的長條圖設定一個共同的堆疊ID
                   barPercentage: 0.7, 
                   categoryPercentage: 0.9,

                   // *** 關鍵：自定義這個堆疊層的 Tooltip ***
                  tooltip: {
                      font: {
                         size: 15, 
                         weight: 'normal',
                      },
                      callbacks: {
                          label: function(context) {
                              // 將判斷條件從 '天氣描述' 改為 '天氣'
                              if (context.dataset.label === '天氣') {
                                  const dataIndex = context.dataIndex;
                                  // 假設 _weat3 是一個天氣描述的陣列，與 _dt1 長度相同
                                  // 您需要確保 _weat3 已經被定義和填充
                                  const weatherDescription = _weat3[dataIndex] || '無天氣描述';
                                  return ` ${weatherDescription}`; // 返回 _weat3 的內容
                              }
                              // 對於其他數據集，讓全局 Tooltip 處理（返回空字串，或返回 context.dataset.label + context.parsed.y）
                              return '';
                          }
                      }
                   }
               }, // <-- 修正：逗號是必須的，因為後面還有數據集 
    
               // ****** 新增的濕度折線圖 (綁定到右側 Y 軸) ****** 
               { // 這是第?個數據集：濕度 
                   label: '濕度', 
                   data: _humi0, 
                   type: 'line', // <--- 設置為折線圖 
                   borderColor: '#034081', 
                   backgroundColor: 'transparent', // 不填充區域 
                   borderWidth: 1, 
                   tension: 0.4, // 平滑曲線 
                   fill: false,  // 不填充 
                   yAxisID: 'yRainfall', // <--- 綁定到右側溫度 Y 軸 
                   pointRadius: 0, // 點的半徑大小 空心
                   pointHitRadius: 8, // 感應區保持大
                   pointBorderWidth: 1, //邊框的厚度 實心
                   pointBackgroundColor: 'rgba(0,0,0,0)', // 完全透明
                   pointHoverRadius: 3, // 懸停時點的半徑 (可以比 normal 狀態大一點，提供視覺反饋)
                   pointHoverBorderWidth: 4, // 懸停時邊框的厚度 (可以與 normal 狀態相同)
                   z: 1,
                   order: 40, // <-- 修正點：設定為 1，作為上層繪圖
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
                   pointRadius: 0.5, //2, // 點的半徑大小 空心
                   pointHitRadius: 8, // 感應區保持大
                   pointBorderWidth: 1, //邊框的厚度 實心
                   pointBackgroundColor: 'rgba(0,0,0,0)', // 完全透明
                   pointHoverRadius: 3, // 懸停時點的半徑 (可以比 normal 狀態大一點，提供視覺反饋)
                   pointHoverBorderWidth: 4, // 懸停時邊框的厚度 (可以與 normal 狀態相同)
                   z: 1,
                   order: 11, // <-- 修正點：設定為 1，作為上層繪圖
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
                   pointRadius: 0.5, //2, // 點的半徑大小 空心
                   pointHitRadius: 8, // 感應區保持大
                   pointBorderWidth: 1, //邊框的厚度 實心
                   pointBackgroundColor: 'rgba(0,0,0,0)', // 完全透明
                   pointHoverRadius: 3, // 懸停時點的半徑 (可以比 normal 狀態大一點，提供視覺反饋)
                   pointHoverBorderWidth: 4, // 懸停時邊框的厚度 (可以與 normal 狀態相同)
                   z: 1,
                   order: 12, // <-- 修正點：設定為 1，作為上層繪圖
               }, // <-- 修正：逗號是必須的，因為後面還有數據集 
    
               // ****** 新增的露點折線圖 (綁定到左側 Y 軸) ****** 
               { // 這是第四個數據集：露點 
                   label: '露點', 
                   data: _dew0, 
                   type: 'line', 
                   borderColor: '#75542B',
                   backgroundColor: 'transparent', 
                   borderWidth: 1, 
                   tension: 0.4, 
                   fill: false, 
                   yAxisID: 'yTemperature', // <--- 綁定到左側溫度 Y 軸 
                   pointRadius: 0, // 點的半徑大小 空心
                   pointHitRadius: 8, // 感應區保持大
                   pointBorderWidth: 1, //邊框的厚度 實心
                   pointBackgroundColor: 'rgba(0,0,0,0)', // 完全透明
                   pointHoverRadius: 3, // 懸停時點的半徑 (可以比 normal 狀態大一點，提供視覺反饋)
                   pointHoverBorderWidth: 4, // 懸停時邊框的厚度 (可以與 normal 狀態相同)
                   z: 1,
                   order: 13, // <-- 修正點：設定為 1，作為上層繪圖
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
                       color: 'rgba(255, 255, 255, 0.8)', 
                       stepSize: 20, // 設定步長為 20
                   }, 
                   stacked: true, // <--- 關鍵：啟用 Y 軸堆疊
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
                       color: 'rgba(255, 255, 255, 0.8)',
                       stepSize: 10, // 設定步長為 20 
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
           maintainAspectRatio: false,
           plugins: { 

                // === START: 修正後的通用 Tooltip 配置 (只顯示單一數據點) ===
                tooltip: {
                bodyFont: {
                size: 15,
                weight: 'normal',
              },
                    // 修正核心：設置為 'nearest' 模式，只顯示最接近鼠標的數據點
                    mode: 'nearest',    
                    // 修正核心：設置為 true，Toolip 只在鼠標直接與數據點/元素相交時觸發
                    intersect: true,    
                    
                    displayColors: false, // 繼續禁用 Tooltip 中每個標籤旁邊的小色塊
                    //yAlign: 'bottom', // <--- 將 Tooltip 對齊到觸發點的底部 這會讓 Tooltip 顯示在長條的下方，而不是上方

///
///


                    
                    callbacks: {
                        // 移除 Tooltip 頂部的標題行 (例如移除 '17')
                        title: function(context) {
                            return []; // 返回一個空陣列，表示不顯示標題
                        },
                        
                        // 自定義每個數據集的標籤內容
                        label: function(context) {
                            let labelContent = '';
                            
                            // context.label: 這是 X 軸的標籤 (例如 '17' 或 '2025-06-22 17:00')
                            // context.dataset.label: 這是您數據集的 'label' 屬性定義的名稱 (例如 '降雨機率', '溫度')
                            // context.parsed.y: 這是數據點的數值 (例如 50, 25)
                            
                            // 這裡的邏輯保持不變，因為它已經能正確組合單個數據點的資訊
                            if (context.dataset.label && context.parsed.y !== null) {
                                labelContent = `${context.label} : ${context.dataset.label} ${context.parsed.y}`;
                                
                                if (context.dataset.label === '降雨機率') {
                                    labelContent += '%';
                                }
                            } else if (context.parsed.y !== null) {
                                labelContent = `${context.label}. ${context.parsed.y}`;
                            }
                            
                            return labelContent; // 返回組合後的單行內容
                        },
                        
                        // 確保主標籤之後不會生成額外的行
                        afterLabel: function() { return null; },
                        footer: function() { return null; }
                    }
                },
                // === END: 修正後的通用 Tooltip 配置 ===

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

                       // ****** 使用迴圈動態生成水平虛線 ******
                      // 首先，定義您所有需要標示的百分比（數值）
                      ...[20, 40, 60, 80].reduce((acc, value) => {
                          const id = `threshold${value}`; // 動態生成一個唯一的 ID，例如 "threshold20"
                          acc[id] = {
                              type: 'line',
                              mode: 'horizontal',
                              scaleID: 'yRainfall', // 綁定到右側降雨機率 Y 軸
                              value: value,         // 使用當前迭代的數值
                              borderColor: 'rgba(255, 255, 255, 0.3)', // 淺灰色、半透明
                              borderWidth: 1,
                              borderDash: [5, 5],   // 虛線效果
                              z: -1, // <-- 新增：設定 z 屬性為 -1，讓它繪製在數據集之下
                             order: -50, 
                              label: {
                                  content: `${value}%`, // 顯示對應的百分比
                                  enabled: true,
                                  position: 'end',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  font: {
                                      size: 10
                                  }
                              }
                          };
                          return acc;
                      }, {})
                      // ****************************************
                
                   } 
               } 
           }  
           // ************************************************************************** 
       } 
   }); 


// 長條圖的寬度
// barPercentage
//    作用： 決定單個長條佔用其可用空間（即「柱狀類別」的空間）的百分比。
//    預設值： 0.9 (即 90%)
//    解釋： 如果設定為 1.0，長條會佔滿整個類別空間，長條之間就沒有間距了。如果設定為 0.5，則長條只佔一半的空間，看起來會更細。
// categoryPercentage
//    作用： 決定長條類別（即一組長條）佔用其可用空間的百分比。
//    預設值： 0.8 (即 80%)
//    解釋： 這個設定會影響每個 X 軸標籤下所有長條（包括多個數據集）的總寬度。

        // 折線圖設定參考
        // === START: 這裡是要修改的點的樣式和感應區 ===
        //pointRadius: 0, // 設置為 0，默認情況下節點不可見
        //pointHoverRadius: 8, // 鼠標懸停時，節點會變大（可見）
        //pointHitRadius: 15, // Tooltip 的感應半徑（非常重要，使其感應區變大）
        //pointBorderWidth: 0, // 節點邊框寬度為 0
        //pointBackgroundColor: 'rgba(0,0,0,0)', // 節點背景色完全透明
        //pointHoverBackgroundColor: 'rgba(255, 99, 132, 0.5)', // 懸停時，顯示一個半透明的點
        //pointHoverBorderColor: 'rgba(255, 99, 132, 1)', // 懸停時，顯示一個邊框
        // === END: 點的樣式和感應區 ===

 //z 與 order
//想像 Chart.js 的繪圖區域像一層一層的玻璃板。
//    你把 z: -1 的東西放在最底下的玻璃板上。
//    然後你把 z: 0 (默認值) 的東西放在第二層玻璃板上。
//    最後你把 z: 1 的東西放在最上面的玻璃板上。
//從頂上往下看，你就會看到 z: 1 遮住 z: 0，z: 0 遮住 z: -1。
//所以，數值越小，層次越低。數值越大，層次越高。
//而order恰恰相反
//(未測試) 說 z優先判斷 然後同一組z的再判斷order
   
}