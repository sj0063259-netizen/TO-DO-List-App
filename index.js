// Grab elements
const input = document.getElementById("taskInput");
const dateInput = document.getElementById("taskDate");
const list = document.getElementById("taskList");
const addBtn = document.getElementById("addBtn");
const taskCount = document.getElementById("taskCount");
const clearBtn = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filters button");
const sortBtn = document.getElementById("sortByDate");
const progressBar = document.getElementById("progressBar");
const progresscount = document.getElementById("progresscount");

// ------------------ Task Count & Progress ------------------
function updateTaskCount() {
  const total = list.children.length;
  const completed = [...list.children].filter(li =>
    li.querySelector("input[type='checkbox']").checked
  ).length;

  taskCount.innerText = `Tasks: ${total} (Completed: ${completed})`;

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  progressBar.style.width = percent + "%";
  progresscount.innerText = `Progress: ${percent}%`;
}

// ------------------ Deadline Labels ------------------
function setDeadlineColor(dateSpan, dueDate) {
  if (!dueDate) return;
  const today = new Date().toISOString().split("T")[0];
  const diffDays = Math.floor((new Date(dueDate) - new Date(today)) / (1000 * 60 * 60 * 24));

  if (dueDate < today) {
    dateSpan.classList.add("overdue");
    dateSpan.innerText = `Overdue by ${Math.abs(diffDays)} day(s)`;
  } else if (dueDate === today) {
    dateSpan.classList.add("today");
    dateSpan.innerText = "Due today";
  } else {
    dateSpan.classList.add("upcoming");
    dateSpan.innerText = `Due in ${diffDays} day(s)`;
  }
}

// ------------------ Create Task ------------------
function createTask(taskText, completed = false, dueDate = "") {
  const li = document.createElement("li");

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = completed;
  li.classList.toggle("completed", completed);

  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed", checkbox.checked);
    saveTasks();
    updateTaskCount();
  });

  // Task text
  const span = document.createElement("span");
  span.innerText = taskText;

  // Inline editing
  span.addEventListener("dblclick", () => {
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = span.innerText;
    editInput.className = "edit-input";

    li.replaceChild(editInput, span);
    editInput.focus();

    editInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") finishEdit();
    });
    editInput.addEventListener("blur", finishEdit);

    function finishEdit() {
      span.innerText = editInput.value.trim() || taskText;
      li.replaceChild(span, editInput);
      saveTasks();
    }
  });

  // Deadline
  const dateSpan = document.createElement("span");
  dateSpan.className = "date";
  if (dueDate) setDeadlineColor(dateSpan, dueDate);

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "Delete";
  deleteBtn.addEventListener("click", () => {
    li.remove();
    updateTaskCount();
    saveTasks();
  });

  // Append
  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(dateSpan);
  li.appendChild(deleteBtn);

  list.appendChild(li);
  updateTaskCount();
}

// ------------------ Add Task ------------------
function addTask() {
  const taskText = input.value.trim();
  const dueDate = dateInput.value;
  if (taskText === "") {
    alert("Please enter a task");
    return;
  }
  createTask(taskText, false, dueDate);
  input.value = "";
  dateInput.value = "";
  saveTasks();
}

// ------------------ Save & Load ------------------
function saveTasks() {
  let tasks = [];
  document.querySelectorAll("#taskList li").forEach(li => {
    const span = li.querySelector("span:not(.date)");
    const checkbox = li.querySelector("input[type='checkbox']");
    const dateSpan = li.querySelector(".date");
    tasks.push({
      text: span.innerText,
      completed: checkbox.checked,
      dueDate: dateInput.value || ""
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  let savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  savedTasks.forEach(task => {
    createTask(task.text, task.completed, task.dueDate);
  });
}

// ------------------ Filters ------------------
function applyFilter(filter) {
  document.querySelectorAll("#taskList li").forEach(li => {
    const checkbox = li.querySelector("input[type='checkbox']");
    if (filter === "all") {
      li.style.display = "flex";
    } else if (filter === "active") {
      li.style.display = checkbox.checked ? "none" : "flex";
    } else if (filter === "completed") {
      li.style.display = checkbox.checked ? "flex" : "none";
    }
  });
}

// ------------------ Sort ------------------
function sortByDate() {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  list.innerHTML = "";
  tasks.forEach(task => createTask(task.text, task.completed, task.dueDate));
  saveTasks();
}

// ------------------ Event Listeners ------------------
addBtn.addEventListener("click", addTask);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

clearBtn.addEventListener("click", () => {
  document.querySelectorAll("#taskList li").forEach(li => {
    const checkbox = li.querySelector("input[type='checkbox']");
    if (checkbox.checked) li.remove();
  });
  updateTaskCount();
  saveTasks();
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilter(btn.dataset.filter);
  });
});

sortBtn.addEventListener("click", sortByDate);

// ------------------ Initialize ------------------
loadTasks();