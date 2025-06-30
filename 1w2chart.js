function w11chart() { 
    //window.alert('...');   
    //return "";
   
   // 在這裡撰寫您的 Chart.js 繪圖程式碼 
   // 例如： 
   const ctx = document.getElementById('Chart7'); // 獲取 canvas 元素 
    
   // *** 修正點：在創建新圖表前，銷毀可能存在的舊實例 *** 
   if (Chart.getChart(ctx)) { // 檢查 Chart.js 是否已在該 canvas 上創建過圖表 
       Chart.getChart(ctx).destroy(); // 銷毀舊的圖表實例 
   } 
    
   new Chart(ctx, { 
       type: 'bar', // 圖表類型：柱狀圖 
       data: { 
           labels: _dt1, 
           datasets: [ 
////
                // *** 這裡新增了盒狀圖數據集 (參考 tt.html 的樣式) ***
                {
                    type: 'boxplot',
                    label: '溫度區間',
                    backgroundColor: _colap, // 竟然有效!! 那高低溫就不改了...
                    borderColor: 'transparent', // 無邊框
                    borderWidth: 0,
                    //medianColor: '#FF9999', // 'rgba(255, 165, 0, 0.8)', // 中位數線可以設為橘黃色，方便區分
                    data: _plot0, // <<--- 使用 _plot0 作為盒狀圖的數據源
                    // borderRadius: 80, // 想要圓角 但無效 數字 '8' 改為您想要的圓角半徑，例如 4, 6, 10 等 
                    yAxisID: 'yTemperature', // 綁定到溫度 Y 軸 (左側)
                    barPercentage: 0.3, // 盒子的相對寬度 (可以調整)
                    categoryPercentage: 0.8, // 類別間距 (可以調整)
                    order: 20, // 將盒狀圖放在最下層 (背景，Order 值越小越在下)
                },

               { // 這是第一個數據集：降雨機率 
                   label: '降雨機率', 
                   data: _prec0, 
                   backgroundColor: _colrp,
                   //最後一碼 透明度 1是不透明 
                   //borderColor: 'rgba(199, 0, 0, 1)', 
                   borderWidth: 0,  
                   borderRadius: 8, //沒用
                   yAxisID: 'yRainfall', // <--- 給右側 Y 軸一個 ID 
                   hoverBackgroundColor: _colrp,
                   hoverBorderWidth: 0, // 這樣滑鼠移過去 就不會變色
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
                   backgroundColor: _colrd7, 
                   //最後一碼 透明度 1是不透明 
                   borderColor: 'rgba(0,0,0,0)', 
                   borderWidth: 0,  
                   yAxisID: 'yRainfall', // <--- 給右側 Y 軸一個 ID 
                   z: 1,
                   order:55, // <-- 修正點：設定為 0，作為中層繪圖
                   stack: 'rainStack', // <--- 關鍵：為這組堆疊的長條圖設定一個共同的堆疊ID
                   barPercentage: 1.0, 
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
                                  // 假設 _weat7 是一個天氣描述的陣列，與 _dt1 長度相同
                                  // 您需要確保 _weat7 已經被定義和填充
                                  const weatherDescription = _weat7[dataIndex] || '無天氣描述';
                                  return ` ${weatherDescription}`; // 返回 _weat7 的內容
                              }
                              // 對於其他數據集，讓全局 Tooltip 處理（返回空字串，或返回 context.dataset.label + context.parsed.y）
                              return '';
                          }
                      }
                   }
               }, // <-- 修正：逗號是必須的，因為後面還有數據集 
    
               // ****** 新增的濕度折線圖 (綁定到右側 Y 軸) ****** 
               { // 這是第二個數據集：濕度
                   label: '濕度', 
                   data: _humi0, 
                   type: 'line', // <--- 設置為折線圖 
                   borderColor: _colh,
                   backgroundColor: 'transparent', // 不填充區域 
                   borderWidth: 2, 
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

               // ****** 新增的均溫折線圖 (綁定到左側 Y 軸) ****** 
               { // 這是第?個數據集：均溫 
                   //hidden: true, // <-- 想隱藏就改這裡 先藏起來 太多東西 干擾
                   label: '均溫', 
                   data: _tempa, 
                   type: 'line', // <--- 設置為折線圖 
                   borderColor: _cola,
                   backgroundColor: 'transparent', // 不填充區域 
                   borderWidth: 1, 
                   tension: 0.4, // 平滑曲線 
                   fill: false,  // 不填充 
                   yAxisID: 'yTemperature', // <--- 綁定到左側溫度 Y 軸 
                   pointRadius: 0, // 點的半徑大小 空心
                   pointHitRadius: 8, // 感應區保持大
                   pointBorderWidth: 1, //邊框的厚度 實心
                   pointBackgroundColor: 'rgba(0,0,0,0)', // 完全透明
                   pointHoverRadius: 3, // 懸停時點的半徑 (可以比 normal 狀態大一點，提供視覺反饋)
                   pointHoverBorderWidth: 4, // 懸停時邊框的厚度 (可以與 normal 狀態相同)
                   z: 1,
                   order: 40, // <-- 修正點：設定為 1，作為上層繪圖
               }, // <-- 修正：逗號是必須的，因為後面還有數據集 

               // ****** 新增的體感低溫折線圖 (綁定到左側 Y 軸) ****** 
               { // 這是第二個數據集：體感低溫 
                   //hidden: true, // <-- 想隱藏就改這裡
                   label: '體感低溫', 
                   data: _tempal, 
                   type: 'line', // <--- 設置為折線圖 
                   borderColor: _colal, 
                   backgroundColor: 'transparent', // 不填充區域 
                   borderWidth: 0.2, 
                   tension: 0.4, // 平滑曲線 
                   fill: false,  // 不填充 
                   yAxisID: 'yTemperature', // <--- 綁定到左側溫度 Y 軸 
                   pointStyle: 'circle',  //'rect', //
                   pointHitRadius: 8, // 感應區保持大
                   pointRadius: 6, // 點的大小
                   pointBorderColor: '#888', // 點的邊框顏色
                   pointBorderWidth: 0.5, // 點的邊框的厚度
                   pointBackgroundColor: _colalp, // 填充點的顏色(背景色)
                   pointHoverRadius: 10, // 懸停時點的大小
                   pointHoverBorderColor: '#000', // 懸停時點的邊框顏色
                   pointHoverBorderWidth: 0, // 懸停時點的邊框的厚度
                   pointHoverBackgroundColor: _colalp, // 懸停時點的點的顏色(背景色)
                   z: 1,
                   order: 12, // <-- 修正點：設定為 1，作為上層繪圖
               }, // <-- 修正：逗號是必須的，因為後面還有數據集 
    
               // ****** 新增的體感高溫折線高溫(綁定到左側 Y 軸) ****** 
               { // 這是第三個數據集：體感高溫 
                   //hidden: true, // <-- 想隱藏就改這裡
                   label: '體感高溫', 
                   data: _tempah, // 注意這裡使用的是 _temp1 
                   type: 'line', 
                   borderColor: _colah, 
                   backgroundColor: 'transparent', // 不填充區域 
                   borderWidth: 0.2, 
                   tension: 0.4, // 平滑曲線 
                   fill: false,  // 不填充 
                   yAxisID: 'yTemperature', // <--- 綁定到左側溫度 Y 軸 
                   pointStyle: 'circle',  //'rect', //
                   pointHitRadius: 8, // 感應區保持大
                   pointRadius: 6, // 點的大小
                   pointBorderColor: '#888', // 點的邊框顏色
                   pointBorderWidth: 0.5, // 點的邊框的厚度
                   pointBackgroundColor: _colahp, // 填充點的顏色(背景色)
                   pointHoverRadius: 10, // 懸停時點的大小
                   pointHoverBorderColor: '#000', // 懸停時點的邊框顏色
                   pointHoverBorderWidth: 0, // 懸停時點的邊框的厚度
                   pointHoverBackgroundColor: _colahp, // 懸停時點的點的顏色(背景色)
                   z: 1,
                   order: 14, // <-- 修正點：設定為 1，作為上層繪圖
               }, // <-- 修正：逗號是必須的，因為後面還有數據集 
    
               // ****** 新增的露點折線圖 (綁定到左側 Y 軸) ****** 
               { // 這是第四個數據集：露點 
                   label: '露點', 
                   data: _dew0, 
                   type: 'line', 
                   borderColor: _cold, // '#75542B',
                   backgroundColor: 'transparent', 
                   borderWidth: 1, 
                   tension: 0.4, 
                   fill: false, 
                   yAxisID: 'yTemperature', // <--- 綁定到左側溫度 Y 軸 
                   pointStyle: 'circle',  //'rect', //
                   pointRadius: 0, // 點的大小
                   pointHitRadius: 8, // 感應區保持大
                   //pointBorderColor: '#888', // 點的邊框顏色
                   pointBorderWidth: 0, // 0.5, // 點的邊框的厚度
                   pointBackgroundColor: _coldp, // 'rgba(0,0,0,0)', // 完全透明
                   pointHoverRadius: 5, // 懸停時點的大小
                   //pointHoverBorderColor: '#000', // 懸停時點的邊框顏色
                   pointHoverBorderWidth: 0, //.8, // 懸停時點的邊框的厚度
                   pointHoverBackgroundColor: _coldp, // 懸停時點的點的顏色(背景色)
                   z: 1,
                   order: 22, // <-- 修正點：設定為 1，作為上層繪圖
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
                       color: 'rgba(255, 255, 255, 0.6)', 
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
                       color: 'rgba(255, 255, 255, 0.6)',
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
                       color: 'rgba(255, 255, 255, 0.9)', 
                       display: false // 將此屬性設置為 false 即可隱藏 X 軸的刻度標籤
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
                    callbacks: {
                        // 移除 Tooltip 頂部的標題行 (例如移除 '17')
                        title: function(context) {
                            return []; // 返回一個空陣列，表示不顯示標題
                        },
                        
                        // 自定義每個數據集的標籤內容
                        label: function(context) {
//// 你叫我改這裡
                            let labelContent = ''; // 初始化一個變數來儲存最終的 Tooltip 內容
                            
                            // *** 根據您的建議，特別判斷如果是 'boxplot' 類型 (即溫度區間)，才套用新的邏輯 ***
                            if (context.dataset.type === 'boxplot') {
                                // 如果是盒狀圖 (溫度區間)
                                const dataPoint = context.raw; // 獲取 _plot0 中該數據點的原始物件
                                const xLabel = context.label; // 獲取 X 軸的日期/時間標籤 (例如 "25 06")

                                if (dataPoint) {
                                    const lowTemp = (dataPoint.min !== null && dataPoint.min !== undefined) ? dataPoint.min : '無資料';
                                    const highTemp = (dataPoint.max !== null && dataPoint.max !== undefined) ? dataPoint.max : '無資料';
                                    
                                    // 顯示日期/時間、高溫、低溫
                                    labelContent = `${xLabel} : 預測高溫 ${highTemp}  低溫 ${lowTemp}`; 
                                    
                                } else {
                                    labelContent = `${xLabel} : 無溫度資料`; // 如果無數據，顯示無資料
                                }
                            } else {
                                // *** 對於所有其他類型的數據集 (包括您的 'bar' 類型)，完全保留您原有的邏輯 ***
                                if (context.dataset.label && context.parsed.y !== null) {
                                    labelContent = `${context.label} : ${context.dataset.label} ${context.parsed.y}`;
                                    
                                    if (context.dataset.label === '降雨機率') {
                                        labelContent += '%';
                                    }
                                } else if (context.parsed.y !== null) {
                                    labelContent = `${context.label}. ${context.parsed.y}`;
                                }
                            }
                            // 因為 title 回調函數已經設置為 return []，這裡不需要額外處理 X 軸標籤

                            return labelContent; // 返回最終生成的 Tooltip 內容
//// eof 你叫我改這裡
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
                           //value: currentDataIndex7, // 使用找到的索引 
                           // 線畫在降雨機率方框的左側 
                           value: currentDataIndex7 - 0.5, 
                           // ******************************************** 
                           borderColor: 'rgba(255, 255, 255, 0.4)', // 白色，透明度 40% (您可以調整 0 到 1 的值) 
                           borderWidth: 1, 
                           //borderDash: [5, 5], 
                           label: { 
                               //content: '當前時間', 
                               display: (currentDataIndex7 !== -1), // 只有找到索引時才顯示標籤 
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



    
}