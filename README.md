# Chicken Manager 🐔

A comprehensive web application for managing your chicken flock, tracking egg production, monitoring expenses, and managing feed inventory. Built with React, TypeScript, and Supabase with full multi-user support.

## ✨ Features

### 🔐 **User Authentication & Multi-User Support**
- **Secure user registration and login** with Supabase Auth
- **Private user profiles** - each user has their own isolated data
- **Protected routes** - authentication required for all app features
- **Session management** with automatic token refresh (1-hour expiry)
- **Automatic token renewal** - seamless authentication experience
- **Emergency session recovery** - handles token expiration gracefully

### 🥚 **Egg Production Tracking**
- Daily egg count logging with date tracking
- Visual statistics and trends
- Export data to CSV format
- Historical data analysis

### 💰 **Expense Management**
- Track feed, equipment, veterinary, and other expenses
- Categorized expense tracking
- Visual expense analytics with charts
- Monthly/yearly expense summaries

### 🌾 **Feed Inventory Management**
- Monitor feed levels and consumption
- Track different feed types and brands
- Purchase date and expiry tracking
- Automatic expense integration

### 🐔 **Flock Profile Management**
- Detailed flock information (farm name, location, breed types)
- Bird count tracking (hens, roosters, chicks, brooding)
- Flock event logging (health, breeding, mortality events)
- Growth and development tracking

### 📊 **Analytics & Reporting**
- Comprehensive dashboard with key metrics
- Savings calculations and ROI tracking
- Visual charts and data visualization
- Export capabilities for record keeping

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chicken-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=/api
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   VITE_USE_LOCAL_STORAGE=false
   ```
   
   ⚠️ **Important**: Never commit your `.env` file to git. It's already excluded in `.gitignore`.

4. **Set up Supabase database**
   - Import the provided `supabase-schema.sql` file
   - Enable Row Level Security (RLS) on all tables
   - Apply the provided RLS policies for user data isolation

5. **Start the development server**
   ```bash
   # Using Vercel CLI (recommended for full API support)
   npx vercel dev
   
   # Or using Vite directly
   npm run dev
   ```

6. **Visit the application**
   Open [http://localhost:3001](http://localhost:3001) (Vercel dev) or [http://localhost:5173](http://localhost:5173) (Vite) in your browser

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Router** for navigation

### Backend
- **Vercel Functions** for serverless API endpoints
- **Supabase** for database and authentication
- **Row Level Security (RLS)** for data isolation
- **PostgreSQL** database with real-time capabilities

### Security
- **User authentication** required for all operations
- **JWT tokens** with 1-hour expiry and automatic refresh
- **Row Level Security** policies protect user data
- **CORS** properly configured for production
- **Environment variables** secured (`.env` excluded from git)
- **Service role key** used only in backend API functions

## 📱 User Guide

### Getting Started
1. **Sign up** for a new account or **log in** to existing account
2. **Set up your flock profile** with farm details and bird counts
3. **Start logging daily egg production**
4. **Track expenses** as they occur
5. **Monitor feed inventory** levels
6. **Review analytics** on the dashboard

### Data Privacy
- Each user has completely **private data**
- No user can access another user's information
- All data is isolated at the database level
- Secure logout preserves data privacy

## 🛠️ Development

### Project Structure
```
├── src/
│   ├── components/          # React components
│   ├── contexts/           # React contexts (Auth)
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── assets/            # Static assets
├── api/                   # Vercel functions
├── docs/                  # Documentation
└── public/               # Public assets
```

### Key Components
- **Authentication**: Full user auth with Supabase
- **Dashboard**: Overview of key metrics
- **EggCounter**: Daily egg production logging
- **Expenses**: Expense tracking and categorization
- **FeedTracker**: Feed inventory management
- **Profile**: Flock management and events

### API Endpoints
All API endpoints require authentication:
- `GET /api/getData` - Fetch user's data
- `POST /api/saveEggEntries` - Save egg entries
- `POST /api/saveExpenses` - Save expenses
- `POST /api/saveFlockProfile` - Save flock profile
- `POST /api/saveFeedInventory` - Save feed inventory
- `POST /api/saveFlockEvents` - Save flock events
- `DELETE /api/deleteFlockEvent` - Delete flock events

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
VITE_USE_LOCAL_STORAGE=false
```

⚠️ **Security Note**: Set these in your Vercel dashboard, never commit them to git.

## 📚 Documentation

- [Database Schema](docs/database-schema.md)
- [API Documentation](docs/api-documentation.md)
- [Component Guide](docs/components.md)
- [User Guide](docs/simple-feed-guide.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please check the documentation in the `docs/` folder or create an issue in the repository.

---

**Happy Chicken Managing!** 🐔🥚
