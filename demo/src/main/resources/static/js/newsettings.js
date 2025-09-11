/* ============================================================================
   CONSTANTS & STORAGE HELPERS
   ============================================================================ */

const STORAGE_KEYS = {
  user: "taskmaster_user",
  settings: "taskmaster_settings",
  profilePicUrl: "profile_picture_url"
}

function safeParse(json, fallback = null) {
  try {
    return json ? JSON.parse(json) : fallback
  } catch {
    return fallback
  }
}

function getStoredUser() {
  return safeParse(localStorage.getItem("taskmaster_user"), null)
}

function setStoredUser(user) {
  const response = saveProfileDetails(user)
//  console.log(response)
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

async function saveProfileDetails(user) {
  payload = {
    fullname: user.fullname,
    bio: user.bio,
  }
  const response = await fetch(`user/${getUserId()}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return response
}

function getSettings() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.settings))
}


function saveSettings(settingsPatch) {
  const prev = getSettings()
  const updated = { ...prev, ...settingsPatch }
//  console.log(updated)
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(updated))
  return updated
}


function savePreferencesToBackend(settingsPatch) {
  let updated = null
  const currentUserId = getUserId()
//  console.log("Current User ID:" + currentUserId)
  if (currentUserId) {
//    console.log(settingsPatch)
    fetch(`/api/settings/preferences/${currentUserId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsPatch),
    }).then(async (res) => {
      if (res.ok) {
        updated = await res.json()
//        console.log("New Updated Settings")
//        console.log(updated)
      }
    }).catch((err) => console.error("Failed to sync settings:", err))

  } else {
    console.warn("No user ID available for persisting settings")
  }
  return updated
}

function saveNotificationToBackend(settingsPatch) {
  let updated = null;

  const currentUserId = getUserId()
//  console.log("Current User ID:" + currentUserId)
  if (currentUserId) {
    fetch(`/api/settings/notification/${currentUserId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsPatch),
    }).then(async (res) => {
      if (res.ok) {
        updated = res.json()
//        console.log("Updated Notification")
//        console.log(updated)
      }
    }).catch((err) => console.error("Failed to sync settings:", err))
  } else {
    console.warn("No user ID available for persisting settings")
  }


  // return Promise.resolve(updated)
}

/* ============================================================================
   GLOBAL STATE
   ============================================================================ */

let userSettings = {} // hydrated on init

let selectedProfilePicture = null

/* ============================================================================
   ENTRY POINT
   ============================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initializeSettingsPage()
})

function initializeSettingsPage() {
  checkAuthentication()
  setupUserSettings()
  setupEventListeners()
  initializeQuickDarkToggle()
  initializeUIState()
  showSecuritySectionForRegisteredUsers()
  isVerified()
}

/* ============================================================================
   AUTHENTICATION & USER MANAGEMENT
   ============================================================================ */

function showSecuritySectionForRegisteredUsers() {
  const user = getStoredUser();
  const securitySection = document.getElementById("security-section");
  const securityNavBtn = document.getElementById("security-btn");

  if (!securitySection) return;

  // Remove inline styles that conflict with CSS classes
  securitySection.style.display = "";  // Clear inline style

  if (user && user.role === "USER") {
    // Show navigation button only
    if (securityNavBtn) {
      securityNavBtn.style.display = "block";
      securityNavBtn.classList.remove("hidden");
    }
  } else {
    // Hide navigation button and ensure section stays hidden
    if (securityNavBtn) {
      securityNavBtn.style.display = "none";
      securityNavBtn.classList.add("hidden");
    }
    // Don't manipulate the section itself - let section switching handle it
  }
}

function setupVerifyEmailListners(){
  const sendButton=document.getElementById("sendCodeBtn")
  sendButton.addEventListener("click",sendVerficationCode)

  const verifyButton=document.getElementById("submitCodeBtn")
  verifyButton.addEventListener("click",verifyCode)
}

function isVerified(){
  const userData=getStoredUser()
  const verifiedWarning=document.getElementById("labelVerify")
  const sendCodeBtn=document.getElementById("sendCode");
  if(!userData.verified){
    verifiedWarning.classList.remove("hidden")
    sendCodeBtn.classList.remove("hidden")
    setupVerifyEmailListners()
  }
}

async function sendVerficationCode(){
  const sendButton=document.getElementById("sendCodeBtn")
  setButtonLoading(sendButton,true)
  const response=await fetch("/user/verify-email/send-code",{method:"GET"})
  const answer=await response.text();
  if(response.ok){
    setButtonLoading(sendButton,false)
    sendButton.classList.add("hidden")
    const codeSection=document.getElementById("codeSection");
    showNotification(answer,"success")
    codeSection.classList.remove("hidden")
  }
  if(!response.ok){
    setButtonLoading(sendButton,false)
    showNotification(answer,"error")
  }
}

async function verifyCode(){
  const thisCode=document.getElementById("verificationCode").value;
  console.log(thisCode)
  const params = new URLSearchParams();
  params.append('code', thisCode);
  const response = await fetch("/user/verify-email/confirm-code",{
    method:"POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:params.toString()
  })
//     document.getElementById("verificationCode").value=""
  const answer=await response.text()
  if(response.ok){
    showNotification(answer,"success")
    userSettings.verified=true
    const labelVerify=document.getElementById("labelVerify");
    const codeSection=document.getElementById("codeSection");
    const sendCode=document.getElementById("sendCode");
    labelVerify.parentNode.removeChild(labelVerify)
    codeSection.parentNode.removeChild(codeSection)
    sendCode.parentNode.removeChild(sendCode)
  }
  if(!response.ok){
    showNotification(answer,"error")
  }
}

function getUserId() {
  const userData = JSON.parse(localStorage.getItem("taskmaster_user")) || null
//  console.log("LOGGING USER DATA")
//  console.log(userData)
  return userData.id || userData.user_id || null
}

function checkAuthentication() {
  const raw = localStorage.getItem(STORAGE_KEYS.user)
  if (!raw) {
    window.location.href = "/auth/login"
    return
  }
  const userObj = safeParse(raw, {})
  populateUserForm(userObj)
}

function populateUserForm(userData) {
  if (!userData) return

  const fullName = userData.fullname || userData.name || ""
  const nameParts = String(fullName).trim().split(" ")
  const first = nameParts[0] || ""
  const last = nameParts.slice(1).join(" ")

  const firstNameEl = document.getElementById("first-name")
  const lastNameEl = document.getElementById("last-name")
  const emailEl = document.getElementById("email")
  const bioEl = document.getElementById("bio")

  if (firstNameEl) firstNameEl.value = first
  if (lastNameEl) lastNameEl.value = last
  if (emailEl) emailEl.value = userData.email || ""
  if (bioEl) bioEl.value = userData.bio || ""

  const picUrl = userData.profilePictureUrl || localStorage.getItem(STORAGE_KEYS.profilePicUrl) || null

  if (picUrl) {
    const avatarDiv = document.querySelector(".w-20.h-20.bg-blue-600.rounded-full")
    if (avatarDiv) {
      avatarDiv.innerHTML = `<img src="${picUrl}" alt="Profile Picture" class="w-20 h-20 rounded-full object-cover" />`
    }
  }
}

/* ============================================================================
   SETTINGS MANAGEMENT
   ============================================================================ */

function setupUserSettings() {
  // Ensure defaults based on current DOM state if nothing stored
  const stored = getSettings()

  userSettings = stored
//  console.log("USER SETTINGS:")
//  console.log(userSettings)
  saveSettings(userSettings)
  checkProfilePicture()
}

async function checkProfilePicture() {
  const userId = getUserId()

  const response = await fetch(`/user/${userId}/profile-picture`, {
    method: "GET"
  })
  if (response.ok) {
    const blob = await response.blob();                 // Response -> Blob
    const url = URL.createObjectURL(blob);
    const avatarDiv = document.querySelector(".w-20.h-20.bg-blue-600.rounded-full")
    if (avatarDiv) {
      avatarDiv.innerHTML = `<img id="profile_picture" alt="Profile Picture" class="w-20 h-20 rounded-full object-cover" />`
    }
    const picture = document.getElementById("profile_picture")
    picture.src = url;
    picture.onload = () => URL.revokeObjectURL(url);
  }
  if (!response.ok) {
    console.log("No Profile Picture Found")
    // throw new Error("Profile Picture Not Fetched")
  }
}

/* ============================================================================
   EVENT LISTENERS SETUP
   ============================================================================ */

function setupEventListeners() {
  // Left nav section switching
  document.querySelectorAll(".settings-nav-btn").forEach((btn) => btn.addEventListener("click", handleSectionChange))

  // Profile form
  const profileForm = document.getElementById("submitForm")
  if (profileForm) profileForm.addEventListener("submit", handleProfileUpdate)

  // Change avatar interactions
  wireAvatarControls()

  // Theme radios - UI only until saving Preferences
  document
    .querySelectorAll('input[name="theme"]')
    .forEach((radio) => radio.addEventListener("change", handleThemeChangeUI))

  // Quick dark toggle - UI only until saving Preferences
  const quickDarkToggle = document.getElementById("quick-dark-toggle")
  if (quickDarkToggle) quickDarkToggle.addEventListener("change", handleQuickDarkToggleUI)

  // Save buttons
  setupSectionSaveButtons()

  // Security form submit
  const passwordForm = document.getElementById("password-form")
  if (passwordForm) {
    passwordForm.addEventListener("submit", (e) => {
      e.preventDefault()
      handleSecuritySave()
    })
  }
}

/* ============================================================================
   SECTION SWITCHING
   ============================================================================ */

function handleSectionChange(event) {
  const targetSection = event.currentTarget.dataset.section

  // Update nav styles
  document.querySelectorAll(".settings-nav-btn").forEach((btn) => {
    btn.classList.remove("bg-blue-600", "text-white")
    btn.classList.add("text-slate-700", "hover:bg-slate-100")
  })

  event.currentTarget.classList.remove("text-slate-700", "hover:bg-slate-100")
  event.currentTarget.classList.add("bg-blue-600", "text-white")

  // Show selected section
  document.querySelectorAll(".settings-section").forEach((section) => {
    section.classList.add("hidden")
  })

  const targetElement = document.getElementById(`${targetSection}-section`)
  if (targetElement) {
    targetElement.classList.remove("hidden")
    targetElement.classList.add("animate-fade-in")
  }
}

/* ============================================================================
   PROFILE
   ============================================================================ */

function wireAvatarControls() {
  const changeBtn = document.getElementById("change-avatar-btn")
  const input = document.getElementById("profile-picture-input")
  if (!changeBtn || !input) return

  changeBtn.addEventListener("click", () => input.click())

  input.addEventListener("change", async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type and size (<= 2MB; JPG/PNG/WebP)
    const maxSize = 2 * 1024 * 1024
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (file.size > maxSize) {
      showNotification("Profile picture must be less than 2MB", "error")
      input.value = ""
      return
    }
    if (!allowedTypes.includes(file.type)) {
      showNotification("Profile picture must be JPG, PNG, or WebP format", "error")
      input.value = ""
      return
    }

    selectedProfilePicture = file
    const reader = new FileReader()
    reader.onload = (ev) => {
      const avatarDiv = document.querySelector(".w-20.h-20.bg-blue-600.rounded-full")
      if (avatarDiv) {
        avatarDiv.innerHTML = `<img src="${ev.target.result}" alt="Profile Picture" class="w-20 h-20 rounded-full object-cover" />`
      }
    }
    reader.readAsDataURL(file)
  })
}

async function handleProfileUpdate(event) {
  event.preventDefault()

  const form = event.target
  const formData = new FormData(form)
  const submitButton = form.querySelector('button[type="submit"]')

  setButtonLoading(submitButton, true)

  try {
    const validationResult = validateProfileData(formData)
    if (!validationResult.isValid) {
      showNotification(validationResult.message, "error")
      return
    }

    const user = getStoredUser() || {}
    const firstName = formData.get("firstName")?.toString().trim() || ""
    const lastName = formData.get("lastName")?.toString().trim() || ""
    const bio = formData.get("bio")?.toString().trim() || ""

    // Update local user model
    const updatedUser = {
      ...user,
      fullname: `${firstName} ${lastName}`.trim(),
      bio,
    }

    // Handle profile picture (save as data URL in localStorage for demo)
    const profilePicture = formData.get("profilePicture")
    if (profilePicture instanceof File && profilePicture.size > 0) {
      const dataUrl = await fileToDataURL(profilePicture)
      updatedUser.profilePictureUrl = dataUrl
      localStorage.setItem(STORAGE_KEYS.profilePicUrl, dataUrl)
    }

    setStoredUser(updatedUser)
    showNotification("Profile updated successfully!", "success")
  } catch (error) {
    console.error("Profile update failed:", error)
    handleProfileUpdateError(error)
  } finally {
    setButtonLoading(submitButton, false)
  }
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => resolve(reader.result)
    const result = saveProfilePicture(getUserId(), file)
//    console.log(result)
    reader.readAsDataURL(file)
  })
}

async function saveProfilePicture(userId, file) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("userId", userId)
  const response = await fetch(`/user/${userId}/profile-picture`, {
    method: "PUT",
    body: formData,
  })
  return response
}


/* ============================================================================
   THEME & QUICK TOGGLE (UI-ONLY until Save)
   ============================================================================ */

function handleThemeChangeUI(event) {
  const theme = event.target.value

  // Update preview styling of cards
  updateThemeOptionStyles()

  // Sync quick toggle
  const quickToggle = document.getElementById("quick-dark-toggle")
  if (quickToggle) quickToggle.checked = theme === "dark"

  // Apply visually (not persisted yet)
  applyTheme(theme)

  // Track pending change
  userSettings.theme = theme

  // Mark modified section
  markSectionAsModified(event.target)
  // window.updateSettingsFromExternal(userSettings)
}

function handleQuickDarkToggleUI(event) {
  const isDark = event.target.checked
  const newTheme = isDark ? "dark" : "light"

  // Sync radio
  const themeRadio = document.querySelector(`input[name="theme"][value="${newTheme}"]`)
  if (themeRadio) {
    themeRadio.checked = true
    updateThemeOptionStyles()
    // window.updateSettingsFromExternal(userSettings)
  }

  // Apply visually (not persisted yet)
  applyTheme(newTheme)

  // Track pending
  userSettings.theme = newTheme

  // Mark modified section
  markSectionAsModified(event.target)
}

function initializeQuickDarkToggle() {
  const quickToggle = document.getElementById("quick-dark-toggle")
  if (quickToggle) {
    const currentTheme = userSettings.theme || "light"
    quickToggle.checked = currentTheme === "dark"
  }
}

function updateThemeOptionStyles() {
  document.querySelectorAll(".theme-option").forEach((option) => {
    const radio = option.querySelector('input[type="radio"]')
    const container = option.querySelector("div")
    if (!radio || !container) return

    if (radio.checked) {
      container.classList.remove("border-slate-300")
      container.classList.add("border-blue-600", "ring-2", "ring-blue-200")
    } else {
      container.classList.remove("border-blue-600", "ring-2", "ring-blue-200")
      container.classList.add("border-slate-300")
    }
  })
}

/* ============================================================================
   INITIAL UI STATE SYNC
   ============================================================================ */

function initializeUIState() {
  // Theme application
  if (userSettings.theme) {
    // Set radio
    const themeRadio = document.querySelector(`input[name="theme"][value="${userSettings.theme}"]`)
    if (themeRadio) themeRadio.checked = true

    updateThemeOptionStyles()
    applyTheme(userSettings.theme)
  }

  // Sync controls from settings
  applySettingsToUI(userSettings)
}

/* ============================================================================
   SAVE BUTTONS (by section)
   ============================================================================ */

function setupSectionSaveButtons() {
  // Preferences
  const savePreferencesBtn = document.getElementById("save-preferences-btn")
  if (savePreferencesBtn) {
    savePreferencesBtn.addEventListener("click", handlePreferencesSave)
  }

  // Notifications
  const saveNotificationsBtn = document.getElementById("save-notifications-btn")
  if (saveNotificationsBtn) {
    saveNotificationsBtn.addEventListener("click", handleNotificationsSave)
  }


  const deleteAccountBtn = document.getElementById("delete-account-btn")
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", deleteAccount)
  }

  const exportAccountBtn = document.getElementById("export-account-btn")
  if (exportAccountBtn) {
    exportAccountBtn.addEventListener("click", exportAccount)
  }

  // Change tracking
  setupChangeTracking()
}

async function deleteAccount() {
  if (!window.confirm("Delete account permanently? This cannot be undone.")) return;  // user canceled [web:549]

  const userId = getUserId();  // assume this returns a valid id [web:551]
  const response = await fetch(`/user/${userId}/delete-account`, { method: "DELETE" });  // DELETE call [web:170]

  const text = await response.text();  // MUST await to get the string [web:170]
  if (response.ok) {
    alert(text || "Account deleted");  // show server message if any [web:549]
    window.location.href = "/";        // redirect after success [web:561]
  } else {
    alert(text || `Failed: HTTP ${response.status}`);  // show error body or fallback [web:170]
  }
}


async function exportAccount() {
  if (!window.confirm("Do You Want To Export Your Account Data..?")) return;  // user canceled [web:549]

  const userId = getUserId();
  const response = await fetch(`/user/${userId}/export-data`, { method: "GET" });

  const blob = await response.blob()

  const cd = response.headers.get("content-disposition") || "";
  const filename = extractFilename(cd) || `user-${userId}-export.json`; // [2][4]

  // 5) Create object URL and trigger download
  const url = URL.createObjectURL(blob); // [19]
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  // 6) Cleanup
  document.body.removeChild(a);
  // It’s generally safe to revoke shortly after click; or delay with setTimeout if needed. [10]
  URL.revokeObjectURL(url); // [16]
}

function extractFilename(disposition) {
  if (!disposition) return null;
  // filename* (RFC 5987) has priority
  const matchStar = /filename\*\s*=\s*([^']*)''([^;]+)/i.exec(disposition);
  if (matchStar) {
    try { return decodeURIComponent(matchStar); } catch { /* ignore */ }
  }
  // fallback: filename="name.ext" or filename=name.ext
  const match = /filename\s*=\s*\"?([^\";]+)\"?/i.exec(disposition);
  return match ? match : null;
}

function setupChangeTracking() {
  const formElements = document.querySelectorAll(
    'input[type="checkbox"], input[type="radio"], select, input[type="text"], input[type="email"], input[type="password"], textarea',
  )

  formElements.forEach((element) => {
    element.addEventListener("change", () => {
      markSectionAsModified(element)
    })

    element.addEventListener("input", () => {
      markSectionAsModified(element)
    })
  })
}

function markSectionAsModified(element) {
  const section = element.closest(".settings-section")
  if (!section) return

  const saveBtn = section.querySelector('button[id*="save-"]')
  if (!saveBtn) return

  if (!saveBtn.classList.contains("bg-orange-500")) {
    saveBtn.classList.remove("bg-blue-600", "hover:bg-blue-700")
    saveBtn.classList.add("bg-orange-500", "hover:bg-orange-600")
    // turn "Save..." into "Save*..."
    saveBtn.innerHTML = saveBtn.innerHTML.replace("Save", "Save*")
  }
}

function resetSectionModifiedState(sectionId) {
  const section = document.getElementById(sectionId)
  if (!section) return

  const saveBtn = section.querySelector('button[id*="save-"]')
  if (!saveBtn) return

  saveBtn.classList.remove("bg-orange-500", "hover:bg-orange-600")
  saveBtn.classList.add("bg-blue-600", "hover:bg-blue-700")
  saveBtn.innerHTML = saveBtn.innerHTML.replace("Save*", "Save")
}

/* ============================================================================
   PREFERENCES SAVE
   ============================================================================ */

async function handlePreferencesSave() {
  try {
    const settings = collectPreferencesSettings()

//    console.log("SETTINGS")
//    console.log(settings)
    if (Object.keys(settings).length === 0) {
      showNotification("No preference changes to save", "info")
      return
    }

    const updated = await savePreferencesToBackend(settings)
//    console.log(updated)
    userSettings = { ...settings, ...updated }
//    console.log(userSettings)
    saveSettings(userSettings)
    resetSectionModifiedState("preferences-section")
    showNotification("Preferences saved successfully!", "success")
  } catch (error) {
    console.error("Failed to save preferences:", error)
    showNotification("Failed to save preferences", "error")
  }
}

function collectPreferencesSettings() {
  const settings = {}

  // Theme
  const themeRadio = document.querySelector('input[name="theme"]:checked')
  if (themeRadio) settings.theme = themeRadio.value

  // Task sounds (id uses dashes; key should match id)
  const taskSounds = document.getElementById("taskSounds")
  if (taskSounds) settings["taskSounds"] = taskSounds.checked

  // Due date reminders (Preferences section uses dashed id)
  const dueDateReminders = document.getElementById("dueDateReminders")
  if (dueDateReminders) settings["dueDateReminders"] = dueDateReminders.checked

  // Default priority
  const defaultPriority = document.getElementById("defaultPriority")
  if (defaultPriority) settings["defaultPriority"] = defaultPriority.value

  // Tasks per page
  const tasksPerPage = document.getElementById("tasksPerPage")
  if (tasksPerPage) settings["tasksPerPage"] = tasksPerPage.value

  return settings
}

/* ============================================================================
   NOTIFICATIONS SAVE
   ============================================================================ */

async function handleNotificationsSave() {
  try {
    const settings = collectNotificationsSettings()

    if (Object.keys(settings).length === 0) {
      showNotification("No notification changes to save", "info")
      return
    }

    let updated = await saveNotificationToBackend(settings)
    userSettings = { ...settings, ...updated }
    saveSettings(userSettings)

    resetSectionModifiedState("notifications-section")
    showNotification("Notification settings saved successfully!", "success")
  } catch (error) {
    console.error("Failed to save notification settings:", error)
    showNotification("Failed to save notification settings", "error")
  }
}

function collectNotificationsSettings() {
  const settings = {}

  // Email notifications (id uses dash; key must match id)
  const emailNotifications = document.getElementById("emailNotifications")
  if (emailNotifications) settings["emailNotifications"] = emailNotifications.checked

  // Task reminders (Notifications section uses camelCase id)
  const taskReminders = document.getElementById("taskReminders")
  if (taskReminders) settings["taskReminders"] = taskReminders.checked

  return settings
}

/* ============================================================================
   SECURITY SAVE (Local validation only)
   ============================================================================ */

function handleSecuritySave() {
  const currentPassword = document.getElementById("current-password")?.value
  const newPassword = document.getElementById("new-password")?.value
  const confirmNewPassword = document.getElementById("confirm-new-password")?.value

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    showNotification("Please fill out all password fields", "error")
    return
  }

  if (newPassword !== confirmNewPassword) {
    showNotification("New passwords do not match", "error")
    return
  }


  resetSectionModifiedState("security-section")
  // Clear fields
  document.getElementById("current-password").value = ""
  document.getElementById("new-password").value = ""
  document.getElementById("confirm-new-password").value = ""
  savePasswordToBackend(currentPassword, newPassword, confirmNewPassword)

}

async function savePasswordToBackend(current, newPass, confirm) {
  const userId = getUserId()
  const response = await fetch(`user/${userId}/change-password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      currentPassword: current.trim(),
      newPassword: newPass.trim(),
      confirmNewPassword: confirm.trim(),
    })
  })
  const txt = await response.text()
//  console.log(txt)
  if (response.ok) {
    showNotification("Password updated successfully!", "success")
  }
  if (!response.ok) {
    showNotification(txt, "error")
  }
}

/* ============================================================================
   THEME & UI MANAGEMENT
   ============================================================================ */

function applyTheme(theme) {
  const body = document.body
  const html = document.documentElement

  body.classList.add("theme-transition")

  body.classList.remove("theme-light", "theme-dark", "theme-auto")
  html.classList.remove("dark")

  const darkBg = "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
  const lightBg = "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"

  switch (theme) {
    case "dark":
      html.classList.add("dark")
      body.classList.add("theme-dark")
      body.style.background = darkBg
      body.style.color = "#f1f5f9"
      break
    case "light":
      body.classList.add("theme-light")
      body.style.background = lightBg
      body.style.color = "#1e293b"
      break
    case "auto": {
      body.classList.add("theme-auto")
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (prefersDark) {
        html.classList.add("dark")
        body.style.background = darkBg
        body.style.color = "#f1f5f9"
      } else {
        body.style.background = lightBg
        body.style.color = "#1e293b"
      }
      setupSystemThemeListener()
      break
    }
  }

  setTimeout(() => {
    body.classList.remove("theme-transition")
  }, 300)
}

function setupSystemThemeListener() {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

  const handleSystemThemeChange = () => {
    const current = getSettings()
    if (current.theme === "auto") {
      applyTheme("auto")
    }
  }

  // Rebind listener safely
  mediaQuery.removeEventListener?.("change", handleSystemThemeChange)
  mediaQuery.addEventListener("change", handleSystemThemeChange)
}

/* ============================================================================
   VALIDATION
   ============================================================================ */

function validateProfileData(formData) {
  const firstName = formData.get("firstName")?.toString().trim()
  // const email = formData.get("email")?.toString().trim()
  const profilePicture = formData.get("profilePicture")

  if (!firstName) {
    return { isValid: false, message: "First name is required" }
  }

  if (profilePicture instanceof File && profilePicture.size > 0) {
    const maxSize = 2 * 1024 * 1024 // 2MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

    if (profilePicture.size > maxSize) {
      return {
        isValid: false,
        message: "Profile picture must be less than 2MB",
      }
    }
    if (!allowedTypes.includes(profilePicture.type)) {
      return {
        isValid: false,
        message: "Profile picture must be JPG, PNG, or WebP format",
      }
    }
  }

  return { isValid: true }
}

/* ============================================================================
   UI SYNC & UTILITIES
   ============================================================================ */

function applySettingsToUI(settings = {}) {
  Object.keys(settings).forEach((key) => {
    const el = document.getElementById(key)
    if (!el) return

    if (el.type === "checkbox") {
      el.checked = Boolean(settings[key])
    } else if (el.type === "radio" && el.value === settings[key]) {
      el.checked = true
    } else if (el.tagName === "SELECT") {
      el.value = String(settings[key])
    } else {
      el.value = settings[key]
    }
  })

  // Sync quick toggle with final theme
  if (settings.theme) {
    const quickToggle = document.getElementById("quick-dark-toggle")
    if (quickToggle) {
      quickToggle.checked = settings.theme === "dark"
    }
  }
}

function showNotification(message, type = "success") {
  const div = document.createElement("div")
  const base = "fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-down text-white"
  const color = type === "success" ? "bg-green-500" : type === "info" ? "bg-slate-700" : "bg-red-500"
  div.className = `${base} ${color}`
  const icon = type === "success" ? "fa-check-circle" : type === "info" ? "fa-info-circle" : "fa-exclamation-circle"
  div.innerHTML = `<i class="fas ${icon} mr-2"></i>${message}`
  document.body.appendChild(div)
  setTimeout(() => {
    div.style.opacity = "0"
    div.style.transform = "translateY(-20px)"
    setTimeout(() => div.remove(), 500)
  }, 3000)
}

function setButtonLoading(button, isLoading) {
  if (!button) return
  if (isLoading) {
    button.disabled = true
    button.dataset.originalText = button.innerHTML
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...'
    button.classList.add("opacity-75", "cursor-not-allowed")
  } else {
    button.disabled = false
    button.innerHTML = button.dataset.originalText || button.innerHTML
    button.classList.remove("opacity-75", "cursor-not-allowed")
  }
}

function handleProfileUpdateError(error) {
  let message = "Failed to update profile"

  if (error?.status === 400) {
    message = error.data?.message || "Invalid profile data"
  } else if (error?.status === 401) {
    message = "Session expired. Please log in again."
    setTimeout(() => (window.location.href = "/auth/login"), 2000)
  } else if (error?.status === 413) {
    message = "File too large. Please choose a smaller image."
  } else if (error?.status === 429) {
    message = "Too many requests. Please try again later."
  } else if (error?.name === "TypeError") {
    message = "Network error. Please check your connection."
  }

  showNotification(message, "error")
}
