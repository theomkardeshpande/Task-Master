// ============================================================================
// TASK MASTER - NEW DASHBOARD
// ============================================================================

// ============================================================================
// INITIALIZATION & MAIN ENTRY POINT
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  initializeDashboard()
})

// ============================================================================
// GLOBAL VARIABLES & STATE
// ============================================================================

let tasks = []
let currentFilter = "all"
let currentPriorityFilter = null

let userSettings = null
let userProfile = null;
// ============================================================================
// THEME & SETTINGS MANAGEMENT
// ============================================================================

// Theme & Settings
function toggleDarkMode() {
  userSettings.theme = userSettings.theme === "light" ? "dark" : "light"
  applyTheme(userSettings.theme)
  updateDarkModeToggle(userSettings.theme)
  localStorage.removeItem("taskmaster_settings");
  localStorage.setItem("taskmaster_settings",JSON.stringify(userSettings));
}


function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
  document.body.classList.toggle("dark-mode", theme === "dark")
}

function updateDarkModeToggle(theme) {
  const btn = document.getElementById("dark-mode-toggle")
  const icon = btn.querySelector("i")
  const text = btn.querySelector(".dark-mode-text")
  if (theme === "dark") {
    icon.className = "fas fa-sun mr-2"
    text.textContent = "Light Mode"
  } else {
    icon.className = "fas fa-moon mr-2"
    text.textContent = "Dark Mode"
  }
}

// Function to update settings from external changes (e.g., from settings page)
// function updateSettingsFromExternal(newSettings) {
//   const updated = false

//   Object.keys(newSettings).forEach(key => {
//     if (userSettings[key] !== newSettings[key]) {
//       userSettings[key] = newSettings[key]
//       updated = true
//     }
//   })

//   if (updated) {
//     localStorage.setItem("taskmaster_settings", JSON.stringify(userSettings))
//     applySettingsToUI(userSettings)
//     console.log("Settings updated from external source:", newSettings)
//   }
// }

// ============================================================================
// NOTIFICATIONS & USER FEEDBACK
// ============================================================================

// Notifications
function showNotification(message, type = "info", duration = 3000) {
  // Remove existing notifications to prevent stacking
  const existingNotifications = document.querySelectorAll(".notification-toast")
  existingNotifications.forEach((notification) => notification.remove())

  const notification = document.createElement("div")
  notification.className = `notification-toast fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-down max-w-sm`

  // Set colors based on type
  const typeStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-black",
    info: "bg-blue-500 text-white",
  }

  const typeIcons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  }

  notification.className += ` ${typeStyles[type] || typeStyles.info}`

  const icon = typeIcons[type] || typeIcons.info
  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas ${icon} mr-2 flex-shrink-0"></i>
      <span class="text-sm">${message}</span>
      <button class="ml-3 text-current opacity-70 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times text-xs"></i>
      </button>
    </div>
  `

  document.body.appendChild(notification)

  // Auto-dismiss after specified duration
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.opacity = "0"
      notification.style.transform = "translateY(-20px)"
      setTimeout(() => notification.remove(), 300)
    }
  }, duration)
}

// ============================================================================
// USER INTERFACE & MODAL CONTROLS
// ============================================================================

// Logout
function handleLogout() {
  localStorage.clear()
  sessionStorage.clear()
  window.location.href = "/auth/login"
}

// Modal Controls
function openEditModal() {
  const modal = document.getElementById("edit-modal")
  modal.classList.remove("hidden", "opacity-0")
  const content = modal.querySelector(".bg-white")
  content.classList.remove("scale-95")
  content.classList.add("scale-100")
  setTimeout(() => content.focus(), 10)
}

function closeEditModal() {
  const modal = document.getElementById("edit-modal")
  modal.classList.add("opacity-0")
  modal.querySelector(".bg-white").classList.replace("scale-100", "scale-95")
  setTimeout(() => modal.classList.add("hidden"), 300)
}

function toggleUserMenu() {
  const menu = document.getElementById("user-menu")
  const isOpen = !menu.classList.contains("hidden")
  isOpen ? closeUserMenu() : openUserMenu()
}

function openUserMenu() {
  const menu = document.getElementById("user-menu")
  const btn = document.getElementById("user-menu-btn")
  menu.classList.remove("hidden", "opacity-0", "scale-95")
  menu.classList.add("opacity-100", "scale-100")
  btn.setAttribute("aria-expanded", "true")
}

function closeUserMenu() {
  const menu = document.getElementById("user-menu")
  const btn = document.getElementById("user-menu-btn")
  menu.classList.replace("opacity-100", "opacity-0")
  menu.classList.replace("scale-100", "scale-95")
  setTimeout(() => menu.classList.add("hidden"), 200)
  btn.setAttribute("aria-expanded", "false")
}

// ============================================================================
// API CLIENT & NETWORK MANAGEMENT
// ============================================================================

class APIClient {
  constructor() {
    this.baseURL = ""
    this.retryAttempts = 3
    this.retryDelay = 1000
  }

  /**
   * Enhanced fetch with retry mechanism and comprehensive error handling
   * @param {string} url - API endpoint
   * @param {Object} options - Fetch options
   * @param {number} attempt - Current retry attempt
   * @returns {Promise<Response>} - Fetch response
   */
  async fetchWithRetry(url, options = {}, attempt = 1) {
    try {
      // Add default headers for all requests
      const defaultHeaders = {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      }

      const config = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      }

      const response = await fetch(url, config)

      // Handle different HTTP status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const error = new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`)
        error.status = response.status
        error.data = errorData
        throw error
      }

      return response
    } catch (error) {
      // Retry logic for network errors and 5xx server errors
      if (
        attempt < this.retryAttempts &&
        (error.name === "TypeError" || // Network error
          (error.status >= 500 && error.status < 600)) // Server error
      ) {
        console.warn(`Request failed (attempt ${attempt}/${this.retryAttempts}):`, error.message)
        await this.delay(this.retryDelay * attempt)
        return this.fetchWithRetry(url, options, attempt + 1)
      }

      throw error
    }
  }

  /**
   * Utility function to create delays for retry mechanism
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} - Promise that resolves after delay
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Initialize API client
const apiClient = new APIClient()

// ============================================================================
// USER MANAGEMENT & AUTHENTICATION
// ============================================================================

let userId = null

function getUserId() {
  if (!userId) {
    const userData = localStorage.getItem("taskmaster_user")
    if (userData) {
      try {
        userId = JSON.parse(userData).id || JSON.parse(userData).user_id
      } catch (error) {
        console.error("Failed to parse user data:", error)
        userId = null
      }
    }
  }
  return userId
}

async function loadUserData() {
  try {
    // Check cache first to reduce server calls
    const cachedUser = localStorage.getItem("taskmaster_user")

    if (cachedUser) {
      const userData = JSON.parse(cachedUser)
      updateUserGreeting(userData)
      return userData
    }

    const response = await apiClient.fetchWithRetry("/user/profile")
    const userData = await response.json()
    console.log(userData)
    console.log("CACHED USER" + cachedUser)
    // Cache user data with timestamp
    localStorage.setItem("taskmaster_user", JSON.stringify(userData))
    localStorage.setItem("taskmaster_user_timestamp", Date.now().toString())

    updateUserGreeting(userData)
    return userData
  } catch (error) {
    console.error("Failed to load user data:", error)

    // Fallback to cached data if available
    const cachedUser = localStorage.getItem("taskmaster_user")
    if (cachedUser) {
      const userData = JSON.parse(cachedUser)
      updateUserGreeting(userData)
      showNotification("Using offline data - some information may be outdated", "warning")
      return userData
    }

    showNotification("Failed to load user profile", "error")
    throw error
  }
}

function updateUserGreeting(userData) {
  const greeting = document.getElementById("user-greeting")
  if (greeting && userData) {
    const name = userData.fullname || userData.name || "User"
    greeting.textContent = `Welcome back, ${name.split(" ")[0]}!`
    greeting.classList.remove("hidden")
  }
}

// ============================================================================
// TASK MANAGEMENT & OPERATIONS
// ============================================================================

async function loadTasks(forceRefresh = false) {
  try {
    // Use cached tasks for immediate UI update unless force refresh
    if (!forceRefresh) {
      const cachedTasks = localStorage.getItem("taskmaster_tasks")
      if (cachedTasks) {
        tasks = JSON.parse(cachedTasks)
        renderTasks()
        updateStats()
      }
    }

    const response = await apiClient.fetchWithRetry("/api/showAllTasks")
    const serverTasks = await response.json()

    // Merge server tasks with any pending local changes
    tasks = mergeTasksWithLocalChanges(serverTasks)
    saveTasksToLocal()
    renderTasks()
    updateStats()

    return tasks
  } catch (error) {
    console.error("Failed to load tasks:", error)

    // Use cached tasks as fallback
    const cachedTasks = localStorage.getItem("taskmaster_tasks")
    if (cachedTasks) {
      tasks = JSON.parse(cachedTasks)
      renderTasks()
      updateStats()
      showNotification("Using offline tasks - changes will sync when connection is restored", "warning")
    } else {
      tasks = []
      showNotification("Failed to load tasks", "error")
    }

    throw error
  }
}

function mergeTasksWithLocalChanges(serverTasks) {
  const pendingChanges = JSON.parse(localStorage.getItem("taskmaster_pending_changes") || "[]")

  if (pendingChanges.length === 0) {
    return serverTasks
  }

  // Apply pending changes to server tasks
  const mergedTasks = serverTasks.map((serverTask) => {
    const pendingChange = pendingChanges.find((change) => change.id === serverTask.id)
    if (pendingChange) {
      // Merge changes, preferring local changes for user-initiated updates
      return { ...serverTask, ...pendingChange.changes }
    }
    return serverTask
  })

  // Clear applied pending changes
  localStorage.removeItem("taskmaster_pending_changes")

  return mergedTasks
}

async function handleAddTask(event) {
  event.preventDefault()
  const form = event.target

  const taskData = {
    title: form.title.value.trim(),
    description: form.description.value.trim(),
    priority: form.priority.value,
    dueDate: form.dueDate.value || null,
    createdDate: new Date().toISOString(),
  }

  // Validate required fields
  if (!taskData.title) {
    showNotification("Task title is required", "error")
    return
  }

  // Create optimistic task for immediate UI update
  const optimisticTask = {
    id: `temp_${Date.now()}`,
    ...taskData,
    completed: false,
    pending: true, // Mark as pending sync
  }

  // Update UI immediately
  tasks.unshift(optimisticTask)
  saveTasksToLocal()
  renderTasks()
  updateStats()
  form.reset()

  try {
    const response = await apiClient.fetchWithRetry("/api/addTask", {
      method: "POST",
      body: JSON.stringify(taskData),
    })

    const newTask = await response.json()

    // Replace optimistic task with server response
    const taskIndex = tasks.findIndex((t) => t.id === optimisticTask.id)
    if (taskIndex !== -1) {
      tasks[taskIndex] = newTask
      saveTasksToLocal()
      renderTasks()
      updateStats()
    }

    showNotification("Task added successfully!", "success")
  } catch (error) {
    console.error("Failed to add task:", error)

    // Store for later sync if offline
    storePendingChange("add", optimisticTask)
    showNotification("Task saved offline - will sync when connection is restored", "warning")
  }
}

function storePendingChange(action, taskData) {
  const pendingChanges = JSON.parse(localStorage.getItem("taskmaster_pending_changes") || "[]")
  pendingChanges.push({
    action,
    data: taskData,
    timestamp: Date.now(),
  })
  localStorage.setItem("taskmaster_pending_changes", JSON.stringify(pendingChanges))
}

async function syncTaskUpdate(task) {
  const payload = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate,
    completed: task.completed,
  }

  // Store original state for rollback
  const originalCompleted = !task.completed

  try {
    const response = await apiClient.fetchWithRetry(`/api/tasks/${task.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Update failed: ${response.status}`)
    }

    // Successful update
    saveTasksToLocal()
    updateStats()
    renderTasks()

    const action = task.completed ? "completed" : "reopened"
    showNotification(`Task ${action}!`, "success")

    // Play completion sound if enabled
    console.log(userSettings["task-sounds"])
    if (task.completed && userSettings["task-sounds"]) {
      playCompletionSound()
    }
  } catch (error) {
    console.error("Failed to sync task update:", error)

    // Rollback optimistic update
    task.completed = originalCompleted
    saveTasksToLocal()
    renderTasks()
    updateStats()

    // Store for later sync
    storePendingChange("update", { id: task.id, changes: payload })
    showNotification("Update saved offline - will sync when connection is restored", "warning")
  }
}

function playCompletionSound() {
  try {
    const audio = new Audio("/sound/Completion.mp3")
    audio.volume = 0.7 // Set reasonable volume
    audio.play().catch((error) => {
      console.warn("Could not play completion sound:", error)
    })
  } catch (error) {
    console.warn("Completion sound not available:", error)
  }
}

// ============================================================================
// MAIN INITIALIZATION & SETUP
// ============================================================================

async function initializeDashboard() {
  const startTime = performance.now()

  try {
    // Show loading state
    showLoadingState(true)

    let userData = await loadUserData()
    let settings = await loadSettingsFromDB()

    console.log(userData)
    console.log(settings)
    // Handle any failures gracefully
    if (userData.status === "rejected") {
      console.warn("User data load failed:", userData.reason)
    }

    if (settings.status === "rejected") {
      console.warn("Settings load failed:", settings.reason)
    }

    // Apply settings and setup UI
    applyUserSettings()
    initializeDateInputs()
    setupEventListeners()

    // Load and render tasks
    await loadTasks()
    renderTasks()
    updateStats()

    const loadTime = performance.now() - startTime
    console.log(`Dashboard initialized in ${loadTime.toFixed(2)}ms`)
  } catch (error) {
    console.error("Dashboard initialization failed:", error)
    console.log(error)
    showNotification("Failed to initialize dashboard", "error")
  } finally {
    showLoadingState(false)
  }
}


function showLoadingState(isLoading) {
  const loadingIndicator = document.getElementById("loading-indicator")
  if (loadingIndicator) {
    loadingIndicator.style.display = isLoading ? "block" : "none"
  }

  // Disable form submissions during loading
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    const submitBtn = form.querySelector('button[type="submit"]')
    if (submitBtn) {
      submitBtn.disabled = isLoading
      if (isLoading) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...'
      } else {
        submitBtn.innerHTML = "Submit"
      }
    }
  })
}

function initializeDateInputs() {
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("task-due-date").setAttribute("min", today)
  document.getElementById("edit-task-due-date").setAttribute("min", today)
}

// ============================================================================
// EVENT LISTENERS & INTERACTION HANDLERS
// ============================================================================

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
  document.addEventListener("click", handleGlobalClick)
  document.addEventListener("keydown", handleGlobalKeydown)
}


function handleGlobalClick(event) {
  const userMenu = document.getElementById("user-menu")
  const userMenuBtn = document.getElementById("user-menu-btn")
  if (!userMenuBtn.contains(event.target) && !userMenu.contains(event.target)) {
    closeUserMenu()
  }
  const modal = document.getElementById("edit-modal")
  if (event.target === modal) {
    closeEditModal()
  }
}

function handleGlobalKeydown(event) {
  if (event.key === "Escape") {
    closeEditModal()
    closeUserMenu()
  }
}

// ============================================================================
// SETTINGS MANAGEMENT & SYNCHRONIZATION
// ============================================================================

async function loadSettingsFromDB() {
  try {
    const currentUserId = getUserId()
    if (!currentUserId) {
      console.warn("No user ID available for loading settings")
      return
    }

    const res = await fetch(`/api/settings/${currentUserId}`)
    if (res.ok) {
      const settings = await res.json()
      console.log("Fetched Settings")
      console.log(settings)
      // Merge all settings from backend with defaults

      // let fetchedSettings = {
      //   theme: settings["theme"],
      //   "task-sounds": settings["taskSounds"],
      //   "due-date-reminders": settings["dueDateReminders"],
      //   "email-notifications": settings["emailNotifications"],
      //   "task-reminders": settings["taskReminders"],
      //   "default-priority": settings["defaultPriority"],
      //   "tasks-per-page": settings["tasksPerPage"]
      // }
      let fetchedSettings=settings
      localStorage.setItem("taskmaster_settings", JSON.stringify(fetchedSettings))
      localStorage.setItem("taskmaster_settings_timestamp", Date.now().toString())
      userSettings = fetchedSettings
      // console.log("Settings loaded from backend:", fetchedSettings)
      return fetchedSettings
    } else {
      const local = localStorage.getItem("taskmaster_settings")
      if (local) userSettings = JSON.parse(local)
    }
  } catch (err) {
    console.error("Failed to load settings:", err)
    const local = localStorage.getItem("taskmaster_settings")
    if (local) userSettings = JSON.parse(local)
  }
}

function applyUserSettings() {
  console.log("Applying user Settings")
  // console.log(userSettings)
  // console.log(userSettings.theme)
  applyTheme(userSettings.theme)
  updateDarkModeToggle(userSettings.theme)

  // Apply other settings to UI elements if they exist
  applySettingsToUI(userSettings)
}

function applySettingsToUI(settings) {
  // Apply settings to UI elements if they exist
  Object.keys(settings).forEach((key) => {
    const element = document.getElementById(key)
    if (element) {
      if (element.type === "checkbox") {
        element.checked = settings[key]
      } else if (element.type === "radio" && element.value === settings[key]) {
        element.checked = true
      } else if (element.tagName === "SELECT") {
        element.value = settings[key]
      }
    }
  })

  if (settings) {
    applyTheme(settings.theme)
    updateDarkModeToggle(settings.theme)
  }

  console.log("Settings applied to UI:", settings)

  // Apply theme immediately
}

// ============================================================================
// FILTERING & SEARCH FUNCTIONALITY
// ============================================================================

function handleFilterChange(event) {
  currentFilter = event.target.dataset.filter
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle("bg-blue-600", btn.dataset.filter === currentFilter)
    btn.classList.toggle("text-white", btn.dataset.filter === currentFilter)
    btn.classList.toggle("bg-slate-200", btn.dataset.filter !== currentFilter)
    btn.classList.toggle("text-slate-700", btn.dataset.filter !== currentFilter)
  })
  renderTasks()
}

function handlePriorityFilterChange(event) {
  const priority = event.target.dataset.priority
  if (currentPriorityFilter === priority) {
    currentPriorityFilter = null
  } else {
    currentPriorityFilter = priority
  }
  document.querySelectorAll(".priority-filter-btn").forEach((btn) => {
    btn.className =
      btn.dataset.priority === currentPriorityFilter
        ? getPriorityActiveClasses(priority)
        : "bg-slate-200 text-slate-700 priority-filter-btn"
  })
  renderTasks()
}

function getPriorityActiveClasses(priority) {
  if (priority === "high") return "bg-red-100 text-red-700 priority-filter-btn"
  if (priority === "medium") return "bg-yellow-100 text-yellow-700 priority-filter-btn"
  if (priority === "low") return "bg-green-100 text-green-700 priority-filter-btn"
  return "bg-slate-200 text-slate-700 priority-filter-btn"
}

// ============================================================================
// TASK OPERATIONS & CRUD
// ============================================================================

async function handleEditTask(event) {
  event.preventDefault()
  const id = document.getElementById("edit-task-id").value
  const updated = {
    taskId: id,
    title: event.target.title.value.trim(),
    description: event.target.description.value.trim(),
    priority: event.target.priority.value,
    dueDate: event.target.dueDate.value || null,
  }
  try {
    const res = await fetch("/api/tasks/updateTask", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
    if (!res.ok) throw new Error("Update failed")
    await loadTasks()
    closeEditModal()
    showNotification("Task updated successfully!", "success")
  } catch (err) {
    console.error(err)
    showNotification("Error updating task.", "error")
  }
}

function deleteTask(taskId) {
  if (!confirm("Are you sure you want to delete this task?")) return
  fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
    .then((res) => {
      if (!res.ok) throw new Error("Delete failed")
      tasks = tasks.filter((t) => t.id !== taskId)
      saveTasksToLocal()
      updateStats()
      renderTasks()
      showNotification("Task deleted!", "success")
    })
    .catch((err) => {
      console.error(err)
      showNotification("Failed to delete task.", "error")
    })
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

function updateStats() {
  const total = tasks.length
  const completed = tasks.filter((t) => t.completed).length
  const pending = total - completed
  document.getElementById("total-tasks").textContent = total
  document.getElementById("completed-tasks").textContent = completed
  document.getElementById("pending-tasks").textContent = pending
}

// ============================================================================
// TASK RENDERING & UI UPDATES
// ============================================================================

function renderTasks() {
  const list = document.getElementById("task-list")
  const empty = document.getElementById("empty-state")
  let filtered = [...tasks]

  if (currentFilter === "completed") filtered = filtered.filter((t) => t.completed)
  else if (currentFilter === "pending") filtered = filtered.filter((t) => !t.completed)

  if (currentPriorityFilter) filtered = filtered.filter((t) => t.priority === currentPriorityFilter)

  filtered.sort(compareTasks)

  if (filtered.length === 0) {
    list.innerHTML = ""
    empty.classList.remove("hidden")
    return
  }

  empty.classList.add("hidden")
  list.innerHTML = filtered.map(createTaskHTML).join("")
  bindTaskActions(filtered)
}

function compareTasks(a, b) {
  if (a.completed !== b.completed) return a.completed ? 1 : -1
  if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate)
  if (a.dueDate) return -1
  if (b.dueDate) return 1
  const order = { high: 3, medium: 2, low: 1 }
  return order[b.priority] - order[a.priority]
}

function bindTaskActions(filtered) {
  filtered.forEach((task) => {
    const el = document.querySelector(`[data-task-id="${task.id}"]`)
    if (!el) return
    el.querySelector(".task-checkbox").addEventListener("click", () => toggleTask(task.id))
    el.querySelector(".edit-btn").addEventListener("click", () => editTask(task.id))
    el.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id))
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
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
  const dueClass = isOverdue ? "text-red-600 font-medium" : "text-slate-500"

  return `
    <div class="task-item p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200 ${task.completed ? "opacity-75" : ""} ${isOverdue ? "border-red-200 bg-red-50" : ""}" data-task-id="${task.id}">
      <div class="flex items-start space-x-3">
        <button class="task-checkbox mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${task.completed ? "bg-blue-600 border-blue-600" : "border-slate-300 hover:border-blue-400"}" ${task.completed ? 'aria-checked="true"' : 'aria-checked="false"'}>
          ${task.completed ? '<i class="fas fa-check text-white text-xs"></i>' : ""}
        </button>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="task-title font-medium transition-all duration-300 ${task.completed ? "text-slate-500 line-through" : "text-slate-900"}">${escapeHtml(task.title)}</h3>
              ${task.description ? `<p class="task-description text-sm text-slate-600 mt-1 ${task.completed ? "line-through" : ""}">${escapeHtml(task.description)}</p>` : ""}
              <div class="flex items-center space-x-2 mt-2 flex-wrap gap-1">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]} flex items-center">
                  <i class="fas ${priorityIcons[task.priority]} mr-1"></i>${capitalize(task.priority)}
                </span>
                ${task.dueDate ? `<span class="px-2 py-1 text-xs rounded-full bg-slate-100 ${dueClass} flex items-center"><i class="fas fa-calendar mr-1"></i>${formatDueDate(task.dueDate)}${isOverdue ? '<i class="fas fa-exclamation-triangle ml-1"></i>' : ""}</span>` : ""}
                <span class="text-xs text-slate-500">${formatDate(task.createdDate)}</span>
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
    </div>`
}

function formatDueDate(dateString) {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  today.setHours(0, 0, 0, 0)
  tomorrow.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  if (date.getTime() === today.getTime()) return "Today"
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow"
  if (date < today) {
    const diff = Math.ceil((today - date) / (1000 * 60 * 60 * 24))
    return `${diff} day${diff > 1 ? "s" : ""} overdue`
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.ceil((now - date) / (1000 * 60 * 60 * 24))
  if (diff === 1) return "Today"
  if (diff === 2) return "Yesterday"
  if (diff <= 7) return `${diff - 1} days ago`
  return date.toLocaleDateString()
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

function toggleTask(taskId) {
  const task = tasks.find((t) => t.id === taskId)
  if (!task) return
  task.completed = !task.completed
  syncTaskUpdate(task)
}

function saveTasksToLocal() {
  localStorage.setItem("taskmaster_tasks", JSON.stringify(tasks))
}

function editTask(taskId) {
  const task = tasks.find((t) => t.id === taskId)
  if (!task) return
  document.getElementById("edit-task-id").value = task.id
  document.getElementById("edit-task-title").value = task.title
  document.getElementById("edit-task-description").value = task.description
  document.getElementById("edit-task-priority").value = task.priority
  document.getElementById("edit-task-due-date").value = task.dueDate || ""
  openEditModal()
}

// ============================================================================
// CONNECTION MONITORING & OFFLINE SYNC
// ============================================================================

class ConnectionMonitor {
  constructor() {
    this.isOnline = navigator.onLine
    this.syncInProgress = false
    this.setupEventListeners()
  }

  setupEventListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true
      showNotification("Connection restored - syncing changes...", "info")
      this.syncPendingChanges()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      showNotification("Connection lost - working offline", "warning")
    })
  }

  async syncPendingChanges() {
    if (this.syncInProgress) return

    this.syncInProgress = true
    const pendingChanges = JSON.parse(localStorage.getItem("taskmaster_pending_changes") || "[]")

    if (pendingChanges.length === 0) {
      this.syncInProgress = false
      return
    }

    try {
      for (const change of pendingChanges) {
        await this.processPendingChange(change)
      }

      // Clear all pending changes after successful sync
      localStorage.removeItem("taskmaster_pending_changes")
      showNotification("All changes synced successfully!", "success")

      // Refresh tasks to ensure consistency
      await loadTasks(true)
    } catch (error) {
      console.error("Failed to sync pending changes:", error)
      showNotification("Some changes could not be synced", "warning")
    } finally {
      this.syncInProgress = false
    }
  }

  async processPendingChange(change) {
    switch (change.action) {
      case "add":
        await this.syncAddTask(change.data)
        break
      case "update":
        await this.syncUpdateTask(change.data)
        break
      case "delete":
        await this.syncDeleteTask(change.data.id)
        break
    }
  }

  async syncAddTask(taskData) {
    const response = await apiClient.fetchWithRetry("/api/addTask", {
      method: "POST",
      body: JSON.stringify(taskData),
    })
    return response.json()
  }

  async syncUpdateTask(taskData) {
    const response = await apiClient.fetchWithRetry(`/api/tasks/${taskData.id}`, {
      method: "PUT",
      body: JSON.stringify(taskData.changes),
    })
    return response.json()
  }

  async syncDeleteTask(taskId) {
    const response = await apiClient.fetchWithRetry(`/api/tasks/${taskId}`, {
      method: "DELETE",
    })
    return response
  }
}

// Initialize connection monitor
const connectionMonitor = new ConnectionMonitor()

// ============================================================================
// EXPORTS & GLOBAL ACCESS
// ============================================================================

// Export settings management functions for external use
// window.SettingsManager = {
//   getSetting,
//   saveSetting,
//   updateSettingsFromExternal,
//   syncSettingsFromLocalStorage,
//   getCurrentSettings: () => ({ ...userSettings })
// }

// Log initialization
console.log("Dashboard initialized with settings:", userSettings)
