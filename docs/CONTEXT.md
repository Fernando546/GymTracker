# Gym Progress Tracker App Documentation

## Overview
The GymTracker app helps users monitor their fitness journey by tracking workouts, body weight, and maintaining a motivational streak-based calendar system.

## App Structure

### 1. Authentication Flow
- **Login Screen**
  - User authentication
  - Password recovery
  - New account creation
- **Signup Process**
  - Required: Email, password
  - Optional: Name, age, gender

### 2. Main Dashboard
- **Streak Display**
  - Current streak counter
  - Visual calendar (Duolingo-style)
- **Quick Access Menu**
  - Personal info updates
  - Start workout
  - View workout history
  - Check achievements

### 3. Personal Information
- **Weight Tracking**
  - Current weight input
  - Historical weight chart
- **Profile Management**
  - Basic info editing
  - Progress visualization

### 4. Workout Management
- **Workout Creation**
  - Exercise logging
    - Exercise name
    - Rep count
    - Set count
    - Weight used
- **Workout History**
  - Timeline view
  - Detailed exercise logs
  - Date tracking

### 5. Achievement System
- **Milestone Tracking**
  - Streak achievements
  - Personal records
- **Progress Visualization**
  - Weight progression charts
  - Workout frequency graphs

## Technical Stack

### Frontend
- React Native with Expo
- State Management: React Context/Redux
- UI Charts: Victory Native/React Native SVG

### Backend
- Node.js/Express server
- Firebase integration
  - Authentication
  - Real-time database
  - User data storage

## Key Features
- Streak-based motivation system
- Comprehensive workout logging
- Weight tracking with visualization
- Achievement-based progression
- User-friendly interface

## Development Goals
- Maintain user engagement through streaks
- Provide clear progress visualization
- Enable detailed workout tracking
- Create a responsive, intuitive interface

## Database Schema

### Users Collection
{
  uid: string; // Firebase Auth UID
  email: string;
  displayName?: string;
  dateJoined: timestamp;
  lastLogin: timestamp;
  profile: {
  age?: number;
  gender?: string;
  height?: number;
  targetWeight?: number;
}

### Workouts Collection
{
uid: string; // Reference to user
weight: number;
date: timestamp;
note?: string;
}

### Streaks Collection
{
uid: string; // Reference to user
currentStreak: number;
longestStreak: number;
lastWorkoutDate: timestamp;
streakHistory: [{
date: timestamp;
completed: boolean;
}]

### Achievements Collection
{
uid: string; // Reference to user
achievementId: string;
dateEarned: timestamp;
type: string; // e.g., "streak", "weight", "workout"
progress: number; // Progress towards next level
}

## Project Structure
GymTracker/
├── app/ # Main application code
│ ├── assets/ # Images, fonts, etc.
│ ├── components/ # Reusable components
│ │ ├── common/ # Shared UI components
│ │ ├── auth/ # Authentication components
│ │ ├── workout/ # Workout-related components
│ │ └── achievements/ # Achievement components
│ ├── screens/ # Screen components
│ │ ├── auth/ # Auth-related screens
│ │ ├── dashboard/ # Main dashboard screens
│ │ ├── workout/ # Workout screens
│ │ └── profile/ # Profile screens
│ ├── navigation/ # Navigation configuration
│ ├── services/ # API and external services
│ │ ├── api/ # API endpoints
│ │ ├── firebase/ # Firebase configuration
│ │ └── storage/ # Local storage helpers
│ ├── store/ # State management
│ │ ├── context/ # React Context
│ │ ├── reducers/ # Redux reducers
│ │ └── actions/ # Redux actions
│ ├── utils/ # Helper functions
│ └── config/ # App configuration
├── server/ # Backend server code
│ ├── controllers/ # Route controllers
│ ├── models/ # Data models
│ ├── routes/ # API routes
│ ├── middleware/ # Custom middleware
│ └── utils/ # Server utilities
├── docs/ # Documentation
└── tests/ # Test files
├── unit/
├── integration/
└── e2e/