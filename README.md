# AuraTracker

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A gamified productivity and classroom management application that motivates users through "Aura Points" for completing tasks, boosting consistency and engagement.

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## About The Project

### Problem Statement

Building consistent habits and staying motivated to complete daily tasks can be difficult without immediate rewards. Students and educators often lack engaging tools to manage classrooms, assignments, and productivity in one place.

### Solution

AuraTracker gamifies productivity by rewarding users with "Aura Points" for completing tasks. It combines classroom management features (like assignments, attendance, and timetables) with gamification elements (points, badges, daily check-ins) to drive long-term consistency and motivation.

## Features

### 🎮 Gamification

- **Daily Check-in**: Earn 1 Aura Point each day for checking in
- **Aura Points Tracking**: Monitor your points and progress
- **Badges System**: Unlock badges for achievements
- **Daily Challenges**: Math and Computer Science quiz missions

### 👥 User Management

- User registration & login
- Admin registration & login
- Profile management
- Password update

### 📋 Task Management

- Create, view, and update tasks
- Track task completion

### 🏫 Classroom Management (Powered by Firebase)

- Create and join classes
- Post classroom announcements
- Create and submit assignments
- View submitted assignments

### 📊 Academic Tools

- Attendance tracking
- Exam management
- Timetable management

### 🔔 Notifications

- Get notified for achievements and updates

## Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Cloudinary + Multer
- **Email**: Nodemailer
- **Authentication**: JWT + bcryptjs

### Frontend

- **Library**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Material-UI (MUI)
- **State Management**: Redux Toolkit + React Redux
- **Routing**: React Router DOM
- **Data Fetching**: Axios + TanStack React Query
- **Charts**: Chart.js + React Chart.js 2
- **Real-time Database**: Firebase

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas instance)
- Cloudinary account (for file uploads)
- Firebase account (for classroom management)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/auratracker.git
   cd auratracker
   ```

2. **Set up Backend**

   ```bash
   cd Backend
   npm install
   ```

   Create a `.env` file in the `Backend` directory (see [`.env.example`](file:///c:/Users/shash/OneDrive/Documents/Project1/AuraTracker/Backend/.env.example)):

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URL=http://localhost:5173
   ```

3. **Set up Frontend**

   ```bash
   cd ../Frontend
   npm install
   ```

   Create a `.env` file in the `Frontend` directory (see [`.env.example`](file:///c:/Users/shash/OneDrive/Documents/Project1/AuraTracker/Frontend/.env.example)):

   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

4. **Run the application**
   - Start Backend:
     ```bash
     cd Backend
     npm run dev
     ```
   - Start Frontend (in a new terminal):
     ```bash
     cd Frontend
     npm run dev
     ```

## Usage

1. Open your browser and go to `http://localhost:5173`
2. Register as a user or admin
3. Start exploring features:
   - Complete daily check-in to earn Aura Points
   - Create tasks and track your progress
   - Create or join classes
   - Manage assignments, attendance, and exams

## Project Structure

```
AuraTracker/
├── Backend/               # Express.js REST API
│   ├── config/           # Configuration (DB, Cloudinary)
│   ├── controllers/      # Request handlers
│   ├── middlewares/      # Authentication & error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── app.js            # Entry point
│   └── package.json
├── Frontend/             # React + Vite application
│   ├── src/
│   │   ├── assets/       # Images & icons
│   │   ├── components/   # React components
│   │   ├── context/      # React context
│   │   ├── redux/        # Redux store & slices
│   │   ├── routes/       # Route definitions
│   │   ├── services/     # API services
│   │   ├── utils/        # Utility functions
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   └── package.json
└── README.md
```

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
