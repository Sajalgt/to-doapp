// State Engine Engine Initialization
let todos = JSON.parse(localStorage.getItem('workspace_todos')) || [];

const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const priorityInput = document.getElementById('priority-input');
const categoryInput = document.getElementById('category-input');
const dateInput = document.getElementById('date-input');

const todoList = document.getElementById('todo-list');
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');

const totalStats = document.getElementById('total-stats');
const pendingStats = document.getElementById('pending-stats');
const completedStats = document.getElementById('completed-stats');
const circleBar = document.getElementById('progress-bar-circle');
const chartPctText = document.getElementById('chart-pct-text');

const radius = 72;
const circumference = 2 * Math.PI * radius; // 452.389

todoForm.addEventListener('submit', addTask);
filterSelect.addEventListener('change', renderTodos);
searchInput.addEventListener('input', renderTodos);

function addTask(e) {
    e.preventDefault();
    const newTask = {
        id: Date.now(),
        text: taskInput.value,
        priority: priorityInput.value,
        category: categoryInput.value,
        dueDate: dateInput.value || 'No Deadline',
        completed: false
    };
    todos.push(newTask);
    saveAndRender();
    todoForm.reset();
}

function deleteTask(id) {
    todos = todos.filter(t => t.id !== id);
    saveAndRender();
}

function toggleComplete(id) {
    todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('workspace_todos', JSON.stringify(todos));
    renderTodos();
}

function updateAnalyticsDashboard() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;

    totalStats.textContent = total;
    pendingStats.textContent = pending;
    completedStats.textContent = completed;

    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
    chartPctText.textContent = `${completionRate}%`;

    const offset = circumference - (completionRate / 100) * circumference;
    circleBar.style.strokeDashoffset = offset;
}

function renderTodos() {
    todoList.innerHTML = '';
    const filter = filterSelect.value;
    const search = searchInput.value.toLowerCase();

    todos.forEach(todo => {
        const matchesFilter = filter === 'all' || (filter === 'completed' && todo.completed) || (filter === 'pending' && !todo.completed);
        const matchesSearch = todo.text.toLowerCase().includes(search);

        if (matchesFilter && matchesSearch) {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.priority} ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <div class="item-left">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleComplete(${todo.id})">
                    <div>
                        <span class="task-text">${todo.text}</span>
                        <div class="task-meta">
                            <span class="priority-lbl">${todo.priority}</span> | 
                            <span>🏷️ ${todo.category}</span> | 
                            <span>📅 ${todo.dueDate}</span>
                        </div>
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteTask(${todo.id})">🗑️</button>
            `;
            todoList.appendChild(li);
        }
    });

    updateAnalyticsDashboard();
}

/* BACKUP & RESTORE DATA MANAGEMENT UTILITIES */

// Export Data Logic
document.getElementById('export-btn').addEventListener('click', () => {
    if (todos.length === 0) {
        alert("Export karne ke liye koi task nahi hai!");
        return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(todos));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `workspace_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
});

// Import Data Logic
document.getElementById('import-file').addEventListener('change', (e) => {
    const fileReader = new FileReader();
    fileReader.onload = function() {
        try {
            const importedTodos = JSON.parse(fileReader.result);
            if (Array.isArray(importedTodos)) {
                if(confirm("Kya aap backup import karna chahte hain? Purana local data overwrite ho jayega.")) {
                    todos = importedTodos;
                    saveAndRender();
                    alert("Data successfully restore ho gaya!");
                }
            } else {
                alert("Galat file format! Kripya valid JSON backup file select karein.");
            }
        } catch (err) {
            alert("File read karne me error aayi!");
        }
    };
    if(e.target.files[0]) {
        fileReader.readAsText(e.target.files[0]);
    }
});

// Initial View Compilation Trigger
renderTodos();