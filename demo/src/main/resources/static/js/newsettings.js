document.addEventListener("DOMContentLoaded", () => {
  initializeSettingsPage()
})

let selectedProfilePicture = null

function initializeSettingsPage() {
  checkAuthentication()
  loadUserData()
  setupEventListeners()
  loadSettings()
  changeProfilePicture()
}

// Check if user is authenticated
function checkAuthentication() {
  const userData = localStorage.getItem("taskmaster_user") || sessionStorage.getItem("taskmaster_user")
  if (!userData) {
    window.location.href = "/auth/login"
    return
  }
}

// Load user data from backend and populate form and localStorage
function loadUserData() {
  // Attempt to load from backend API first
  fetch('/user/profile') // Adapt URL to your backend
    .then(res => {
      if (!res.ok) throw new Error("Failed to load user data")
      return res.json()
    })
    .then(userData => {
      if (userData) {
        // Save to localStorage/sessionStorage
        if (localStorage.getItem("taskmaster_user")) {
          localStorage.setItem("taskmaster_user", JSON.stringify(userData))
        } else {
          sessionStorage.setItem("taskmaster_user", JSON.stringify(userData))
        }
        const userData = JSON.parse(localStorage.getItem("taskmaster_user"))
        // Populate form fields
        const fullName = userData.fullname || ""
        const nameParts = fullName.split(" ")
        document.getElementById("first-name").value = nameParts[0] || ""
        document.getElementById("last-name").value = nameParts.slice(1).join(" ") || ""
        document.getElementById("email").value = userData.email || ""
        document.getElementById("bio").value = userData.bio || ""

        // Show profile picture if exists
        if (userData.profilePictureUrl) {
          const avatarDiv = document.querySelector(".w-20.h-20.bg-blue-600.rounded-full")
          avatarDiv.innerHTML = `<img src="${userData.profilePictureUrl}" alt="Profile Picture" class="w-20 h-20 rounded-full object-cover" />`
        }
      }
    })
    .catch(err => {
      console.error(err)
      // If no API or error, fallback to localStorage data (optional)
      const userData = JSON.parse(localStorage.getItem("taskmaster_user"))
      if (userData) {
        const fullName = userData.fullname || ""
        const nameParts = fullName.split(" ")
        document.getElementById("first-name").value = nameParts[0] || ""
        document.getElementById("last-name").value = nameParts.slice(1).join(" ") || ""
        document.getElementById("email").value = userData.email || ""
        document.getElementById("bio").value = userData.bio || ""
      }
    })
}

function setupEventListeners() {
  document.querySelectorAll(".settings-nav-btn").forEach((btn) => {
    btn.addEventListener("click", handleSectionChange)
  })

  document.getElementById("profile-form").addEventListener("submit", handleProfileUpdate)
  document.getElementById("password-form").addEventListener("submit", handlePasswordChange)

  document.querySelectorAll('input[name="theme"]').forEach((radio) => {
    radio.addEventListener("change", handleThemeChange)
  })

  document.getElementById("quick-dark-toggle").addEventListener("change", handleQuickDarkToggle)

  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", handleSettingToggle)
  })

  document.querySelectorAll("select").forEach((select) => {
    select.addEventListener("change", handleSelectChange)
  })
}

function handleQuickDarkToggle(event) {
  const isDark = event.target.checked
  const newTheme = isDark ? "dark" : "light"
  document.querySelector(`input[name="theme"][value="${newTheme}"]`).checked = true
  handleThemeChange({ target: document.querySelector(`input[name="theme"][value="${newTheme}"]`) })
}

function handleSelectChange(event) {
  const setting = event.target.id
  const value = event.target.value

  // Save settings through API or localStorage
  saveSettingsToBackend({ [setting]: value })
    .then(() => {
      showNotification(`${getSettingLabel(setting)} updated to ${value}`, "success")
    })
    .catch(() => {
      showNotification(`Failed to update ${getSettingLabel(setting)}`, "error")
    })
}

function handleSectionChange(event) {
  const targetSection = event.target.dataset.section

  // Nav UI update
  document.querySelectorAll(".settings-nav-btn").forEach((btn) => {
    btn.classList.remove("bg-blue-600", "text-white")
    btn.classList.add("text-slate-700", "hover:bg-slate-100")
  })

  event.target.classList.remove("text-slate-700", "hover:bg-slate-100")
  event.target.classList.add("bg-blue-600", "text-white")

  // Show relevant section only
  document.querySelectorAll(".settings-section").forEach((section) => {
    section.classList.add("hidden")
  })

  const targetElement = document.getElementById(`${targetSection}-section`)
  if (targetElement) {
    targetElement.classList.remove("hidden")
    targetElement.classList.add("animate-fade-in")
  }
}

function changeProfilePicture() {
  document.getElementById("change-avatar-btn").addEventListener("click", () => {
    document.getElementById("profile-picture-input").click()
  })

  document.getElementById("profile-picture-input").addEventListener("change", (event) => {
    const file = event.target.files[0]
    if (file) {
      selectedProfilePicture = file

      // Optional: show preview
      const reader = new FileReader()
      reader.onload = function (e) {
        const avatarDiv = document.querySelector(".w-20.h-20.bg-blue-600.rounded-full")
        avatarDiv.innerHTML = `<img src="${e.target.result}" alt="Profile Picture" class="w-20 h-20 rounded-full object-cover" />`
      }
      reader.readAsDataURL(file)
    }
  })
}

async function handleProfileUpdate(event) {
  event.preventDefault()

  const form = event.target
  const formData = new FormData(form)
  const firstName = formData.get("firstName").trim()
  const lastName = formData.get("lastName").trim()
  const email = formData.get("email").trim()
  const bio = formData.get("bio").trim()

  if (!firstName || !email) {
    showNotification("Please fill in all required fields", "error")
    return
  }

  // Prepare data payload for text fields
  const userDataUpdate = {
    fullname: `${firstName} ${lastName}`.trim(),
    email: email,
    bio: bio,
  }

  try {
    // Update user profile info (without picture) via API
    const userData = JSON.parse(localStorage.getItem("taskmaster_user") || sessionStorage.getItem("taskmaster_user"))
    const userId = userData?.id || userData?.userId
    if (!userId) throw new Error("User ID not found")

    // Update text fields first via PUT (adjust endpoint if needed)
    let response = await fetch(`/user/${userId}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDataUpdate),
    })

    if (!response.ok) throw new Error("Failed to update profile information")

    // If profile picture selected, upload it separately
    if (selectedProfilePicture) {
      const pictureForm = new FormData()
      pictureForm.append("file", selectedProfilePicture)

      response = await fetch(`/user/${userId}/profile-picture`, {
        method: "PUT",
        body: pictureForm,
      })

      if (!response.ok) throw new Error("Failed to upload profile picture")

      const pictureData = await response.json()
      if (pictureData && pictureData.url) {
        userDataUpdate.profilePictureUrl = pictureData.url
      }
      selectedProfilePicture = null
    }

    // Fetch updated user data from server (optional but recommended)
    const userRes = await fetch(`/user/profile`)
    const userProfilePicture= await fetch('/user/{userId}/profile-picture',{
        method:"GET",
        body:MediaType.All
    })
    if (userRes.ok) {
      const updatedUser = await userRes.json()
      // Save updated user data locally
      if (localStorage.getItem("taskmaster_user")) {
        localStorage.setItem("taskmaster_user", JSON.stringify(updatedUser))
      } else {
        sessionStorage.setItem("taskmaster_user", JSON.stringify(updatedUser))
      }
    } else {
      // As fallback update local data with what we sent
      const userData = JSON.parse(localStorage.getItem("taskmaster_user") || sessionStorage.getItem("taskmaster_user"))
      const newUserData = { ...userData, ...userDataUpdate }
      if (localStorage.getItem("taskmaster_user")) {
        localStorage.setItem("taskmaster_user", JSON.stringify(newUserData))
      } else {
        sessionStorage.setItem("taskmaster_user", JSON.stringify(newUserData))
      }
    }

    showNotification("Profile updated successfully!", "success")
  } catch (error) {
    console.error(error)
    showNotification("Failed to update profile", "error")
  }
}

async function handlePasswordChange(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const currentPassword = formData.get("currentPassword")
  const newPassword = formData.get("newPassword")
  const confirmNewPassword = formData.get("confirmNewPassword")

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

  try {
    const userData = JSON.parse(localStorage.getItem("taskmaster_user") || sessionStorage.getItem("taskmaster_user"))
    const userId = userData?.id || userData?.userId
    if (!userId) throw new Error("User ID not found")

    const payload = {
      currentPassword,
      newPassword,
      confirmNewPassword,
    }

    const response = await fetch(`/user/${userId}/change-password`, {
      method: "POST", // or PUT depending on your backend
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const msg = errorData?.message || "Failed to update password"
      throw new Error(msg)
    }

    showNotification("Password updated successfully!", "success")
    event.target.reset()
  } catch (error) {
    console.error(error)
    showNotification(error.message || "Password update error", "error")
  }
}

function handleThemeChange(event) {
  const theme = event.target.value

  // Update UI for selected theme
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

  // Sync quick toggle
  document.getElementById("quick-dark-toggle").checked = (theme === "dark")

  // Save theme setting to backend/localStorage
  saveSettingsToBackend({ theme })
    .then(() => {
      applyTheme(theme)
      showNotification(`Theme changed to ${theme}`, "success")
    })
    .catch(() => {
      showNotification("Failed to save theme setting", "error")
    })
}

function handleSettingToggle(event) {
  const setting = event.target.id
  const value = event.target.checked

  saveSettingsToBackend({ [setting]: value })
    .then(() => {
      showNotification(`${getSettingLabel(setting)} ${value ? "enabled" : "disabled"}`, "success")
    })
    .catch(() => {
      showNotification(`Failed to update ${getSettingLabel(setting)}`, "error")
    })
}

function loadSettings() {
  // Replace this with backend fetch if needed
  fetch('/api/user/settings')
    .then(res => {
      if (!res.ok) throw new Error('Failed to load settings')
      return res.json()
    })
    .then(settings => {
      applySettingsToUI(settings)
      applyTheme(settings.theme || "light")
    })
    .catch(() => {
      // fallback to localStorage
      const settings = getSettings()
      applySettingsToUI(settings)
      applyTheme(settings.theme || "light")
    })
}

// Apply a settings object to the UI elements
function applySettingsToUI(settings) {
  Object.keys(settings).forEach((key) => {
    const element = document.getElementById(key)
    if (!element) return

    if (element.type === "checkbox") {
      element.checked = settings[key]
    } else if (element.type === "radio") {
      if (element.value === settings[key]) {
        element.checked = true
      }
    } else if (element.tagName === "SELECT") {
      element.value = settings[key]
    } else {
      element.value = settings[key]
    }
  })
}

// Get settings fallback from localStorage
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

// Save settings to localStorage (fallback)
function saveSettings(settings) {
  const currentSettings = getSettings()
  const updatedSettings = { ...currentSettings, ...settings }
  localStorage.setItem("taskmaster_settings", JSON.stringify(updatedSettings))
}

// Save settings to backend API and fallback to localStorage on failure
async function saveSettingsToBackend(settings) {
  try {
    const response = await fetch('/user/settings', {
      method: 'PUT', // Adjust your backend method
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    console.log(settings)

    if (!response.ok) {
      // Save locally as fallback if backend fails
      saveSettings(settings)
      throw new Error('Backend save failed')
    }

    // Optionally update localStorage with latest settings from backend
    saveSettings(settings)
  } catch {
    // fallback saved done in catch
    saveSettings(settings)
  }
}

function applyTheme(theme) {
  const body = document.body
  const html = document.documentElement

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
