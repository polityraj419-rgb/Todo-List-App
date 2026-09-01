// ===========================
// To-Do List App - JavaScript
// ===========================

class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.editingId = null;
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.render();
    }

    // ===========================
    // LOCAL STORAGE MANAGEMENT
    // ===========================

    loadFromStorage() {
        const stored = localStorage.getItem('todoTasks');
        if (stored) {
            try {
                this.tasks = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading tasks from storage:', e);
                this.tasks = [];
            }
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (e) {
            console.error('Error saving tasks to storage:', e);
            alert('Failed to save tasks. Your device storage may be full.');
        }
    }

    // ===========================
    // EVENT LISTENERS
    // ===========================

    setupEventListeners() {
        // Add task
        document.getElementById('addBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Sort dropdown
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });

        // Action buttons
        document.getElementById('clearCompletedBtn').addEventListener('click', () => this.clearCompleted());
        document.getElementById('deleteAllBtn').addEventListener('click', () => this.deleteAll());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));

        // Modal
        const modal = document.getElementById('editModal');
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Save edited task
        document.getElementById('saveEditBtn').addEventListener('click', () => this.saveEdit());
    }

    // ===========================
    // TASK MANAGEMENT
    // ===========================

    addTask() {
        const input = document.getElementById('taskInput');
        const priority = document.getElementById('prioritySelect').value;
        const dueDate = document.getElementById('dueDateInput').value;
        const text = input.value.trim();

        if (!text) {
            alert('Please enter a task!');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: priority,
            dueDate: dueDate,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveToStorage();
        this.render();

        // Clear inputs
        input.value = '';
        document.getElementById('prioritySelect').value = 'medium';
        document.getElementById('dueDateInput').value = '';

        input.focus();
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveToStorage();
            this.render();
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToStorage();
            this.render();
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        this.editingId = id;
        document.getElementById('editTaskInput').value = task.text;
        document.getElementById('editPrioritySelect').value = task.priority;
        document.getElementById('editDueDateInput').value = task.dueDate;

        this.openModal();
    }

    saveEdit() {
        if (this.editingId === null) return;

        const task = this.tasks.find(t => t.id === this.editingId);
        if (!task) return;

        const newText = document.getElementById('editTaskInput').value.trim();
        if (!newText) {
            alert('Task cannot be empty!');
            return;
        }

        task.text = newText;
        task.priority = document.getElementById('editPrioritySelect').value;
        task.dueDate = document.getElementById('editDueDateInput').value;

        this.saveToStorage();
        this.closeModal();
        this.render();
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear!');
            return;
        }

        if (confirm(`Clear ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveToStorage();
            this.render();
        }
    }

    deleteAll() {
        if (this.tasks.length === 0) {
            alert('No tasks to delete!');
            return;
        }

        if (confirm('Are you sure? This will delete ALL tasks permanently!')) {
            this.tasks = [];
            this.saveToStorage();
            this.render();
        }
    }

    // ===========================
    // FILTERING & SORTING
    // ===========================

    getFilteredTasks() {
        let filtered = this.tasks;

        switch (this.currentFilter) {
            case 'active':
                filtered = this.tasks.filter(t => !t.completed);
                break;
            case 'completed':
                filtered = this.tasks.filter(t => t.completed);
                break;
            case 'high':
                filtered = this.tasks.filter(t => t.priority === 'high');
                break;
            default:
                filtered = this.tasks;
        }

        return filtered;
    }

    getSortedTasks(tasks) {
        const sorted = [...tasks];

        switch (this.currentSort) {
            case 'oldest':
                sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
            case 'duedate':
                sorted.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
            case 'newest':
            default:
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return sorted;
    }

    // ===========================
    // RENDERING
    // ===========================

    render() {
        this.updateStats();
        this.renderTasks();
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const active = total - completed;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('activeTasks').textContent = active;
        document.getElementById('completionPercent').textContent = `${percent}%`;
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        let filtered = this.getFilteredTasks();
        let sorted = this.getSortedTasks(filtered);

        if (sorted.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p>No tasks to show. Add one to get started!</p>
                </div>
            `;
            return;
        }

        const template = document.getElementById('taskTemplate');
        tasksList.innerHTML = '';

        sorted.forEach(task => {
            const clone = template.content.cloneNode(true);
            const taskItem = clone.querySelector('.task-item');
            taskItem.dataset.id = task.id;
            taskItem.classList.add(`${task.priority}-priority`);

            if (task.completed) {
                taskItem.classList.add('completed');
                clone.querySelector('.task-check').checked = true;
            }

            // Task text
            clone.querySelector('.task-text').textContent = task.text;

            // Priority badge
            const badge = clone.querySelector('.priority-badge');
            badge.textContent = task.priority;
            badge.classList.add(task.priority);

            // Due date
            const dateSpan = clone.querySelector('.task-date');
            if (task.dueDate) {
                const date = new Date(task.dueDate);
                dateSpan.textContent = `📅 ${date.toLocaleDateString()}`;
            } else {
                dateSpan.style.display = 'none';
            }

            // Created date
            const createdSpan = clone.querySelector('.task-created');
            const createdDate = new Date(task.createdAt);
            createdSpan.textContent = `Created: ${createdDate.toLocaleDateString()}`;

            // Checkbox
            clone.querySelector('.task-check').addEventListener('change', () => {
                this.toggleTask(task.id);
            });

            // Edit button
            clone.querySelector('.btn-edit').addEventListener('click', () => {
                this.editTask(task.id);
            });

            // Delete button
            clone.querySelector('.btn-delete').addEventListener('click', () => {
                this.deleteTask(task.id);
            });

            tasksList.appendChild(clone);
        });
    }

    // ===========================
    // MODAL MANAGEMENT
    // ===========================

    openModal() {
        document.getElementById('editModal').classList.add('show');
        document.getElementById('editTaskInput').focus();
    }

    closeModal() {
        document.getElementById('editModal').classList.remove('show');
        this.editingId = null;
    }

    // ===========================
    // IMPORT/EXPORT
    // ===========================

    exportData() {
        if (this.tasks.length === 0) {
            alert('No tasks to export!');
            return;
        }

        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `todo-tasks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('Tasks exported successfully!');
    }

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedTasks = JSON.parse(event.target.result);
                
                if (!Array.isArray(importedTasks)) {
                    throw new Error('Invalid format: data must be an array');
                }

                // Validate task structure
                importedTasks.forEach(task => {
                    if (!task.id || !task.text) {
                        throw new Error('Invalid task format');
                    }
                });

                if (confirm(`Import ${importedTasks.length} task(s)? This will merge with existing tasks.`)) {
                    this.tasks = [...this.tasks, ...importedTasks];
                    this.saveToStorage();
                    this.render();
                    alert('Tasks imported successfully!');
                }
            } catch (error) {
                alert(`Error importing tasks: ${error.message}`);
            }
        };

        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    }
}

// ===========================
// INITIALIZATION
// ===========================

let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
    console.log('To-Do List App initialized successfully');
});

// Handle beforeunload to ensure data is saved
window.addEventListener('beforeunload', () => {
    if (app) {
        app.saveToStorage();
    }
});
