function s1() {
//window.alert('這裡');
   
   // StationLatitude	"24.960990"
   // StationLongitude	"121.516977"
   // from https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001
   
   var now = new Date(); 
   _tmp1=String(now.getFullYear())+'-'+String(now.getMonth()+1).padStart(2, '0')+'-'+String(now.getDate()).padStart(2, '0'); 
   _tmp2=String(now.getHours()).padStart(2, '0')+':'+String(now.getMinutes()).padStart(2, '0')+':'+String(now.getSeconds()).padStart(2, '0'); 
   //window.alert(_tmp1+' '+_tmp2);
   
   var jsonString = getSunMoon(_tmp1, _tmp2, 24.960990, 121.516977);
   // 將 JSON 字串解析回 JavaScript 物件
   var _sm0 = JSON.parse(jsonString); // <-- 這是關鍵的修正
   //window.alert(_sm0);
   
   sendmsg('sun_data0', `高度角: ${_sm0.sun.高度角.toFixed(0)} 度`);
   sendmsg('sun_data0', `方位角: ${atos0(_sm0.sun.方位角)} (${_sm0.sun.方位角.toFixed(0)})`);
   sendmsg('sun_data0', ` `);
   
   //sendmsg('sun_data0', `日期時間: ${_sm0.日期} ${_sm0.時間}`);
   sendmsg('sun_data0', `日出: ${_sm0.sun.日出}`);
   sendmsg('sun_data0', `正午: ${_sm0.sun.正午}`);
   sendmsg('sun_data0', `日落: ${_sm0.sun.日落}`);
   //日長= 日落-日出
   sendmsg('sun_data0', `日長: ${_sm0.sun.日長}`);
   sendmsg('sun_data0', ` `);
   
   sendmsg('sun_data0', `黎明: ${_sm0.sun.曙光}`);
   sendmsg('sun_data0', `黃昏: ${_sm0.sun.黃昏}`);
   sendmsg('sun_data0', ` `);
   
   // 黃金時段結束 (goldenHourEnd)：指日出後黃金時段的結束時間.
   // 黃金時段開始 (goldenHour)：指日落前黃金時段的開始時間.
   // 今天傍晚的黃金時段：從 18:15 開始，一直持續到日落之後光線變暗為止。這部分是 "日落黃金時段"。 (太陽在地平線上下約 4 到 6 度的範圍)
   // 明天早上的黃金時段：從日出時開始，一直持續到 05:42 結束。這部分是 "日出黃金時段"。
   //sendmsg('sun_data0', `黃金時段: ${_sm0.sun.黃金時段開始} ${_sm0.sun.黃金時段結束}`);
   sendmsg('sun_data0', `今晚黃金時段: ${_sm0.sun.黃金時段開始}`);
   // 天空從天文黃昏過渡到完全的黑暗夜空的那個時間點。 (太陽在地平線下 18 度)
   sendmsg('sun_data0', `黑夜: ${_sm0.sun.夜晚}`);
   
   
   
   if ( _sm0.moon.狀態 != '整日不可見' ) {
      //sendmsg('moon_data0', `月相編號: ${_sm0.moon.月相編號}`);
      //sendmsg('moon_data0', "https://raeltw.github.io/wea.tw/moon/"+_sm0.moon.月相編號+".png" );
      sendmsg('moon_data0', "<img style='float:right; width: 128px;' src='https://raeltw.github.io/wea.tw/moon/"+_sm0.moon.月相編號+".png'>", 0 );
   }   

   sendmsg('moon_data0', `高度角: ${_sm0.moon.高度角.toFixed(0)} 度`);
   sendmsg('moon_data0', `方位角: ${atos0(_sm0.moon.方位角)} (${_sm0.moon.方位角.toFixed(0)})`);
   sendmsg('moon_data0', ` `);

   if ( _sm0.moon.狀態 == '正常' ) {
      sendmsg('moon_data0', `月出: ${_sm0.moon.月出}`);
      sendmsg('moon_data0', `月落: ${_sm0.moon.月落}`);
      sendmsg('moon_data0', `月長: ${_sm0.moon.月長}`);
      sendmsg('moon_data0', ` `);
   } else {
      sendmsg('moon_data0', `狀態: ${_sm0.moon.狀態}`);
   }

   if ( _sm0.moon.狀態 != '整日不可見' ) {
      // fraction 告訴您月亮多亮。
      // phase 告訴您月亮在整個盈虧週期中處於哪個階段和方向。
      sendmsg('moon_data0', `亮度: ${(_sm0.moon.被照亮比例*100).toFixed(0)}%`); // fraction
      sendmsg('moon_data0', `月相: ${_sm0.moon.月相} ${_sm0.moon.月相進程.toFixed(2)}`); // phase
   }   
}