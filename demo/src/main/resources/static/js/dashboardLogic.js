let tasks = [];

// When the DOM is loaded, perform initializations
document.addEventListener('DOMContentLoaded', function() {
    fetchUserData();
    loadTasks(); // Fetch tasks from the server
    setupSearch();
});

// ============================================
// Authentication & User Data Functions
// ============================================
async function fetchUserData() {
    try {
        const response = await fetch('/user/profile');
        if (response.ok) {
            const userSession = await response.json();
            localStorage.setItem('userSession', JSON.stringify(userSession)); // Store in localStorage
            updateUserUI(userSession);
        } else {
            console.error('Failed to fetch user profile');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}


function updateUserUI(userSession) {
    if (userSession) {
        document.querySelectorAll('.fullname').forEach(el => {
            if (el.textContent === 'John Doe' || el.textContent.trim() === '') {
                el.textContent = userSession.fullname;
            }
        });

        document.querySelectorAll('.email').forEach(el => {
            if (el.textContent === 'john@example.com' || el.textContent.trim() === '') {
                el.textContent = userSession.email;
            }
        });
    }
}

function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('userSession');
        fetch("/logout", {
                method: "POST",
                credentials: "same-origin"
            }).then(response => {
                if (response.ok) {
                    window.location.href = "/login?logout"; // Redirect after logout
                } else {
                    console.error("Logout failed!");
                }
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
        } else {
            console.error('Failed to fetch tasks');
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}
async function addTask() {
    const titleInput = document.getElementById('taskTitle');
    const descriptionInput = document.getElementById('taskDescription');
    const completionDateInput = document.getElementById('completionDate');

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const date = completionDateInput.value.trim();
    const formatedDate=new Date(date).toISOString();

    console.log("title:",title);
    console.log("description:",description);
    console.log("date:",formatedDate);

    if (!title || !description || !date) {
        showToast('Please fill in all fields', 'danger');
        return;
    }

    try {
        const data={
            taskTitle: title,
            taskDescription: description,
            completionDate: formatedDate
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
        renderTasks(tasks);
        updateRemainingTasks();

        // Clear form fields
        titleInput.value = '';
        descriptionInput.value = '';
        completionDateInput.value = '';

        // Hide modal (Bootstrap-based)
        const modalElement = document.getElementById('addTaskModal');
        const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        }

        showToast('Task added successfully!', 'success');
    } catch (error) {
        console.error('Error adding task:', error);
        showToast(`Error occurred: ${error.message}`, 'danger');
    }
}

async function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                tasks = tasks.filter(task => task.task_id !== taskId);
                renderTasks(tasks);
                updateRemainingTasks();
                showToast('Task deleted successfully', 'success');
            } else {
                showToast('Failed to delete task', 'danger');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            showToast('Error occurred while deleting task', 'danger');
        }
    }
}
// ============================================
// ToggleTask
// ============================================

function toggleTask(taskId) {
  // Find the index of the task in the global tasks array
  const taskIndex = tasks.findIndex(task => task.task_id === taskId);
  if (taskIndex === -1) {
    return;
  }

  // Call the backend endpoint to toggle the task.
  // We assume the backend toggles the `completed` status internally.
  fetch(`/api/tasks/toggle/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    // No payload is needed if the server is toggling the state itself.
    body: JSON.stringify({})
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Failed to update task");
    }
    return response.json();
  })
  .then(updatedTask => {
    // Update the local tasks array with the updated task returned from the server.
    tasks[taskIndex] = updatedTask;
    // Re-render the tasks list and update remaining tasks count.
    renderTasks();
    updateRemainingTasks();
    const message = updatedTask.completed ? 'Task completed!' : 'Task marked as incomplete';
    showToast(message, updatedTask.completed ? 'success' : 'warning');
  })
  .catch(err => {
    showToast("Could not update task", "error");
    console.error(err);
  });
}
// ============================================
// UI Rendering & Utility Functions
// ============================================
// Renders the tasks list in the UI.
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
        <div class="task-list-item d-flex align-items-center ${task.completed ? 'completed' : ''}" data-task-id="${task.task_id}">
            <div class="task-checkbox ${task.completed ? 'completed' : ''} me-3" onclick="toggleTask(${task.task_id})">
                ${task.completed ? '<i class="fas fa-check text-primary"></i>' : ''}
            </div>
            <div class="flex-grow-1">
                <span class="task-text">${task.title}</span>
            </div>
            <span class="text-muted small me-3">${task.dueDate ? task.dueDate : ''}</span>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.task_id})" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Sets up the live search functionality.
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    // Filter tasks by searching in the title (case-insensitive)
    const filteredTasks = tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm)
    );
    renderTasks(filteredTasks);
  });
}

// Updates the UI element that shows the count of remaining (incomplete) tasks.
function updateRemainingTasks() {
  const remainingCount = tasks.filter(task => !task.completed).length;
  const remainingElement = document.getElementById('remainingTasks');
  if (remainingElement) {
    remainingElement.textContent = remainingCount;
  }
}

// ============================================
// Toast Notifications
// ============================================
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

// ============================================
// Keyboard Shortcuts
// ============================================
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
});