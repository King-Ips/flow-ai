// js/app.js - Phase 1 (Classic version - super simple)

let tasks = [];

// Run when page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("%c🚀 FlowAI Phase 1 started (classic version)", "color:#1e3a5f; font-size:18px; font-weight:bold");

  loadTasks();
  startLiveClock();
  showGreeting();
  renderTimeline();

  // Connect Add Task button
  document.getElementById("add-task-btn").addEventListener("click", addNewTask);

  console.log("✅ App ready! Add a task to test.");
});

// ====================== LOAD / SAVE ======================
function loadTasks() {
  const saved = localStorage.getItem("flowai-tasks");
  if (saved) {
    tasks = JSON.parse(saved);
    console.log("📂 Loaded", tasks.length, "tasks from storage");
  }
}

function saveTasks() {
  localStorage.setItem("flowai-tasks", JSON.stringify(tasks));
}

// ====================== LIVE CLOCK ======================
function startLiveClock() {
  const timeEl = document.getElementById("current-time");

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes}`;
  }

  updateClock();
  setInterval(updateClock, 60000);   // every minute
  console.log("⏰ Live clock started");
}

// ====================== GREETING ======================
function showGreeting() {
  const greetingEl = document.getElementById("greeting");
  const hour = new Date().getHours();
  let text = "Good ";

  if (hour < 12) text += "morning";
  else if (hour < 18) text += "afternoon";
  else text += "evening";

  greetingEl.textContent = `${text}, Ipeleng! 👋`;
  console.log("👋 Greeting shown");
}

// ====================== TIMELINE ======================
function renderTimeline() {
  const list = document.getElementById("timeline-list");
  list.innerHTML = "";

  if (tasks.length === 0) {
    list.innerHTML = `<li style="text-align:center; color:#999; padding:30px 20px;">
      No tasks yet.<br>Add one above! 👆
    </li>`;
    return;
  }

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.innerHTML = `<span><strong>${task.start} – ${task.end}</strong> ${task.title}</span>`;
    list.appendChild(li);
  });
}

// ====================== ADD TASK ======================
function addNewTask() {
  const title = document.getElementById("task-title").value.trim();
  const start = document.getElementById("task-start").value;
  const end = document.getElementById("task-end").value;

  if (!title || !start || !end) {
    alert("Please fill in all three fields!");
    return;
  }

  tasks.push({
    id: Date.now(),
    title,
    start,
    end
  });

  // Sort by start time
  tasks.sort((a, b) => a.start.localeCompare(b.start));

  saveTasks();
  renderTimeline();

  // Clear the form
  document.getElementById("task-title").value = "";
  document.getElementById("task-start").value = "";
  document.getElementById("task-end").value = "";

  console.log("✅ Task added:", title);
}