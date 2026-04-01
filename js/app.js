// js/app.js - Phase 2 - Scheduler Engine (Full task management)

let tasks = [];

// ====================== INIT ======================
document.addEventListener("DOMContentLoaded", () => {
  console.log("%c🚀 FlowAI Phase 2 started - Scheduler Engine", "color:#1e3a5f; font-size:18px; font-weight:bold");

  loadTasks();
  startLiveClock();
  showGreeting();
  renderTimeline();
  updateDashboard();

  document.getElementById("add-task-btn").addEventListener("click", addNewTask);

  console.log("✅ Scheduler Engine ready! Add, edit, or delete tasks.");
});

// ====================== LOAD / SAVE ======================
function loadTasks() {
  const saved = localStorage.getItem("flowai-tasks");
  if (saved) tasks = JSON.parse(saved);
}

function saveTasks() {
  localStorage.setItem("flowai-tasks", JSON.stringify(tasks));
}

// ====================== LIVE CLOCK ======================
function startLiveClock() {
  const timeEl = document.getElementById("current-time");
  function updateClock() {
    const now = new Date();
    timeEl.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    updateDashboard();
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

// ====================== TIMELINE (now with edit/delete) ======================
function renderTimeline() {
  const list = document.getElementById("timeline-list");
  list.innerHTML = "";

  if (tasks.length === 0) {
    list.innerHTML = `<li style="text-align:center; color:#999; padding:30px 20px;">No tasks yet.<br>Add one above! 👆</li>`;
    return;
  }

  tasks.forEach((task, index) => {
    const duration = calculateDuration(task.start, task.end);
    const priorityColor = getPriorityColor(task.priority || "medium");

    const li = document.createElement("li");
    li.innerHTML = `
      <span>
        <strong>${task.start} – ${task.end}</strong> 
        ${task.title}
        <span style="background:${priorityColor}; color:white; padding:2px 8px; border-radius:12px; font-size:0.8rem; margin-left:10px;">
          ${task.priority || "medium"}
        </span>
        <small style="margin-left:15px; color:#666;">(${duration})</small>
      </span>
      <div>
        <button class="edit-btn" data-index="${index}">✏️</button>
        <button class="delete-btn" data-index="${index}">🗑️</button>
      </div>
    `;
    list.appendChild(li);
  });

  // Attach edit & delete listeners
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", handleEdit);
  });
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", handleDelete);
  });
}

// ====================== NEW: ADD TASK (with priority) ======================
function addNewTask() {
  const title = document.getElementById("task-title").value.trim();
  const start = document.getElementById("task-start").value;
  const end = document.getElementById("task-end").value;
  const priority = document.getElementById("task-priority") ? document.getElementById("task-priority").value : "medium";

  if (!title || !start || !end) {
    alert("Please fill all fields!");
    return;
  }

  // Validate end > start
  if (parseTimeToMinutes(end) <= parseTimeToMinutes(start)) {
    alert("End time must be after start time!");
    return;
  }

  tasks.push({
    id: Date.now(),
    title,
    start,
    end,
    priority
  });

  tasks.sort((a, b) => a.start.localeCompare(b.start));
  saveTasks();
  renderTimeline();
  updateDashboard();

  // Clear form
  document.getElementById("task-title").value = "";
  document.getElementById("task-start").value = "";
  document.getElementById("task-end").value = "";

  console.log("✅ Task added:", title);
}

// ====================== DELETE TASK ======================
function handleDelete(e) {
  if (!confirm("Delete this task?")) return;
  const index = parseInt(e.target.dataset.index);
  tasks.splice(index, 1);
  saveTasks();
  renderTimeline();
  updateDashboard();
}

// ====================== EDIT TASK ======================
function handleEdit(e) {
  const index = parseInt(e.target.dataset.index);
  const task = tasks[index];

  const newTitle = prompt("Edit task title:", task.title);
  if (newTitle === null) return;

  const newStart = prompt("Edit start time (HH:MM):", task.start);
  const newEnd = prompt("Edit end time (HH:MM):", task.end);
  const newPriority = prompt("Priority (high/medium/low):", task.priority || "medium");

  if (newStart && newEnd && parseTimeToMinutes(newEnd) > parseTimeToMinutes(newStart)) {
    task.title = newTitle.trim();
    task.start = newStart;
    task.end = newEnd;
    task.priority = newPriority.toLowerCase();
    
    tasks.sort((a, b) => a.start.localeCompare(b.start));
    saveTasks();
    renderTimeline();
    updateDashboard();
  } else {
    alert("Invalid times or end must be after start!");
  }
}

// ====================== HELPERS ======================
function calculateDuration(start, end) {
  const s = parseTimeToMinutes(start);
  const e = parseTimeToMinutes(end);
  const diff = e - s;
  return diff < 60 ? `${diff} min` : `${Math.floor(diff/60)}h ${diff%60}min`;
}

function getPriorityColor(priority) {
  if (priority === "high") return "#ff4444";
  if (priority === "medium") return "#ffaa00";
  return "#44aa44";
}

function parseTimeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// ====================== SMART DASHBOARD (unchanged from Phase 1.5) ======================
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

    if (currentMinutes >= taskStart && currentMinutes < taskEnd) {
      currentTask = tasks[i];
      nextTask = tasks[i + 1] || null;
      break;
    }
    if (currentMinutes < taskStart) {
      nextTask = tasks[i];
      break;
    }
  }

  if (!currentTask && tasks.length > 0) nextTask = tasks[0];

  if (currentTask) {
    currentText.innerHTML = `<strong>${currentTask.title}</strong><br><small>${currentTask.start}–${currentTask.end}</small>`;
  } else {
    currentText.textContent = "Free time";
  }

  if (nextTask) {
    nextText.innerHTML = `<strong>${nextTask.title}</strong><br><small>${nextTask.start}–${nextTask.end}</small>`;
  } else {
    nextText.textContent = "Day complete ✓";
  }
}