# Kanban Application

A minimal Kanban board application built with React, Vite, Tailwind CSS, and Firebase.

## Features

- User authentication (login/register)
- Create multiple boards
- Drag and drop cards between lists
- Real-time updates with Firebase
- Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update `src/config/firebase.js` with your config

3. Run the development server:
```bash
npm run dev
```

## Usage

1. Register a new account or login
2. Create a new board
3. Add cards to lists
4. Drag cards between To Do, In Progress, and Done columns