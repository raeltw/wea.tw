// himawariViewer.js

// === JS 程式碼開始 ===

const H_CFGS = {
    twi1350: { b: "https://www.cwa.gov.tw/Data/satellite/TWI_TRGB_1350/", p: "TWI_TRGB_1350-" },
    lcc2750: { b: "https://www.cwa.gov.tw/Data/satellite/LCC_TRGB_2750/", p: "LCC_TRGB_2750-" }
};

let fUrls1 = [];
let fUrls2 = [];
let curIdx1 = 0;
let curIdx2 = 0;

let tipTmr1 = null;
let tipTmr2 = null;

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
let HIMAWARI_HOURS_TO_FETCH = 24; // <--- 在這裡修改您希望抓取的小時數 (例如：12, 24 等)

// ====== 新增：對 HIMAWARI_HOURS_TO_FETCH 設定上限 (最大 24 小時) ======
const MAX_HOURS_TO_FETCH = 24;
if (HIMAWARI_HOURS_TO_FETCH > MAX_HOURS_TO_FETCH) {
    HIMAWARI_HOURS_TO_FETCH = MAX_HOURS_TO_FETCH;
    console.warn(`Warning: HIMAWARI_HOURS_TO_FETCH was set to ${HIMAWARI_HOURS_TO_FETCH} (max allowed is ${MAX_HOURS_TO_FETCH}).`);
}
// ======================================================================

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

function showTip(gIdx, msg, autoHide = true) {
    const tipOv = document.getElementById(`imageGroup${gIdx}-tip`);
    if (tipOv) {
        tipOv.textContent = msg;
        tipOv.style.display = 'block';

        if (gIdx === 1) clearTimeout(tipTmr1);
        else clearTimeout(tipTmr2);

        if (autoHide) {
            const tmr = setTimeout(() => {
                tipOv.style.display = 'none';
            }, 3000);

            if (gIdx === 1) tipTmr1 = tmr;
            else tipTmr2 = tmr;
        }
    }
}

function dispImg(gIdx, idx) {
    const imgEl = document.getElementById(`imageGroup${gIdx}-image`);
    const tipOv = document.getElementById(`imageGroup${gIdx}-tip`);

    let urls = (gIdx === 1) ? fUrls1 : fUrls2;

    if (tipOv.textContent === '無可用圖片' && tipOv.style.display === 'block') {
        tipOv.style.display = 'none';
    } else {
        if (gIdx === 1) clearTimeout(tipTmr1);
        else clearTimeout(tipTmr2);
    }

    if (!urls || urls.length === 0 || idx < 0 || idx >= urls.length) {
        imgEl.src = '';
        imgEl.classList.remove('show');
        imgEl.style.display = 'none';
        showTip(gIdx, '無可用圖片', false);
        return;
    }

    const newImg = new Image();
    newImg.src = urls[idx].url;

    imgEl.classList.remove('show');

    newImg.onload = () => {
        imgEl.src = newImg.src;
        imgEl.style.display = 'block';
        setTimeout(() => {
            imgEl.classList.add('show');
        }, 50);
    };

    newImg.onerror = () => {
        imgEl.classList.remove('show');
        imgEl.style.display = 'none';
        showTip(gIdx, '圖片載入失敗');
    };
}

function navImg(gIdx, dir) {
    const isPlaying = (gIdx === 1) ? isPlaying1 : isPlaying2;
    if (isPlaying) {
        showTip(gIdx, '自動播放中');
        return;
    }

    let cIdx = (gIdx === 1) ? curIdx1 : curIdx2;
    let urls = (gIdx === 1) ? fUrls1 : fUrls2;

    const newIdx = cIdx + dir;

    if (newIdx < 0) {
        showTip(gIdx, '已是最舊圖片');
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

    stopAutoplay(gIdx);

    tipOv.style.display = 'none';
    if (tipOv.textContent === '無可用圖片') {
        tipOv.textContent = '';
    }

    imgEl.classList.remove('show');
    imgEl.style.display = 'none';

    loadOv.textContent = '更新中...';
    loadOv.style.display = 'block';

    let urls;
    if (gIdx === 1) {
        urls = await findImgs(H_CFGS.twi1350, HIMAWARI_HOURS_TO_FETCH, loadOv);
        fUrls1 = urls;
        curIdx1 = fUrls1.length > 0 ? fUrls1.length - 1 : 0;
        dispImg(1, curIdx1);
    } else {
        urls = await findImgs(H_CFGS.lcc2750, HIMAWARI_HOURS_TO_FETCH, loadOv);
        fUrls2 = urls;
        curIdx2 = fUrls2.length > 0 ? fUrls2.length - 1 : 0;
        dispImg(2, curIdx2);
    }

    loadOv.style.display = 'none';
    showTip(gIdx, '已更新至最新圖片');
}

function dblClkEdge(gIdx, tgt) {
    stopAutoplay(gIdx);

    let urls = (gIdx === 1) ? fUrls1 : fUrls2;

    if (urls.length === 0) {
        showTip(gIdx, '無可用圖片', false);
        return;
    }

    let newIdx;
    if (tgt === 'oldest') {
        newIdx = 0;
    } else {
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
    const urls = (gIdx === 1) ? fUrls1 : fUrls2;
    let autoplayTmrRef = (gIdx === 1) ? autoplayTmr1 : autoplayTmr2;
    let isPlayingRef = (gIdx === 1) ? isPlaying1 : isPlaying2;

    if (isPlayingRef) {
        showTip(gIdx, '正在播放中');
        return;
    }

    if (urls.length < 2) {
        showTip(gIdx, '圖片不足，無法播放');
        return;
    }

    stopAutoplay(gIdx);

    // 設置為從最舊一張開始
    if (gIdx === 1) curIdx1 = 0;
    else curIdx2 = 0;
    
    dispImg(gIdx, (gIdx === 1) ? curIdx1 : curIdx2);

    // 每小時有 6 張圖片 (每 10 分鐘一張)
    // 我們希望每小時的圖片播放 2 秒
    // 所以總播放時間 = HIMAWARI_HOURS_TO_FETCH * 2 秒 * 1000 毫秒/秒
    const playbackDuration = HIMAWARI_HOURS_TO_FETCH * 2 * 1000; 

    // 如果只有一張圖片或沒有圖片，間隔時間設為播放時長（或避免除以零）
    const interval = urls.length > 1 ? playbackDuration / (urls.length - 1) : playbackDuration;
    
    if (gIdx === 1) {
        isPlaying1 = true;
        autoplayTmr1 = setInterval(() => {
            if (curIdx1 < urls.length - 1) {
                curIdx1++;
                dispImg(gIdx, curIdx1);
            } else {
                stopAutoplay(gIdx);
                showTip(gIdx, '播放完畢');
            }
        }, interval);
    } else {
        isPlaying2 = true;
        autoplayTmr2 = setInterval(() => {
            if (curIdx2 < urls.length - 1) {
                curIdx2++;
                dispImg(gIdx, curIdx2);
            } else {
                stopAutoplay(gIdx);
                showTip(gIdx, '播放完畢');
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
        if (cC === 1) {
            if (area === 'left-bottom') navImg(gIdx, -1);
            else if (area === 'right-bottom') navImg(gIdx, 1);
        } else if (cC === 2) {
            if (area === 'left-top') dblClkEdge(gIdx, 'oldest');
            else if (area === 'center-top') dblClkCenterTop(gIdx);
            else if (area === 'center-bottom') startAutoplay(gIdx);
            else if (area === 'right-top') dblClkEdge(gIdx, 'latest');
        }
        if (gIdx === 1) { clkCnt1 = 0; clkTmr1 = null; }
        else { clkCnt2 = 0; clkTmr2 = null; }
    }, DBL_TMOUT);

    if (gIdx === 1) { clkCnt1 = cC; clkTmr1 = cT; }
    else { clkCnt2 = cC; clkTmr2 = cT; }
}

async function findImgs(cfg, h, loadOvEl) {
    const { b, p } = cfg;
    const discUrls = [];

    const now = new Date();
    let sT = new Date(now.getTime());
    sT.setSeconds(0); sT.setMilliseconds(0);
    const mins = sT.getMinutes();
    sT.setMinutes(mins - (mins % 10));

    const eT = new Date(sT.getTime());
    eT.setHours(eT.getHours() - h);

    let tmpT = new Date(sT.getTime());
    const imgPrms = [];

    while (tmpT.getTime() >= eT.getTime()) {
        const curT = new Date(tmpT.getTime());
        const fmtFNTime = fmtFN(curT);
        const imgUrl = `${b}${p}${fmtFNTime}.jpg`;

        loadOvEl.textContent = `${fmtDisp(curT)} 載入中...`;

        imgPrms.push(new Promise(res => {
            const img = new Image();
            img.onload = () => { discUrls.push({ url: imgUrl, time: curT }); res(); };
            img.onerror = () => { res(); };
            img.src = imgUrl;
        }));

        tmpT.setMinutes(tmpT.getMinutes() - 10);
    }
    await Promise.all(imgPrms);
    discUrls.sort((a, b) => a.time.getTime() - b.time.getTime());
    return discUrls;
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
                display: none;
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

    const [urls1, urls2] = await Promise.all([
        findImgs(H_CFGS.twi1350, HIMAWARI_HOURS_TO_FETCH, loadOv1),
        findImgs(H_CFGS.lcc2750, HIMAWARI_HOURS_TO_FETCH, loadOv2)
    ]);

    fUrls1 = urls1;
    fUrls2 = urls2;

    curIdx1 = fUrls1.length > 0 ? fUrls1.length - 1 : 0;
    curIdx2 = fUrls2.length > 0 ? fUrls2.length - 1 : 0;

    dispImg(1, curIdx1);
    dispImg(2, curIdx2);
};

// === JS 程式碼結束 ===