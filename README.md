# NGO Aggregator Platform

A comprehensive platform for discovering, connecting with, and managing NGOs across India. Features include user authentication, NGO verification, volunteer opportunities, event management, and AI-powered chatbot assistance.

## Features

### For Users

- **Browse NGOs**: Search and filter NGOs by category, location, and verification status
- **Volunteer Opportunities**: Discover and apply for volunteer positions
- **Event Discovery**: Find and register for NGO events
- **Personal Dashboard**: Track applications, bookmark opportunities, and save favorite NGOs
- **Interactive Map**: Visualize NGO locations across India
- **AI Chatbot**: Get instant help finding NGOs and opportunities

### For NGOs

- **Registration System**: Apply for verification with detailed forms
- **NGO Dashboard**: Manage organization profile and activities
- **Post Management**: Create and manage volunteer opportunities
- **Event Creation**: Organize and promote events
- **Application Management**: Review and respond to volunteer applications
- **Analytics**: Track engagement and applications

### For Admins

- **Verification System**: Approve or reject NGO registration requests
- **Blacklist Management**: Flag organizations violating guidelines
- **Platform Analytics**: Monitor user activity and platform growth
- **Content Moderation**: Oversee volunteer posts and events

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│                    (Next.js 14 + React)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │   Public   │  │   User     │  │    NGO     │          │
│  │   Pages    │  │  Dashboard │  │  Dashboard │          │
│  └────────────┘  └────────────┘  └────────────┘          │
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │   Admin    │  │    Auth    │  │  Chatbot   │          │
│  │  Dashboard │  │   System   │  │ Component  │          │
│  └────────────┘  └────────────┘  └────────────┘          │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ REST API (axios)
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      Backend API                            │
│                   (Flask + Python)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │   Auth     │  │    NGO     │  │    User    │          │
│  │  Routes    │  │   Routes   │  │   Routes   │          │
│  └────────────┘  └────────────┘  └────────────┘          │
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │   Admin    │  │  Chatbot   │  │    AI      │          │
│  │   Routes   │  │   Routes   │  │  Service   │          │
│  └────────────┘  └────────────┘  └────────────┘          │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ SQLAlchemy ORM
                     │
┌────────────────────▼────────────────────────────────────────┐
│                       Database                              │
│                   (PostgreSQL)                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tables: users, ngos, categories, volunteer_posts,         │
│         events, applications, bookmarks, likes,            │
│         blacklist_records, ngo_requests                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                     │
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   External Services                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────┐  ┌────────────┐                           │
│  │   Groq AI  │  │  Leaflet   │                           │
│  │  (Chatbot) │  │   (Maps)   │                           │
│  └────────────┘  └────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- Groq API Key (for AI features)

### Backend Setup

1. **Clone and navigate to backend**

```bash
git clone <repository-url>
cd backend
```

2. **Create virtual environment**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install flask flask-sqlalchemy flask-cors psycopg2-binary python-dotenv pyjwt groq
```

4. **Configure environment**
   Create `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost/ngo_aggregator
SECRET_KEY=your-secret-key-change-in-production
GROQ_API_KEY=your-groq-api-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme123
```

5. **Initialize database**

```bash
python init_db.py
python seed_data.py  # Optional: Add sample data
```

6. **Run backend**

```bash
python app.py
```

Backend runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend**

```bash
cd frontend
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Configure environment**
   Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. **Run frontend**

```bash
npm run dev
# or
yarn dev
```

Frontend runs on `http://localhost:3000`

## Project Structure

### Backend

```
backend/
├── app.py              # Main Flask application
├── models.py           # Database models
├── config.py           # Configuration
├── ai_service.py       # AI/chatbot service
├── init_db.py          # Database initialization
├── seed_data.py        # Sample data seeder
└── requirements.txt    # Python dependencies
```

### Frontend

```
frontend/
├── app/
│   ├── page.tsx                    # Home page
│   ├── auth/
│   │   ├── login/page.tsx          # Login
│   │   ├── register/page.tsx       # User registration
│   │   └── ngo-register/page.tsx   # NGO registration
│   ├── dashboard/page.tsx          # User dashboard
│   ├── ngo/
│   │   └── dashboard/page.tsx      # NGO dashboard
│   ├── admin/
│   │   └── dashboard/page.tsx      # Admin dashboard
│   ├── ngos/
│   │   ├── page.tsx                # NGO listing
│   │   └── [id]/page.tsx           # NGO detail
│   ├── volunteer/page.tsx          # Volunteer opportunities
│   ├── events/page.tsx             # Events listing
│   ├── impact/page.tsx             # Analytics/stats
│   └── blacklisted/page.tsx        # Blacklisted NGOs
├── components/
│   ├── Chatbot.tsx                 # AI chatbot
│   └── NGOMap.tsx                  # Interactive map
├── lib/
│   └── api.ts                      # API client
└── package.json
```

## Default Credentials

### Admin Account

- Email: `admin@example.com`
- Password: `changeme123`

** Change these immediately in production!**

## User Flows

### User Registration & Activity

1. Sign up with email/password
2. Browse NGOs, opportunities, and events
3. Apply for volunteer positions
4. Bookmark opportunities
5. Like favorite NGOs
6. Track application status in dashboard

### NGO Registration & Management

1. Submit registration request with documents
2. Wait for admin approval
3. Access NGO dashboard
4. Create volunteer posts and events
5. Review and manage applications
6. Update organization profile

### Admin Workflow

1. Login with admin credentials
2. Review pending NGO applications
3. Approve with credentials or reject with reason
4. Monitor platform statistics
5. Manage blacklist when needed

## Security Features

- JWT-based authentication
- Role-based access control (User, NGO, Admin)
- Password hashing with bcrypt
- Protected API endpoints
- Input validation and sanitization
- CORS configuration

## AI Features

### Chatbot

- Powered by Groq AI (Mixtral model)
- Answers platform questions
- Helps find NGOs and opportunities
- Available to all users

### AI Services

- NGO description summarization
- Category suggestion based on mission
- Transparency score calculation

## Maps Integration

- Interactive Leaflet maps
- Real-time NGO location plotting
- Category-based filtering
- Click for NGO details

## Database Schema

### Core Tables

- **users**: User accounts and authentication
- **ngos**: NGO profiles and information
- **categories**: NGO categories/causes
- **volunteer_posts**: Volunteer opportunities
- **events**: NGO events
- **applications**: User applications to posts
- **bookmarks**: User saved posts
- **likes**: User liked NGOs
- **blacklist_records**: Blacklisted NGO details
- **ngo_requests**: Pending NGO registrations
- **office_bearers**: NGO leadership

## UI/UX Features

- Modern gradient designs
- Responsive layouts
- Smooth animations
- Intuitive navigation
- Loading states
- Error handling
- Success feedback
- Modal dialogs
- Tab interfaces

## 🔧 Configuration

### Backend Configuration

Edit `config.py` for:

- Database URL
- JWT secret key
- API keys
- Pagination settings
- Admin credentials

### Frontend Configuration

Edit `.env.local` for:

- API URL
- Feature flags
- External service keys

## 📈 Analytics & Stats

The platform tracks:

- Total NGOs and verification status
- Blacklisted organizations
- Volunteer opportunities
- Upcoming events
- User applications
- Category distribution
- Geographic distribution

## 🛠️ Development

### Adding New Features

1. Backend: Add routes in `app.py`
2. Frontend: Create components/pages
3. Update API client in `lib/api.ts`
4. Test functionality
5. Update documentation

### Code Style

- Python: PEP 8
- TypeScript: ESLint + Prettier
- Components: Functional + Hooks
- API: RESTful conventions

## Common Issues

### Database Connection

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Create database if needed
createdb ngo_aggregator
```

### Port Conflicts

```bash
# Backend (default 5000)
export FLASK_RUN_PORT=5001

# Frontend (default 3000)
npm run dev -- -p 3001
```

### CORS Errors

Ensure `CORS(app)` is enabled in `app.py` and API URL matches in frontend

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License

MIT License - see LICENSE file for details
