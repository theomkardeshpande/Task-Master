// Loading Page JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeLoadingPage()
})

function initializeLoadingPage() {
  simulateLoading()
}

function simulateLoading() {
  const loadingTexts = [
    "Preparing your workspace...",
    "Loading your tasks...",
    "Setting up your dashboard...",
    "Organizing your data...",
    "Almost ready...",
    "Welcome to TaskMaster!",
  ]

  const progressBar = document.getElementById("progress-bar")
  const progressText = document.getElementById("progress-text")
  const loadingTextElement = document.getElementById("loading-text")

  let currentStep = 0
  const totalSteps = loadingTexts.length
  const stepDuration = 800 // milliseconds per step

  function updateProgress() {
    const progress = Math.round((currentStep / (totalSteps - 1)) * 100)

    // Update progress bar
    progressBar.style.width = `${progress}%`
    progressText.textContent = `${progress}%`

    // Update loading text with animation
    loadingTextElement.style.opacity = "0"
    setTimeout(() => {
      loadingTextElement.textContent = loadingTexts[currentStep]
      loadingTextElement.style.opacity = "1"
    }, 200)

    currentStep++

    if (currentStep < totalSteps) {
      setTimeout(updateProgress, stepDuration)
    } else {
      // Loading complete, redirect to dashboard
      setTimeout(() => {
        // Check if user is authenticated
        const userData = localStorage.getItem("taskmaster_user") || sessionStorage.getItem("taskmaster_user")

        if (userData) {
          window.location.href = "dashboard.html"
        } else {
          window.location.href = "login.html"
        }
      }, 1000)
    }
  }

  // Start the loading simulation
  setTimeout(updateProgress, 500)
}

// Add some visual effects
function addVisualEffects() {
  // Create floating particles
  const particleCount = 20

  for (let i = 0; i < particleCount; i++) {
    setTimeout(() => {
      createParticle()
    }, i * 100)
  }
}

function createParticle() {
  const particle = document.createElement("div")
  particle.className = "fixed w-2 h-2 bg-blue-400 rounded-full opacity-30 pointer-events-none"
  particle.style.left = Math.random() * window.innerWidth + "px"
  particle.style.top = window.innerHeight + "px"
  particle.style.animation = "float-up 4s linear forwards"

  document.body.appendChild(particle)

  // Remove particle after animation
  setTimeout(() => {
    if (document.body.contains(particle)) {
      document.body.removeChild(particle)
    }
  }, 4000)
}

// Add CSS for floating particles
const style = document.createElement("style")
style.textContent = `
    @keyframes float-up {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.3;
        }
        50% {
            opacity: 0.6;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`
document.head.appendChild(style)

// Start visual effects after a short delay
setTimeout(addVisualEffects, 1000)
