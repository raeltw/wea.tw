/**
* 透明度的完整規則
* A 帶入時 沒有疊到前一個圖示 本身就不透明
* B 帶入時 如果有疊到前一個圖示 本身50%透明+灰色邊框
* C 當滑鼠移到 所有圖示上面時 該圖示移到最上層 變成不透明 且沒有邊框
* D 當滑鼠離開時 回到原圖層 且原來的透明與邊框狀態


 * 自定義繪製 Chart.js 圖表下方的天氣圖示。
 *
 * @param {string} chartId - Chart.js canvas 元素的 ID (例如 'Chart3', 'Chart7')。
 * @param {string} iconContainerId - 外部圖示顯示區域 div 的 ID (例如 'xicon3d', 'xicon7d')。
 * @param {string[]} dateArray - 原始的YYYY-MM-DD-HH 格式日期字串陣列。
 * @param {string[]} iconCodeArray - 圖示代碼陣列 (例如 '00', '01', ..., '16')。
 * @param {number} iconWidth - 圖示的寬度 (px)。圖示通常是正方形，高度也會是這個值。
 * @param {string[]} iconTitleArray - 圖示 img 的 title 屬性文字說明陣列。
 * @param {number} skipInterval - 顯示間隔 (0 為全部顯示，1 為跳一個顯示，以此類推)。
 * @param {number} [containerOffsetY=0] - 圖示顯示區域距離 Chart.js 圖表底部邊緣的垂直偏移量 (px)。正數向下，負數向上。
 */
function writeicon(chartId, iconContainerId, dateArray, iconCodeArray, iconWidth, iconTitleArray, skipInterval, containerOffsetY = 0) {

    // 半透明+有邊框
    // drop-shadow(0px 0px 1px rgba(0, 0, 0, 1)) 前2個px是距離 第3個px是模糊
    //const myDesired = 'drop-shadow(0px 0px 0px rgba(120, 120, 120, 1)) drop-shadow(1px 1px 0px rgba(120, 120, 120, 1)) drop-shadow(-1px -1px 0px rgba(120, 120, 120, 1))';
    //const myDesired = 'drop-shadow(0px 0px 0px rgba(255, 0, 0, 1)) drop-shadow(1px 1px 0px rgba(0, 255, 0, 1)) drop-shadow(-1px -1px 0px rgba(0, 0, 255, 1))';
    //const myDesired = 'drop-shadow(0px 0px 1px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 1px rgba(0, 0, 0, 1)) drop-shadow(-1px -1px 1px rgba(0, 0, 0, 1))';
    const myDesired = 'drop-shadow(1px 1px 1px rgba(40, 40, 40, 1)) drop-shadow(-1px -1px 1px rgba(40, 40, 40, 1))';

    const chart = Chart.getChart(chartId); // 獲取對應 ID 的 Chart.js 實例
    if (!chart) {
        console.error(`writeicon error: Chart with ID '${chartId}' not found. Ensure the chart is initialized before calling writeicon.`);
        return;
    }

    const iconContainer = document.getElementById(iconContainerId); // 獲取圖示的容器 div
    if (!iconContainer) {
        console.error(`writeicon error: Icon container with ID '${iconContainerId}' not found.`);
        return;
    }

    // --- 計算並設置圖示容器的 top 位置 ---
    // 獲取 Chart.js canvas 元素的實際 DOM 矩形資訊
    const chartCanvas = chart.canvas;
    const chartRect = chartCanvas.getBoundingClientRect();

    // 獲取圖示容器的父容器 (通常是 .chart-container) 的矩形資訊
    // 我們假設 iconContainer 是 position: absolute; 且其父元素 (例如 .chart-container) 是 position: relative;
    const parentContainer = iconContainer.parentElement;
    if (!parentContainer) {
        console.error(`writeicon error: Parent container for '${iconContainerId}' not found. Make sure it has a parent element.`);
        return;
    }
    const parentRect = parentContainer.getBoundingClientRect();

    // 計算圖示容器相對於其父容器的 top 位置
    // chartRect.bottom 是 canvas 底部相對於視口的距離
    // parentRect.top 是父容器頂部相對於視口的距離
    // (chartRect.bottom - parentRect.top) 得到 canvas 底部相對於父容器頂部的距離
    // 再加上 containerOffsetY 進行微調
    const newTopPosition = (chartRect.bottom - parentRect.top) + containerOffsetY;
    iconContainer.style.top = `${Math.round(newTopPosition)}px`; // 設置為整數像素

    iconContainer.innerHTML = ''; // 清空容器內的舊圖示，準備重新繪製

    let lastDisplayedIconCode = null;       // 追蹤上一個顯示的圖示代碼 (例如 '01')
    let lastDisplayedTimeOfDay = null;      // 追蹤上一個顯示的 day/night 狀態 ('day' 或 'night')
    let lastDisplayedIconRightEdge = -Infinity; // 追蹤上一個成功顯示圖示的右邊緣，用於判斷碰撞

    let zIndexCounter = 1; // 用於遞增 z-index，實現「越後載入越上層」的初始層次

    const allIconsInThisContainer = []; // 收集所有已添加到當前容器的圖標，用於滑鼠事件中的 z-index 調整

    // 遍歷日期陣列，為每個數據點生成或判斷是否顯示圖示
    dateArray.forEach((fullDateString, index) => {
        // 根據 skipInterval 判斷是否跳過當前數據點
        if (skipInterval !== 0 && index % (skipInterval + 1) !== 0) {
            return; // 跳過不顯示的數據點
        }

        const stringParts = fullDateString.split('-');
        const hour = parseInt(stringParts[3]); // 從日期字串中解析小時數 (HH)
        const currentIconCode = iconCodeArray[index]; // 獲取當前數據點對應的圖示代碼
        const currentTitle = iconTitleArray[index]; // 獲取當前數據點對應的圖示文字說明

        // 判斷當前小時是屬於 'day' 還是 'night'
        // 規則：06(含06) ~ 17(含17) 是 'day'，其餘時間是 'night'
        const currentTimeOfDay = (hour >= 6 && hour <= 17) ? 'day' : 'night';

        // 獲取 Chart.js 資料點在畫布上的 X 座標 (中心點)
        let xPos = 0;
        if (chart.getDatasetMeta(0) && chart.getDatasetMeta(0).data[index]) {
            xPos = Math.round(chart.getDatasetMeta(0).data[index].x);
        } else {
            // 作為備用方案，如果無法直接從數據集中獲取，則使用 scale 的方法
            xPos = Math.round(chart.scales.x.getPixelForValue(index));
        }

        // --- 核心顯示規則判斷 ---
        let shouldDisplay = false;
        // 規則 1: 如果當前時間的 day/night 狀態與上一個顯示的狀態不同，則強制顯示
        if (currentTimeOfDay !== lastDisplayedTimeOfDay) {
            shouldDisplay = true;
        }
        // 規則 2: 如果當前圖示代碼與上一個顯示的代碼不同 (且沒有觸發規則 1)，則顯示
        else if (currentIconCode !== lastDisplayedIconCode) {
            shouldDisplay = true;
        }

        if (shouldDisplay) {
            // 構建完整的圖示 URL
            const iconUrl = `https://www.cwa.gov.tw/V8/assets/img/weather_icons/weathers/svg_icon/${currentTimeOfDay}/${currentIconCode}.svg`;

            const imgElement = document.createElement('img');
            imgElement.src = iconUrl;
            imgElement.alt = currentTitle; // 為可訪問性提供替代文字
            imgElement.title = currentTitle; // 滑鼠懸停時顯示的文字說明
            imgElement.className = 'weather-icon'; // 添加一個 class 以便 CSS 樣式和 JavaScript 選擇

            imgElement.style.width = `${iconWidth}px`;  // 設定圖示寬度
            imgElement.style.height = `${iconWidth}px`; // 設定圖示高度 (保持正方形)
            imgElement.style.position = 'absolute';      // 必須是絕對定位，才能精確控制 left/top/z-index

            // 居中對齊 X 座標：將圖示的中心對齊 Chart.js 資料點的 X 座標
            // 圖示的 left = 資料點 X 座標 - (圖示寬度 / 2)
            const currentIconLeft = Math.round(xPos - (iconWidth / 2));
            imgElement.style.left = `${currentIconLeft}px`;
            imgElement.style.top = '0'; // 圖示在 iconContainer 內的垂直位置，通常是頂部對齊

            // --- 透明度規則判斷 ---
            let initialOpacity = 1; // 預設為不透明 (規則 A: 沒有疊到前一個)
            // 判斷是否與「上一個成功顯示的圖示」重疊
            // 如果當前圖示的左邊緣小於上一個圖示的右邊緣，則視為重疊
            if (currentIconLeft < lastDisplayedIconRightEdge) {
                initialOpacity = 0.5; // 重疊時半透明 (規則 B)
            }
            imgElement.style.opacity = initialOpacity;
            // 儲存原始透明度，供滑鼠移開時恢復
            imgElement.dataset.originalOpacity = initialOpacity;

            // --- 層次設定 (越後載入，z-index 越高) ---
            imgElement.style.zIndex = zIndexCounter;
            // 儲存原始 z-index，供滑鼠移開時恢復
            imgElement.dataset.originalZIndex = zIndexCounter;

            iconContainer.appendChild(imgElement); // 將圖示添加到容器中
            allIconsInThisContainer.push(imgElement); // 將新創建的圖示元素添加到列表中，以便統一管理事件

            // 更新追蹤變數，為下一個圖示的判斷做準備
            lastDisplayedIconCode = currentIconCode;
            lastDisplayedTimeOfDay = currentTimeOfDay;
            // 更新上一個顯示圖示的右邊緣
            lastDisplayedIconRightEdge = currentIconLeft + iconWidth;
            zIndexCounter++; // 遞增 z-index 計數器
        }
    });

    // === 為所有已創建的圖示添加滑鼠事件監聽器 ===
    allIconsInThisContainer.forEach(icon => {
        // --- 設定初始透明度和濾鏡狀態 (根據規則 A 和 B) ---
        // parseFloat(icon.dataset.originalOpacity) === 0.5 表示這是被疊到的圖示
        if (parseFloat(icon.dataset.originalOpacity) === 0.5) {
            icon.style.opacity = 0.5; // 規則 B: 半透明
            // 規則 B: 有灰色邊框 (使用多個純白色、銳利的 drop-shadow 疊加，以創建更粗的邊框)
            // 這裡疊加了三個 drop-shadow:
            // 1. drop-shadow(0px 0px 0px rgba(255, 255, 255, 1))：核心銳利白邊
            // 2. drop-shadow(1px 1px 0px rgba(255, 255, 255, 1))：向右下方偏移 1px，增加厚度
            // 3. drop-shadow(-1px -1px 0px rgba(255, 255, 255, 1))：向左上方偏移 1px，進一步增加厚度
            // 這樣會形成一個圍繞圖示的，約 2px 寬的純白色邊框效果。
            //icon.style.filter = 'drop-shadow(0px 0px 0px rgba(255, 255, 255, 1)) drop-shadow(1px 1px 0px rgba(255, 255, 255, 1)) drop-shadow(-1px -1px 0px rgba(255, 255, 255, 1))'; 
            icon.style.filter = myDesired; 
        } else {
            icon.style.opacity = 1; // 規則 A: 不透明
            icon.style.filter = 'none'; // 規則 A: 沒有邊框
        }

        icon.addEventListener('mouseenter', () => {
            // 規則 C: 當滑鼠移到任何圖示上面時
            // 先將所有圖示（包括當前懸停的）恢復到其非懸停狀態的 A 或 B 規則，
            // 這樣可以避免其他圖示在 hover 時還保留 hover 狀態的 z-index 或濾鏡。
            allIconsInThisContainer.forEach(otherIcon => {
                otherIcon.style.zIndex = otherIcon.dataset.originalZIndex;
                if (parseFloat(otherIcon.dataset.originalOpacity) === 0.5) {
                    otherIcon.style.opacity = 0.5; // 半透明
                    //otherIcon.style.filter = 'drop-shadow(0px 0px 0px rgba(255, 255, 255, 1)) drop-shadow(1px 1px 0px rgba(255, 255, 255, 1)) drop-shadow(-1px -1px 0px rgba(255, 255, 255, 1))'; // 灰色邊框 (純白色銳利)
                    otherIcon.style.filter = myDesired;
                } else {
                    otherIcon.style.opacity = 1; // 不透明
                    otherIcon.style.filter = 'none'; // 無邊框
                }
            });

            // 再對當前懸停的圖示應用規則 C 的樣式
            icon.style.opacity = 1; // 該圖示變成不透明
            icon.style.filter = 'none'; // 且沒有邊框 (移除所有濾鏡)
            icon.style.zIndex = 99999; // 移到最上層
        });

        icon.addEventListener('mouseleave', () => {
            // 規則 D: 當滑鼠離開時
            icon.style.zIndex = icon.dataset.originalZIndex; // 回到原圖層

            // 恢復到原來的透明度與邊框狀態 (根據 originalOpacity 判斷)
            if (parseFloat(icon.dataset.originalOpacity) === 0.5) {
                icon.style.opacity = 0.5; // 半透明
                //icon.style.filter = 'drop-shadow(0px 0px 0px rgba(255, 255, 255, 1)) drop-shadow(1px 1px 0px rgba(255, 255, 255, 1)) drop-shadow(-1px -1px 0px rgba(255, 255, 255, 1))'; // 灰色邊框 (純白色銳利)
                icon.style.filter = myDesired;
            } else {
                icon.style.opacity = 1; // 不透明
                icon.style.filter = 'none'; // 無邊框
            }
        });
    });
} // writeicon 函數結束