const input = document.getElementById("taskInput");
const dateInput = document.getElementById("taskDate");
const list = document.getElementById("taskList");
const button = document.getElementById("addBtn");
const taskCount = document.getElementById("taskCount");
const clearBtn = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filters button");
const sortBtn = document.getElementById("sortByDate");
const progressBar = document.getElementById("progressBar");

function updateTaskCount() {
  const total = list.children.length;
  const completed = [...list.children].filter(li =>
    li.querySelector("input[type='checkbox']").checked
  ).length;

  taskCount.innerText = `Tasks: ${total} (Completed: ${completed})`;

  // Update progress bar
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  progressBar.style.width = percent + "%";
}

function setDeadlineColor(dateSpan, dueDate) {
  if (!dueDate) return;
  const today = new Date().toISOString().split("T")[0];
  if (dueDate < today) {
    dateSpan.classList.add("overdue");
  } else if (dueDate === today) {
    dateSpan.classList.add("today");
  } else {
    dateSpan.classList.add("upcoming");
  }
}

function createTask(taskText, completed = false, dueDate = "") {
  const li = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = completed;
  li.classList.toggle("completed", completed);

  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed", checkbox.checked);
    saveTasks();
    updateTaskCount();
  });

  const span = document.createElement("span");
  span.innerText = taskText;

  const dateSpan = document.createElement("span");
  dateSpan.className = "date";
  dateSpan.innerText = dueDate ? `Due: ${dueDate}` : "";
  setDeadlineColor(dateSpan, dueDate);

  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "Delete";
  deleteBtn.addEventListener("click", () => {
    li.remove();
    updateTaskCount();
    saveTasks();
  });

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(dateSpan);
  li.appendChild(deleteBtn);

  list.appendChild(li);
  updateTaskCount();
}

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

function saveTasks() {
  let tasks = [];
  document.querySelectorAll("#taskList li").forEach(li => {
    const span = li.querySelector("span:not(.date)");
    const checkbox = li.querySelector("input[type='checkbox']");
    const dateSpan = li.querySelector(".date");
    tasks.push({
      text: span.innerText,
      completed: checkbox.checked,
      dueDate: dateSpan.innerText.replace("Due: ", "")
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

// Event listeners
button.addEventListener("click", addTask);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

clearBtn.addEventListener("click", () => {
  document.querySelectorAll("#taskList li").forEach(li => {
    const checkbox = li.querySelector("input[type='checkbox']");
    if (checkbox.checked) {
      li.remove();
    }
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

// Initialize
loadTasks();