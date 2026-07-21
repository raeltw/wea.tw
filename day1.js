function day1() {
  const container = document.getElementById('api_datad');
  if (!container) return;

  // 1. 陣列定義資料 (month, day, time, label, note, align)
  const eventsData = [
    [1,  13, "06:40", "日出最晚",       "", "left"],
    [3,  15, "",      "白天超過12小時", "", ""],
    [4,  28, "",      "白天超過13小時", "", ""],
    [6,   8, "05:03", "日出最早",       "", "left"],
    [6,  21, "13:41", "白天最長",       "*開始升溫", "center"],
    [7,   3, "18:47", "日落最晚",       "", "right"],
    [8,  15, "",      "白天低於13小時", "*持續酷熱", ""],
    [9,  28, "",      "白天低於12小時", "*熬過酷暑", ""],
    [11, 29, "17:03", "日落最早",       "", "right"],
    [12, 21, "10:35", "白天最短",       "", "center"]
  ];

  // 中間 5 個欄位的寬度（完全維持原本設定）
  const colWidths = ['100px', '30px', '70px', '140px', '160px'];

  // 2. 取得今日零點時間
  const now = new Date();
  const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 3. 建立表格 DOM
  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  table.style.lineHeight = '1.5';

  // --- 建立表頭 (thead) ---
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');

  // 表頭 7 個欄位（最左與最右為 4px 空欄位）
  const headers = [
    { isPaddingCol: true }, // 左邊凸出 4px 欄位
    { text: '注意', align: 'left' },
    { text: '日數', align: 'right', paddingRight: '20px' },
    { text: '日期', align: 'left', paddingRight: '20px' },
    { text: '折點', align: 'left' },
    { text: '時間 (約略)', align: 'left' },
    { isPaddingCol: true }  // 右邊凸出 4px 欄位
  ];

  headers.forEach((hInfo, index) => {
    const th = document.createElement('th');
    th.style.borderBottom = '1px solid rgb(50, 50, 50)'; // 灰色橫線
    th.style.verticalAlign = 'middle';

    if (hInfo.isPaddingCol) {
      th.style.width = '4px';
    } else {
      // 扣除左邊空欄位 index 後的真實資料欄位索引
      const dataColIndex = index - 1;
      th.textContent = hInfo.text;
      th.style.width = colWidths[dataColIndex];
      if (hInfo.align) th.style.textAlign = hInfo.align;
      if (hInfo.paddingRight) th.style.paddingRight = hInfo.paddingRight;
    }

    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  // --- 建立表格內容 (tbody) ---
  const tbody = document.createElement('tbody');

  eventsData.forEach((item, rowIndex) => {
    const [month, day, time, label, note, align] = item;

    // 計算目標日期
    let targetDate = new Date(todayZero.getFullYear(), month - 1, day);
    let isNextYear = false;
    if (targetDate < todayZero) {
      targetDate.setFullYear(todayZero.getFullYear() + 1);
      isNextYear = true;
    }

    let daysLeftDisplay = '';
    if (!isNextYear) {
      const diffMs = targetDate - todayZero;
      daysLeftDisplay = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    }

    const yy = String(targetDate.getFullYear()).slice(-2);
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${yy}/${mm}/${dd}`;

    const tr = document.createElement('tr');

    // 每一列的 7 個欄位（包含左右 4px 空欄位）
    const tds = [
      { isPaddingCol: true }, // 左邊凸出 4px 欄位
      { text: note, align: 'left' },
      { text: daysLeftDisplay, align: 'right', paddingRight: '20px' },
      { text: dateStr, align: 'left', paddingRight: '20px' },
      { text: label, align: 'left' },
      { text: time, align: align || 'left' },
      { isPaddingCol: true }  // 右邊凸出 4px 欄位
    ];

    tds.forEach((tdInfo, index) => {
      const td = document.createElement('td');
      td.style.verticalAlign = 'middle';

      // 除最後一列外，每一列畫灰色橫線
      if (rowIndex < eventsData.length - 1) {
        td.style.borderBottom = '1px solid rgb(50, 50, 50)';
      }

      if (tdInfo.isPaddingCol) {
        td.style.width = '4px';
      } else {
        const dataColIndex = index - 1;
        td.textContent = tdInfo.text;
        td.style.width = colWidths[dataColIndex];
        if (tdInfo.align) td.style.textAlign = tdInfo.align;
        if (tdInfo.paddingRight) td.style.paddingRight = tdInfo.paddingRight;
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);

  // 4. 清空容器並放入表格
  container.innerHTML = '';
  container.appendChild(table);
}