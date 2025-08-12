document.addEventListener("DOMContentLoaded", () => {
  initializeDashboard()
})

let tasks = []
let currentFilter = "all"
let currentPriorityFilter = null

function initializeDashboard() {
  checkAuthentication()
  loadUserData()
  loadTasks()
  setupEventListeners()
  updateStats()
  renderTasks()
  initializeDateInputs()
  initializeDarkMode()
}

function initializeDateInputs() {
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("task-due-date").setAttribute("min", today)
  document.getElementById("edit-task-due-date").setAttribute("min", today)
}

function initializeDarkMode() {
  const savedTheme = localStorage.getItem("taskmaster_theme") || "light"
  applyTheme(savedTheme)
  updateDarkModeToggle(savedTheme)
}

function checkAuthentication() {
  const userData = localStorage.getItem("taskmaster_user") || sessionStorage.getItem("taskmaster_user")
  if (!userData) {
    window.location.href = "/auth/login"
    return
  }
}

async function loadUserData() {
  await fetch('/user/profile')
    .then(res => res.json())
    .then(userData => {
      if (userData) {
        localStorage.setItem("taskmaster_user", JSON.stringify(userData))
        const greeting = document.getElementById("user-greeting");
        const name = userData.fullname || userData.name || "User";
        greeting.textContent = `Welcome back, ${name.split(" ")[0]}!`;
        greeting.classList.remove("hidden");
        console.log("USER DATA")
        console.log(userData)
      }
    })
    .catch(err => {
      console.error("Failed to load user data:", err);
    });
}

function loadTasks() {
  fetch('/api/showAllTasks')
    .then(res => res.json())
    .then(data => {
      tasks = data || []
      saveTasks()
      renderTasks()
      updateStats()
    })
    .catch(err => {
      console.error("Failed to load tasks:", err);
    });
}

function setupEventListeners() {
  document.getElementById("add-task-form").addEventListener("submit", handleAddTask)
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", handleFilterChange)
  })
  document.querySelectorAll(".priority-filter-btn").forEach((btn) => {
    btn.addEventListener("click", handlePriorityFilterChange)
  })
  document.getElementById("user-menu-btn").addEventListener("click", toggleUserMenu)
  document.getElementById("logout-btn").addEventListener("click", handleLogout)
  document.getElementById("dark-mode-toggle").addEventListener("click", toggleDarkMode)
  document.getElementById("close-modal").addEventListener("click", closeEditModal)
  document.getElementById("cancel-edit").addEventListener("click", closeEditModal)
  document.getElementById("edit-task-form").addEventListener("submit", handleEditTask)

  document.addEventListener("click", (event) => {
    const userMenu = document.getElementById("user-menu")
    const userMenuBtn = document.getElementById("user-menu-btn")
    if (!userMenuBtn.contains(event.target) && !userMenu.contains(event.target)) {
      closeUserMenu()
    }
  })

  document.getElementById("edit-modal").addEventListener("click", function (event) {
    if (event.target === this) {
      closeEditModal()
    }
  })

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeEditModal()
      closeUserMenu()
    }
  })
}

function handlePriorityFilterChange(event) {
  const priority = event.target.dataset.priority
  if (currentPriorityFilter === priority) {
    currentPriorityFilter = null
    event.target.classList.remove("bg-red-100","text-red-700","bg-yellow-100","text-yellow-700","bg-green-100","text-green-700")
    event.target.classList.add("bg-slate-200", "text-slate-700")
  } else {
    document.querySelectorAll(".priority-filter-btn").forEach((btn) => {
      btn.classList.remove("bg-red-100","text-red-700","bg-yellow-100","text-yellow-700","bg-green-100","text-green-700")
      btn.classList.add("bg-slate-200", "text-slate-700")
    })
    currentPriorityFilter = priority
    event.target.classList.remove("bg-slate-200", "text-slate-700")
    if (priority === "high") {
      event.target.classList.add("bg-red-100", "text-red-700")
    } else if (priority === "medium") {
      event.target.classList.add("bg-yellow-100", "text-yellow-700")
    } else if (priority === "low") {
      event.target.classList.add("bg-green-100", "text-green-700")
    }
  }
  renderTasks()
}

function handleAddTask(event) {
  event.preventDefault();
  const formData = new FormData(event.target)
  const taskData = {
    title: formData.get("title").trim(),
    description: formData.get("description").trim(),
    priority: formData.get("priority").trim(),
    dueDate: formData.get("dueDate") || null,
    createdDate:new Date().toISOString()
  }
  console.log(taskData)
  fetch('/api/addTask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  })
  .then(res => res.json())
  .then(newTask => {
    tasks.unshift(newTask)
    saveTasks()
    updateStats()
    renderTasks()
    event.target.reset()
    showNotification("Task added successfully!", "success")
    console.log(newTask)
  })
  .catch(err => console.error('Error adding task:', err))
}

function handleFilterChange(event) {
  const filter = event.target.dataset.filter
  currentFilter = filter
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("bg-blue-600", "text-white")
    btn.classList.add("bg-slate-200", "text-slate-700")
  })
  event.target.classList.remove("bg-slate-200", "text-slate-700")
  event.target.classList.add("bg-blue-600", "text-white")
  renderTasks()
}

//function toggleTask(taskId) {
//  const task = tasks.find((t) => t.id === taskId)
//  if (task) {
//    task.completed = !task.completed
//    saveTasks()
//    updateStats()
//    renderTasks()
//    const action = task.completed ? "completed" : "reopened"
//    showNotification(`Task ${action}!`, "success")
//  }
//}

function playTaskCompleteSoundIfAllowed() {
  try {
    const settingsRaw = localStorage.getItem("taskmaster_settings");
    if (settingsRaw) {
      const settings = JSON.parse(settingsRaw);
      if (settings.task-sounds === true) {
        const sound = new Audio("/sound/Completion.mp3");
        sound.play().catch(err => console.warn("Sound playback failed:", err));
      }
    }
  } catch (e) {
    console.warn("Error reading from taskmaster_settings in localStorage:", e);
  }
}


function toggleSound(taskId){
const task = tasks.find((t) => t.id === taskId)
const wasCompleted=task.completed;
    task.completed = !task.completed
      if (!wasCompleted && task.completed) {
            const sound = new Audio("/sound/Completion.mp3");
            sound.play().catch(err => console.warn("Sound playback failed:", err));
      }
}

function toggleTask(taskId) {
  const task = tasks.find((t) => t.id === taskId)
  if (task) {
    // Toggle the completion status locally
    task.completed = !task.completed;
    // Prepare the update payload with the current task's fields including the new completion status
    const wasCompleted = task.completed;
    task.completed = !task.completed;

    if (!wasCompleted && task.completed) {
      playTaskCompleteSoundIfAllowed();
    }

    const updatedTask = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate || null,
      completed: task.completed
    }

    // Send the update to the backend
    fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Failed to update task status: ${res.statusText}`)
      }
      return res.json()
    })
    .then(() => {
      // If update succeeds, save locally and update UI
      saveTasks()
      updateStats()
      renderTasks()
      const action = task.completed ? "completed" : "reopened"
      showNotification(`Task ${action}!`, "success")
    })
    .catch(err => {
      console.error('Error updating task completion status:', err)
      // Optionally revert local toggle on failure
      task.completed = !task.completed
      showNotification("Failed to update task status. Please try again.", "error")
      renderTasks()
    })
  }
}

function editTask(taskId) {
  const task = tasks.find((t) => t.id === taskId)
  if (task) {
    document.getElementById("edit-task-id").value = task.id
    document.getElementById("edit-task-title").value = task.title
    document.getElementById("edit-task-description").value = task.description
    document.getElementById("edit-task-priority").value = task.priority
    document.getElementById("edit-task-due-date").value = task.dueDate || ""
    openEditModal()
  }
}

function deleteTask(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      .then(res => res.ok && loadTasks())
      .then(() => {
        saveTasks()
        updateStats()
        showNotification("Task deleted!", "success")
      })
      .catch(err => console.error('Error deleting task:', err))
  }
}

function handleEditTask(event) {
  event.preventDefault()
//  const task = tasks.find((t) => t.id === id)
  const taskId = document.getElementById("edit-task-id").value
  const formData = new FormData(event.target)
  const updatedTask = {
    taskId:document.getElementById("edit-task-id").value,
    title: formData.get("title").trim(),
    description: formData.get("description").trim(),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate") || null,
  }
  console.log(updatedTask)
  fetch(`/api/tasks/updateTask`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTask),
  })
  .then(res => res.json())
  .then(() => {
    saveTasks()
    loadTasks()
    closeEditModal()
    showNotification("Task updated successfully!", "success")
  })
  .catch(err => console.error('Error updating task:', err))
}

function openEditModal() {
  const modal = document.getElementById("edit-modal")
  modal.classList.remove("hidden")
  setTimeout(() => {
    modal.classList.remove("opacity-0")
    modal.querySelector(".bg-white").classList.remove("scale-95")
    modal.querySelector(".bg-white").classList.add("scale-100")
  }, 10)
  document.getElementById("edit-task-title").focus()
}

function closeEditModal() {
  const modal = document.getElementById("edit-modal")
  modal.classList.add("opacity-0")
  modal.querySelector(".bg-white").classList.remove("scale-100")
  modal.querySelector(".bg-white").classList.add("scale-95")
  setTimeout(() => {
    modal.classList.add("hidden")
  }, 300)
}

function toggleUserMenu() {
  const menu = document.getElementById("user-menu")
  const isOpen = !menu.classList.contains("hidden")
  if (isOpen) {
    closeUserMenu()
  } else {
    openUserMenu()
  }
}

function openUserMenu() {
  const menu = document.getElementById("user-menu")
  const btn = document.getElementById("user-menu-btn")
  menu.classList.remove("hidden")
  setTimeout(() => {
    menu.classList.remove("opacity-0", "scale-95")
    menu.classList.add("opacity-100", "scale-100")
  }, 10)
  btn.setAttribute("aria-expanded", "true")
}

function closeUserMenu() {
  const menu = document.getElementById("user-menu")
  const btn = document.getElementById("user-menu-btn")
  menu.classList.remove("opacity-100", "scale-100")
  menu.classList.add("opacity-0", "scale-95")
  setTimeout(() => {
    menu.classList.add("hidden")
  }, 200)
  btn.setAttribute("aria-expanded", "false")
}

function handleLogout() {
  if (confirm("Are you sure you want to sign out?")) {
    localStorage.removeItem("taskmaster_user")
    sessionStorage.removeItem("taskmaster_user")
    window.location.href = "/auth/login"
  }
}

function updateStats() {
  const total = tasks.length
  const completed = tasks.filter((t) => t.completed).length
  const pending = total - completed
  document.getElementById("total-tasks").textContent = total
  document.getElementById("completed-tasks").textContent = completed
  document.getElementById("pending-tasks").textContent = pending
}

function renderTasks() {
  const taskList = document.getElementById("task-list")
  const emptyState = document.getElementById("empty-state")
  let filteredTasks = tasks
  if (currentFilter === "completed") {
    filteredTasks = filteredTasks.filter((t) => t.completed)
  } else if (currentFilter === "pending") {
    filteredTasks = filteredTasks.filter((t) => !t.completed)
  }
  if (currentPriorityFilter) {
    filteredTasks = filteredTasks.filter((t) => t.priority === currentPriorityFilter)
  }
  filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate)
    if (a.dueDate && !b.dueDate) return -1
    if (!a.dueDate && b.dueDate) return 1
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
  if (filteredTasks.length === 0) {
    taskList.innerHTML = ""
    emptyState.classList.remove("hidden")
    return
  }
  emptyState.classList.add("hidden")
  taskList.innerHTML = filteredTasks.map((task) => createTaskHTML(task)).join("")
  filteredTasks.forEach((task) => {
    const taskElement = document.querySelector(`[data-task-id="${task.id}"]`)
    if (taskElement) {
      const checkbox = taskElement.querySelector(".task-checkbox")
      const editBtn = taskElement.querySelector(".edit-btn")
      const deleteBtn = taskElement.querySelector(".delete-btn")
      checkbox.addEventListener("click", () => toggleTask(task.id))
      editBtn.addEventListener("click", () => editTask(task.id))
      deleteBtn.addEventListener("click", () => deleteTask(task.id))
    }
  })
}



function createTaskHTML(task) {
  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  }
  const priorityIcons = {
    low: "fa-circle",
    medium: "fa-minus-circle",
    high: "fa-exclamation-circle",
  }
  const priorityColor = priorityColors[task.priority] || priorityColors.medium
  const priorityIcon = priorityIcons[task.priority] || priorityIcons.medium
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
  const dueDateClass = isOverdue ? "text-red-600 font-medium" : "text-slate-500"
  return `
        <div class="task-item p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200 ${task.completed ? "opacity-75" : ""} ${isOverdue ? "border-red-200 bg-red-50" : ""}" data-task-id="${task.id}">
            <div class="flex items-start space-x-3">
                <button class="task-checkbox mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  task.completed ? "bg-blue-600 border-blue-600" : "border-slate-300 hover:border-blue-400"
                }" ${task.completed ? 'aria-checked="true"' : 'aria-checked="false"'}>
                    ${task.completed ? '<i class="fas fa-check text-white text-xs"></i>' : ""}
                </button>
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <h3 class="task-title font-medium transition-all duration-300 ${
                              task.completed ? "text-slate-500 line-through" : "text-slate-900"
                            }">${escapeHtml(task.title)}</h3>
                            ${
                              task.description
                                ? `
                                <p class="task-description text-sm text-slate-600 mt-1 ${
                                  task.completed ? "line-through" : ""
                                }">${escapeHtml(task.description)}</p>
                            `
                                : ""
                            }
                            <div class="flex items-center space-x-2 mt-2 flex-wrap gap-1">
                                <span class="px-2 py-1 text-xs font-medium rounded-full ${priorityColor} flex items-center">
                                    <i class="fas ${priorityIcon} mr-1"></i>
                                    ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </span>
                                ${
                                  task.dueDate
                                    ? `
                                    <span class="px-2 py-1 text-xs rounded-full bg-slate-100 ${dueDateClass} flex items-center">
                                        <i class="fas fa-calendar mr-1"></i>
                                        ${formatDueDate(task.dueDate)}
                                        ${isOverdue ? '<i class="fas fa-exclamation-triangle ml-1"></i>' : ""}
                                    </span>
                                `
                                    : ""
                                }
                                <span class="text-xs text-slate-500">
                                    ${formatDate(task.createdDate)}
                                </span>
                            </div>
                        </div>
                        <div class="flex items-center space-x-1 ml-4">
                            <button class="edit-btn p-2 text-slate-400 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-blue-50" title="Edit task">
                                <i class="fas fa-edit text-sm"></i>
                            </button>
                            <button class="delete-btn p-2 text-slate-400 hover:text-red-600 transition-colors duration-200 rounded-lg hover:bg-red-50" title="Delete task">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
}

function formatDueDate(dateString) {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  today.setHours(0, 0, 0, 0)
  tomorrow.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  if (date.getTime() === today.getTime()) {
    return "Today"
  } else if (date.getTime() === tomorrow.getTime()) {
    return "Tomorrow"
  } else if (date < today) {
    const diffDays = Math.ceil((today - date) / (1000 * 60 * 60 * 24))
    return `${diffDays} day${diffDays > 1 ? "s" : ""} overdue`
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    })
  }
}

function saveTasks() {
  localStorage.setItem("taskmaster_tasks", JSON.stringify(tasks))
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays === 1) {
    return "Today"
  } else if (diffDays === 2) {
    return "Yesterday"
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`
  } else {
    return date.toLocaleDateString()
  }
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

function showNotification(message, type) {
  const notification = document.createElement("div")
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-down ${
    type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
  }`
  const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
  notification.innerHTML = `<i class="fas ${icon} mr-2"></i>${message}`
  document.body.appendChild(notification)
  setTimeout(() => {
    notification.style.opacity = "0"
    notification.style.transform = "translateY(-20px)"
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

function toggleDarkMode() {
  const currentTheme = localStorage.getItem("taskmaster_theme") || "light"
  const newTheme = currentTheme === "light" ? "dark" : "light"
  localStorage.setItem("taskmaster_theme", newTheme)
  applyTheme(newTheme)
  updateDarkModeToggle(newTheme)
  showNotification(`Switched to ${newTheme} mode`, "success")
}

function applyTheme(theme) {
  const body = document.body
  const html = document.documentElement
  if (theme === "dark") {
    html.classList.add("dark")
    body.classList.add("dark-mode")
  } else {
    html.classList.remove("dark")
    body.classList.remove("dark-mode")
  }
}

function updateDarkModeToggle(theme) {
  const toggleBtn = document.getElementById("dark-mode-toggle")
  const icon = toggleBtn.querySelector("i")
  const text = toggleBtn.querySelector(".dark-mode-text")
  if (theme === "dark") {
    icon.className = "fas fa-sun mr-2"
    text.textContent = "Light Mode"
  } else {
    icon.className = "fas fa-moon mr-2"
    text.textContent = "Dark Mode"
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeDashboard,
    handleAddTask,
    toggleTask,
    editTask,
    deleteTask,
    generateId,
  }
}
