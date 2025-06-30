// customChartAxis.js

const hiddenCalculator = document.getElementById('hidden-text-width-calculator');

function getTextWidth(text) {
    if (!hiddenCalculator) {
        console.error("Error: '#hidden-text-width-calculator' element not found. Please ensure it's in your HTML.");
        // 在找不到計算器時返回一個估計值，並取整
        return Math.round(text.length * 7); 
    }
    
    hiddenCalculator.textContent = text;
    // 將 getTextWidth 的結果也取整，因為它用於計算寬度，進而影響位置判斷
    return Math.round(hiddenCalculator.offsetWidth); 
}

/**
 * 自定義繪製 Chart.js 圖表下方的 X 軸日期和時間標籤。
 * 該函數會根據 Chart.js 圖表的數據點位置，在指定的容器內創建並定位自定義標籤。
 *
 * @param {string} chartId - Chart.js canvas 元素的 ID。
 * @param {string} xAxisContainerId - 外部 X 軸標籤容器 div 的 ID。
 * @param {string} dateOrder - 日期和時間的顯示順序 ('U' 為 HH在上DD在下靠上對齊, 'B' 為 DD在上HH在下靠下對齊)。
 * @param {string[]} dateArray - 原始的YYYY-MM-DD-HH 格式日期字串陣列。
 * @param {number} skipInterval - 顯示間隔 (0 為全部顯示，1 為跳一個顯示，以此類推)。
 * @param {number} [verticalOffsetFromChartBottom=0] - 自定義 X 軸標籤容器 (紅色方塊) 距離 Chart.js 圖表底部邊緣的垂直偏移量 (px)。正數向下，負數向上。
 */
function writedh(chartId, xAxisContainerId, dateOrder, dateArray, skipInterval, verticalOffsetFromChartBottom = 0) {
    const chart = Chart.getChart(chartId); 
    if (!chart) {
        console.error(`writedh error: Chart with ID '${chartId}' not found. Ensure the chart is initialized before calling writedh.`);
        return;
    }

    const xAxisLabelsContainer = document.getElementById(xAxisContainerId);
    if (!xAxisLabelsContainer) {
        console.error(`writedh error: X-axis container with ID '${xAxisContainerId}' not found.`);
        return;
    }

    // === 關鍵修正：計算紅色方塊的 top 位置 ===
    // 獲取 Chart.js canvas 元素的矩形資訊
    const chartCanvas = chart.canvas;
    const chartRect = chartCanvas.getBoundingClientRect(); // 獲取 canvas 在視口中的位置
    
    // 獲取父容器 (通常是 .chart-container) 的矩形資訊，作為相對定位的基準
    // 我們假設 .x-axis-labels-container 是 position: absolute; 且其父元素 (chart-container) 是 position: relative;
    const parentContainer = xAxisLabelsContainer.parentElement; 
    if (!parentContainer) {
        console.error(`writedh error: Parent container for '${xAxisContainerId}' not found.`);
        return;
    }
    const parentRect = parentContainer.getBoundingClientRect();

    // 計算紅色方塊的 top 位置：Chart 的底部位置 - 父容器的 top 位置 + 期望的垂直偏移量
    // 這裡的計算需要是相對於父容器的 'top'
    const newTopPosition = (chartRect.bottom - parentRect.top) + verticalOffsetFromChartBottom;
    xAxisLabelsContainer.style.top = `${Math.round(newTopPosition)}px`;
    // ===========================================

    xAxisLabelsContainer.innerHTML = ''; // 清空容器內的舊標籤，準備重新繪製

    let lastDisplayedDateRightEdge = 0; // 上一個顯示標籤的右邊緣，用於避免重疊
    let lastDisplayedDay = null;        // 上一次顯示的日期，用於判斷是否需要顯示日期 (DD)

    const minSpacingBetweenLabels = 5;  // 標籤之間的最小間距 (像素)
    const fullWidthSpace = '　';        // 用於佔位的全形空白字元，確保空間一致

    dateArray.forEach((fullDateString, index) => { // 遍歷每個日期數據點
        if (skipInterval !== 0 && index % (skipInterval + 1) !== 0) {
            return; 
        }

        const stringParts = fullDateString.split('-'); 
        const yearPart = stringParts[0];
        const monthPart = stringParts[1];
        const dayPart = stringParts[2];
        const timePart = stringParts[3]; 
        
        const datePart = `${yearPart}-${monthPart}-${dayPart}`;
        const currentDay = dayPart; 

        // === 關鍵修正：使用 chart.getDatasetMeta(0).data[index].x 獲取精確的 X 座標 ===
        let xPos = 0; 
        // 確保數據集存在且有足夠的數據點 
        if (chart.getDatasetMeta(0) && chart.getDatasetMeta(0).data[index]) { 
            xPos = Math.round(chart.getDatasetMeta(0).data[index].x); // === 修正: 取整 ===

            // ====== 臨時調試用：彈出 xPos 值 ======
            // 建議只在第一個圖表 Chart3 上啟用，且只彈出幾個點的值，以免過多彈窗
            // if (chartId === 'Chart3' && index < 5) { // 例如只看前5個點
            //     window.alert(`ChartID: ${chartId}, Index: ${index}, xPos: ${xPos}`);
            // }
            // ===================================
        } else { 
            // 如果無法獲取精確位置，退回使用 getPixelForValue 
            xPos = Math.round(chart.scales.x.getPixelForValue(index)); // === 修正: 取整 ===

            // 如果這裡也需要微調，同樣操作
        }
        // =========================================================================
        
        let displayDayInLabel = false; 
        if (currentDay !== lastDisplayedDay) { 
            displayDayInLabel = true; 
        }
        
        let line1Text = ''; 
        let line2Text = ''; 
        
        if (dateOrder === 'U') { // HH在上DD在下 (靠頂部對齊) 
            line1Text = timePart || fullWidthSpace; // 時間部分，如果為空則用全形空白佔位 
            if (displayDayInLabel) { 
                line2Text = currentDay || fullWidthSpace; // 日期部分，如果為空則用全形空白佔位 
            } else { 
                line2Text = fullWidthSpace; // 如果不需要顯示日期，用全形空白佔位 
            }
        } else { // 'B' 為 DD在上HH在下 (靠底部對齊) 
            if (displayDayInLabel) { 
                line1Text = currentDay || fullWidthSpace; // 日期部分，如果為空則用全形空白佔位 
            } else { 
                line1Text = fullWidthSpace; // 如果不需要顯示日期，用全形空白佔位 
            }
            line2Text = timePart || fullWidthSpace; // 時間部分，如果為空則用全形空白佔位 
        }

        // 計算當前標籤的內容寬度 (取兩行中最寬的)，並取整
        const currentLabelContentWidth = Math.round(Math.max(getTextWidth(line1Text), getTextWidth(line2Text))); // === 修正: 取整 ===
        // 計算當前標籤的左邊緣位置，並取整
        const currentLabelLeftEdge = Math.round(xPos - (currentLabelContentWidth / 2)); // === 修正: 取整 ===

        // 判斷是否應該顯示當前標籤，避免標籤重疊
        let shouldDisplayLabel = false; 
        if (currentLabelLeftEdge > lastDisplayedDateRightEdge + minSpacingBetweenLabels) { 
            shouldDisplayLabel = true; 
        }
        
        if (shouldDisplayLabel) { 
            const labelWrapper = document.createElement('div');
            labelWrapper.className = 'x-axis-label';
            labelWrapper.style.left = `${xPos}px`; // 將標籤的 `left` 位置設定為數據點的中心 X 座標 

            const span1 = document.createElement('span');
            span1.className = 'line1';
            span1.textContent = line1Text;
            labelWrapper.appendChild(span1);
            
            const span2 = document.createElement('span');
            span2.className = 'line2';
            span2.textContent = line2Text;
            labelWrapper.appendChild(span2);

            if (dateOrder === 'U') { 
                labelWrapper.style.justifyContent = 'flex-start'; 
            } else { 
                labelWrapper.style.justifyContent = 'flex-end'; 
            }
            labelWrapper.style.top = '0'; // 自定義標籤內部垂直定位，與容器的 topOffset 不同 
            labelWrapper.style.bottom = '0';
            
            xAxisLabelsContainer.appendChild(labelWrapper);

            // 更新上一個顯示標籤的右邊緣，以便下一個標籤判斷是否重疊 
            lastDisplayedDateRightEdge = Math.round(xPos + (currentLabelContentWidth / 2)); // === 修正: 取整 ===
            // 如果顯示了日期 (DD)，則更新 lastDisplayedDay 
            if (displayDayInLabel) { 
                lastDisplayedDay = currentDay; 
            }
        }
    });
}