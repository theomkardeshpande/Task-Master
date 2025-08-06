// Home Page JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeHomePage()
})

function initializeHomePage() {
  setupMobileMenu()
  setupDemoTasks()
  setupScrollAnimations()
  setupPerformanceMonitoring()
}

// Mobile Menu Functionality
function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobile-menu-btn")
  const mobileMenu = document.getElementById("mobile-menu")
  const menuIcon = mobileMenuBtn.querySelector("i")

  if (!mobileMenuBtn || !mobileMenu) return

  let isMenuOpen = false

  mobileMenuBtn.addEventListener("click", toggleMobileMenu)

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    if (isMenuOpen && !mobileMenuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
      closeMobileMenu()
    }
  })

  // Close menu on escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMenuOpen) {
      closeMobileMenu()
      mobileMenuBtn.focus()
    }
  })

  function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen

    if (isMenuOpen) {
      openMobileMenu()
    } else {
      closeMobileMenu()
    }
  }

  function openMobileMenu() {
    mobileMenu.classList.remove("hidden")
    setTimeout(() => {
      mobileMenu.classList.remove("opacity-0", "-translate-y-2")
      mobileMenu.classList.add("opacity-100", "translate-y-0")
    }, 10)

    menuIcon.classList.remove("fa-bars")
    menuIcon.classList.add("fa-times")
    menuIcon.style.transform = "rotate(180deg)"

    mobileMenuBtn.setAttribute("aria-expanded", "true")

    // Focus first menu item
    const firstMenuItem = mobileMenu.querySelector("a")
    if (firstMenuItem) {
      firstMenuItem.focus()
    }
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove("opacity-100", "translate-y-0")
    mobileMenu.classList.add("opacity-0", "-translate-y-2")

    setTimeout(() => {
      mobileMenu.classList.add("hidden")
    }, 300)

    menuIcon.classList.remove("fa-times")
    menuIcon.classList.add("fa-bars")
    menuIcon.style.transform = "rotate(0deg)"

    mobileMenuBtn.setAttribute("aria-expanded", "false")
    isMenuOpen = false
  }
}

// Demo Tasks Functionality
function setupDemoTasks() {
  const demoTasks = document.querySelectorAll(".task-item")

  demoTasks.forEach((task) => {
    task.addEventListener("click", toggleDemoTask)
    task.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        toggleDemoTask.call(this)
      }
    })
  })

  function toggleDemoTask() {
    const checkbox = this.querySelector(".task-checkbox")
    const text = this.querySelector(".task-text")
    const isCompleted = this.dataset.completed === "true"

    // Add click animation
    this.style.transform = "scale(0.98)"
    setTimeout(() => {
      this.style.transform = ""
    }, 150)

    if (isCompleted) {
      // Mark as incomplete
      this.dataset.completed = "false"
      checkbox.classList.remove("bg-blue-600", "border-blue-600")
      checkbox.classList.add("border-slate-300")
      checkbox.innerHTML = ""
      text.classList.remove("text-slate-500", "line-through")
      text.classList.add("text-slate-900")
      checkbox.setAttribute("aria-checked", "false")

      // Add bounce animation
      checkbox.classList.add("animate-bounce")
      setTimeout(() => {
        checkbox.classList.remove("animate-bounce")
      }, 600)
    } else {
      // Mark as complete
      this.dataset.completed = "true"
      checkbox.classList.remove("border-slate-300")
      checkbox.classList.add("bg-blue-600", "border-blue-600")
      checkbox.innerHTML = '<i class="fas fa-check text-white text-xs"></i>'
      text.classList.remove("text-slate-900")
      text.classList.add("text-slate-500", "line-through")
      checkbox.setAttribute("aria-checked", "true")

      // Add success animation
      checkbox.classList.add("animate-pulse")
      setTimeout(() => {
        checkbox.classList.remove("animate-pulse")
      }, 600)

      // Show completion feedback
      showTaskCompletionFeedback()
    }
  }

  function showTaskCompletionFeedback() {
    const feedback = document.createElement("div")
    feedback.className =
      "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-down"
    feedback.innerHTML = '<i class="fas fa-check mr-2"></i>Task completed!'

    document.body.appendChild(feedback)

    setTimeout(() => {
      feedback.style.opacity = "0"
      feedback.style.transform = "translateY(-20px)"
      setTimeout(() => {
        document.body.removeChild(feedback)
      }, 300)
    }, 2000)
  }
}

// Scroll Animations
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-fade-in")
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // Observe feature cards
  const featureCards = document.querySelectorAll('[class*="group p-8"]')
  featureCards.forEach((card) => {
    observer.observe(card)
  })
}

// Performance Monitoring
function setupPerformanceMonitoring() {
  // Monitor page load performance
  window.addEventListener("load", () => {
    if ("performance" in window) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      console.log(`Home page loaded in ${loadTime}ms`)

      // Track Core Web Vitals
      if ("web-vitals" in window) {
        // This would integrate with web-vitals library if available
        trackWebVitals()
      }
    }
  })

  // Monitor user interactions
  trackUserInteractions()
}

function trackWebVitals() {
  // Placeholder for web vitals tracking
  // In production, you would use the web-vitals library
  console.log("Web Vitals tracking initialized")
}

function trackUserInteractions() {
  // Track button clicks
  const buttons = document.querySelectorAll("button, a[href]")
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const action = this.textContent.trim() || this.getAttribute("aria-label") || "Unknown"
      console.log(`User interaction: ${action}`)
    })
  })
}

// Utility Functions
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function throttle(func, limit) {
  let inThrottle
  return function () {
    const args = arguments
    
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Export functions for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeHomePage,
    setupMobileMenu,
    setupDemoTasks,
    debounce,
    throttle,
  }
}
