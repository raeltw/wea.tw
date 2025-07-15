// himawari.js 檔案內容開始

/**
 * 衛星雲圖載入函式庫
 * 將最新的兩張氣象署衛星雲圖載入到指定的 DIV 容器中。
 * 處理圖片載入失敗的情況，並顯示精簡的錯誤訊息及最後嘗試的 URL。
 * 所有必要的 CSS 樣式會由 JavaScript 動態注入，且僅限於最必要的佈局，
 * 不包含任何顏色、背景、邊框、陰影、字體大小等視覺樣式，也不顯示圖片標題。
 * 圖片容器將不再有固定大小，只在圖片載入成功時才顯示圖片。
 * 錯誤訊息將只佔用其內容所需的空間，並顯示當前應嘗試的最新圖片 URL。
 */

// 內部配置，用於定義兩種圖片類型及其相關資訊
const HIMAWARI_IMAGE_CONFIGS = {
    twiTrgb1350: { // 圖一類型 - 恢復正確的 baseUrl
        baseUrl: "https://www.cwa.gov.tw/Data/satellite/TWI_TRGB_1350/",
        prefix: "TWI_TRGB_1350-",
        correctBaseUrl: "https://www.cwa.gov.tw/Data/satellite/TWI_TRGB_1350/"
    },
    lccTrgb2750: { // 圖二類型 - 恢復正確的 baseUrl
        baseUrl: "https://www.cwa.gov.tw/Data/satellite/LCC_TRGB_2750/",
        prefix: "LCC_TRGB_2750-",
        correctBaseUrl: "https://www.cwa.gov.tw/Data/satellite/LCC_TRGB_2750/"
    }
};

/**
 * 動態注入 CSS 樣式到頁面中。
 * 此函式將只注入與 Himawari 圖片組件相關的最必要 CSS，且不包含視覺樣式。
 */
function injectHimawariStyles() {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        /* 您的目標 DIV 容器樣式 */
        #api_datah {
            display: flex;
            justify-content: flex-start;
            flex-wrap: wrap;
        }

        /* 每個圖片組件的容器 */
        .image-group {
            margin-right: 8px; /* 僅保留圖片組件之間的間距 */
            display: inline-block; /* 改為 inline-block 確保不佔滿一行 */
            vertical-align: top; /* 確保頂部對齊 */
        }
        .image-group:last-child {
            margin-right: 0;
        }

        /* 圖片顯示容器 - 不再有固定寬高，只在圖片載入後才顯示其自身大小 */
        .image-container {
            min-width: 1px; /* 最小寬度，避免完全不佔空間導致顯示異常 */
            min-height: 1px; /* 最小高度，避免完全不佔空間導致顯示異常 */
        }
        .image-container img {
            display: block; /* 確保圖片獨佔一行 */
            max-width: 475px; /* 限制最大寬度為 480px */
            max-height: 475px; /* 限制最大高度為 480px */
            width: auto; /* 讓圖片寬度自適應 */
            height: auto; /* 讓圖片高度自適應 */
            object-fit: contain; /* 保持圖片比例 */
            /* 預設隱藏，只在 src 設定後才顯示，解決載入失敗時的巨大空白/破碎圖標問題 */
            display: none;
        }

        /* 載入訊息樣式 - 自動適應高度 */
        .loading-message, .error-message {
            display: none; /* 預設隱藏 */
            white-space: nowrap;
        }
    `;
    document.head.appendChild(style);
}


/**
 * 格式化日期時間為 YYYY-MM-DD-HH-MM
 * @param {Date} dateObj
 * @returns {string}
 */
function formatDateTime(dateObj) {
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return '';
    }
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}-${hours}-${minutes}`;
}

/**
 * 格式化日期時間為 HH:MM (用於載入訊息顯示)
 * @param {Date} dateObj
 * @returns {string}
 */
function formatTimeForDisplay(dateObj) {
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return '未知時間';
    }
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * 創建圖片組件的 DOM 元素。
 * @param {string} imageId - 圖片元素的 ID
 * @param {string} loadingId - 載入訊息元素的 ID
 * @param {string} errorMessageId - 錯誤訊息元素的 ID
 * @returns {HTMLElement} 包含圖片組件的 div 元素
 */
function createHimawariImageGroup(imageId, loadingId, errorMessageId) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'image-group';

    const containerDiv = document.createElement('div');
    containerDiv.id = imageId.replace('satelliteImage', 'image') + '-container';
    containerDiv.className = 'image-container';

    const imgElement = document.createElement('img');
    imgElement.id = imageId;
    imgElement.alt = "衛星雲圖"; // 僅作為無障礙用途的 alt 屬性
    imgElement.src = ''; // 初始為空

    const loadingMessage = document.createElement('div');
    loadingMessage.id = loadingId;
    loadingMessage.className = 'loading-message';
    loadingMessage.textContent = '載入中...'; // 預設訊息

    const errorMessage = document.createElement('div');
    errorMessage.id = errorMessageId;
    errorMessage.className = 'error-message';
    errorMessage.textContent = '錯誤'; // 預設訊息

    containerDiv.appendChild(imgElement); // 圖片放在 containerDiv 裡
    groupDiv.appendChild(containerDiv); // 將 containerDiv 加入 groupDiv
    groupDiv.appendChild(loadingMessage); // 載入訊息放在 groupDiv 裡 (圖片下方)
    groupDiv.appendChild(errorMessage);   // 錯誤訊息放在 groupDiv 裡 (圖片下方)

    return groupDiv;
}

/**
 * 尋找並載入指定範圍內最新的可用圖片。
 * @param {object} config - 特定圖片類型的配置 (baseUrl, prefix, correctBaseUrl)
 * @param {object} domElements - 相關 DOM 元素 (imageElement, loadingElement, errorMessageElement)
 * @param {number} searchHours - 往前回溯搜尋的小時數
 */
async function findAndLoadLatestImage(config, domElements, searchHours) {
    const { baseUrl, prefix, correctBaseUrl } = config; // correctBaseUrl 仍然保留，以防未來需要顯示
    const { imageElement, loadingElement, errorMessageElement } = domElements;

    // 重置狀態
    imageElement.src = '';
    imageElement.style.display = 'none'; // 預設隱藏圖片
    loadingElement.style.display = 'block'; // 顯示載入訊息
    errorMessageElement.style.display = 'none'; // 隱藏錯誤訊息
    errorMessageElement.textContent = ''; // 清空錯誤訊息內容

    loadingElement.textContent = '搜尋最新圖片中...';

    const now = new Date();
    let searchTime = new Date(now.getTime());
    searchTime.setSeconds(0);
    searchTime.setMilliseconds(0);
    const minutes = searchTime.getMinutes();
    searchTime.setMinutes(minutes - (minutes % 10)); // 向下捨去到最近的10分鐘

    const endTime = new Date(searchTime.getTime());
    endTime.setHours(endTime.getHours() - searchHours);

    let foundImage = false;
    let lastAttemptedUrl = ''; // 記錄實際嘗試的 URL (現在會是正確的 https)

    while (searchTime.getTime() >= endTime.getTime()) {
        const formattedTime = formatDateTime(searchTime);
        const imageUrl = `${baseUrl}${prefix}${formattedTime}.jpg`; // 現在 baseUrl 已經是正確的 https
        lastAttemptedUrl = imageUrl; // 這是實際會被嘗試的 URL

        loadingElement.textContent = `載入 ${formatTimeForDisplay(searchTime)}...`; // 載入中顯示時間

        try {
            await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    imageElement.src = imageUrl;
                    imageElement.style.display = 'block'; // 圖片載入成功才顯示
                    foundImage = true;
                    resolve();
                };
                img.onerror = () => {
                    reject(new Error(`圖片載入失敗: ${imageUrl}`));
                };
                img.src = imageUrl;
            });
            break; // 找到圖片，跳出迴圈

        } catch (error) {
            searchTime.setMinutes(searchTime.getMinutes() - 10);
        }
    }

    loadingElement.style.display = 'none'; // 無論成功或失敗，隱藏載入訊息

    if (!foundImage) {
        // 現在由於 baseUrl 已經正確，所以 lastAttemptedUrl 就是最後一個嘗試的正確 URL
        errorMessageElement.textContent = `錯誤：找不到圖片。最後嘗試：${lastAttemptedUrl}`;
        errorMessageElement.style.display = 'block'; // 顯示錯誤訊息
        imageElement.src = ''; // 確保不顯示破損圖片圖標
        imageElement.style.display = 'none'; // 載入失敗時也確保圖片不顯示
    }
}

/**
 * 主要函式：載入兩張衛星雲圖到指定的 DIV 容器中。
 * @param {string} targetDivId - 用於放置衛星雲圖組件的 DIV 元素的 ID。
 */
async function loadHimawariImages(targetDivId) {
    // 首先注入 CSS 樣式
    injectHimawariStyles();

    const targetDiv = document.getElementById(targetDivId);
    if (!targetDiv) {
        console.error(`找不到 ID 為 "${targetDivId}" 的目標 DIV 元素。請確保您的 HTML 中有這個 DIV。`);
        return;
    }

    // 清空目標 DIV 內容，防止重複載入
    targetDiv.innerHTML = '';

    // 創建並追加圖一組件
    const image1Group = createHimawariImageGroup(
        "satelliteImage1",
        "loading1",
        "error1"
    );
    targetDiv.appendChild(image1Group);

    // 創建並追加圖二組件
    const image2Group = createHimawariImageGroup(
        "satelliteImage2",
        "loading2",
        "error2"
    );
    targetDiv.appendChild(image2Group);

    // 獲取新創建的 DOM 元素引用
    const domElements1 = {
        imageElement: document.getElementById('satelliteImage1'),
        loadingElement: document.getElementById('loading1'),
        errorMessageElement: document.getElementById('error1')
    };

    const domElements2 = {
        imageElement: document.getElementById('satelliteImage2'),
        loadingElement: document.getElementById('loading2'),
        errorMessageElement: document.getElementById('error2')
    };

    // 並行載入兩張圖片
    await Promise.all([
        findAndLoadLatestImage(HIMAWARI_IMAGE_CONFIGS.twiTrgb1350, domElements1, 2),
        findAndLoadLatestImage(HIMAWARI_IMAGE_CONFIGS.lccTrgb2750, domElements2, 2)
    ]);
}
// himawari.js 檔案內容結束