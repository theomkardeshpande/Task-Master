// Register Page JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeRegisterPage()
})

function initializeRegisterPage() {
  setupEventListeners()
  setupFormValidation()
  setupPasswordToggle()
  setupPasswordStrength()
}

function setupEventListeners() {
  // Form submission
  document.getElementById("register-form").addEventListener("submit", handleRegistration)

  // Real-time validation
  const inputs = document.querySelectorAll("input[required]")
  inputs.forEach((input) => {
    input.addEventListener("blur", validateField)
    input.addEventListener("input", clearError)
  })

  // Password confirmation validation
  document.getElementById("confirm-password").addEventListener("input", validatePasswordMatch)
}

function setupFormValidation() {
  const form = document.getElementById("register-form")
  const inputs = form.querySelectorAll("input[required]")

  inputs.forEach((input) => {
    input.addEventListener("invalid", (event) => {
      event.preventDefault()
      validateField({ target: input })
    })
  })
}

function setupPasswordToggle() {
  const toggleBtn = document.getElementById("toggle-password")
  const passwordInput = document.getElementById("password")
  const toggleIcon = toggleBtn.querySelector("i")

  toggleBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password"

    passwordInput.type = isPassword ? "text" : "password"
    toggleIcon.classList.toggle("fa-eye")
    toggleIcon.classList.toggle("fa-eye-slash")

    toggleBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password")

    // Add animation
    toggleIcon.style.transform = "scale(0.8)"
    setTimeout(() => {
      toggleIcon.style.transform = "scale(1)"
    }, 150)
  })
}

function setupPasswordStrength() {
  const passwordInput = document.getElementById("password")
  const strengthContainer = document.getElementById("password-strength")
  const strengthBars = strengthContainer.querySelectorAll(".strength-bar")
  const strengthText = strengthContainer.querySelector(".strength-text")

  passwordInput.addEventListener("input", function () {
    const password = this.value

    if (password.length === 0) {
      strengthContainer.classList.add("hidden")
      return
    }

    strengthContainer.classList.remove("hidden")

    const strength = calculatePasswordStrength(password)
    updatePasswordStrengthUI(strength, strengthBars, strengthText)
  })
}

function calculatePasswordStrength(password) {
  let score = 0
  const feedback = []

  // Length check
  if (password.length >= 8) score += 1
  else feedback.push("at least 8 characters")

  // Lowercase check
  if (/[a-z]/.test(password)) score += 1
  else feedback.push("lowercase letters")

  // Uppercase check
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push("uppercase letters")

  // Number check
  if (/\d/.test(password)) score += 1
  else feedback.push("numbers")

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  else feedback.push("special characters")

  const levels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

  return {
    score: Math.min(score, 4),
    level: levels[Math.min(score, 4)],
    color: colors[Math.min(score, 4)],
    feedback: feedback,
  }
}

function updatePasswordStrengthUI(strength, strengthBars, strengthText) {
  // Reset all bars
  strengthBars.forEach((bar) => {
    bar.className = "strength-bar h-1 bg-slate-200 rounded flex-1"
  })

  // Fill bars based on strength
  for (let i = 0; i <= strength.score; i++) {
    if (strengthBars[i]) {
      strengthBars[i].classList.remove("bg-slate-200")
      strengthBars[i].classList.add(strength.color)
    }
  }

  // Update text
  strengthText.textContent = `Password strength: ${strength.level}`
  strengthText.className = `strength-text text-xs ${strength.score < 2 ? "text-red-600" : strength.score < 3 ? "text-yellow-600" : "text-green-600"
    }`
}

async function handleRegistration(event) {
  event.preventDefault()

  const form = event.target
  const formData = new FormData(form)
  const fullname = formData.get("fullname")
  const email = formData.get("email")
  const password = formData.get("password")
  const confirmPassword = formData.get("confirm-password")
  const terms = formData.get("terms")

  // Validate form
  let isValid = true
  const fields = ["fullname", "email", "password", "confirm-password"]

  fields.forEach((fieldName) => {
    const field = form.querySelector(`#${fieldName}`)
    if (!validateField({ target: field })) isValid = false
  })

  // Validate password match
  if (!validatePasswordMatch()) isValid = false

  // Validate terms
  if (!terms) {
    showFieldError(form.querySelector("#terms"), "You must agree to the terms and conditions")
    isValid = false
  }

  if (!isValid) return

  // Show loading state
  const submitBtn = document.getElementById("submit-btn")
  const btnText = submitBtn.querySelector(".btn-text")
  const spinner = submitBtn.querySelector(".spinner")

  // submitBtn.disabled = true
  // btnText.textContent = "Creating Account..."
  // spinner.classList.remove("hidden")

  try {
    // Disable button and show spinner as needed before the fetch call
    submitBtn.disabled = true;
    btnText.textContent = "Creating Account...";
    spinner.classList.remove("hidden");

    // Prepare payload with registration data
    const payload = {
      fullname: fullname,  // assuming these variables are from your form inputs
      email: email,
      password: password
      // Add any other registration fields here such as password, etc.
    };

    // Make POST request to Spring Boot registration API
    const response = await fetch("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // If the status code is not 2xx, try to parse error or throw generic error
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Registration failed");
    }

    // Parse the JSON response from backend (e.g., created user info)
    const userData = await response.json();

    // Save user data in localStorage/sessionStorage as per your app logic
    localStorage.setItem("taskmaster_user", JSON.stringify(userData));

    // Show success notification
    showNotification("Account created successfully! Redirecting to Login Page...", "success");

    // Redirect to dashboard after delay
    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 2000);
  }
  catch (error) {
    // Handle error notifications and UI reset
    showNotification(error.message || "Registration failed. Please try again.", "error");

    submitBtn.disabled = false;
    btnText.textContent = "Create Account";
    spinner.classList.add("hidden");

    // Shake form animation for visual feedback
  }
}

function validateField(event) {
  const field = event.target
  const value = field.value.trim()
  const fieldName = field.name

  clearError(event)

  if (!value) {
    showFieldError(field, `${getFieldLabel(fieldName)} is required`)
    return false
  }

  if (fieldName === "fullname" && value.length < 2) {
    showFieldError(field, "Full name must be at least 2 characters long")
    return false
  }

  if (fieldName === "email" && !isValidEmail(value)) {
    showFieldError(field, "Please enter a valid email address")
    return false
  }

  if (fieldName === "password") {
    const strength = calculatePasswordStrength(value)
    if (strength.score < 2) {
      showFieldError(field, "Password is too weak. Include uppercase, lowercase, numbers, and special characters.")
      return false
    }
  }

  return true
}

function validatePasswordMatch() {
  const password = document.getElementById("password").value
  const confirmPassword = document.getElementById("confirm-password").value
  const confirmField = document.getElementById("confirm-password")

  if (confirmPassword && password !== confirmPassword) {
    showFieldError(confirmField, "Passwords do not match")
    return false
  }

  if (confirmPassword && password === confirmPassword) {
    clearError({ target: confirmField })
  }

  return true
}

function clearError(event) {
  const field = event.target
  const errorElement = document.getElementById(`${field.name}-error`)

  if (errorElement) {
    errorElement.classList.add("hidden")
    errorElement.textContent = ""
  }

  field.classList.remove("border-red-500")
}

function showFieldError(field, message) {
  const errorElement = document.getElementById(`${field.name}-error`)

  if (errorElement) {
    errorElement.textContent = message
    errorElement.classList.remove("hidden")
    errorElement.classList.add("animate-slide-down")
  }

  field.classList.add("border-red-500")
  field.classList.add("animate-shake")

  setTimeout(() => {
    field.classList.remove("animate-shake")
  }, 500)
}

function getFieldLabel(fieldName) {
  const labels = {
    fullname: "Full name",
    email: "Email address",
    password: "Password",
    "confirm-password": "Confirm password",
    terms: "Terms and conditions",
  }
  return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function showNotification(message, type) {
  const notification = document.createElement("div")
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-down ${type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
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
  }, 5000)
}

  // Export functions for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeRegisterPage,
    handleRegistration,
    validateField,
    calculatePasswordStrength,
    isValidEmail,
  }
}

