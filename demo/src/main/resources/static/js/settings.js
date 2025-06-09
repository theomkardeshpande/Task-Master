document.addEventListener("DOMContentLoaded", function() {
  initializeSettings();
});

function initializeSettings() {
  // Initialize theme toggle
  initializeThemeToggle();

  // Initialize color scheme selector
  initializeColorScheme();

  // Initialize reminder settings
  initializeReminderSettings();

  // Add settings form submission handler
  setupFormSubmission();

  // Add keyboard shortcuts
  setupKeyboardShortcuts();
}

// ============================================
// Theme Toggle
// ============================================
function initializeThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  // Set initial state from localStorage
  const savedTheme = localStorage.getItem('theme') || 'light';
  themeToggle.checked = savedTheme === 'dark';

  // Apply current theme to the page
  document.body.classList.toggle('dark-mode', savedTheme === 'dark');

  // Listen for theme toggle changes
  themeToggle.addEventListener('change', function() {
    const isDarkMode = this.checked;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // Show feedback
    showFeedback(isDarkMode ? 'Dark mode enabled' : 'Light mode enabled');
  });
}

// ============================================
// Color Scheme
// ============================================
function initializeColorScheme() {
  // Get saved color scheme
  const savedColor = localStorage.getItem('colorScheme') || 'blue';

  // Set active class on the correct color button
  const colorButtons = document.querySelectorAll('.color-scheme-btn');
  colorButtons.forEach(button => {
    const colorName = button.id.replace('color-', '');
    button.classList.toggle('active', colorName === savedColor);

    // Add click event listeners
    button.addEventListener('click', function() {
      setColorScheme(colorName);
    });
  });

  // Apply the color scheme to the page
  setColorScheme(savedColor, false);
}

function setColorScheme(scheme, showNotification = true) {
  // Remove active class from all color scheme buttons
  document.querySelectorAll('.color-scheme-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Add active class to the selected color-button
  const selectedButton = document.getElementById(`color-${scheme}`);
  if (selectedButton) {
    selectedButton.classList.add('active');
  }

  // Remove previous custom color scheme classes from body
  document.body.classList.remove('custom-blue', 'custom-red', 'custom-green', 'custom-purple', 'custom-orange');

  // Add the new color scheme class
  document.body.classList.add(`custom-${scheme}`);

  // Update the CSS variable for the primary color
  let primaryColor;
  switch (scheme) {
    case 'red':
      primaryColor = '#dc3545';
      break;
    case 'green':
      primaryColor = '#28a745';
      break;
    case 'purple':
      primaryColor = '#6f42c1';
      break;
    case 'orange':
      primaryColor = '#fd7e14';
      break;
    default: // blue
      primaryColor = '#007bff';
  }

  document.documentElement.style.setProperty('--primary-color', primaryColor);

  // Save to localStorage
  localStorage.setItem('colorScheme', scheme);

  // Show feedback if needed
  if (showNotification) {
    showFeedback(`Color scheme changed to ${scheme}`);
  }
}

// ============================================
// Reminder Settings
// ============================================
function initializeReminderSettings() {
  // Load saved reminder settings
  const savedSettings = localStorage.getItem('reminderSettings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);

    // Set checkbox states
    document.getElementById('reminderEmail').checked = settings.email || false;
    document.getElementById('reminderSMS').checked = settings.sms || false;
    document.getElementById('reminderPush').checked = settings.push || false;

    // Set time value
    if (settings.time) {
      document.getElementById('reminderTime').value = settings.time;
    }
  }

  // Request notification permission if push is enabled
  const pushCheckbox = document.getElementById('reminderPush');
  if (pushCheckbox && pushCheckbox.checked) {
    requestNotificationPermission();
  }

  // Add event listener for push checkbox
  pushCheckbox.addEventListener('change', function() {
    if (this.checked) {
      requestNotificationPermission();
    }
  });
}

function requestNotificationPermission() {
  if ('Notification' in window) {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showFeedback('Notification permission granted!');
        }
      });
    }
  }
}

// ============================================
// Form Submission
// ============================================
function setupFormSubmission() {
  const reminderForm = document.getElementById('reminderForm');
  if (reminderForm) {
    reminderForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Get form values
      const emailAlert = document.getElementById('reminderEmail').checked;
      const smsAlert = document.getElementById('reminderSMS').checked;
      const pushAlert = document.getElementById('reminderPush').checked;
      const reminderTime = document.getElementById('reminderTime').value;

      // Create settings object
      const reminderSettings = {
        email: emailAlert,
        sms: smsAlert,
        push: pushAlert,
        time: reminderTime
      };

      // Save to localStorage
      localStorage.setItem('reminderSettings', JSON.stringify(reminderSettings));

      // Show success message
      showFeedback("Reminder settings saved successfully!");

      // If push notifications are enabled, request permission
      if (pushAlert) {
        requestNotificationPermission();
      }
    });
  }
}

// ============================================
// Feedback & Notifications
// ============================================
function showFeedback(message, type = 'success') {
  // Check if there's an existing feedback element
  let feedbackEl = document.querySelector('.settings-feedback');

  // If not, create one
  if (!feedbackEl) {
    feedbackEl = document.createElement('div');
    feedbackEl.className = `settings-feedback alert alert-${type} fade-in`;

    // Insert at the top of the container
    const container = document.querySelector('.container');
    if (container) {
      container.insertBefore(feedbackEl, container.firstChild);
    } else {
      document.body.insertBefore(feedbackEl, document.body.firstChild);
    }
  }

  // Update message and class
  feedbackEl.textContent = message;
  feedbackEl.className = `settings-feedback alert alert-${type} fade-in`;

  // Auto-hide after 3 seconds
  setTimeout(() => {
    feedbackEl.classList.add('fade-out');
    setTimeout(() => {
      feedbackEl.remove();
    }, 300);
  }, 3000);
}

// ============================================
// Keyboard Shortcuts
// ============================================
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save settings
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      const reminderForm = document.getElementById('reminderForm');
      if (reminderForm) {
        const submitEvent = new Event('submit', { cancelable: true });
        reminderForm.dispatchEvent(submitEvent);
      }
    }

    // Ctrl/Cmd + D to toggle dark mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.checked = !themeToggle.checked;
        themeToggle.dispatchEvent(new Event('change'));
      }
    }
  });
}

// Make functions available globally
window.setColorScheme = setColorScheme;