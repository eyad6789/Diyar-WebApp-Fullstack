# Diyari (ديياري) - Arabic Real Estate Platform

A comprehensive real estate platform designed specifically for Iraqi users, featuring full Arabic RTL interface and advanced property management capabilities.

## 🏠 Features

### Core Functionality
- **User Authentication**: Secure registration and login system with JWT tokens
- **Property Listings**: Browse and search properties with advanced filtering
- **Property Reels**: Video content for immersive property viewing experience
- **Property Requests**: Create and manage property search requests with intelligent matching
- **Real-time Messaging**: In-app messaging system for property inquiries
- **WhatsApp Integration**: External communication for property contacts
- **Notifications System**: Real-time alerts for matches, messages, and interactions

### User Experience
- **Full Arabic RTL Interface**: Complete right-to-left layout with Arabic typography
- **Responsive Design**: Optimized for desktop and mobile devices
- **Advanced Search & Filters**: Filter by location, price, property type, and more
- **Property Details**: Comprehensive property information with image galleries
- **User Profiles**: Manage personal information and property listings
- **Settings Management**: Customize preferences and account settings

## 🛠 Tech Stack

### Frontend
- **React 18**: Modern JavaScript framework
- **Tailwind CSS**: Utility-first CSS framework with custom Diyari theme
- **Arabic Fonts**: Cairo and Tajawal fonts for optimal Arabic text rendering
- **Axios**: HTTP client for API communication
- **React Router**: Client-side routing and navigation

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **SQLite**: Lightweight database solution
- **JWT**: JSON Web Tokens for secure authentication
- **Multer**: File upload middleware for images and videos
- **bcrypt**: Password hashing and security

### Database Schema
- **Users**: User accounts and profiles
- **Properties**: Property listings and details
- **Property Requests**: User search requests and preferences
- **Messages**: Real-time messaging system
- **Notifications**: System alerts and updates
- **Likes & Comments**: User interactions and engagement

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

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

### Application URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
diyar-web/
├── backend/
│   ├── models/
│   │   └── database.js          # Database schema and initialization
│   ├── routes/
│   │   ├── auth.js             # Authentication endpoints
│   │   ├── properties.js       # Property management
│   │   ├── messages.js         # Messaging system
│   │   └── notifications.js    # Notification system
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── uploads/                # File storage for images/videos
│   └── server.js               # Main server application
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Application pages
│   │   │   ├── Home.js         # Property feed and main dashboard
│   │   │   ├── Search.js       # Advanced property search
│   │   │   ├── Reels.js        # Property video content
│   │   │   ├── Requests.js     # Property request management
│   │   │   ├── Messages.js     # Messaging interface
│   │   │   ├── Notifications.js # Notification center
│   │   │   ├── Settings.js     # User settings and preferences
│   │   │   └── PropertyDetails.js # Detailed property view
│   │   ├── contexts/
│   │   │   └── AuthContext.js  # Authentication state management
│   │   ├── services/           # API service functions
│   │   └── App.js              # Main application component
│   ├── public/                 # Static assets
│   └── package.json
├── README.md
└── LICENSE
```

## 🎨 Design System

### Color Palette
- **Primary**: Diyari brand colors optimized for Arabic interface
- **Secondary**: Complementary colors for actions and highlights
- **Neutral**: Grayscale palette for text and backgrounds

### Typography
- **Arabic Fonts**: Cairo (headings), Tajawal (body text)
- **RTL Layout**: Complete right-to-left interface design
- **Responsive Text**: Scalable typography for all device sizes

## 🔧 Development

### Environment Variables
Create `.env` files in both backend and frontend directories:

**Backend (.env)**
```
JWT_SECRET=your_jwt_secret_key
PORT=5000
DB_PATH=./database.sqlite
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000
```

### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/properties` - Get property listings
- `POST /api/properties` - Create new property
- `GET /api/property-requests` - Get user requests
- `POST /api/property-requests` - Create property request
- `GET /api/messages` - Get user messages
- `POST /api/messages` - Send message
- `GET /api/notifications` - Get notifications

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Diyari** - Connecting Iraqi families with their dream homes 🏡
