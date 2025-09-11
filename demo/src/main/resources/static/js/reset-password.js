// Reset Password JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeResetPasswordPage();
});

function initializeResetPasswordPage() {
  setupEventListeners();
  setupPasswordToggle();
  setupPasswordStrength();
  validateResetToken();
}


function getToken(){
  const urlParams = new URLSearchParams(window.location.search);
  gettoken = urlParams.get("token");
  return gettoken
}


function validateResetToken() {
  const urlParams = new URLSearchParams(window.location.search);
  gettoken = urlParams.get("token");
  token=gettoken
//  console.log("GETTOKEN"+gettoken)
  if (!gettoken) {
    showNotification("Invalid or missing reset token. Redirecting to forgot password page.", "error");
    setTimeout(() => {
      window.location.href = "/auth/forgot-password";
    }, 3000);
  }
}

function setupEventListeners() {
  const form = document.getElementById("reset-password-form");
  if (form) {
    form.addEventListener("submit", handlePasswordReset);
  }

  const inputs = document.querySelectorAll("input[required]");
  inputs.forEach((input) => {
    input.addEventListener("blur", validateField);
    input.addEventListener("input", clearError);
  });

  const confirm = document.getElementById("confirm-password");
  if (confirm) {
    confirm.addEventListener("input", validatePasswordMatch);
  }
}

function setupPasswordToggle() {
  const toggleBtn = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");
  if (!toggleBtn || !passwordInput) return;

  const toggleIcon = toggleBtn.querySelector("i");

  toggleBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";
    if (toggleIcon) {
      toggleIcon.classList.toggle("fa-eye");
      toggleIcon.classList.toggle("fa-eye-slash");
      toggleIcon.style.transform = "scale(0.8)";
      setTimeout(() => {
        toggleIcon.style.transform = "scale(1)";
      }, 150);
    }

    toggleBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
  });
}

function setupPasswordStrength() {
  const passwordInput = document.getElementById("password");
  const strengthContainer = document.getElementById("password-strength");
  if (!passwordInput || !strengthContainer) return;

  const strengthBars = strengthContainer.querySelectorAll(".strength-bar");
  const strengthText = strengthContainer.querySelector(".strength-text");

  passwordInput.addEventListener("input", function () {
    const password = this.value;

    if (password.length === 0) {
      strengthContainer.classList.add("hidden");
      return;
    }

    strengthContainer.classList.remove("hidden");

    const strength = calculatePasswordStrength(password);
    updatePasswordStrengthUI(strength, strengthBars, strengthText);
  });
}

function calculatePasswordStrength(password) {
  let score = 0;
  const feedback = [];

  if (password.length >= 8) score += 1;
  else feedback.push("at least 8 characters");

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("lowercase letters");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("uppercase letters");

  if (/\d/.test(password)) score += 1;
  else feedback.push("numbers");

  if (/[!@#$%^&*(),.?\":{}|<>]/.test(password)) score += 1;
  else feedback.push("special characters");

  const levels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

  const capped = Math.min(score, 4);
  return {
    score: capped,
    level: levels[capped],
    color: colors[capped],
    feedback: feedback,
  };
}

function updatePasswordStrengthUI(strength, strengthBars, strengthText) {
  strengthBars.forEach((bar) => {
    bar.className = "strength-bar h-1 bg-slate-200 rounded flex-1";
  });

  for (let i = 0; i <= strength.score; i++) {
    if (strengthBars[i]) {
      strengthBars[i].classList.remove("bg-slate-200");
      strengthBars[i].classList.add(strength.color);
    }
  }

  if (strengthText) {
    strengthText.textContent = `Password strength: ${strength.level}`;
    strengthText.className =
      `strength-text text-xs ${strength.score < 2 ? "text-red-600" : strength.score < 3 ? "text-yellow-600" : "text-green-600"}`;
  }
}

async function handlePasswordReset(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const password = (formData.get("password") || "").toString();
  const confirmPassword = (formData.get("confirm-password") || "").toString();

  let isValid = true;
  const fields = ["password", "confirm-password"];

  fields.forEach((fieldName) => {
    const field = form.querySelector(`#${fieldName}`);
    if (!validateField({ target: field })) isValid = false;
  });

  if (!validatePasswordMatch()) isValid = false;

  if (!isValid) return;

  const submitBtn = document.getElementById("submit-btn");
  const btnText = submitBtn ? submitBtn.querySelector(".btn-text") : null;
  const spinner = submitBtn ? submitBtn.querySelector(".spinner") : null;

  if (submitBtn) submitBtn.disabled = true;
  if (btnText) btnText.textContent = "Resetting Password...";
  if (spinner) spinner.classList.remove("hidden");

  try {
    await passwordReset(password);
    showNotification("Password reset successfully! Redirecting to sign in...", "success");
    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 2000);
  } catch (error) {
    const msg = error?.message || "Password reset failed. Please try again.";
    showNotification(msg, "error");

    if (form) {
      form.classList.add("animate-shake");
      setTimeout(() => form.classList.remove("animate-shake"), 500);
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.textContent = "Reset Password";
    if (spinner) spinner.classList.add("hidden");
  }
}

async function passwordReset(password) {
  if (!token) {
    throw new Error("Missing reset token");
  }
  token=getToken()
//  console.log(token)
  const data = {
    token: token.trim(),
    newPassword: password.trim(),
  };

  const response = await fetch("/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // Try to read JSON error; fall back to text
    let message = `HTTP ${response.status}`;
    try {
      const ct = response.headers.get("Content-Type") || "";
      if (ct.includes("application/json")) {
        const err = await response.json();
        if (err?.message) message = err.message;
      } else {
        const txt = await response.text();
        if (txt) message = txt;
      }
    } catch (_) {
      // ignore parsing errors
    }
    throw new Error(message);
  }

  // optionally return parsed data if backend responds with JSON
  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return null;
}

function validateField(event) {
  const field = event?.target;
  if (!field) return false;

  const value = (field.value || "").trim();
  const fieldName = field.name;

  clearError(event);

  if (!value) {
    showFieldError(field, `${getFieldLabel(fieldName)} is required`);
    return false;
  }

  if (fieldName === "password") {
    const strength = calculatePasswordStrength(value);
    if (strength.score < 2) {
      showFieldError(field, "Password is too weak. Include uppercase, lowercase, numbers, and special characters.");
      return false;
    }
  }

  return true;
}

function validatePasswordMatch() {
  const pwEl = document.getElementById("password");
  const cEl = document.getElementById("confirm-password");
  const password = pwEl ? pwEl.value : "";
  const confirmPassword = cEl ? cEl.value : "";

  if (confirmPassword && password !== confirmPassword) {
    showFieldError(cEl, "Passwords do not match");
    return false;
  }

  if (confirmPassword && password === confirmPassword) {
    clearError({ target: cEl });
  }

  return true;
}

function clearError(event) {
  const field = event?.target;
  if (!field) return;

  const errorElement = document.getElementById(`${field.name}-error`);

  if (errorElement) {
    errorElement.classList.add("hidden");
    errorElement.textContent = "";
  }

  field.classList.remove("border-red-500");
}

function showFieldError(field, message) {
  if (!field) return;

  const errorElement = document.getElementById(`${field.name}-error`);

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
    errorElement.classList.add("animate-slide-down");
  }

  field.classList.add("border-red-500");
  field.classList.add("animate-shake");

  setTimeout(() => {
    field.classList.remove("animate-shake");
  }, 500);
}

function getFieldLabel(fieldName) {
  const labels = {
    password: "Password",
    "confirm-password": "Confirm password",
  };
  return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-down ${
    type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
  }`;

  const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
  notification.innerHTML = `<i class="fas ${icon} mr-2"></i>${message}`;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateY(-20px)";
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// Export functions for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeResetPasswordPage,
    handlePasswordReset,
    validateField,
    calculatePasswordStrength,
    validatePasswordMatch,
  };
}
