// Login Page JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeLoginPage()
})

function initializeLoginPage() {
  setupEventListeners()
  setupFormValidation()
  setupPasswordToggle()
}

function setupEventListeners() {
  // Form submission
  document.getElementById("login-form").addEventListener("submit", handleLogin)

  // Real-time validation
  const inputs = document.querySelectorAll("input[required]")
  inputs.forEach((input) => {
    input.addEventListener("blur", validateField)
    input.addEventListener("input", clearError)
  })
}

function setupFormValidation() {
  const form = document.getElementById("login-form")
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

// function setupDemoCredentials() {
//   const fillDemoBtn = document.getElementById("fill-demo-btn")
//   const emailInput = document.getElementById("email")
//   const passwordInput = document.getElementById("password")

//   // fillDemoBtn.addEventListener("click", () => {
//   //   emailInput.value = "demo@taskmaster.com"
//   //   passwordInput.value = "demo123"

//   //   // Clear any existing errors
//   //   clearError({ target: emailInput })
//   //   clearError({ target: passwordInput })

//   //   // Add visual feedback
//   //   ;[emailInput, passwordInput].forEach((input) => {
//   //     input.classList.add("animate-pulse")
//   //     setTimeout(() => {
//   //       input.classList.remove("animate-pulse")
//   //     }, 600)
//   //   })

//   //   // Focus on submit button
//   //   document.getElementById("submit-btn").focus()
//   // })
// }

async function handleLogin(event) {
  event.preventDefault()

  const form = event.target
  const formData = new FormData(form)
  const email = formData.get("email")
  const password = formData.get("password")
  const rememberMe = formData.get("remember-me")

  // Validate form
  const emailField = form.querySelector("#email")
  const passwordField = form.querySelector("#password")

  let isValid = true

  if (!validateField({ target: emailField })) isValid = false
  if (!validateField({ target: passwordField })) isValid = false

  if (!isValid) return

  // Show loading state
  const submitBtn = document.getElementById("submit-btn")
  const btnText = submitBtn.querySelector(".btn-text")
  const spinner = submitBtn.querySelector(".spinner")

  // submitBtn.disabled = true
  // btnText.textContent = "Signing In..."
  // spinner.classList.remove("hidden")

  try {
    // Disable button & show spinner (you probably have done this before calling this code)
    submitBtn.disabled = true;
    btnText.textContent = "Signing In...";
    spinner.classList.remove("hidden");

    // Prepare login payload
    const payload = {
        email: email,
        password: password,
        rememberMe: !!rememberMe
    };

    // Make POST request to Spring Boot login endpoint (adjust URL accordingly)
    const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        // If response status is not 2xx, throw error
        throw new Error("Invalid credentials or server error");
    }

    // Parse JSON response from backend
    const userData = await response.json();

    // Store user session data based on "rememberMe" flag
    if (userData.rememberMe) {
        localStorage.setItem("taskmaster_user", JSON.stringify(userData));
    } else {
        sessionStorage.setItem("taskmaster_user", JSON.stringify(userData));
    }

    // Show success message
    showNotification("Login successful! Redirecting...", "success");

    // Redirect after a short delay to dashboard (adjust path as needed)
    setTimeout(() => {
        window.location.href = "/dashboard";
    }, 1500);

  }
  catch (error) {
    // Show error notification
    showNotification("Invalid email or password. Please try again.", "error");

    // Reset button state
    submitBtn.disabled = false;
    btnText.textContent = "Sign In";
    spinner.classList.add("hidden");

    // Shake form animation for feedback
    form.classList.add("animate-shake");
    setTimeout(() => {
        form.classList.remove("animate-shake");
    }, 500);

    // Focus email field for retry
    emailField.focus();
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

  if (fieldName === "email" && !isValidEmail(value)) {
    showFieldError(field, "Please enter a valid email address")
    return false
  }

  if (fieldName === "password" && value.length < 6) {
    showFieldError(field, "Password must be at least 6 characters long")
    return false
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
    email: "Email address",
    password: "Password",
  }
  return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
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
  }, 4000)
}

// Export functions for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeLoginPage,
    handleLogin,
    validateField,
    isValidEmail,
  }
}
