/**
 * TaskFlow Pro Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // App State
  const state = {
    todos: [],
    statusFilter: 'all',
    priorityFilter: 'all',
    categoryFilter: 'all',
    searchQuery: '',
    sortBy: 'newest',
    theme: localStorage.getItem('taskflow_theme') || 'dark'
  };

  // DOM Elements
  const todoListEl = document.getElementById('todo-list');
  const emptyStateEl = document.getElementById('empty-state');
  const emptyMessageEl = document.getElementById('empty-message');
  const loadingSpinnerEl = document.getElementById('loading-spinner');
  const currentDateEl = document.getElementById('current-date');

  // Stats Elements
  const statTotalEl = document.getElementById('stat-total');
  const statActiveEl = document.getElementById('stat-active');
  const statCompletedEl = document.getElementById('stat-completed');
  const statRateEl = document.getElementById('stat-rate');
  const progressFillEl = document.getElementById('progress-fill');

  // Filters & Controls
  const searchInputEl = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  const filterCategoryEl = document.getElementById('filter-category');
  const filterPriorityEl = document.getElementById('filter-priority');
  const sortByEl = document.getElementById('sort-by');
  const tabBtns = document.querySelectorAll('.tab-btn');

  // Modal Elements
  const modalBackdrop = document.getElementById('task-modal');
  const modalTitleEl = document.getElementById('modal-title');
  const btnOpenModal = document.getElementById('btn-open-modal');
  const btnCloseModal = document.getElementById('modal-close');
  const btnCancelModal = document.getElementById('btn-cancel');
  const btnEmptyAdd = document.getElementById('empty-btn-add');
  const taskForm = document.getElementById('task-form');

  // Form Inputs
  const inputTaskId = document.getElementById('task-id');
  const inputTitle = document.getElementById('input-title');
  const inputDescription = document.getElementById('input-description');
  const inputCategory = document.getElementById('input-category');
  const inputPriority = document.getElementById('input-priority');
  const inputDueDate = document.getElementById('input-due-date');

  // Theme Elements
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  // Initialization
  init();

  function init() {
    setupDateHeader();
    applyTheme(state.theme);
    setupEventListeners();
    loadDashboardData();
  }

  // Set formatted current date in header
  function setupDateHeader() {
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
  }

  // Theme switcher
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    state.theme = theme;
    localStorage.setItem('taskflow_theme', theme);

    if (theme === 'light') {
      themeIcon.className = 'fa-solid fa-moon';
    } else {
      themeIcon.className = 'fa-solid fa-sun';
    }
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Theme toggle
    themeToggleBtn.addEventListener('click', () => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });

    // Status Tab buttons
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => b.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        state.statusFilter = target.dataset.status;
        loadDashboardData();
      });
    });

    // Search input with debounce
    let searchTimeout;
    searchInputEl.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      state.searchQuery = val;
      clearSearchBtn.classList.toggle('hidden', val.length === 0);

      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        loadDashboardData();
      }, 300);
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInputEl.value = '';
      state.searchQuery = '';
      clearSearchBtn.classList.add('hidden');
      loadDashboardData();
    });

    // Select Filters
    filterCategoryEl.addEventListener('change', (e) => {
      state.categoryFilter = e.target.value;
      loadDashboardData();
    });

    filterPriorityEl.addEventListener('change', (e) => {
      state.priorityFilter = e.target.value;
      loadDashboardData();
    });

    sortByEl.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      loadDashboardData();
    });

    // Modal Actions
    btnOpenModal.addEventListener('click', () => openModal());
    btnEmptyAdd.addEventListener('click', () => openModal());
    btnCloseModal.addEventListener('click', () => closeModal());
    btnCancelModal.addEventListener('click', () => closeModal());

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });

    // Form submission
    taskForm.addEventListener('submit', handleFormSubmit);
  }

  // Load Tasks & Stats from backend API
  async function loadDashboardData() {
    showLoading(true);
    try {
      // Parallel API calls
      const [todosRes, statsRes] = await Promise.all([
        TodoAPI.getTodos({
          status: state.statusFilter,
          priority: state.priorityFilter,
          category: state.categoryFilter,
          search: state.searchQuery,
          sortBy: state.sortBy
        }),
        TodoAPI.getStats()
      ]);

      if (todosRes.success) {
        state.todos = todosRes.data;
        renderTodoList(state.todos);
      }

      if (statsRes.success) {
        updateStatsUI(statsRes.data);
      }
    } catch (error) {
      showToast('Error syncing with database server', 'error');
    } finally {
      showLoading(false);
    }
  }

  // Update Stats UI widgets
  function updateStatsUI(stats) {
    statTotalEl.textContent = stats.total;
    statActiveEl.textContent = stats.active;
    statCompletedEl.textContent = stats.completed;
    statRateEl.textContent = `${stats.completionRate}%`;
    progressFillEl.style.width = `${stats.completionRate}%`;
  }

  // Render Todo List
  function renderTodoList(todos) {
    todoListEl.innerHTML = '';

    if (!todos || todos.length === 0) {
      emptyStateEl.classList.remove('hidden');
      if (state.searchQuery || state.priorityFilter !== 'all' || state.categoryFilter !== 'all' || state.statusFilter !== 'all') {
        emptyMessageEl.textContent = 'No tasks match your filter or search criteria.';
      } else {
        emptyMessageEl.textContent = 'You currently have no tasks. Click "New Task" to create one!';
      }
      return;
    }

    emptyStateEl.classList.add('hidden');

    todos.forEach(todo => {
      const todoCard = createTodoCardElement(todo);
      todoListEl.appendChild(todoCard);
    });
  }

  // Create single todo DOM node
  function createTodoCardElement(todo) {
    const item = document.createElement('div');
    item.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    item.dataset.id = todo._id;

    // Due date formatting & check overdue
    let dueDateHTML = '';
    if (todo.due_date) {
      const d = new Date(todo.due_date);
      const today = new Date();
      today.setHours(0,0,0,0);
      const isOverdue = !todo.completed && d < today;
      const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dueDateHTML = `
        <span class="date-tag ${isOverdue ? 'overdue' : ''}">
          <i class="fa-regular fa-calendar"></i> ${formattedDate} ${isOverdue ? '(Overdue)' : ''}
        </span>
      `;
    }

    item.innerHTML = `
      <div class="todo-left">
        <label class="checkbox-custom" title="Toggle completion">
          <input type="checkbox" ${todo.completed ? 'checked' : ''} data-action="toggle">
          <span class="checkmark"></span>
        </label>
        <div class="todo-content">
          <div class="todo-title-row">
            <span class="todo-title">${escapeHTML(todo.title)}</span>
          </div>
          ${todo.description ? `<p class="todo-description">${escapeHTML(todo.description)}</p>` : ''}
          <div class="todo-meta">
            <span class="badge badge-priority-${todo.priority}">
              <i class="fa-solid fa-flag"></i> ${todo.priority}
            </span>
            <span class="badge badge-category">
              <i class="fa-solid fa-folder"></i> ${escapeHTML(todo.category)}
            </span>
            ${dueDateHTML}
          </div>
        </div>
      </div>
      <div class="todo-actions">
        <button class="btn-icon-sm" data-action="edit" title="Edit Task">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button class="btn-icon-sm" data-action="delete" title="Delete Task">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;

    // Event listener for card action buttons
    item.addEventListener('click', async (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;

      const action = actionBtn.dataset.action;
      if (action === 'toggle') {
        await handleToggle(todo._id);
      } else if (action === 'edit') {
        openModal(todo);
      } else if (action === 'delete') {
        await handleDelete(todo._id);
      }
    });

    return item;
  }

  // Handle task completion toggle
  async function handleToggle(id) {
    try {
      const res = await TodoAPI.toggleTodo(id);
      if (res.success) {
        showToast(res.data.completed ? 'Task marked as completed!' : 'Task marked as active', 'info');
        loadDashboardData();
      }
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  }

  // Handle task deletion
  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await TodoAPI.deleteTodo(id);
      if (res.success) {
        showToast('Task deleted successfully', 'info');
        loadDashboardData();
      }
    } catch (error) {
      showToast('Failed to delete task', 'error');
    }
  }

  // Form submit handler (Create or Edit)
  async function handleFormSubmit(e) {
    e.preventDefault();

    const id = inputTaskId.value;
    const title = inputTitle.value.trim();
    const description = inputDescription.value.trim();
    const category = inputCategory.value;
    const priority = inputPriority.value;
    const due_date = inputDueDate.value || null;

    if (!title) {
      showToast('Title is required', 'error');
      return;
    }

    const payload = { title, description, category, priority, due_date };

    try {
      if (id) {
        // Edit existing
        const res = await TodoAPI.updateTodo(id, payload);
        if (res.success) {
          showToast('Task updated successfully!', 'success');
          closeModal();
          loadDashboardData();
        }
      } else {
        // Create new
        const res = await TodoAPI.createTodo(payload);
        if (res.success) {
          showToast('Task created successfully!', 'success');
          closeModal();
          loadDashboardData();
        }
      }
    } catch (error) {
      showToast(error.message || 'Operation failed', 'error');
    }
  }

  // Modal open/close helpers
  function openModal(todo = null) {
    taskForm.reset();
    if (todo) {
      modalTitleEl.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Task';
      inputTaskId.value = todo._id;
      inputTitle.value = todo.title;
      inputDescription.value = todo.description || '';
      inputCategory.value = todo.category || 'General';
      inputPriority.value = todo.priority || 'medium';
      if (todo.due_date) {
        inputDueDate.value = new Date(todo.due_date).toISOString().split('T')[0];
      }
    } else {
      modalTitleEl.innerHTML = '<i class="fa-solid fa-plus-circle"></i> Create New Task';
      inputTaskId.value = '';
    }
    modalBackdrop.classList.remove('hidden');
    inputTitle.focus();
  }

  function closeModal() {
    modalBackdrop.classList.add('hidden');
    taskForm.reset();
    inputTaskId.value = '';
  }

  // Show/Hide spinner
  function showLoading(show) {
    if (show) {
      loadingSpinnerEl.classList.remove('hidden');
    } else {
      loadingSpinnerEl.classList.add('hidden');
    }
  }

  // Toast Notification System
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastIn 0.3s ease reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Utility to prevent XSS
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
