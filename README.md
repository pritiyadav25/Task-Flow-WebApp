# TaskFlow Pro - Full-Stack Todo Application

TaskFlow Pro is a modern, feature-rich full-stack Task Management Application built using **Node.js, Express, MongoDB (via Mongoose)** for the backend, and **HTML5, Modern Glassmorphic CSS, and JavaScript** for the frontend.

---

## 🌟 Key Features

- **Full CRUD REST API**: Create, Read, Update, Delete tasks powered by Express & MongoDB.
- **Task Analytics**: Live progress percentage, total task count, pending tasks, and completed task counters.
- **Glassmorphic UI**: Translucent glass-like cards, glowing ambient effects, and smooth animations.
- **Dark / Light Theme Switcher**: Easily switch between dark and light themes with automatic preference saving.
- **Task Filtering & Search**:
  - Filter by status (*All*, *Active*, *Completed*).
  - Filter by Category (*Work*, *Personal*, *Shopping*, *Health*, *General*).
  - Filter by Priority (*High*, *Medium*, *Low*).
  - Live instant debounced search across titles and descriptions.
  - Sort by Newest, Oldest, or Due Date.
- **Due Date Tracking**: Color-coded badges for due dates and overdue tasks.
- **Interactive Modals & Toasts**: Animated creation/editing modal and toast feedback messages.

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Node.js** (v18+ recommended)
2. **MongoDB** running locally on default port `27017` (or configured via environment variable `MONGODB_URI`).

### Running the App

1. Open your terminal in the `server` directory:
   ```bash
   cd server
   npm install   # If not already installed
   npm start
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5000/
   ```

---

## 📂 Project Directory Structure

```
crud/
├── server/                      # Node.js + Express REST API (MongoDB)
│   ├── package.json             # Server dependencies & scripts
│   ├── .env                     # PORT=5000, MONGODB_URI=mongodb://localhost:27017/todo_db
│   └── src/
│       ├── config/db.js         # Mongoose database connection
│       ├── models/todo.model.js # Todo Mongoose Schema
│       ├── controllers/todo.controller.js # CRUD & Stats logic
│       ├── routes/todo.routes.js # Express API router
│       └── server.js            # Express app & static file server
│
└── client/                      # Frontend Application
    ├── index.html               # Semantic HTML layout
    ├── css/styles.css           # Glassmorphism design system & dark/light theme
    └── js/
        ├── api.js               # Frontend API client
        └── app.js               # Event handling & UI state logic
```
