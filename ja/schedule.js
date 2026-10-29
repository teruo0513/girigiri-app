// ローカルストレージから予定を読み込む
function loadSchedules() {
    const saved = localStorage.getItem("giriSchedules");
    if (!saved) return [];

    return JSON.parse(saved);
}

// ローカルストレージに予定を保存する
function saveSchedules(data) {
    localStorage.setItem("giriSchedules", JSON.stringify(data));
}

// ページ読み込み時に予定一覧を表示
function displaySchedules() {
    const list = document.getElementById("scheduleList");
    const schedules = loadSchedules();

    list.innerHTML = "";

    schedules.forEach((s, index) => {
        const item = document.createElement("div");
        item.classList.add("schedule-item");
        item.innerHTML = `
            <p><strong>${s.name}</strong></p>
            <p>開始：${s.start}</p>
            <p>終了：${s.end}</p>
            <button class="delete-btn" data-index="${index}">削除</button>
            <hr>
        `;
        list.appendChild(item);
    });

    // 削除処理
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            const schedules = loadSchedules();
            schedules.splice(index, 1);
            saveSchedules(schedules);
            displaySchedules();
        });
    });
}

// 保存ボタン
document.getElementById("saveScheduleBtn").addEventListener("click", () => {
    const name = document.getElementById("scheduleName").value.trim();
    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value;

    if (!name || !start || !end) {
        alert("すべて入力してください！");
        return;
    }

    const schedules = loadSchedules();
    schedules.push({ name, start, end });
    saveSchedules(schedules);

    alert("予定を保存しました！");
    displaySchedules();
});

// 初期表示
displaySchedules();
