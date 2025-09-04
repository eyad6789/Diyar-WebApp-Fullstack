# Instagram Clone - Social Media Application

A full-stack social media application inspired by Instagram, built with React frontend and Node.js/Express backend.

## Features

- User authentication (register/login)
- Photo sharing with captions
- Feed with posts from all users
- Like and comment functionality
- User profiles
- Responsive design

## Tech Stack

### Frontend
- React 18
- Tailwind CSS for styling
- Axios for API calls
- React Router for navigation

### Backend
- Node.js
- Express.js
- SQLite database
- JWT for authentication
- Multer for file uploads
- bcrypt for password hashing

## Getting Started

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
instagram-clone/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── public/
└── README.md
```
