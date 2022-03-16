const week = ["日", "月", "火", "水", "木", "金", "土"];
const today = new Date();
let showDate = new Date(today.getFullYear(), today.getMonth(), 1);


// リソースを読み込んでから処理を実行
window.onload = function () {
    /* カレンダー表示 */
    showCalendar(today);
}

// 前の月を表示
function prev(){
    showDate.setMonth(showDate.getMonth() - 1);
    showCalendar(showDate);
}

// 次の月を表示
function next(){
    showDate.setMonth(showDate.getMonth() + 1);
    showCalendar(showDate);
}

/* 日付を各種データに変換する関数 */
/* 時間はJSTのみ */
/* year: 年、month: 月、date: 日、day: 曜日（0が日曜）、hour: 時、minute: 分、second: 秒、timestamp: UNIXタイムスタンプ（UTC0:00基準）、timeDefined: 時間が定義されているかどうか、timestring: xx:xxの時間表記 */
/* 記法：2021/02/21 10:00:00, 2021-02-21 10:00:00 */
/* 　　　2021/02/21 10:00, 2021-02-21 10:00 */
/* 　　　2021/02/21, 2021-02-21 */
function parseDate(time) {
    const data = {};
    time = time.split(' ');
    if (time[0].indexOf('/') != -1) {
      time[0] = time[0].split('/');
    }
    else if (time[0].indexOf('-') != -1) {
      time[0] = time[0].split('-');
    }
    
    data.year=Number(time[0][0]);
    data.month=Number(time[0][1]);
    data.date=Number(time[0][2]);
  
    /* 時間指定あり */
    if (time.length == 2) {
      time[1] = time[1].split(':');
  
      /* 秒の指定なし→0秒にする */
      if (time[1].length == 3) time[1][2] = 0;
  
      data.timeDefined = 1;
      data.hour=Number(time[1][0]);
      data.minute=Number(time[1][1]);
      data.second=Number(time[1][2]);
    }
  
    /* 時間指定なし→0時0分0秒、時間指定なし */
    else if (time.length == 1) {
      data.timeDefined = 0;
      data.hour=0;
      data.minute=0;
      data.second=0;
    }
  
    data.timeString = String(data.hour) + ":" + String(('0' + data.minute).slice(-2));
    const date=new Date(new Date(data.year, data.month - 1, data.date, data.hour, data.minute, data.second).getTime() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));  //どのクライアントでも日本時間になるように
    data.timestamp = date.getTime();
    data.day = new Date(data.timestamp + (9 * 60 * 60 * 1000)).getUTCDay(); //あえて9時間足して、JST基準のUNIXタイムスタンプにして、getUTCDayで求める
    
    return data;
}

function parseTimestamp (timestamp) {
    const date = new Date(timestamp + 9 * 60 * 60 * 1000);  //どのクライアントでも日本時間になるように
    let data = [];
    data.year = date.getUTCFullYear();
    data.month = date.getUTCMonth() + 1;
    data.date = date.getUTCDate();
    data.day = date.getUTCDay();
    data.hour = date.getUTCHours();
    data.minute = date.getUTCMinutes();
    data.second = date.getUTCSeconds();
    return data;
}


/* 単日開催（1）か複数日開催（0）かの確認 */
function eventDaysCheck(startTime, endTime) {
    let startTimeDate = parseDate(startTime);
    let endTimeDate = parseDate(endTime);
  
    if (startTimeDate.year == endTimeDate.year && startTimeDate.month == endTimeDate.month && startTimeDate.date == endTimeDate.date) return 1;
    else return 0;
  }
  
  /* 開催日を表すIDの生成（複数日開催と単日開催で分ける） */
  /* 単日開催: 2021-4-1 */
  /* 複数日開催: 2021-4-1_2021-4-2 */
  function generateDateID(startTime, endTime) {
    let startTimeDate = parseDate(startTime);
    let endTimeDate = parseDate(endTime);
    
    let startTimeArray = [startTimeDate.year, startTimeDate.month, startTimeDate.date];
    let endTimeArray = [endTimeDate.year, endTimeDate.month, endTimeDate.date];
  
    /* 単日 */
    if (eventDaysCheck(startTime, endTime) == 1) return startTimeArray.join('-');
    /* 複数日 */
    else {
      let buff = [startTimeArray.join('-'), endTimeArray.join('-')];
      return buff.join('_');
    }
  }
  
  function generateSubmitButton(status, url = "") {
    /* ノード作成 */
    let btn = document.createElement("a");
    /* ノードに共通の設定 */
    btn.setAttribute("target", "_blank");
    btn.setAttribute("rel", "noopener noreferrer");
    btn.classList.add("submit-btn");
    switch(status) {
      case 0:
        btn.innerText = "申し込みは不要です";
        btn.classList.add("btn-disabled", "okay");
        break;
      case 1:
        btn.innerText = "後日申し込み開始";
        btn.classList.add("btn-disabled", "okay");
        break;
      case 2:
        btn.innerText = "申し込み終了しました";
        btn.classList.add("btn-disabled", "ng");
        break;
      case 3:
        btn.innerText = "終了しました";
        btn.classList.add("btn-disabled", "ng");
        break;
      case 4:
        btn.innerText = "中止になりました";
        btn.classList.add("btn-disabled", "ng");
        break;
      case 5:
        btn.innerText = "開催を検討中です";
        btn.classList.add("btn-disabled");
        break;
      case 6:
        btn.innerText = "申し込む";
        btn.classList.add("btn-available");
        btn.setAttribute("href", url);
        break;
      case 7:
        btn.innerText = "フォームへ";
        btn.classList.add("btn-available");
        btn.setAttribute("href", url);
        break;
    }
    return btn;
  }
  
  function statusAvailableJudge(status) {
    switch(status) {
      case 2:
      case 3:
      case 4:
      case 5:
        return 0;
        break;
      default:
        return 1;
        break;
    }
  }


// カレンダー作成
function createCalendar(year, month){
    // 曜日
    let calendarHtml = "<table><tr class = 'dayOfWeek'>";
    for(let i = 0 ; i < week.length ; i++){
        calendarHtml += "<th>" + week[i] + "</th>";
    }
    calendarHtml += "</tr>";

    let = count = 0;
    let startDayOfWeek = new Date(year, month, 1).getDay();
    let endDate = new Date(year, month + 1, 0).getDate();
    let lastMonthEndDate = new Date(year, month, 0).getDate();
    let row = Math.ceil((startDayOfWeek + endDate) / week.length);

    // 日付
    for(let i = 0 ; i < row ; i++){
        calendarHtml += "<tr>";
        for(let j = 0 ; j < week.length; j++){
            if(i == 0 && j < startDayOfWeek){
                // 1行目で1日まで先月の日付を表示
                calendarHtml += "<td class = 'date-disabled'>" + (lastMonthEndDate - startDayOfWeek + 1 + j) + "</td>";
            } else if(count >= endDate){
                // 最終行で最終日以降翌月の日付を表示
                count++;
                calendarHtml += "<td class = 'date-disabled'>" + (count - endDate) + "</td>";
            } else {
                count++;
                if(year == today.getFullYear() && month == today.getMonth() && count == today.getDate()){
                    calendarHtml += "<td class = 'today id" + year + "-" + (month + 1) + "-" + count + "'>" + count + "</td>";
                }else {
                    calendarHtml += "<td  class = 'id" + year + "-" + (month + 1) + "-" + count + "'>" + count + "</td>";
                }
            }
        }
        calendarHtml += "</tr>";
    }
    return calendarHtml;
}


function showCalendar(date){
    /* JSONデータの取得 */
    const getEventListJSON = new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest(),
            method = "GET",
            url = "event.json";

        xhr.responseType = "json";
        xhr.open(method, url, true);
        xhr.onreadystatechange = () => {
            if(xhr.readyState == 4 && xhr.status == 200) {
            let obj = [xhr.response];
            resolve(obj);
            }
        }
        xhr.send();
    });

    /* ステータスに現在時刻を反映して返す。以後はここでstatusが更新されたobj[0]を使い続ける */
    /* また開始・終了時間から求めた日程識別用のdateIDを追加する */
    const statusTimeReflect = getEventListJSON.then((obj) => {
        return new Promise((resolve, reject) => {
            const nowTimeStamp = new Date().getTime();
            for (i = 0; i < obj[0].length; i++) {
                /* まずstatus省略時の対応 */
                if (typeof obj[0][i].status === "undefined") obj[0][i].status = 0;
        
                /* 文字列としてURL以外の数字などが入力されている場合の対策 */
                obj[0][i].status = parseInt(obj[0][i].status);
        
                /* ステータスの優先度は「中止＞終了＞検討中＞申し込み終了＞申し込み不要＝後日申し込み開始＝フォームURL」。 */
                /* 中止の場合を除外 */
                if (obj[0][i].status != 4) {
                    /* 企画の終了判定 */
                    let endTime = parseDate(obj[0][i].endTime);
                    /* endTimeで時間が定義されている場合=>その時間以降終了表示に */
                    if (endTime.timeDefined == 1 && endTime.timestamp <= nowTimeStamp) obj[0][i].status = 3;
                    /* endTimeで時間が定義されていない場合=>その翌日の0時以降終了表示に */
                    else if (endTime.timeDefined == 0 && (endTime.timestamp + 24 * 60 * 60 * 1000) <= nowTimeStamp) obj[0][i].status = 3;
                    
                    /* 中止、終了、検討中の場合を除外 */
                    if (obj[0][i].status != 4 && obj[0][i].status != 3 && obj[0][i].status != 5) {
                        /* 申込終了（時間面）判定 */
                        /* まずフォームの時間制限の設定がされているかどうか */
                        if (typeof(obj[0][i].submitLimitTime) !== "undefined") {
                            /* 時間制限の設定がなされているので比較 */
                            let submitLimitTime = parseDate(obj[0][i].submitLimitTime);
                            if (submitLimitTime.timestamp <= nowTimeStamp) obj[0][i].status = 2;
                        }
                    }
                }
                
                /* 日付識別用のdateIDの追加 */
                obj[0][i].dateID = generateDateID(obj[0][i].startTime, obj[0][i].endTime);
            }
            resolve(obj);
        })
    });

    /* 定員チェック */
    /* const statusCapaReflect = statusTimeReflect.then((obj) => {
        return new Promise((resolve, reject) => {


        let xhr = new XMLHttpRequest(),
            method = "GET",
            url = capacityURL;
        
        xhr.responseType = "json";
        xhr.open(method, url, true);
        xhr.onreadystatechange = () => {
            if(xhr.readyState == 4 && xhr.status == 200) {
            // スプレッドシート受け取り
            let obj2 = xhr.response;
            // スプレッドシートのうちデータ部分のみ取り出し
            obj2 = obj2.feed.entry;
    
            // スプレッドシート側のイベントごと照合
            for (i = 0; i < obj2.length; i++) {
                let eventName = obj2[i]["gsx$eventname"]["$t"];  // 企画名、照合に用いる
    
                let reservedNumber = obj2[i]["gsx$applied"]["$t"]; // 申込数
                reservedNumber -= obj2[i]["gsx$canceled"]["$t"]; // キャンセル数
    
                let limitNumber = obj2[i]["gsx$limit"]["$t"];  // 定員
                let remainNumber = limitNumber - reservedNumber;  // 残り枠数
    
                // JSON側の全ての企画と企画名を照合
                for (j = 0; j < obj[0].length; j++) {
                    // 企画名が照合された場合
                    if (obj[0][j].name == eventName) {
                        // 残り枠数
                        obj[0][j].submitRemain = remainNumber;
        
                        // 定員いっぱい、申し込み終了
                        if (remainNumber <= 0) {
                            obj[0][j].status = 2;
                        }
                    }
                }
            }
            resolve(obj);
            }
        }
        xhr.send();
        })
    });
 */
    /* 企画一覧部分のテンプレートの取得。obj[1]に格納される。 */
    /* const loadTemplate = statusTimeReflect.then((obj) => {
        return new Promise((resolve, reject) => {
            
            let xhr = new XMLHttpRequest(),
                method = "GET",
                url = "template.html";
        
            xhr.responseType = "document";
            xhr.open(method, url, true);
            xhr.onreadystatechange = () => {
                if(xhr.readyState == 4 && xhr.status == 200) {
                    obj[1] = xhr.responseXML;
                    resolve(obj);
                }
            }
            xhr.send();
        });
    }); */


    /* カレンダー生成 */
    const generateCalender = statusTimeReflect.then((obj) => {
        return new Promise((resolve, reject) => {
            let year = date.getFullYear();
            let month = date.getMonth();
            // カレンダーの年月表示
            document.querySelector('#cal-header').innerHTML = year + "年" + (month + 1) + "月";
            // カレンダー作成
            let calendarHtml = createCalendar(year, month);
            document.querySelector('#calendar').innerHTML = calendarHtml;

            resolve(obj);
        })
    });

    // カレンダーに企画を追加
    const addEvent = generateCalender.then((obj) => {
        return new Promise((resolve, reject) => {
            let year = date.getFullYear(); // 表示される年
            let month = date.getMonth(); // 表示される月
            
            for(let i = 0 ; i < obj[0].length; i++){
                console.log(obj[0]);
                let parsedStartTime = parseDate(obj[0][i].startTime); // 企画の開始時間
                let parsedEndTime = parseDate(obj[0][i].endTime); // 企画の終了時間
                
                if(parsedStartTime.year == year && parsedStartTime.month == (month + 1)){
                    let elem = document.querySelector('.id' + obj[0][i].dateID);
                    elem.classList.add("event");
                    elem.innerHTML += "<div class = 'event-name'>" + obj[0][i].name + "</div>"
                                    + "<div class = 'event-time'>" + parsedStartTime.timeString + "~" + parsedEndTime.timeString + "</div>";
                }
            }
            resolve(obj);
        });
    });
}
