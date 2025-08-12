document.addEventListener("DOMContentLoaded", () => {
  initializeSettingsPage();
});

let selectedProfilePicture = null;

function getUserId() {
  const userData = JSON.parse(localStorage.getItem("taskmaster_user"));
  return userData?.id || userData?.userId || null;
}

function initializeSettingsPage() {
  checkAuthentication();
  loadUserData();
  setupEventListeners();
  loadSettings(); // will also update notification checkboxes
  changeProfilePicture();
  notificationSection(); // only sets listeners now
}


function handleSectionChange(event) {
  const targetSection = event.target.dataset.section;

  // Update nav button styles
  document.querySelectorAll(".settings-nav-btn").forEach((btn) => {
    btn.classList.remove("bg-blue-600", "text-white");
    btn.classList.add("text-slate-700", "hover:bg-slate-100");
  });

  event.target.classList.remove("text-slate-700", "hover:bg-slate-100");
  event.target.classList.add("bg-blue-600", "text-white");

  // Show the selected section only
  document.querySelectorAll(".settings-section").forEach((section) => {
    section.classList.add("hidden");
  });

  const targetElement = document.getElementById(`${targetSection}-section`);
  if (targetElement) {
    targetElement.classList.remove("hidden");
    targetElement.classList.add("animate-fade-in");
  }
}


async function handleProfileUpdate(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const firstName = formData.get("firstName")?.trim();
  const lastName = formData.get("lastName")?.trim();
  const email = formData.get("email")?.trim();
  const bio = formData.get("bio")?.trim();
  const profilePicture = formData.get("profilePicture");

  // Validation
  if (!firstName || !email) {
    showNotification("Please fill in all required fields", "error");
    return;
  }

  // Prepare data payload
  const userDataUpdate = {
    fullname: `${firstName} ${lastName}`.trim(),
    email: email,
    bio: bio
  };

  try {
    const userData = JSON.parse(localStorage.getItem("taskmaster_user"));
    const userId = userData?.id || userData?.userId;
    if (!userId) throw new Error("User ID not found");

    // 1️⃣ Update profile text fields
    let response = await fetch(`/user/${userId}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDataUpdate)
    });

    if (!response.ok) throw new Error("Failed to update profile information");

    // 2️⃣ Optionally update profile picture if file is chosen
    if (profilePicture && profilePicture.size > 0) {
      const pictureForm = new FormData();
      pictureForm.append("file", profilePicture);

      let picResponse = await fetch(`/user/${userId}/profile-picture`, {
        method: "PUT",
        body: pictureForm
      });

      if (!picResponse.ok) throw new Error("Failed to upload profile picture");
    }

    // 3️⃣ Refresh profile picture preview
    loadProfilePicture(userId);

    // 4️⃣ Get updated user data from backend and save to localStorage
    const userRes = await fetch(`/user/profile`);
    if (userRes.ok) {
      const updatedUser = await userRes.json();
      localStorage.setItem("taskmaster_user", JSON.stringify(updatedUser));
    } else {
      // fallback to update local data
      const currentUser = JSON.parse(localStorage.getItem("taskmaster_user"));
      localStorage.setItem("taskmaster_user", JSON.stringify({ ...currentUser, ...userDataUpdate }));
    }

    // 5️⃣ Show success to user
    showNotification("Profile updated successfully!", "success");

  } catch (error) {
    console.error(error);
    showNotification(error.message || "Failed to update profile", "error");
  }
}


async function handlePasswordChange(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmNewPassword = formData.get("confirmNewPassword");

  // ===== Validation =====
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    showNotification("Please fill in all password fields", "error");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    showNotification("New passwords do not match", "error");
    return;
  }

  if (newPassword.length < 6) {
    showNotification("New password must be at least 6 characters long", "error");
    return;
  }

  try {
    const userData = JSON.parse(localStorage.getItem("taskmaster_user"));
    const userId = userData?.id || userData?.userId;
    if (!userId) throw new Error("User ID not found");

    // Prepare request payload
    const payload = {
      currentPassword,
      newPassword,
      confirmNewPassword
    };

    const response = await fetch(`/user/${userId}/change-password`, {
      method: "POST", // or "PUT" if your backend expects PUT
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const msg = errorData?.message || "Failed to update password";
      throw new Error(msg);
    }

    showNotification("Password updated successfully!", "success");
    event.target.reset();

  } catch (error) {
    console.error(error);
    showNotification(error.message || "Password update error", "error");
  }
}

function handleThemeChange(event) {
  const theme = event.target.value;

  // Update UI for selected theme
  document.querySelectorAll(".theme-option").forEach((option) => {
    const radio = option.querySelector('input[type="radio"]');
    const container = option.querySelector("div");

    if (radio.checked) {
      container.classList.remove("border-slate-300");
      container.classList.add("border-blue-600", "ring-2", "ring-blue-200");
    } else {
      container.classList.remove("border-blue-600", "ring-2", "ring-blue-200");
      container.classList.add("border-slate-300");
    }
  });

  // Sync quick toggle
  const quickToggle = document.getElementById("quick-dark-toggle");
  if (quickToggle) quickToggle.checked = (theme === "dark");

  // Save selected theme to backend/localStorage
  saveSettingsToBackend({ theme })
    .then(() => {
      applyTheme(theme); // instantly change page theme
      showNotification(`Theme changed to ${theme}`, "success");
    })
    .catch(() => {
      showNotification("Failed to save theme setting", "error");
    });
}


function handleQuickDarkToggle(event) {
  const isDark = event.target.checked;
  const newTheme = isDark ? "dark" : "light";

  // Update radio buttons for theme selection accordingly
  const themeRadio = document.querySelector(`input[name="theme"][value="${newTheme}"]`);
  if (themeRadio) {
    themeRadio.checked = true;
  }

  // Call your existing theme change handler to apply changes and save
  handleThemeChange({ target: themeRadio });
}

function handleSettingToggle(event) {
  const setting = event.target.id;      // e.g. "task-sounds", "due-date-reminders"
  const value = event.target.checked;   // true / false

  saveSettingsToBackend({ [setting]: value })
    .then(() => {
      showNotification(
        `${getSettingLabel(setting)} ${value ? "enabled" : "disabled"}`,
        "success"
      );
    })
    .catch(() => {
      showNotification(
        `Failed to update ${getSettingLabel(setting)}`,
        "error"
      );
    });
}
function handleSelectChange(event) {
  const setting = event.target.id;     // e.g. "default-priority", "tasks-per-page"
  const value = event.target.value;    // selected value

  // Save setting to backend
  saveSettingsToBackend({ [setting]: value })
    .then(() => {
      showNotification(
        `${getSettingLabel(setting)} updated to ${value}`,
        "success"
      );
    })
    .catch(() => {
      showNotification(
        `Failed to update ${getSettingLabel(setting)}`,
        "error"
      );
    });
}

// ------------------ AUTH CHECK ------------------
function checkAuthentication() {
  const userData = localStorage.getItem("taskmaster_user") || sessionStorage.getItem("taskmaster_user");
  if (!userData) {
    window.location.href = "/auth/login";
  }
}

// ------------------ LOAD USER ------------------
async function loadUserData() {
  try {
    const res = await fetch('/user/profile', { method: "GET", headers: { "Content-Type": "application/json" } });
    if (!res.ok) throw new Error("Failed to load user data");
    const userData = await res.json();
    localStorage.setItem("taskmaster_user", JSON.stringify(userData));
    populateUserForm(userData);
  } catch (err) {
    console.error(err);
    const localData = localStorage.getItem("taskmaster_user");
    if (localData) populateUserForm(JSON.parse(localData));
  }
}

function populateUserForm(userData) {
  if (!userData) return;
  const fullName = userData.fullname || "";
  const nameParts = fullName.trim().split(" ");
  document.getElementById("first-name").value = nameParts[0] || "";
  document.getElementById("last-name").value = nameParts.slice(1).join(" ");
  document.getElementById("email").value = userData.email || "";
  document.getElementById("bio").value = userData.bio || "";

  if (userData.profilePictureUrl) {
    const avatarDiv = document.querySelector(".w-20.h-20.bg-blue-600.rounded-full");
    avatarDiv.innerHTML = `<img src="${userData.profilePictureUrl}" alt="Profile Picture" class="w-20 h-20 rounded-full object-cover" />`;
  }
}

// ------------------ EVENTS ------------------
function setupEventListeners() {
  document.querySelectorAll(".settings-nav-btn").forEach(btn =>
    btn.addEventListener("click", handleSectionChange)
  );

  const profileForm = document.getElementById("profile-form");
  if (profileForm) profileForm.addEventListener("submit", handleProfileUpdate);

  const passwordForm = document.getElementById("password-form");
  if (passwordForm) passwordForm.addEventListener("submit", handlePasswordChange);

  document.querySelectorAll('input[name="theme"]').forEach(radio =>
    radio.addEventListener("change", handleThemeChange)
  );

  const quickDarkToggle = document.getElementById("quick-dark-toggle");
  if (quickDarkToggle)
    quickDarkToggle.addEventListener("change", handleQuickDarkToggle);

  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox =>
    checkbox.addEventListener("change", handleSettingToggle)
  );

  document.querySelectorAll("select").forEach(select =>
    select.addEventListener("change", handleSelectChange)
  );
}

// ------------------ PROFILE PICTURE ------------------
function changeProfilePicture() {
  const changeBtn = document.getElementById("change-avatar-btn");
  const input = document.getElementById("profile-picture-input");

  if (!changeBtn || !input) return;

  changeBtn.addEventListener("click", () => input.click());
  input.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    selectedProfilePicture = file;
    const reader = new FileReader();
    reader.onload = e => {
      const avatarDiv = document.querySelector(".w-20.h-20.bg-blue-600.rounded-full");
      if (avatarDiv) avatarDiv.innerHTML = `<img src="${e.target.result}" class="w-20 h-20 rounded-full object-cover" />`;
    };
    reader.readAsDataURL(file);
    const userId = getUserId();
    if (userId) saveProfilePicture(userId);
  });
}

async function saveProfilePicture(userId) {
  if (!selectedProfilePicture || !userId) return;
  try {
    const pictureForm = new FormData();
    pictureForm.append("file", selectedProfilePicture);
    const res = await fetch(`/user/${userId}/profile-picture`, { method: "PUT", body: pictureForm });
    if (!res.ok) throw new Error("Failed to upload profile picture");
    alert(await res.text());
    selectedProfilePicture = null;
  } catch (e) {
    console.error(e);
    alert("Error uploading profile picture");
  }
}

// ------------------ SETTINGS ------------------
function loadSettings() {
  const userId = getUserId();
  if (!userId) return;

  fetch(`/api/settings/${userId}`)
    .then(res => { if (!res.ok) throw new Error('Failed to load settings'); return res.json(); })
    .then(settings => {
      applySettingsToUI(settings);
      applyTheme(settings.theme || "light");
      // Populate notification checkboxes without second API call
      const section = document.getElementById("notifications-section");
      if (section) {
        const emailCheckbox = section.querySelector("#email-notifications");
        const remindersCheckbox = section.querySelector("#task-reminders");
        if (emailCheckbox) emailCheckbox.checked = !!settings.emailNotifications;
        if (remindersCheckbox) remindersCheckbox.checked = !!settings.dueDateReminders;
      }
    })
    .catch(() => {
      const settings = getSettings();
      applySettingsToUI(settings);
      applyTheme(settings.theme || "light");
    });
}

function notificationSection() {
  const section = document.getElementById("notifications-section");
  if (!section) return;

  const emailCheckbox = section.querySelector("#email-notifications");
  const remindersCheckbox = section.querySelector("#task-reminders");

  if (emailCheckbox)
    emailCheckbox.addEventListener("change", () =>
      saveSettingsToBackend({ emailNotifications: emailCheckbox.checked })
    );

  if (remindersCheckbox)
    remindersCheckbox.addEventListener("change", () =>
      saveSettingsToBackend({ dueDateReminders: remindersCheckbox.checked })
    );
}

function getSettings() {
  return JSON.parse(localStorage.getItem("taskmaster_settings")) || {
    theme: "light",
    "task-sounds": false,
    "due-date-reminders": true,
    "default-priority": "medium",
    "tasks-per-page": "25"
  };
}

function saveSettings(settings) {
  const updated = { ...getSettings(), ...settings };
  localStorage.setItem("taskmaster_settings", JSON.stringify(updated));
}

async function saveSettingsToBackend(settings) {
  const userId = getUserId();
  if (!userId) return;
  try {
    const res = await fetch(`/api/settings/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
      credentials: "include"
    });
    if (!res.ok) throw new Error('Backend save failed');
    saveSettings(settings);
  } catch {
    saveSettings(settings);
  }
}

// ------------------ THEME & UI ------------------
function applySettingsToUI(settings) {
  Object.keys(settings).forEach(key => {
    const el = document.getElementById(key);
    if (!el) return;
    if (el.type === "checkbox") el.checked = settings[key];
    else if (el.type === "radio" && el.value === settings[key]) el.checked = true;
    else if (el.tagName === "SELECT") el.value = settings[key];
    else el.value = settings[key];
  });
}

function applyTheme(theme) {
  const body = document.body, html = document.documentElement;
  body.classList.remove("theme-light", "theme-dark", "theme-auto");
  html.classList.remove("dark");
  const darkBg = "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)";
  const lightBg = "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)";
  if (theme === "dark") {
    html.classList.add("dark");
    body.classList.add("theme-dark"); body.style.background = darkBg; body.style.color = "#f1f5f9";
  } else if (theme === "light") {
    body.classList.add("theme-light"); body.style.background = lightBg; body.style.color = "#1e293b";
  } else {
    body.classList.add("theme-auto");
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      html.classList.add("dark"); body.style.background = darkBg; body.style.color = "#f1f5f9";
    } else {
      body.style.background = lightBg; body.style.color = "#1e293b";
    }
  }
}

function getSettingLabel(settingId) {
  return {
    "task-sounds": "Task sounds",
    "due-date-reminders": "Due date reminders",
    "email-notifications": "Email notifications",
    "task-reminders": "Task reminders",
    "default-priority": "Default priority",
    "tasks-per-page": "Tasks per page"
  }[settingId] || settingId;
}

function showNotification(message, type) {
  const div = document.createElement("div");
  div.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-down ${type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`;
  const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
  div.innerHTML = `<i class="fas ${icon} mr-2"></i>${message}`;
  document.body.appendChild(div);
  setTimeout(() => {
    div.style.opacity = "0"; div.style.transform = "translateY(-20px)";
    setTimeout(() => div.remove(), 300);
  }, 3000);
}
