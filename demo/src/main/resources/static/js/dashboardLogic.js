// ============================================
// Global Variables & State Management
// ============================================
let tasks = [];
let currentFilter = 'all'; // all, active, completed
let isLoading = false;

// ============================================
// DOM Content Loaded - Initialize Everything
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    showLoadingState();

    try {
        // Initialize core functionality
        await fetchUserData();
        await loadTasks();

        // Setup UI components
        setupSearch();
        setupFilters();
        setupKeyboardShortcuts();

        // Apply saved settings (but don't show the floating panel)
        applyThemeSettings();
        loadReminderSettings();

        hideLoadingState();
    } catch (error) {
        console.error('Error initializing app:', error);
        showToast('Failed to initialize application', 'danger');
        hideLoadingState();
    }
}

// ============================================
// Loading States
// ============================================
function showLoadingState() {
    isLoading = true;
    const tasksList = document.getElementById('tasksList');
    if (tasksList) {
        tasksList.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted mt-3">Loading tasks...</p>
            </div>
        `;
    }
}

function hideLoadingState() {
    isLoading = false;
}

// ============================================
// Authentication & User Data Functions
// ============================================
async function fetchUserData() {
    try {
        const response = await fetch('/user/profile');
        if (response.ok) {
            const userSession = await response.json();
            localStorage.setItem('userSession', JSON.stringify(userSession));
            updateUserUI(userSession);
            return userSession;
        } else {
            throw new Error('Failed to fetch user profile');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

function updateUserUI(userSession) {
    if (userSession) {
        // Update fullname elements
        document.querySelectorAll('.fullname').forEach(el => {
            if (el.textContent === 'John Doe' || el.textContent.trim() === '') {
                el.textContent = userSession.fullname;
                el.classList.add('fade-in');
            }
        });

        // Update email elements
        document.querySelectorAll('.email').forEach(el => {
            if (el.textContent === 'john@example.com' || el.textContent.trim() === '') {
                el.textContent = userSession.email;
                el.classList.add('fade-in');
            }
        });

        // Update profile images if they exist
        document.querySelectorAll('img[alt="User"]').forEach(img => {
            if (userSession.profileImage) {
                img.src = userSession.profileImage;
            }
        });
    }
}

function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        showLoadingOverlay('Signing out...');

        localStorage.removeItem('userSession');

        fetch("/logout", {
            method: "POST",
            credentials: "same-origin"
        }).then(response => {
            hideLoadingOverlay();
            if (response.ok) {
                window.location.href = "/login?logout";
            } else {
                console.error("Logout failed!");
                showToast('Logout failed. Please try again.', 'danger');
            }
        }).catch(error => {
            hideLoadingOverlay();
            console.error('Logout error:', error);
            showToast('Network error during logout', 'danger');
        });
    }
}

// ============================================
// Tasks API Functions
// ============================================
async function loadTasks() {
    try {
        const response = await fetch('/api/showAllTasks');
        if (response.ok) {
            tasks = await response.json();
            renderTasks(tasks);
            updateRemainingTasks();
            updateTaskStats();
        } else {
            throw new Error('Failed to fetch tasks');
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showToast('Failed to load tasks', 'danger');
        throw error;
    }
}

async function addTask() {
    const titleInput = document.getElementById('taskTitle');
    const descriptionInput = document.getElementById('taskDescription');
    const completionDateInput = document.getElementById('completionDate');

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const date = completionDateInput.value.trim();

    if (!title || !description || !date) {
        showToast('Please fill in all fields', 'warning');
        highlightEmptyFields([titleInput, descriptionInput, completionDateInput]);
        return;
    }

    const formattedDate = new Date(date).toISOString();

    try {
        showButtonLoading('Add Task', true);

        const data = {
            taskTitle: title,
            taskDescription: description,
            completionDate: formattedDate
        };

        const response = await fetch('/api/addTask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }

        const newTask = await response.json();
        tasks.unshift(newTask);
        renderTasks(getFilteredTasks());
        updateRemainingTasks();
        updateTaskStats();

        // Clear form and close modal
        clearTaskForm();
        closeModal('addTaskModal');

        showToast('Task added successfully!', 'success');

        // Check for reminder settings
        scheduleTaskReminder(newTask);

    } catch (error) {
        console.error('Error adding task:', error);
        showToast(`Error occurred: ${error.message}`, 'danger');
    } finally {
        showButtonLoading('Add Task', false);
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Add fade-out animation before removing
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                taskElement.style.transition = 'opacity 0.3s ease';
                taskElement.style.opacity = '0';

                setTimeout(() => {
                    tasks = tasks.filter(task => task.task_id !== taskId);
                    renderTasks(getFilteredTasks());
                    updateRemainingTasks();
                    updateTaskStats();
                }, 300);
            }

            showToast('Task deleted successfully', 'success');
        } else {
            throw new Error('Failed to delete task');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Error occurred while deleting task', 'danger');
    }
}

async function toggleTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.task_id === taskId);
    if (taskIndex === -1) return;

    try {
        const response = await fetch(`/api/tasks/toggle/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            throw new Error("Failed to update task");
        }

        const updatedTask = await response.json();
        tasks[taskIndex].completed = updatedTask.completed; // Ensure state is updated

        // Update the UI immediately
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            const checkbox = taskElement.querySelector(".task-checkbox");
            const checkboxInner = checkbox.querySelector(".checkbox-inner");

            // Toggle the completed class
            checkbox.classList.toggle("completed", updatedTask.completed);
            taskElement.classList.toggle("completed", updatedTask.completed);

            // Update the tick mark inside the checkbox
            checkboxInner.innerHTML = updatedTask.completed ? '<i class="fas fa-check text-white"></i>' : '';

            // Update task list and stats
            updateRemainingTasks();
            updateTaskStats();
        }

        // ✅ Fix: Ensure correct toast message
        const message = updatedTask.completed
            ? '✅ Task marked as completed! 🎉'
            : 'Task marked as incomplete.';
        showToast(message, updatedTask.completed ? 'success' : 'warning');

    } catch (error) {
        console.error('Error toggling task:', error);
        showToast("Could not update task", "danger");
    }
}
// ============================================
// UI Rendering & Utility Functions
// ============================================
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return `<span class="text-danger">Overdue</span>`;
    } else if (diffDays === 0) {
        return `<span class="text-warning">Due Today</span>`;
    } else if (diffDays === 1) {
        return `<span class="text-info">Due Tomorrow</span>`;
    } else {
        return date.toLocaleDateString();
    }
}

function renderTasks(tasksToRender = tasks) {
    const tasksList = document.getElementById('tasksList');

    if (!tasksList) return;

    if (tasksToRender.length === 0) {
        tasksList.innerHTML = getEmptyStateHTML();
        return;
    }

    tasksList.innerHTML = tasksToRender
        .map(task => createTaskHTML(task))
        .join('');

    // Add stagger animation to task items
    const taskItems = tasksList.querySelectorAll('.task-list-item');
    taskItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('fade-in');
    });
}

function createTaskHTML(task) {
    const priorityClass = getPriorityClass(task.completionDate);
    const completedClass = task.completed ? 'completed' : '';

    return `
        <div class="task-list-item ${completedClass} ${priorityClass}" data-task-id="${task.task_id}">
            <div class="d-flex align-items-center" style="cursor: pointer;">
                <div class="task-checkbox ${task.completed ? 'completed' : ''} me-3" onclick="toggleTask(${task.task_id}); event.stopPropagation();">
                    <div class="checkbox-inner">
                        ${task.completed ? '<i class="fas fa-check text-white"></i>' : ''}
                    </div>
                </div>
                <div class="flex-grow-1" onclick="toggleTaskDescription(${task.task_id})">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <small class="text-muted">
                            <i class="fas fa-calendar-alt me-1"></i>
                            ${formatDate(task.completionDate)}
                        </small>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn btn-sm btn-outline-primary me-2"
                            onclick="editTask(${task.task_id}); event.stopPropagation();"
                            title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger"
                            onclick="deleteTask(${task.task_id}); event.stopPropagation();"
                            title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="task-description" id="desc-${task.task_id}" style="display: none;">
                <div class="description-content">
                    <i class="fas fa-align-left me-2"></i>
                    ${task.description}
                </div>
            </div>
        </div>
    `;
}

function getEmptyStateHTML() {
    const emptyMessages = {
        all: { icon: 'fas fa-tasks', message: 'No tasks found. Create your first task!' },
        active: { icon: 'fas fa-clock', message: 'No active tasks. Great job!' },
        completed: { icon: 'fas fa-check-circle', message: 'No completed tasks yet.' }
    };

    const state = emptyMessages[currentFilter] || emptyMessages.all;

    return `
        <div class="text-center py-5 empty-state">
            <i class="${state.icon} text-muted mb-3" style="font-size: 3rem;"></i>
            <p class="text-muted">${state.message}</p>
            ${currentFilter === 'all' ? '<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addTaskModal">Add Your First Task</button>' : ''}
        </div>
    `;
}

function getPriorityClass(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'priority-overdue';
    if (diffDays === 0) return 'priority-today';
    if (diffDays <= 3) return 'priority-soon';
    return '';
}

function toggleTaskDescription(taskId) {
    const descElement = document.getElementById(`desc-${taskId}`);
    if (descElement) {
        const isVisible = descElement.style.display !== 'none';
        descElement.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) {
            descElement.classList.add('slide-down');
        }
    }
}

// ============================================
// Filter & Search Functions
// ============================================
function setupFilters() {
    // Add filter buttons if they don't exist
    const filterContainer = document.querySelector('.filter-buttons');
    if (!filterContainer) {
        addFilterButtons();
    }

    // Setup filter event listeners
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setFilter(this.dataset.filter);
        });
    });
}

function addFilterButtons() {
    const searchRow = document.querySelector('.row.mb-4');
    if (searchRow) {
        const filterHTML = `
            <div class="col-12 mt-3">
                <div class="filter-buttons d-flex gap-2">
                    <button class="btn btn-outline-secondary filter-btn active" data-filter="all">
                        All Tasks
                    </button>
                    <button class="btn btn-outline-secondary filter-btn" data-filter="active">
                        Active
                    </button>
                    <button class="btn btn-outline-secondary filter-btn" data-filter="completed">
                        Completed
                    </button>
                </div>
            </div>
        `;
        searchRow.insertAdjacentHTML('beforeend', filterHTML);
    }
}

function setFilter(filter) {
    currentFilter = filter;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    // Render filtered tasks
    renderTasks(getFilteredTasks());
}

function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = this.value.toLowerCase();
            let filteredTasks = getFilteredTasks();

            if (searchTerm) {
                filteredTasks = filteredTasks.filter(task =>
                    task.title.toLowerCase().includes(searchTerm) ||
                    task.description.toLowerCase().includes(searchTerm)
                );
            }

            renderTasks(filteredTasks);
        }, 300);
    });
}

function updateRemainingTasks() {
    const remainingCount = tasks.filter(task => !task.completed).length;
    const remainingElement = document.getElementById('remainingTasks');
    if (remainingElement) {
        remainingElement.textContent = remainingCount;
        remainingElement.classList.add('counter-update');
        setTimeout(() => {
            remainingElement.classList.remove('counter-update');
        }, 300);
    }
}

function updateTaskStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const activeTasks = totalTasks - completedTasks;

    // Update stats if elements exist
    const statsElements = {
        total: document.getElementById('totalTasks'),
        completed: document.getElementById('completedTasks'),
        active: document.getElementById('activeTasks')
    };

    if (statsElements.total) statsElements.total.textContent = totalTasks;
    if (statsElements.completed) statsElements.completed.textContent = completedTasks;
    if (statsElements.active) statsElements.active.textContent = activeTasks;
}

// ============================================
// Theme Management (Settings Page Only)
// ============================================
function applyThemeSettings() {
    // Apply saved theme settings (Dark Mode)
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    // Apply Saved Color Scheme
    const savedColor = localStorage.getItem('colorScheme') || 'blue';
    setColorScheme(savedColor);
}

function setColorScheme(scheme) {
    // Remove all color scheme classes
    document.body.classList.remove('custom-red', 'custom-green', 'custom-blue', 'custom-purple', 'custom-orange');
    document.body.classList.add(`custom-${scheme}`);

    // Update CSS custom properties
    const colorMap = {
        blue: '#007bff',
        red: '#dc3545',
        green: '#28a745',
        purple: '#6f42c1',
        orange: '#fd7e14'
    };

    if (colorMap[scheme]) {
        document.documentElement.style.setProperty('--primary-color', colorMap[scheme]);
    }
}

// ============================================
// Reminder Settings
// ============================================
function loadReminderSettings() {
    const reminderSettings = localStorage.getItem('reminderSettings');
    if (reminderSettings) {
        const settings = JSON.parse(reminderSettings);
        // Apply reminder settings to the app
        console.log('Reminder settings loaded:', settings);
    }
}

function scheduleTaskReminder(task) {
    const reminderSettings = localStorage.getItem('reminderSettings');
    if (!reminderSettings) return;

    const settings = JSON.parse(reminderSettings);
    if (settings.push) {
        // Schedule browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            const taskDate = new Date(task.completionDate);
            const now = new Date();
            const timeDiff = taskDate - now;

            if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) { // Within 24 hours
                setTimeout(() => {
                    new Notification('Task Reminder', {
                        body: `Don't forget: ${task.title}`,
                        icon: '/favicon.ico'
                    });
                }, Math.max(0, timeDiff - 60 * 60 * 1000)); // 1 hour before
            }
        }
    }
}

// ============================================
// Utility Functions
// ============================================
function clearTaskForm() {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('completionDate').value = '';
}

function closeModal(modalId) {
    const modalElement = document.getElementById(modalId);
    const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
        modalInstance.hide();
    }
}

function highlightEmptyFields(fields) {
    fields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            setTimeout(() => {
                field.classList.remove('is-invalid');
            }, 3000);
        }
    });
}

function showButtonLoading(buttonText, isLoading) {
    const addButton = document.querySelector('#addTaskModal .btn-primary');
    if (addButton) {
        if (isLoading) {
            addButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';
            addButton.disabled = true;
        } else {
            addButton.innerHTML = buttonText;
            addButton.disabled = false;
        }
    }
}

function showLoadingOverlay(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="spinner-border text-primary mb-3"></div>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// ============================================
// Toast Notifications (Enhanced)
// ============================================
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();

    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas ${getToastIcon(type)} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    toastContainer.appendChild(toast);
    const bsToast = new window.bootstrap.Toast(toast, { delay: 4000 });
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

function getToastIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        danger: 'fa-exclamation-triangle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// ============================================
// Keyboard Shortcuts (Enhanced)
// ============================================
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + N to open Add Task Modal
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const addTaskModal = new window.bootstrap.Modal(document.getElementById('addTaskModal'));
            addTaskModal.show();
            setTimeout(() => {
                document.getElementById('taskTitle').focus();
            }, 300);
        }

        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }

        // Escape key to close open modals
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                const bsModal = window.bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                }
            });
        }

        // Number keys for filters
        if (e.key >= '1' && e.key <= '3' && !e.ctrlKey && !e.metaKey) {
            const filters = ['all', 'active', 'completed'];
            const filterIndex = parseInt(e.key) - 1;
            if (filters[filterIndex]) {
                setFilter(filters[filterIndex]);
            }
        }
    });
}

// ============================================
// Export functions for global access
// ============================================
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.addTask = addTask;
window.signOut = signOut;
window.toggleTaskDescription = toggleTaskDescription;