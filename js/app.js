// app.js — FlowAI Redesigned
// All original scheduler logic preserved. Voice engine removed.

const AppState = {
  tasks: []
};

// ====================== INIT ======================
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  startLiveClock();
  showGreeting();
  renderTimeline();
  updateDashboard();

  const addBtn = document.getElementById("add-task-btn");
  if (addBtn) addBtn.addEventListener("click", addNewTask);

  // Priority select colors
  const prioritySelect = document.getElementById("task-priority");
  if (prioritySelect) {
    prioritySelect.classList.add("priority-medium"); // default
    prioritySelect.addEventListener("change", (e) => {
      e.target.className = `priority-${e.target.value}`;
    });
  }
});

// ====================== LOAD / SAVE ======================
function loadTasks() {
  try {
    const saved = localStorage.getItem("flowai-tasks");
    if (saved) AppState.tasks = JSON.parse(saved) || [];
  } catch (e) {
    console.error("Corrupted data, resetting...");
    AppState.tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem("flowai-tasks", JSON.stringify(AppState.tasks));
}

// ====================== LIVE CLOCK ======================
function startLiveClock() {
  const timeEl = document.getElementById("current-time");
  if (!timeEl) return;

  function updateClock() {
    const now = new Date();
    const h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = (h % 12) || 12;
    timeEl.textContent = `${h12}:${m} ${ampm}`;
    updateDashboard();
  }

  updateClock();
  setInterval(updateClock, 60000);
}

// ====================== GREETING ======================
function showGreeting() {
  const greetingEl = document.getElementById("greeting");
  if (!greetingEl) return;

  const hour = new Date().getHours();
  let prefix = "Good ";
  if (hour < 12)      prefix += "morning,";
  else if (hour < 18) prefix += "afternoon,";
  else                prefix += "evening,";

  greetingEl.innerHTML = `${prefix} <span class="accent">let's get focused.</span>`;
}

// ====================== HELPERS ======================
function isValidTime(timeStr) {
  const regex = /^\d{2}:\d{2}$/;
  if (!regex.test(timeStr)) return false;
  const [h, m] = timeStr.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

function parseTimeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

function calculateDuration(start, end) {
  const diff = parseTimeToMinutes(end) - parseTimeToMinutes(start);
  if (diff <= 0) return "—";
  return diff < 60 ? `${diff}m` : `${Math.floor(diff / 60)}h ${diff % 60}m`;
}

function fmt12(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = (h % 12) || 12;
  return `${h12}:${String(m).padStart(2, "0")}${ampm}`;
}

function getPriorityColor(priority) {
  if (priority === "high")   return "#e85858";
  if (priority === "medium") return "#e8a838";
  return "#4ec97e";
}

function getPriorityBadgeClass(priority) {
  if (priority === "high")   return "badge-high";
  if (priority === "medium") return "badge-medium";
  return "badge-low";
}

// ====================== TIMELINE ======================
function renderTimeline() {
  const list = document.getElementById("timeline-list");
  const countEl = document.getElementById("task-count");
  if (!list) return;

  list.innerHTML = "";

  if (countEl) {
    countEl.textContent = `${AppState.tasks.length} task${AppState.tasks.length !== 1 ? "s" : ""}`;
  }

  if (AppState.tasks.length === 0) {
    list.innerHTML = `<li class="tl-empty">No tasks scheduled yet — add one below.</li>`;
    return;
  }

  const now = new Date();
  const curMins = now.getHours() * 60 + now.getMinutes();

  AppState.tasks.forEach((task, index) => {
    const startMins = parseTimeToMinutes(task.start);
    const endMins   = parseTimeToMinutes(task.end);
    const isDone    = endMins <= curMins;
    const isActive  = startMins <= curMins && curMins < endMins;
    const priority  = task.priority || "medium";
    const dotColor  = isDone ? "#5a7ec8" : getPriorityColor(priority);

    const li = document.createElement("li");
    li.classList.add(`priority-${priority}`);
    if (isDone) li.classList.add("done");

    const badge = isDone
      ? `<span class="tl-badge badge-done">Done</span>`
      : `<span class="tl-badge ${getPriorityBadgeClass(priority)}">${priority}</span>`;

    li.innerHTML = `
      <span class="tl-time">${fmt12(task.start)} – ${fmt12(task.end)}</span>
      <span class="tl-dot" style="background:${dotColor};"></span>
      <span class="tl-info">
        <span class="tl-title" style="${isActive ? "color:#f0ebe1; font-weight:500;" : ""}">${task.title}</span>
        <span class="tl-duration">${calculateDuration(task.start, task.end)}</span>
      </span>
      ${badge}
      <span class="tl-actions">
        <button class="edit-btn" data-index="${index}">Edit</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </span>
    `;
    list.appendChild(li);
  });

  document.querySelectorAll(".edit-btn").forEach(btn =>
    btn.addEventListener("click", handleEdit)
  );
  document.querySelectorAll(".delete-btn").forEach(btn =>
    btn.addEventListener("click", handleDelete)
  );
}

// ====================== ADD TASK ======================
function addNewTask() {
  const titleEl    = document.getElementById("task-title");
  const startEl    = document.getElementById("task-start");
  const endEl      = document.getElementById("task-end");
  const priorityEl = document.getElementById("task-priority");

  const title    = titleEl.value.trim();
  const start    = startEl.value;
  const end      = endEl.value;
  const priority = priorityEl ? priorityEl.value : "medium";

  if (!title || !start || !end) {
    alert("Please fill in all fields.");
    return;
  }
  if (!isValidTime(start) || !isValidTime(end)) {
    alert("Invalid time format. Use HH:MM.");
    return;
  }
  if (parseTimeToMinutes(end) <= parseTimeToMinutes(start)) {
    alert("End time must be after start time.");
    return;
  }

  const startMins = parseTimeToMinutes(start);
  const endMins   = parseTimeToMinutes(end);
  const overlap = AppState.tasks.some(t =>
    startMins < parseTimeToMinutes(t.end) && endMins > parseTimeToMinutes(t.start)
  );
  if (overlap) {
    alert("This task overlaps with an existing task. Please adjust the times.");
    return;
  }

  AppState.tasks.push({ id: Date.now(), title, start, end, priority });
  AppState.tasks.sort((a, b) => a.start.localeCompare(b.start));
  saveTasks();
  renderTimeline();
  updateDashboard();

  // Clear form
  titleEl.value    = "";
  startEl.value    = "";
  endEl.value      = "";
  if (priorityEl) priorityEl.value = "medium";

  // Success flash
  const form = document.querySelector(".add-task-form");
  if (form) {
    form.classList.add("success");
    setTimeout(() => form.classList.remove("success"), 1200);
  }
}

// ====================== DELETE ======================
function handleDelete(e) {
  if (!confirm("Delete this task?")) return;
  const index = parseInt(e.target.dataset.index, 10);
  AppState.tasks.splice(index, 1);
  saveTasks();
  renderTimeline();
  updateDashboard();
}

// ====================== EDIT ======================
function handleEdit(e) {
  const index = parseInt(e.target.dataset.index, 10);
  const task  = AppState.tasks[index];

  const newTitle = prompt("Task title:", task.title);
  if (newTitle === null) return;

  const newStart    = prompt("Start time (HH:MM):", task.start);
  if (newStart === null) return;

  const newEnd      = prompt("End time (HH:MM):", task.end);
  if (newEnd === null) return;

  const newPriority = prompt("Priority (high / medium / low):", task.priority || "medium");
  if (newPriority === null) return;

  if (!isValidTime(newStart) || !isValidTime(newEnd)) {
    alert("Invalid time format. Use HH:MM.");
    return;
  }
  if (parseTimeToMinutes(newEnd) <= parseTimeToMinutes(newStart)) {
    alert("End time must be after start time.");
    return;
  }

  const overlap = AppState.tasks.some((t, idx) =>
    idx !== index &&
    parseTimeToMinutes(newStart) < parseTimeToMinutes(t.end) &&
    parseTimeToMinutes(newEnd)   > parseTimeToMinutes(t.start)
  );
  if (overlap) {
    alert("Updated times overlap with another task.");
    return;
  }

  task.title    = newTitle.trim() || task.title;
  task.start    = newStart;
  task.end      = newEnd;
  task.priority = ["high", "medium", "low"].includes(newPriority.toLowerCase())
    ? newPriority.toLowerCase()
    : "medium";

  AppState.tasks.sort((a, b) => a.start.localeCompare(b.start));
  saveTasks();
  renderTimeline();
  updateDashboard();

  const form = document.querySelector(".add-task-form");
  if (form) {
    form.classList.add("edit-success");
    setTimeout(() => form.classList.remove("edit-success"), 1200);
  }
}

// ====================== DASHBOARD ======================
function updateDashboard() {
  const currentText = document.getElementById("current-task-text");
  const nextText    = document.getElementById("next-task-text");
  if (!currentText || !nextText) return;

  if (AppState.tasks.length === 0) {
    currentText.textContent = "No active task";
    nextText.textContent    = "Add tasks to get started";
    return;
  }

  const now        = new Date();
  const curMins    = now.getHours() * 60 + now.getMinutes();
  let currentTask  = null;
  let nextTask     = null;

  for (let i = 0; i < AppState.tasks.length; i++) {
    const s = parseTimeToMinutes(AppState.tasks[i].start);
    const e = parseTimeToMinutes(AppState.tasks[i].end);

    if (curMins >= s && curMins < e) {
      currentTask = AppState.tasks[i];
      nextTask    = AppState.tasks[i + 1] || null;
      break;
    }
    if (curMins < s) {
      nextTask = AppState.tasks[i];
      break;
    }
  }

  if (currentTask) {
    currentText.innerHTML = `${currentTask.title}<small>${fmt12(currentTask.start)} – ${fmt12(currentTask.end)}</small>`;
  } else {
    currentText.textContent = "Free time";
  }

  if (nextTask) {
    nextText.innerHTML = `${nextTask.title}<small>${fmt12(nextTask.start)} – ${fmt12(nextTask.end)}</small>`;
  } else {
    nextText.textContent = "Day complete ✓";
  }
}