const week = ["日", "月", "火", "水", "木", "金", "土"];
const today = new Date();
let showDate = new Date(today.getFullYear(), today.getMonth(), 1);




// リソースを読み込んでから処理を実行
window.onload = function () {

    /* JSONデータの取得 */
    let xhr = new XMLHttpRequest(),
    method = "GET",
    url = "event.json";
    xhr.open(method, url, true);
    xhr.responseType = "json";
    xhr.send();
    xhr.onload = function() {
        const obj = xhr.response;
        console.log(obj);
        /* カレンダー表示 */
        showCalendar(today);
    }
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
    let year = date.getFullYear();
    let month = date.getMonth();
    //年月表示
    document.querySelector('#cal-header').innerHTML = year + "年" + (month + 1) + "月";
    let calendarHtml = createCalendar(year, month);
    document.querySelector('#calendar').innerHTML = calendarHtml;
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
                    calendarHtml += "<td class = 'today'>" + count + "</td>"
                }else {
                    calendarHtml += "<td>" + count + "</td>";
                }
            }
        }
        calendarHtml += "</tr>";
    }
    return calendarHtml;
}

