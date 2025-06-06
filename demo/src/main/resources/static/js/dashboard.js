// Dashboard functionality
let tasks = [
    { id: 1, title: 'Complete project proposal', completed: true, dueDate: 'Today' },
    { id: 2, title: 'Review team updates', completed: false, dueDate: 'Today' },
    { id: 3, title: 'Schedule client meeting', completed: false, dueDate: 'Tomorrow' },
    { id: 4, title: 'Update documentation', completed: false, dueDate: 'Jun 5' },
    { id: 5, title: 'Prepare presentation', completed: false, dueDate: 'Jun 10' }
];

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    checkAuthentication();

    // Load user data
    loadUserData();

    // Render tasks
    renderTasks();

    // Setup search functionality
    setupSearch();

    // Update remaining tasks count
    updateRemainingTasks();
});

function checkAuthentication() {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
        window.location.href = 'signin.html';
        return;
    }
}

function loadUserData() {
    const userSession = JSON.parse(localStorage.getItem('userSession'));
    if (userSession) {
        // Update user info in sidebar and mobile menu
        const userNames = document.querySelectorAll('.fw-medium');
        const userEmails = document.querySelectorAll('.text-muted');

        userNames.forEach(element => {
            if (element.textContent === 'John Doe') {
                element.textContent = userSession.name;
            }
        });

        userEmails.forEach(element => {
            if (element.textContent === 'john@example.com') {
                element.textContent = userSession.email;
            }
        });
    }
}

function renderTasks(tasksToRender = tasks) {
    const tasksList = document.getElementById('tasksList');

    if (tasksToRender.length === 0) {
        tasksList.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-tasks text-muted mb-3" style="font-size: 3rem;"></i>
                <p class="text-muted">No tasks found</p>
            </div>
        `;
        return;
    }

    tasksList.innerHTML = tasksToRender.map(task => `
        <div class="task-list-item d-flex align-items-center ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-checkbox ${task.completed ? 'completed' : ''} me-3" onclick="toggleTask(${task.id})">
                ${task.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <div class="flex-grow-1">
                <span class="task-text">${task.title}</span>
            </div>
            <span class="text-muted small me-3">${task.dueDate}</span>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function toggleTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        renderTasks();
        updateRemainingTasks();

        // Show success message
        const task = tasks[taskIndex];
        const message = task.completed ? 'Task completed!' : 'Task marked as incomplete';
        showToast(message, task.completed ? 'success' : 'info');
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        renderTasks();
        updateRemainingTasks();
        showToast('Task deleted successfully', 'success');
    }
}

function addTask() {
    const titleInput = document.getElementById('taskTitle');
    const dueDateInput = document.getElementById('taskDueDate');

    const title = titleInput.value.trim();
    const dueDate = dueDateInput.value;

    if (!title) {
        showToast('Please enter a task title', 'danger');
        return;
    }

    // Format due date
    let formattedDueDate = 'No due date';
    if (dueDate) {
        const date = new Date(dueDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            formattedDueDate = 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            formattedDueDate = 'Tomorrow';
        } else {
            formattedDueDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    // Create new task
    const newTask = {
        id: Math.max(...tasks.map(t => t.id)) + 1,
        title: title,
        completed: false,
        dueDate: formattedDueDate
    };

    tasks.unshift(newTask);
    renderTasks();
    updateRemainingTasks();

    // Clear form and close modal
    titleInput.value = '';
    dueDateInput.value = '';

    const modal = window.bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
    modal.hide();

    showToast('Task added successfully!', 'success');
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredTasks = tasks.filter(task =>
            task.title.toLowerCase().includes(searchTerm)
        );
        renderTasks(filteredTasks);
    });
}

function updateRemainingTasks() {
    const remainingCount = tasks.filter(task => !task.completed).length;
    const remainingElement = document.getElementById('remainingTasks');
    if (remainingElement) {
        remainingElement.textContent = remainingCount;
    }
}

function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('userSession');
        window.location.href = 'signin.html';
    }
}

// Toast notification function
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    toastContainer.appendChild(toast);

    const bsToast = new window.bootstrap.Toast(toast);
    bsToast.show();

    // Remove toast element after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N to add new task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        const addTaskModal = new window.bootstrap.Modal(document.getElementById('addTaskModal'));
        addTaskModal.show();
        setTimeout(() => {
            document.getElementById('taskTitle').focus();
        }, 300);
    }

    // Escape to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const bsModal = window.bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        });
    }
});

// Auto-save tasks to localStorage
function saveTasks() {
    localStorage.setItem('userTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('userTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

// Load tasks on page load
loadTasks();

// Save tasks whenever they change
const originalToggleTask = toggleTask;
const originalDeleteTask = deleteTask;
const originalAddTask = addTask;

toggleTask = function(taskId) {
    originalToggleTask(taskId);
    saveTasks();
};

deleteTask = function(taskId) {
    originalDeleteTask(taskId);
    saveTasks();
};

addTask = function() {
    originalAddTask();
    saveTasks();
};