// ===============================
// 現在時刻の更新
// ===============================
function updateCurrentTime() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");

    document.getElementById("currentTime").textContent = `${hh}:${mm}`;
}
setInterval(updateCurrentTime, 1000);
updateCurrentTime();


// ===============================
// 出発時刻までのカウントダウン
// ===============================
let leaveTime = "07:30";

function updateCountdown() {
    const now = new Date();

    const [leaveH, leaveM] = leaveTime.split(":").map(Number);
    const leaveDate = new Date();
    leaveDate.setHours(leaveH);
    leaveDate.setMinutes(leaveM);
    leaveDate.setSeconds(0);

    let diff = leaveDate - now;

    // ★★★ アラーム機能追加 ★★★
    if (diff <= 0) {
    document.getElementById("countdown").textContent = "出発時間です！";

    const alarm = document.getElementById("alarmSound");
    if (alarm) {
        alarm.currentTime = 0;   // 先頭から再生
        alarm.play();

        // ★★★ 自動停止（3秒後） ★★★
        setTimeout(() => {
            alarm.pause();
            alarm.currentTime = 0;
        }, 3000);
    }

    return;
}


    const h = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, "0");
    const m = String(Math.floor(diff / 1000 / 60) % 60).padStart(2, "0");
    const s = String(Math.floor(diff / 1000) % 60).padStart(2, "0");

    document.getElementById("countdown").textContent = `${h}:${m}:${s}`;
}

setInterval(updateCountdown, 1000);
updateCountdown();


// ===============================
// タスク完了処理
// ===============================
const taskButtons = document.querySelectorAll(".task-btn");

let doneCount = 0;
const totalCount = taskButtons.length;

document.getElementById("totalCount").textContent = totalCount;

taskButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (btn.classList.contains("done")) return;

        btn.classList.add("done");

        doneCount++;
        document.getElementById("doneCount").textContent = doneCount;

        const percent = (doneCount / totalCount) * 100;
        document.getElementById("progressFill").style.width = percent + "%";
    });
});


// ===============================
// 出発時刻の設定
// ===============================
const leaveInput = document.getElementById("leaveInput");
const setLeaveBtn = document.getElementById("setLeaveBtn");

setLeaveBtn.addEventListener("click", () => {
    const newTime = leaveInput.value;

    if (!newTime) {
        alert("出発時刻を入力してください！");
        return;
    }

    leaveTime = newTime;
    document.getElementById("leaveTime").textContent = newTime;
    updateCountdown();
    updateWakeTime();
});


// ===============================
// タスク追加機能（削除ボタンは後で直す）
// ===============================
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.querySelector(".task-list");

addTaskBtn.addEventListener("click", () => {
    const taskName = taskInput.value.trim();

    if (!taskName) {
        alert("タスク名を入力してください！");
        return;
    }

    const newBtn = document.createElement("button");
    newBtn.classList.add("task-btn");
    newBtn.textContent = taskName;

    const delBtn = document.createElement("button");
    delBtn.classList.add("delete-btn");
    delBtn.textContent = "削除";

    delBtn.addEventListener("click", () => {
        newBtn.remove();
        delBtn.remove();
        updateProgress();
        saveData(); 
    });

    newBtn.addEventListener("click", () => {
        if (newBtn.classList.contains("done")) return;
        newBtn.classList.add("done");
        updateProgress();
        saveData(); 
    });

    taskList.appendChild(newBtn);
    taskList.appendChild(delBtn);

    taskInput.value = "";
    updateProgress();
    saveData();
});


// ===============================
// 進捗バー再計算
// ===============================
function updateProgress() {
    const allTasks = document.querySelectorAll(".task-btn");
    const doneTasks = document.querySelectorAll(".task-btn.done");

    const total = allTasks.length;
    const done = doneTasks.length;

    document.getElementById("totalCount").textContent = total;
    document.getElementById("doneCount").textContent = done;

    const percent = (done / total) * 100;
    document.getElementById("progressFill").style.width = percent + "%";
}


// ===============================
// ローカルストレージ保存
// ===============================
function saveData() {
    const allTasks = document.querySelectorAll(".task-btn");

    const taskData = [];
    allTasks.forEach(btn => {
        taskData.push({
            name: btn.textContent,
            done: btn.classList.contains("done")
        });
    });

    const data = {
        tasks: taskData,
        leaveTime: leaveTime
    };

    localStorage.setItem("giriData", JSON.stringify(data));
}


// ===============================
// ローカルストレージ読み込み
// ===============================
function loadData() {
    const saved = localStorage.getItem("giriData");
    if (!saved) return;

    const data = JSON.parse(saved);

    leaveTime = data.leaveTime;
    document.getElementById("leaveTime").textContent = leaveTime;
    updateCountdown();

    const taskList = document.querySelector(".task-list");
    taskList.innerHTML = "";

    data.tasks.forEach(task => {
        const newBtn = document.createElement("button");
        newBtn.classList.add("task-btn");
        newBtn.textContent = task.name;

        if (task.done) newBtn.classList.add("done");

        newBtn.addEventListener("click", () => {
            if (newBtn.classList.contains("done")) return;
            newBtn.classList.add("done");
            updateProgress();
            saveData();
        });

        const delBtn = document.createElement("button");
        delBtn.classList.add("delete-btn");
        delBtn.textContent = "削除";

        delBtn.addEventListener("click", () => {
            newBtn.remove();
            delBtn.remove();
            updateProgress();
            saveData();
        });

        taskList.appendChild(newBtn);
        taskList.appendChild(delBtn);
    });

    updateProgress();
}


// ===============================
// 次の予定をメイン画面に表示 ＋ 出発時刻に反映
// ===============================
function displayNextSchedule() {
    const saved = localStorage.getItem("giriSchedules");
    const area = document.getElementById("scheduleInfo");

    if (!saved) {
        area.innerHTML = "<p>予定がまだ登録されていません。</p>";
        return;
    }

    const schedules = JSON.parse(saved);

    if (schedules.length === 0) {
        area.innerHTML = "<p>予定がまだ登録されていません。</p>";
        return;
    }

    const next = schedules[0];

    area.innerHTML = `
        <p><strong>${next.name}</strong></p>
        <p>開始：${next.start}</p>
        <p>終了：${next.end}</p>
    `;

    leaveTime = next.end;
    document.getElementById("leaveTime").textContent = leaveTime;
    updateCountdown();
    saveData();
}


// ===============================
// ページ読み込み時に予定も表示
// ===============================
window.addEventListener("load", () => {
    loadData();
    displayNextSchedule();
    updateWakeTime(); 
});
// ===============================
// 起床時刻の計算（出発の90分前）
// ===============================
function updateWakeTime() {
    const [h, m] = leaveTime.split(":").map(Number);

    // 出発時刻を分に変換
    let total = h * 60 + m;

    // 起床時刻（90分前）
    total -= 90;

    if (total < 0) total += 24 * 60; // 日付またぎ対策

    const wakeH = String(Math.floor(total / 60)).padStart(2, "0");
    const wakeM = String(total % 60).padStart(2, "0");

    document.getElementById("wakeTime").textContent = `${wakeH}:${wakeM}`;
}
// ===============================
// 次の予定をメイン画面に表示 ＋ 出発時刻に反映（時間順ソート）
// ===============================
function displayNextSchedule() {
    const saved = localStorage.getItem("giriSchedules");
    const area = document.getElementById("scheduleInfo");

    if (!saved) {
        area.innerHTML = "<p>予定がまだ登録されていません。</p>";
        return;
    }

    let schedules = JSON.parse(saved);

    if (schedules.length === 0) {
        area.innerHTML = "<p>予定がまだ登録されていません。</p>";
        return;
    }

    // ★★★ 追加ポイント：開始時刻で並び替え ★★★
    schedules.sort((a, b) => {
        const [ah, am] = a.start.split(":").map(Number);
        const [bh, bm] = b.start.split(":").map(Number);
        return ah * 60 + am - (bh * 60 + bm);
    });

    // 並び替え後の一番早い予定が next
    const next = schedules[0];

    area.innerHTML = `
        <p><strong>${next.name}</strong></p>
        <p>開始：${next.start}</p>
        <p>終了：${next.end}</p>
    `;

    // 終了時刻を出発時刻に反映
    leaveTime = next.end;
    document.getElementById("leaveTime").textContent = leaveTime;
    updateCountdown();
    updateWakeTime(); // 起床時刻も更新
    saveData();
}
// ===============================
// 起床時刻アラーム（wakeTime になったら鳴る）
// ===============================
function checkWakeAlarm() {
    const now = new Date();

    const [wakeH, wakeM] = document.getElementById("wakeTime").textContent.split(":").map(Number);

    // wakeTime がまだ "--:--" の場合は何もしない
    if (isNaN(wakeH) || isNaN(wakeM)) return;

    const wakeDate = new Date();
    wakeDate.setHours(wakeH);
    wakeDate.setMinutes(wakeM);
    wakeDate.setSeconds(0);

    let diff = wakeDate - now;

    if (diff <= 0) {
        const alarm = document.getElementById("alarmSound");
        if (alarm) {
            alarm.currentTime = 0;
            alarm.play();

            // ★★★ 自動停止（3秒後） ★★★
            setTimeout(() => {
                alarm.pause();
                alarm.currentTime = 0;
            }, 3000);
        }
        return;
    }
}
setInterval(checkWakeAlarm, 1000);
