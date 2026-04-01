// js/app.js - Phase 1.5 (Smart Dashboard + Scheduler Engine)

let tasks = [];

// ====================== INIT ======================
document.addEventListener("DOMContentLoaded", () => {
  console.log("%c🚀 FlowAI Phase 1.5 started - Smart Dashboard", "color:#1e3a5f; font-size:18px; font-weight:bold");

  loadTasks();
  startLiveClock();
  showGreeting();
  renderTimeline();
  updateDashboard();                    // ← NEW: show Now & Next immediately

  // Connect Add Task button
  document.getElementById("add-task-btn").addEventListener("click", addNewTask);

  console.log("✅ Smart Dashboard ready!");
});

// ====================== LOAD / SAVE ======================
function loadTasks() {
  const saved = localStorage.getItem("flowai-tasks");
  if (saved) tasks = JSON.parse(saved);
}

function saveTasks() {
  localStorage.setItem("flowai-tasks", JSON.stringify(tasks));
}

// ====================== LIVE CLOCK + DASHBOARD ======================
function startLiveClock() {
  const timeEl = document.getElementById("current-time");

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes}`;

    updateDashboard();        // ← Every minute we also refresh Now/Next
  }

  updateClock();
  setInterval(updateClock, 60000);
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

// ====================== NEW: SMART DASHBOARD (Now + Next) ======================
function updateDashboard() {
  const currentText = document.getElementById("current-task-text");
  const nextText = document.getElementById("next-task-text");

  if (tasks.length === 0) {
    currentText.textContent = "No tasks yet";
    nextText.textContent = "Add tasks to get started";
    return;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let currentTask = null;
  let nextTask = null;

  for (let i = 0; i < tasks.length; i++) {
    const taskStart = parseTimeToMinutes(tasks[i].start);
    const taskEnd   = parseTimeToMinutes(tasks[i].end);

    // Is this task happening RIGHT NOW?
    if (currentMinutes >= taskStart && currentMinutes < taskEnd) {
      currentTask = tasks[i];
      nextTask = tasks[i + 1] || null;   // next one after this
      break;
    }

    // If we passed this task, the next one is the candidate
    if (currentMinutes < taskStart) {
      nextTask = tasks[i];
      break;
    }
  }

  // If no current task but we have future tasks
  if (!currentTask && !nextTask && tasks.length > 0) {
    nextTask = tasks[0];
  }

  // Update "Now" card
  if (currentTask) {
    currentText.innerHTML = `<strong>${currentTask.title}</strong><br><small>${currentTask.start} – ${currentTask.end}</small>`;
  } else {
    currentText.textContent = "Free time";
  }

  // Update "Next" card
  if (nextTask) {
    nextText.innerHTML = `<strong>${nextTask.title}</strong><br><small>${nextTask.start} – ${nextTask.end}</small>`;
  } else {
    nextText.textContent = "Day complete ✓";
  }
}

// Helper: convert "HH:MM" to minutes since midnight
function parseTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
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

  tasks.sort((a, b) => a.start.localeCompare(b.start));

  saveTasks();
  renderTimeline();
  updateDashboard();        // ← Refresh Now/Next immediately

  // Clear form
  document.getElementById("task-title").value = "";
  document.getElementById("task-start").value = "";
  document.getElementById("task-end").value = "";

  console.log("✅ Task added and dashboard updated:", title);
}