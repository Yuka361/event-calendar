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

// カレンダー表示
function showCalendar(date){
    /* JSONデータの取得 */
    let xhr = new XMLHttpRequest(),
        method = "GET",
        url = "event.json";
    xhr.open(method, url, true);
    xhr.responseType = "json";
    xhr.send();
    xhr.onload = function() {
        const obj = xhr.response;

        //カレンダーの年月表示
        let year = date.getFullYear();
        let month = date.getMonth();
        document.querySelector('#cal-header').innerHTML = year + "年" + (month + 1) + "月";
        // カレンダー作成
        let calendarHtml = createCalendar(year, month);
        document.querySelector('#calendar').innerHTML = calendarHtml;
        addEvent(year, month, obj);
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

// イベントをカレンダーに追加
function addEvent(year, month, obj){
    for(let i = 0 ; i < obj.length; i++){
        if(obj[i].startYear == year && obj[i].startMonth == (month + 1)){
            let elem = document.querySelector('.id' + obj[i].id);
            elem.classList.add("event");
            elem.innerHTML += "<div class = 'event-name'>" + obj[i].name + "</div>"
            + "<div class = 'event-time'>" + obj[i].time + "</div>";
        }
    }
}