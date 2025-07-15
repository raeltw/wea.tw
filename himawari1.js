// himawariViewer.js

// === JS 程式碼開始 ===

const H_CFGS = {
    twi1350: { b: "https://www.cwa.gov.tw/Data/satellite/TWI_TRGB_1000/", p: "TWI_TRGB_1000-" },
    lcc2750: { b: "https://www.cwa.gov.tw/Data/satellite/LCC_TRGB_1000/", p: "LCC_TRGB_1000-" }
};

let fUrls1 = [];
let fUrls2 = [];
let curIdx1 = 0;
let curIdx2 = 0;

let tipTmr1 = null; // 用於管理 imageGroup1 的提示自動隱藏計時器
let tipTmr2 = null; // 用於管理 imageGroup2 的提示自動隱動計時器

const DBL_TMOUT = 300;
let clkTmr1 = null;
let clkCnt1 = 0;
let clkTmr2 = null;
let clkCnt2 = 0;

let autoplayTmr1 = null;
let autoplayTmr2 = null;
let isPlaying1 = false;
let isPlaying2 = false;

// 將 hoursToFetch 定義在這裡，作為模組內部的變數
// 您想修改抓取的小時數時，直接修改這個值即可
let HIMAWARI_HOURS_TO_FETCH = 8; // <--- 在這裡修改您希望抓取的小時數 (例如：12, 24 等)

// 對 HIMAWARI_HOURS_TO_FETCH 設定上限 (最大 24 小時)
const MAX_HOURS_TO_FETCH = 24;
if (HIMAWARI_HOURS_TO_FETCH > MAX_HOURS_TO_FETCH) {
    HIMAWARI_HOURS_TO_FETCH = MAX_HOURS_TO_FETCH;
    console.warn(`Warning: HIMAWARI_HOURS_TO_FETCH was set to ${HIMAWARI_HOURS_TO_FETCH} (max allowed is ${MAX_HOURS_TO_FETCH}).`);
}

// 新增一個變數來追蹤歷史圖片是否已全部載入
let allHistoryLoaded1 = false;
let allHistoryLoaded2 = false;

function fmtFN(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}-${String(d.getMinutes()).padStart(2, '0')}`;
}

function fmtDisp(d) {
    return `${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function createImgGroup(gId, gIdx) {
    const gDiv = document.createElement('div');
    gDiv.className = 'image-group-full-features';
    gDiv.id = gId;

    const cDiv = document.createElement('div');
    cDiv.className = 'image-container-full-features';
    gDiv.appendChild(cDiv);

    const imgEl = document.createElement('img');
    imgEl.id = `${gId}-image`;
    imgEl.alt = "衛星雲圖";
    cDiv.appendChild(imgEl);

    const loadOv = document.createElement('div');
    loadOv.id = `${gId}-loading`;
    loadOv.className = 'overlay-message loading-overlay';
    gDiv.appendChild(loadOv);

    const tipOv = document.createElement('div');
    tipOv.id = `${gId}-tip`;
    tipOv.className = 'overlay-message tip-overlay';
    gDiv.appendChild(tipOv);

    const lZone = document.createElement('div');
    lZone.className = 'click-zone left-click-zone';
    const lT = document.createElement('div');
    lT.className = 'click-area-sub top';
    lT.title = '雙擊: 最舊一張';
    lT.onclick = (e) => handleAllClicks(gIdx, 'left-top', e);
    lZone.appendChild(lT);
    const lB = document.createElement('div');
    lB.className = 'click-area-sub bottom';
    lB.title = '單擊: 上一張';
    lB.onclick = (e) => handleAllClicks(gIdx, 'left-bottom', e);
    lZone.appendChild(lB);
    gDiv.appendChild(lZone);

    const cZone = document.createElement('div');
    cZone.className = 'click-zone center-click-zone';
    const cT = document.createElement('div');
    cT.className = 'click-area-sub top';
    cT.title = '雙擊: 重新讀取';
    cT.onclick = (e) => handleAllClicks(gIdx, 'center-top', e);
    cZone.appendChild(cT);
    const cB = document.createElement('div');
    cB.className = 'click-area-sub bottom';
    cB.title = '雙擊: 自動播放';
    cB.onclick = (e) => handleAllClicks(gIdx, 'center-bottom', e);
    cZone.appendChild(cB);
    gDiv.appendChild(cZone);

    const rZone = document.createElement('div');
    rZone.className = 'click-zone right-click-zone';
    const rT = document.createElement('div');
    rT.className = 'click-area-sub top';
    rT.title = '雙擊: 最新一張';
    rT.onclick = (e) => handleAllClicks(gIdx, 'right-top', e);
    rZone.appendChild(rT);
    const rB = document.createElement('div');
    rB.className = 'click-area-sub bottom';
    rB.title = '單擊: 下一張';
    rB.onclick = (e) => handleAllClicks(gIdx, 'right-bottom', e);
    rZone.appendChild(rB);
    gDiv.appendChild(rZone);

    return gDiv;
}

/**
 * 顯示圖片組件上的提示訊息
 * @param {number} gIdx - 圖片組件的索引 (1 或 2)
 * @param {string} msg - 要顯示的訊息
 * @param {boolean} [autoHide=true] - 訊息是否在 3 秒後自動隱藏，預設為 true
 */
function showTip(gIdx, msg, autoHide = true) {
    const tipOv = document.getElementById(`imageGroup${gIdx}-tip`);
    if (tipOv) {
        tipOv.textContent = msg;
        tipOv.style.display = 'block';

        // 清除現有的自動隱藏計時器，避免舊的計時器影響新的提示
        if (gIdx === 1) clearTimeout(tipTmr1);
        else clearTimeout(tipTmr2);

        if (autoHide) {
            const tmr = setTimeout(() => {
                tipOv.style.display = 'none';
            }, 3000); // 3 秒後自動隱藏

            if (gIdx === 1) tipTmr1 = tmr;
            else tipTmr2 = tmr;
        }
        // 如果 autoHide 為 false，則訊息會一直顯示，直到被其他 showTip 呼叫覆蓋或手動隱藏
    }
}

function dispImg(gIdx, idx) {
    const imgEl = document.getElementById(`imageGroup${gIdx}-image`);
    const tipOv = document.getElementById(`imageGroup${gIdx}-tip`);

    let urls = (gIdx === 1) ? fUrls1 : fUrls2;

    // 如果當前顯示的提示是「無可用圖片」，且正在嘗試顯示圖片，則隱藏它
    if (tipOv.textContent === '無可用圖片' && tipOv.style.display === 'block') {
        tipOv.style.display = 'none';
    } else {
        // 否則，清除自動隱藏計時器，避免顯示新圖片時提示消失
        if (gIdx === 1) clearTimeout(tipTmr1);
        else clearTimeout(tipTmr2);
    }

    // 檢查圖片是否存在於已載入的列表中
    if (!urls || urls.length === 0 || idx < 0 || idx >= urls.length) {
        imgEl.src = '';
        imgEl.classList.remove('show');
        imgEl.style.display = 'none';
        showTip(gIdx, '無可用圖片', false); // 這裡不自動隱藏，因為可能真的沒圖
        return;
    }

    const newImg = new Image();
    newImg.src = urls[idx].url; 

    imgEl.classList.remove('show');

    newImg.onload = () => {
        imgEl.src = newImg.src;
        imgEl.style.display = 'block';
        // 這裡的 setTimeout 保持 50ms，這是為了淡入效果。
        setTimeout(() => {
            imgEl.classList.add('show');
        }, 50); // 短暫延遲後顯示，讓過渡更平滑
    };

    newImg.onerror = () => {
        imgEl.classList.remove('show');
        imgEl.style.display = 'none';
        showTip(gIdx, '圖片載入失敗'); // 這裡會自動隱藏
    };
}

function navImg(gIdx, dir) {
    const isPlaying = (gIdx === 1) ? isPlaying1 : isPlaying2;
    if (isPlaying) {
        showTip(gIdx, '自動播放中'); // 自動播放中不允許手動導航
        return;
    }

    let cIdx = (gIdx === 1) ? curIdx1 : curIdx2;
    let urls = (gIdx === 1) ? fUrls1 : fUrls2;
    let allLoaded = (gIdx === 1) ? allHistoryLoaded1 : allHistoryLoaded2;


    const newIdx = cIdx + dir;

    if (newIdx < 0) {
        showTip(gIdx, '已是最舊圖片');
        // 如果還沒載入完所有歷史圖，並且試圖往前導航到不存在的索引
        if (!allLoaded) {
             showTip(gIdx, '正在載入歷史圖片...'); // 提示正在載入
        }
    } else if (newIdx >= urls.length) {
        showTip(gIdx, '已是最新圖片');
    } else {
        if (gIdx === 1) curIdx1 = newIdx;
        else curIdx2 = newIdx;
        dispImg(gIdx, newIdx);
    }
}

async function dblClkCenterTop(gIdx) {
    const loadOv = document.getElementById(`imageGroup${gIdx}-loading`);
    const tipOv = document.getElementById(`imageGroup${gIdx}-tip`);
    const imgEl = document.getElementById(`imageGroup${gIdx}-image`);

    stopAutoplay(gIdx); // 停止自動播放

    tipOv.style.display = 'none'; // 隱藏所有提示
    if (tipOv.textContent === '無可用圖片') {
        tipOv.textContent = '';
    }

    imgEl.classList.remove('show');
    imgEl.style.display = 'none';

    loadOv.textContent = '更新中...';
    loadOv.style.display = 'block'; // 顯示載入中提示
    
    // 清空現有圖片列表並重置載入狀態
    if (gIdx === 1) {
        fUrls1 = [];
        allHistoryLoaded1 = false;
        curIdx1 = 0;
        await findAndLoadLatestImage(H_CFGS.twi1350, 1, loadOv); // 只載入最新一張
        loadHistoryImagesInBackground(H_CFGS.twi1350, HIMAWARI_HOURS_TO_FETCH, 1, loadOv); // 在背景載入所有歷史圖
    } else {
        fUrls2 = [];
        allHistoryLoaded2 = false;
        curIdx2 = 0;
        await findAndLoadLatestImage(H_CFGS.lcc2750, 2, loadOv); // 只載入最新一張
        loadHistoryImagesInBackground(H_CFGS.lcc2750, HIMAWARI_HOURS_TO_FETCH, 2, loadOv); // 在背景載入所有歷史圖
    }

    // loadOv 會在 findAndLoadLatestImage 中被隱藏，這裡不需要再處理
    // showTip 會在 loadHistoryImagesInBackground 完成後觸發
}

function dblClkEdge(gIdx, tgt) {
    stopAutoplay(gIdx); // 停止自動播放

    let urls = (gIdx === 1) ? fUrls1 : fUrls2;
    let allLoaded = (gIdx === 1) ? allHistoryLoaded1 : allHistoryLoaded2;


    if (urls.length === 0) {
        showTip(gIdx, '無可用圖片', false);
        return;
    }

    let newIdx;
    if (tgt === 'oldest') {
        newIdx = 0;
        if (!allLoaded && newIdx < ((gIdx === 1) ? curIdx1 : curIdx2)) { // 如果還沒載入完所有歷史圖，點擊最舊圖時提示
            showTip(gIdx, '正在載入歷史圖片...');
            // 等待直到載入完成，或者只顯示目前載入的最舊圖
        }
    } else { // 'latest'
        newIdx = urls.length - 1;
    }

    if (gIdx === 1) curIdx1 = newIdx;
    else curIdx2 = newIdx;
    dispImg(gIdx, newIdx);

    if (tgt === 'oldest') {
        showTip(gIdx, '已是最舊圖片');
    } else {
        showTip(gIdx, '已是最新圖片');
    }
}

function startAutoplay(gIdx) {
    let autoplayTmrRef = (gIdx === 1) ? autoplayTmr1 : autoplayTmr2;
    let isPlayingRef = (gIdx === 1) ? isPlaying1 : isPlaying2;

    if (isPlayingRef) {
        showTip(gIdx, '正在播放中');
        return;
    }

    let urls = (gIdx === 1) ? fUrls1 : fUrls2; // 獲取當前 URL 列表
    if (urls.length < 1) { // 至少需要一張圖片來顯示
        showTip(gIdx, '無可用圖片，無法播放', false);
        return;
    }

    stopAutoplay(gIdx); // 確保停止任何現有播放

    // 設置初始索引為最舊的圖片 (索引 0)
    if (gIdx === 1) curIdx1 = 0;
    else curIdx2 = 0;
    
    // 顯示第一張圖片 (最舊的)
    dispImg(gIdx, (gIdx === 1) ? curIdx1 : curIdx2);

    // 理論計算，用於確保播放速度一致
    const theoreticalImagesPerHour = 6;
    const secondsPerTheoreticalHour = 2; // <--- 這裡保持 2 秒，不變
    const interval = (1 / theoreticalImagesPerHour) * secondsPerTheoreticalHour * 1000; // 每幀的毫秒數

    if (gIdx === 1) {
        isPlaying1 = true;
        autoplayTmr1 = setInterval(() => {
            let currentUrls = fUrls1; // <--- **每次迭代都獲取最新的圖片列表**
            let allLoadedStatus = allHistoryLoaded1; // <--- **每次迭代都獲取最新的載入狀態**

            if (currentUrls.length === 0) { // 安全檢查
                stopAutoplay(gIdx);
                showTip(gIdx, '無可用圖片，停止播放');
                return;
            }

            if (curIdx1 < currentUrls.length - 1) { // 如果還沒到當前列表的最後一張
                curIdx1++;
                dispImg(gIdx, curIdx1);
            } else {
                // 已播放到當前列表的最後一張圖片
                if (allLoadedStatus) {
                    // 如果所有歷史圖片都已載入完畢，則播放結束
                    stopAutoplay(gIdx);
                    showTip(gIdx, '播放完畢');
                } else {
                    // 歷史圖片尚未全部載入，循環回到最舊一張，並等待更多圖片
                    curIdx1 = 0;
                    dispImg(gIdx, curIdx1);
                    showTip(gIdx, '正在等待更多歷史圖片...'); // 提示用戶
                }
            }
        }, interval);
    } else { // 針對 imageGroup2 的相同邏輯
        isPlaying2 = true;
        autoplayTmr2 = setInterval(() => {
            let currentUrls = fUrls2; // <--- **每次迭代都獲取最新的圖片列表**
            let allLoadedStatus = allHistoryLoaded2; // <--- **每次迭代都獲取最新的載入狀態**

            if (currentUrls.length === 0) {
                stopAutoplay(gIdx);
                showTip(gIdx, '無可用圖片，停止播放');
                return;
            }

            if (curIdx2 < currentUrls.length - 1) {
                curIdx2++;
                dispImg(gIdx, curIdx2);
            } else {
                if (allLoadedStatus) {
                    stopAutoplay(gIdx);
                    showTip(gIdx, '播放完畢');
                } else {
                    curIdx2 = 0;
                    dispImg(gIdx, curIdx2);
                    showTip(gIdx, '正在等待更多歷史圖片...');
                }
            }
        }, interval);
    }
}

function stopAutoplay(gIdx) {
    if (gIdx === 1 && autoplayTmr1) {
        clearInterval(autoplayTmr1);
        autoplayTmr1 = null;
        isPlaying1 = false;
    } else if (gIdx === 2 && autoplayTmr2) {
        clearInterval(autoplayTmr2);
        autoplayTmr2 = null;
        isPlaying2 = false;
    }
}

function handleAllClicks(gIdx, area, e) {
    let cC, cT;
    if (gIdx === 1) { cC = clkCnt1; cT = clkTmr1; }
    else { cC = clkCnt2; cT = clkTmr2; }

    cC++;

    if (cT) clearTimeout(cT);

    cT = setTimeout(() => {
        if (cC === 1) { // 單擊事件
            if (area === 'left-bottom') navImg(gIdx, -1);
            else if (area === 'right-bottom') navImg(gIdx, 1);
        } else if (cC === 2) { // 雙擊事件
            if (area === 'left-top') dblClkEdge(gIdx, 'oldest');
            else if (area === 'center-top') dblClkCenterTop(gIdx);
            else if (area === 'center-bottom') startAutoplay(gIdx);
            else if (area === 'right-top') dblClkEdge(gIdx, 'latest');
        }
        // 重置點擊計數和計時器
        if (gIdx === 1) { clkCnt1 = 0; clkTmr1 = null; }
        else { clkCnt2 = 0; clkTmr2 = null; }
    }, DBL_TMOUT);

    // 更新點擊計數和計時器狀態
    if (gIdx === 1) { clkCnt1 = cC; clkTmr1 = cT; }
    else { clkCnt2 = cC; clkTmr2 = cT; }
}

/**
 * 查找並載入指定配置的最新一張圖片
 * 這個函數會阻塞，直到找到第一張可用圖片並顯示。
 * @param {object} cfg - 衛星雲圖配置 (H_CFGS.twi1350 或 H_CFGS.lcc2750)
 * @param {number} gIdx - 組索引 (1 或 2)
 * @param {HTMLElement} loadOvEl - 載入提示的 DOM 元素
 */
async function findAndLoadLatestImage(cfg, gIdx, loadOvEl) {
    const { b, p } = cfg;
    const now = new Date();
    let sT = new Date(now.getTime());
    sT.setSeconds(0); sT.setMilliseconds(0);
    const mins = sT.getMinutes();
    sT.setMinutes(mins - (mins % 10)); // 對齊到最近的 10 分鐘

    let foundLatest = false;
    let tmpT = new Date(sT.getTime());

    // 往前回溯最多 2 小時（12個10分鐘間隔）尋找最新一張可用的圖
    for (let i = 0; i < 12; i++) {
        const curT = new Date(tmpT.getTime());
        const fmtFNTime = fmtFN(curT);
        const imgUrl = `${b}${p}${fmtFNTime}.jpg`;

        loadOvEl.textContent = `載入最新圖 ${fmtDisp(curT)}...`;

        const img = new Image();
        img.src = imgUrl; // 觸發下載

        await new Promise(resolve => {
            img.onload = () => {
                const urlObj = { url: imgUrl, time: curT };
                // 確保只添加一張最新圖，且在列表的最後
                if (gIdx === 1) {
                    fUrls1 = [urlObj]; // 直接替換為只有這一張圖
                    curIdx1 = 0; // 索引為0
                } else {
                    fUrls2 = [urlObj]; // 直接替換為只有這一張圖
                    curIdx2 = 0; // 索引為0
                }
                dispImg(gIdx, 0); // 顯示這張最新圖
                foundLatest = true;
                resolve();
            };
            img.onerror = () => {
                resolve(); // 載入失敗，繼續嘗試更舊的時間
            };
        });

        if (foundLatest) {
            loadOvEl.style.display = 'none'; // 找到最新圖後隱藏載入提示
            showTip(gIdx, '已顯示最新圖片'); // 自動隱藏
            break; // 找到最新一張就跳出循環
        }
        tmpT.setMinutes(tmpT.getMinutes() - 10);
    }

    if (!foundLatest) {
        loadOvEl.style.display = 'none';
        showTip(gIdx, '未能載入最新圖片', false); // 這裡明確設定為不自動隱藏
    }
}


/**
 * 在背景載入所有歷史圖片，不阻塞主線程。
 * 發現的圖片會添加到對應的 fUrls 陣列中並保持排序。
 * @param {object} cfg - 衛星雲圖配置
 * @param {number} h - 希望載入的小時數
 * @param {number} gIdx - 組索引 (1 或 2)
 * @param {HTMLElement} loadOvEl - 載入提示的 DOM 元素 (用於更新狀態，但在此函數中不頻繁更新)
 */
async function loadHistoryImagesInBackground(cfg, h, gIdx, loadOvEl) {
    const { b, p } = cfg;
    const now = new Date();
    let sT = new Date(now.getTime());
    sT.setSeconds(0); sT.setMilliseconds(0);
    const mins = sT.getMinutes();
    sT.setMinutes(mins - (mins % 10)); 

    const eT = new Date(sT.getTime());
    eT.setHours(eT.getHours() - h);

    let tmpT = new Date(sT.getTime());
    // 獲取目前 fUrls 中最舊的時間點，避免重複處理
    let currentOldestTime = (gIdx === 1 && fUrls1.length > 0) ? fUrls1[0].time.getTime() : Infinity;
    
    // 從最新的時間點開始往回檢查，並跳過已經處理過的區間
    while (tmpT.getTime() >= eT.getTime()) {
        const curT = new Date(tmpT.getTime());

        // 如果當前時間點的圖片已經存在於列表中，則跳過，避免重複添加
        if (curT.getTime() >= currentOldestTime && ((gIdx === 1) ? fUrls1.length : fUrls2.length) > 0) { 
             // 確保 fUrls1.length > 0 或 fUrls2.length > 0 才檢查 currentOldestTime
            // 這裡還需要檢查該時間點的圖片是否已經存在，避免重複添加
            const targetUrls = (gIdx === 1) ? fUrls1 : fUrls2;
            const exists = targetUrls.some(item => item.time.getTime() === curT.getTime());
            if (exists) {
                tmpT.setMinutes(tmpT.getMinutes() - 10);
                continue;
            }
        }

        const fmtFNTime = fmtFN(curT);
        const imgUrl = `${b}${p}${fmtFNTime}.jpg`;

        // 使用 setTimeout 讓主線程有機會處理其他任務，實現非阻塞載入
        await new Promise(resolve => {
            setTimeout(() => {
                const img = new Image();
                img.onload = () => {
                    const urlObj = { url: imgUrl, time: curT };
                    let targetUrls = (gIdx === 1) ? fUrls1 : fUrls2;
                    // 再次檢查是否存在，以防在 setTimeout 延遲期間被添加
                    const exists = targetUrls.some(item => item.time.getTime() === curT.getTime());
                    if (!exists) { // 避免重複添加
                        targetUrls.push(urlObj);
                        targetUrls.sort((a, b) => a.time.getTime() - b.time.getTime()); // 保持排序
                        // 更新 currentOldestTime (不是絕對必要，因為每次循環都會根據 tmpT 往前回溯)
                    }
                    resolve();
                };
                img.onerror = () => {
                    resolve(); // 即使錯誤也算已處理，繼續下一個
                };
                img.src = imgUrl; // 觸發背景下載
            }, 5); // 每次檢查延遲 5 毫秒，避免完全阻塞，且比 10 毫秒更頻繁一點
        });

        tmpT.setMinutes(tmpT.getMinutes() - 10);
    }

    // 所有歷史圖片檢查完成後
    if (gIdx === 1) {
        allHistoryLoaded1 = true;
        // 確保重新計算 curIdx1 到最新圖的索引，因為 fUrls1 可能在背景載入過程中被排序和增加
        curIdx1 = fUrls1.length > 0 ? fUrls1.length - 1 : 0; 
        dispImg(gIdx, curIdx1); // 重新顯示最新圖，確保索引正確
        showTip(gIdx, '所有歷史圖片已載入', true); // 這裡明確設定為自動隱藏
    } else {
        allHistoryLoaded2 = true;
        curIdx2 = fUrls2.length > 0 ? fUrls2.length - 1 : 0;
        dispImg(gIdx, curIdx2);
        showTip(gIdx, '所有歷史圖片已載入', true); // 這裡明確設定為自動隱藏
    }
}


window.loadHimawariImages = async function(targetDivId) {
    const tDiv = document.getElementById(targetDivId);
    if (!tDiv) {
        console.error(`Error: DIV element with ID '${targetDivId}' not found.`);
        return;
    }

    const styleId = 'himawari-viewer-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            #${targetDivId} {
                display: flex;
                justify-content: flex-start;
            }
            .image-group-full-features {
                position: relative;
                display: inline-block;
                vertical-align: top;
                width: 475px;
                height: 475px;
                overflow: hidden;
            }
            .image-group-full-features:first-of-type {
                margin-right: 8px;
            }
            .image-container-full-features {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .image-container-full-features img {
                display: block;
                max-width: 100%;
                max-height: 100%;
                width: auto;
                height: auto;
                object-fit: contain;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
            }
            .image-container-full-features img.show {
                opacity: 1;
            }
            .overlay-message {
                position: absolute;
                z-index: 10;
                pointer-events: none;
                white-space: nowrap;
                padding: 5px 10px;
                border-radius: 5px;
                background-color: rgba(0, 0, 0, 0.5);
            }
            .loading-overlay {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            .tip-overlay {
                bottom: 10px;
                left: 10px;
            }
            .click-zone {
                position: absolute;
                top: 0;
                height: 100%;
                width: 20%;
                display: flex;
                flex-direction: column;
                z-index: 5;
                box-sizing: border-box;
            }
            .left-click-zone { left: 0%; }
            .center-click-zone { left: 40%; }
            .right-click-zone { left: 80%; }
            .click-area-sub {
                width: 100%;
                cursor: pointer;
                box-sizing: border-box;
            }
            .click-area-sub.top { height: 50%; }
            .click-area-sub.bottom { height: 50%; }
        `;
        document.head.appendChild(style);
    }

    tDiv.innerHTML = '';

    const img1Grp = createImgGroup("imageGroup1", 1);
    tDiv.appendChild(img1Grp);

    const img2Grp = createImgGroup("imageGroup2", 2);
    tDiv.appendChild(img2Grp);

    const loadOv1 = document.getElementById('imageGroup1-loading');
    const loadOv2 = document.getElementById('imageGroup2-loading');

    // 顯示載入提示
    loadOv1.style.display = 'block';
    loadOv2.style.display = 'block';

    // 優先載入並顯示最新一張圖片
    await findAndLoadLatestImage(H_CFGS.twi1350, 1, loadOv1);
    await findAndLoadLatestImage(H_CFGS.lcc2750, 2, loadOv2);

    // 在背景非同步載入所有歷史圖片，不阻塞主線程
    loadHistoryImagesInBackground(H_CFGS.twi1350, HIMAWARI_HOURS_TO_FETCH, 1, loadOv1);
    loadHistoryImagesInBackground(H_CFGS.lcc2750, HIMAWARI_HOURS_TO_FETCH, 2, loadOv2);
};

// === JS 程式碼結束 ===