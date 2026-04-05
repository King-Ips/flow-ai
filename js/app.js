// js/app.js - Phase 2 - Scheduler Engine (Full task management)

const AppState = {
  tasks: []
};

// ====================== INIT ======================
document.addEventListener("DOMContentLoaded", () => 
  {
  console.log("%c🚀 FlowAI Phase 2 started - Scheduler Engine", "color:#1e3a5f; font-size:18px; font-weight:bold");

  loadTasks();
  startLiveClock();
  showGreeting();
  renderTimeline();
  updateDashboard();

  const addBtn = document.getElementById("add-task-btn");
  if (addBtn) addBtn.addEventListener("click", addNewTask);
  else console.warn("Add task button not found");


  // Initialize voice engine (Phase 3, but safe to call now) - START VOICE ENGINE
  initVoiceEngine(); 


  console.log("✅ Scheduler Engine ready! Add, edit, or delete tasks.");
});

// ====================== LOAD / SAVE ======================
function loadTasks() {
  const saved = localStorage.getItem("flowai-tasks");
  try {
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
  if (!timeEl) {
    console.warn("Current time element not found");
    return;
  } 
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
  if (!greetingEl) {
    console.warn("Greeting element not found");
    return;
  }
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
  if (!list) {
    console.warn("Timeline list element not found");
    return;
  }
  list.innerHTML = "";

  if (AppState.tasks.length === 0) {
    list.innerHTML = `<li style="text-align:center; color:#999; padding:30px 20px;">No tasks yet.<br>Add one above! 👆</li>`;
    return;
  }

  AppState.tasks.forEach((task, index) => {
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

  // Validate times
  if (!isValidTime(start) || !isValidTime(end)) {
    alert("Invalid time format! Use HH:MM (00:00-23:59)");
    return;
  }

  // Check for overlaps
const startMins = parseTimeToMinutes(start);
const endMins = parseTimeToMinutes(end);
const overlap = AppState.tasks.some(t =>
  startMins < parseTimeToMinutes(t.end) && endMins > parseTimeToMinutes(t.start)
);

  if (overlap) {
    alert("Task overlaps with existing task. Adjust times.");
    return;
  }

  AppState.tasks.push({
    id: Date.now(),
    title,
    start,
    end,
    priority
  });

  // Sort safety
  if (AppState.tasks.every(t => isValidTime(t.start) && isValidTime(t.end))) {
    AppState.tasks.sort((a, b) => a.start.localeCompare(b.start));
  } else {
    console.error("Invalid task times - sort skipped");
  }
  saveTasks();
  renderTimeline();
  updateDashboard();

// Clear form
  document.getElementById("task-title").value = "";
  document.getElementById("task-start").value = "";
  document.getElementById("task-end").value = "";
  
  // Feedback
  const form = document.querySelector('.add-task-form');
  if (form) {
    form.style.background = '#d4edda';
    form.style.transition = 'background 0.3s';
    setTimeout(() => {
      form.style.background = 'white';
    }, 1500);
  }

  console.log("✅ Task added:", title);
}

// ====================== DELETE TASK ======================
function handleDelete(e) {
  if (!confirm("Delete this task?")) return;
  const index = parseInt(e.target.dataset.index);
  AppState.tasks.splice(index, 1);
  saveTasks();
  renderTimeline();
  updateDashboard();
}

// ====================== EDIT TASK ======================
function handleEdit(e) {
  const index = parseInt(e.target.dataset.index);
  const task = AppState.tasks[index]; 

  const newTitle = prompt("Edit task title:", task.title);
  if (newTitle === null) return;

  const newStart = prompt("Edit start time (HH:MM):", task.start);
  const newEnd = prompt("Edit end time (HH:MM):", task.end);
  const newPriority = prompt("Priority (high/medium/low):", task.priority || "medium");

  if (!newStart || !newEnd) {
    alert("Start and end times required!");
    return;
  }
  if (!isValidTime(newStart) || !isValidTime(newEnd)) {
    alert("Invalid time format! Use HH:MM (00:00-23:59)");
    return;
  }
  if (parseTimeToMinutes(newEnd) <= parseTimeToMinutes(newStart)) {
    alert("End time must be after start time!");
    return;
  }

  // Check overlaps
  const overlap = AppState.tasks.some((t, idx) => idx !== index && newStart < t.end && newEnd > t.start);
  if (overlap) {
    alert("New times overlap with another task. Adjust.");
    return;
  } 

  if (newStart && newEnd && parseTimeToMinutes(newEnd) > parseTimeToMinutes(newStart)) {
    task.title = newTitle.trim();
    task.start = newStart;
    task.end = newEnd;
    task.priority = newPriority.toLowerCase();
    
    // Sort safety
    if (AppState.tasks.every(t => isValidTime(t.start) && isValidTime(t.end))) {
      AppState.tasks.sort((a, b) => a.start.localeCompare(b.start));
    } else {
      console.error("Invalid task times - sort skipped");
    }
    saveTasks();
    renderTimeline();
    updateDashboard();
    
    // Feedback for edit
    const form = document.querySelector('.add-task-form');
    if (form) {
      form.style.background = '#d1ecf1';
      setTimeout(() => form.style.background = 'white', 1000);
    }
  } else {
    alert("Invalid times or end must be after start!");
  }
}

// ====================== HELPERS ======================
function isValidTime(timeStr) {
  const regex = /^\d{2}:\d{2}$/;
  if (!regex.test(timeStr)) return false;
  const [h, m] = timeStr.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

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
  if (isNaN(h) || isNaN(m)) {
    console.warn("Invalid time:", timeStr);
    return 0;
  }
  return h * 60 + m;
}

// ====================== SMART DASHBOARD (unchanged from Phase 1.5) ======================
function updateDashboard() 
{
  const currentText = document.getElementById("current-task-text");
  const nextText = document.getElementById("next-task-text");
  if (!currentText || !nextText) {
    console.warn("Dashboard elements not found");
    return;
  }

  if (AppState.tasks.length === 0) {
    currentText.textContent = "No tasks yet";
    nextText.textContent = "Add tasks to get started";
    return;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let currentTask = null;
  let nextTask = null;

  for (let i = 0; i < AppState.tasks.length; i++) {
    const taskStart = parseTimeToMinutes(AppState.tasks[i].start);
    const taskEnd   = parseTimeToMinutes(AppState.tasks[i].end); 

    if (currentMinutes >= taskStart && currentMinutes <= taskEnd) {
       currentTask = AppState.tasks[i];
       nextTask = AppState.tasks[i + 1] || null;
      break;
    }
    if (currentMinutes < taskStart) {
      nextTask = AppState.tasks[i];
      break;
    } 
  }
  
  if (!currentTask && !nextTask && AppState.tasks.length > 0) {
    const first = AppState.tasks[0];
    if (parseTimeToMinutes(first.start) > currentMinutes) nextTask = first;
  }

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

// ====================== PHASE 3: VOICE ENGINE (Global Scope) ======================
// This is now correctly placed outside any function so it can be used by the button

function getCurrentTask() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return AppState.tasks.find(task => {
    const start = parseTimeToMinutes(task.start);
    const end = parseTimeToMinutes(task.end);
    return currentMinutes >= start && currentMinutes <= end;
  });
}

function getNextTask() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return AppState.tasks.find(task => parseTimeToMinutes(task.start) > currentMinutes);
}

// Main voice initialization
function initVoiceEngine() {
  const voiceBtn = document.getElementById("voice-btn");
  if (!voiceBtn) {
    console.warn("Voice button not found");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("⚠️ Voice not supported. Please use Google Chrome.");
    voiceBtn.style.opacity = "0.5";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";   // Change to "en-ZA" later if you want

  voiceBtn.addEventListener("click", () => {
    try {
      recognition.start();
      voiceBtn.classList.add("listening");
      voiceBtn.textContent = "🔴";
      console.log("🎤 Listening...");
    } catch (err) {
      console.error("Voice start failed:", err);
      speak("Sorry, microphone access failed.");
    }
  });

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript.trim().toLowerCase();
    console.log("🗣️ You said:", spokenText);
    handleVoiceCommand(spokenText);
  };

  recognition.onerror = (event) => {
    console.error("Voice error:", event.error);
    speak("Sorry, I didn't catch that. Try again.");
  };

  recognition.onend = () => {
    voiceBtn.classList.remove("listening");
    voiceBtn.textContent = "🎤";
  };
}

// Handle what the user said
function handleVoiceCommand(command) {
  speak("Got it!");   // instant feedback

  if (command.includes("what's next") || command.includes("next task")) {
    const nextTask = getNextTask();
    speak(nextTask ? `Next is ${nextTask.title} at ${nextTask.start}` : "No more tasks today.");
  } 
  else if (command.includes("what am i doing") || command.includes("now") || command.includes("current")) {
    const currentTask = getCurrentTask();
    speak(currentTask ? `You should be doing ${currentTask.title}` : "You have free time right now.");
  } 
  else if (command.includes("add")) {
    speak("Voice adding tasks is coming next phase. Use the form for now.");
  } 
  else {
    speak("Sorry, I didn't understand. Try 'what's next' or 'what am I doing now'.");
  }
}

// Text-to-speech (safe)
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    speechSynthesis.speak(utterance);
  } catch (err) {
    console.error("Speak failed:", err);
  }
}