// Settings Page JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeSettingsPage()
})

function initializeSettingsPage() {
  checkAuthentication()
  loadUserData()
  setupEventListeners()
  loadSettings()
  changeProfilePicture()
}

function checkAuthentication() {
  const userData = localStorage.getItem("taskmaster_user") || sessionStorage.getItem("taskmaster_user")

  if (!userData) {
    window.location.href = "/auth/login"
    return
  }
}

function loadUserData() {
  const userData = JSON.parse(localStorage.getItem("taskmaster_user"))

  if (userData) {
    // Populate profile form
    const fullName = userData.fullname
    const nameParts = fullName.split(" ")

    document.getElementById("first-name").value = nameParts[0] || ""
    document.getElementById("last-name").value = nameParts.slice(1).join(" ") || ""
    document.getElementById("email").value = userData.email || ""
  }
}

function setupEventListeners() {
  // Settings navigation
  document.querySelectorAll(".settings-nav-btn").forEach((btn) => {
    btn.addEventListener("click", handleSectionChange)
  })

  // Profile form
  document.getElementById("profile-form").addEventListener("submit", handleProfileUpdate)

  // Password form
  document.getElementById("password-form").addEventListener("submit", handlePasswordChange)

  // Theme selection
  document.querySelectorAll('input[name="theme"]').forEach((radio) => {
    radio.addEventListener("change", handleThemeChange)
  })

  // Quick dark mode toggle
  document.getElementById("quick-dark-toggle").addEventListener("change", handleQuickDarkToggle)

  // Toggle switches
  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", handleSettingToggle)
  })

  // Select dropdowns
  document.querySelectorAll("select").forEach((select) => {
    select.addEventListener("change", handleSelectChange)
  })
}

function handleQuickDarkToggle(event) {
  const isDark = event.target.checked
  const newTheme = isDark ? "dark" : "light"

  // Update theme radio buttons
  document.querySelector(`input[name="theme"][value="${newTheme}"]`).checked = true
  handleThemeChange({ target: document.querySelector(`input[name="theme"][value="${newTheme}"]`) })
}

function handleSelectChange(event) {
  const setting = event.target.id
  const value = event.target.value

  // Save setting
  const settings = getSettings()
  settings[setting] = value
  saveSettings(settings)

  showNotification(`${getSettingLabel(setting)} updated to ${value}`, "success")
}

function handleSectionChange(event) {
  const targetSection = event.target.dataset.section

  // Update navigation
  document.querySelectorAll(".settings-nav-btn").forEach((btn) => {
    btn.classList.remove("bg-blue-600", "text-white")
    btn.classList.add("text-slate-700", "hover:bg-slate-100")
  })

  event.target.classList.remove("text-slate-700", "hover:bg-slate-100")
  event.target.classList.add("bg-blue-600", "text-white")

  // Show target section
  document.querySelectorAll(".settings-section").forEach((section) => {
    section.classList.add("hidden")
  })

  const targetElement = document.getElementById(`${targetSection}-section`)
  if (targetElement) {
    targetElement.classList.remove("hidden")
    targetElement.classList.add("animate-fade-in")
  }
}

let selectedProfilePicture = null;
function changeProfilePicture(){
document.getElementById("change-avatar-btn").addEventListener("click", () => {
  document.getElementById("profile-picture-input").click();
});

document.getElementById("profile-picture-input").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedProfilePicture = file;

    // Optional: show preview
    const reader = new FileReader();
    reader.onload = function (e) {
      const avatarDiv = document.querySelector(".w-20.h-20.bg-blue-600.rounded-full");
      avatarDiv.innerHTML = `<img src="${e.target.result}" alt="Profile Picture" class="w-20 h-20 rounded-full object-cover" />`;
    };
    reader.readAsDataURL(file);
  }
});

}

function handleProfileUpdate(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const firstName = formData.get("firstName").trim()
  const lastName = formData.get("lastName").trim()
  const email = formData.get("email").trim()
  const bio = formData.get("bio").trim()
  const profilePicture =selectedProfilePicture

  // Validate required fields
  if (!firstName || !email) {
    showNotification("Please fill in all required fields", "error")
    return
  }

  // Update user data
  const userData = JSON.parse(localStorage.getItem("taskmaster_user") || sessionStorage.getItem("taskmaster_user"))
  userData.fullname = `${firstName} ${lastName}`.trim()
  userData.email = email
  userData.bio = bio

  // Save updated data
  if (localStorage.getItem("taskmaster_user")) {
    localStorage.setItem("taskmaster_user", JSON.stringify(userData))
  } else {
    sessionStorage.setItem("taskmaster_user", JSON.stringify(userData))
  }

  showNotification("Profile updated successfully!", "success")
}

function handlePasswordChange(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const currentPassword = formData.get("currentPassword")
  const newPassword = formData.get("newPassword")
  const confirmNewPassword = formData.get("confirmNewPassword")

  // Validate passwords
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    showNotification("Please fill in all password fields", "error")
    return
  }

  if (newPassword !== confirmNewPassword) {
    showNotification("New passwords do not match", "error")
    return
  }

  if (newPassword.length < 6) {
    showNotification("New password must be at least 6 characters long", "error")
    return
  }

  // Simulate password update
  setTimeout(() => {
    showNotification("Password updated successfully!", "success")
    event.target.reset()
  }, 1000)
}

function handleThemeChange(event) {
  const theme = event.target.value

  // Update theme selection UI
  document.querySelectorAll(".theme-option").forEach((option) => {
    const radio = option.querySelector('input[type="radio"]')
    const container = option.querySelector("div")

    if (radio.checked) {
      container.classList.remove("border-slate-300")
      container.classList.add("border-blue-600", "ring-2", "ring-blue-200")
    } else {
      container.classList.remove("border-blue-600", "ring-2", "ring-blue-200")
      container.classList.add("border-slate-300")
    }
  })

  // Update quick toggle
  const quickToggle = document.getElementById("quick-dark-toggle")
  quickToggle.checked = theme === "dark"

  // Save theme preference
  saveSettings({ theme: theme })

  // Apply theme
  applyTheme(theme)

  showNotification(`Theme changed to ${theme}`, "success")
}

function handleSettingToggle(event) {
  const setting = event.target.id
  const value = event.target.checked

  // Save setting
  const settings = getSettings()
  settings[setting] = value
  saveSettings(settings)

  showNotification(`${getSettingLabel(setting)} ${value ? "enabled" : "disabled"}`, "success")
}

function loadSettings() {
  const settings = getSettings()

  // Apply saved settings
  Object.keys(settings).forEach((key) => {
    const element = document.getElementById(key)
    if (element) {
      if (element.type === "checkbox") {
        element.checked = settings[key]
      } else if (element.type === "radio") {
        if (element.value === settings[key]) {
          element.checked = true
          handleThemeChange({ target: element })
        }
      } else if (element.tagName === "SELECT") {
        element.value = settings[key]
      } else {
        element.value = settings[key]
      }
    }
  })

  // Apply theme on load
  applyTheme(settings.theme || "light")
}

function getSettings() {
  const savedSettings = localStorage.getItem("taskmaster_settings")
  return savedSettings
    ? JSON.parse(savedSettings)
    : {
        theme: "light",
        "auto-save": true,
        "task-sounds": false,
        "due-date-reminders": true,
        "default-priority": "medium",
        "tasks-per-page": "25",
      }
}

function saveSettings(newSettings) {
  const currentSettings = getSettings()
  const updatedSettings = { ...currentSettings, ...newSettings }
  localStorage.setItem("taskmaster_settings", JSON.stringify(updatedSettings))
}

function applyTheme(theme) {
  const body = document.body
  const html = document.documentElement

  // Remove existing theme classes
  body.classList.remove("theme-light", "theme-dark", "theme-auto")
  html.classList.remove("dark")

  if (theme === "dark") {
    html.classList.add("dark")
    body.classList.add("theme-dark")
    body.style.background = "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
    body.style.color = "#f1f5f9"
  } else if (theme === "light") {
    body.classList.add("theme-light")
    body.style.background = "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
    body.style.color = "#1e293b"
  } else if (theme === "auto") {
    body.classList.add("theme-auto")
    // Use system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (prefersDark) {
      html.classList.add("dark")
      body.style.background = "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
      body.style.color = "#f1f5f9"
    } else {
      body.style.background = "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
      body.style.color = "#1e293b"
    }
  }
}

function getSettingLabel(settingId) {
  const labels = {
    "auto-save": "Auto-save",
    "task-sounds": "Task sounds",
    "due-date-reminders": "Due date reminders",
    "email-notifications": "Email notifications",
    "push-notifications": "Push notifications",
    "task-reminders": "Task reminders",
    "default-priority": "Default priority",
    "tasks-per-page": "Tasks per page",
  }
  return labels[settingId] || settingId
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

// Export functions for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeSettingsPage,
    handleProfileUpdate,
    handlePasswordChange,
    handleThemeChange,
    getSettings,
    saveSettings,
  }
}
