# 🎓 Project Recommendation System

## 📖 Overview

A comprehensive project recommendation system built with Flask and React, designed for academic environments. The system facilitates intelligent project matching between students and faculty members, offering features like resume management, team formation, and AI-powered recommendations to optimize academic project collaboration.

## ✨ Key Features

### 👨‍🎓 Student Portal
- **User Authentication**: Secure student registration and login
- **Resume Management**: Upload and manage personal resumes (PDF, DOCX support)
- **Smart Recommendations**: AI-powered project suggestions based on skills and interests
- **Team Collaboration**: View and join project teams
- **Profile Management**: Personal information and preference settings

### 👨‍🏫 Faculty Portal
- **Faculty Authentication**: Dedicated teacher registration and login
- **Project Management**: Create and manage academic projects
- **Team Oversight**: Monitor and manage project teams
- **Student Matching**: Intelligent student recommendations for projects

### 🔧 System Features
- **AI Recommendation Engine**: Skill-based project matching algorithm
- **Document Processing**: Advanced resume parsing (PDF, DOCX, PPTX)
- **Real-time Notifications**: Project status updates and team changes
- **Responsive Design**: Cross-device compatibility
- **Role-based Access Control**: Secure user permissions

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask 2.2.5
- **Database**: MySQL 8.0
- **ORM**: SQLAlchemy 3.0.5
- **Authentication**: JWT (PyJWT 2.8.0)
- **API Documentation**: Swagger/OpenAPI
- **File Processing**: pdfplumber, python-docx, python-pptx
- **Machine Learning**: scikit-learn, numpy, pandas

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.2.6
- **UI Libraries**: Material-UI 7.0.2, Ant Design 5.24.6
- **Routing**: React Router DOM 6.30.0
- **State Management**: React Hooks
- **Data Visualization**: Recharts 2.15.3
- **Animations**: Framer Motion 12.7.4
- **Testing**: Vitest, Cypress

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx
- **Environment**: Python 3.11, Node.js 18+

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. **Clone the Repository**
```bash
git clone <repository-url>
cd capstone-project-25t2-9900-w16a-cake
```

2. **Start Services**
```bash
docker-compose up --build
```

3. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/apidocs

### Local Development Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python init_db.py
python app.py
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
capstone-project-25t2-9900-w16a-cake/
├── backend/                 # Flask Backend
│   ├── app.py              # Main application entry point
│   ├── config.py           # Configuration settings
│   ├── requirements.txt    # Python dependencies
│   ├── init_db.py         # Database initialization
│   ├── auth/              # Authentication module
│   │   ├── controller.py  # Auth endpoints
│   │   ├── service.py     # Business logic
│   │   └── dao.py         # Data access layer
│   ├── models/            # Database models
│   │   ├── user.py        # User model
│   │   ├── project.py     # Project model
│   │   ├── group.py       # Team model
│   │   └── resume.py      # Resume model
│   ├── resume/            # Resume management
│   ├── project/           # Project management
│   ├── group/             # Team management
│   ├── recommend/         # Recommendation system
│   └── utils/             # Utility functions
├── frontend/              # React Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── assets/        # Static resources
│   │   ├── __test__/      # Test files
│   │   └── App.jsx        # Main application component
│   ├── cypress/           # E2E testing
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile         # Frontend Docker configuration
└── docker-compose.yml     # Docker orchestration
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file with the following parameters:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DB=capstone_project

# JWT Configuration
SECRET_KEY=your-secret-key
TEACHER_SECRET_KEY=teacher-secret-key-2024

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=1
```

## 📚 API Documentation

Access the complete API documentation at http://localhost:5000/apidocs after starting the backend service.

### Core API Endpoints

#### Authentication
- `POST /api/auth/register/student` - Student registration
- `POST /api/auth/register/teacher` - Teacher registration
- `POST /api/auth/login/student` - Student login
- `POST /api/auth/login/teacher` - Teacher login

#### Resume Management
- `POST /api/resume/upload` - Upload resume
- `GET /api/resume/profile` - Retrieve resume information
- `PUT /api/resume/update` - Update resume details

#### Project Management
- `GET /api/project/list` - List all projects
- `POST /api/project/create` - Create new project
- `GET /api/project/{id}` - Get project details
- `PUT /api/project/{id}` - Update project information

#### Team Management
- `GET /api/group/list` - List project teams
- `POST /api/group/create` - Create new team
- `POST /api/group/join` - Join existing team

#### Recommendation System
- `GET /api/recommend/projects` - Get recommended projects for students
- `GET /api/recommend/students` - Get recommended students for projects

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest
```

### Frontend Testing
```bash
cd frontend
npm test              # Unit tests with Vitest
npm run test:e2e      # E2E tests with Cypress
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Write comprehensive tests for new features
- Update documentation for API changes

## 📊 Performance & Scalability

- **Database Optimization**: Indexed queries for fast retrieval
- **Caching Strategy**: Redis integration for session management
- **Load Balancing**: Horizontal scaling support
- **API Rate Limiting**: Protection against abuse

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permission management
- **Input Validation**: Comprehensive data sanitization
- **CORS Protection**: Cross-origin request security
- **SQL Injection Prevention**: Parameterized queries

## 📈 Monitoring & Logging

- **Application Logs**: Structured logging with different levels
- **Performance Metrics**: Response time monitoring
- **Error Tracking**: Comprehensive error handling and reporting
- **Health Checks**: Service availability monitoring

## 🆘 Support & Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify MySQL service is running
   - Check connection credentials in `.env`
   - Ensure database exists

2. **Frontend Build Issues**
   - Clear `node_modules` and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

3. **Docker Issues**
   - Ensure Docker and Docker Compose are installed
   - Check port availability (3000, 5000)
   - Verify Docker daemon is running

### Getting Help

- Check existing [Issues](../../issues)
- Create a new issue with detailed problem description
- Contact the development team
- Review the API documentation

## 📝 Development Team

- **Project**: Capstone Project 25T2-9900-W16A-CAKE
- **Team**: W16A
- **Institution**: Academic Capstone Project
- **Technology**: Flask + React + MySQL

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Flask community for the excellent web framework
- React team for the powerful frontend library
- Open source contributors for various dependencies
- Academic mentors for project guidance

---

**Note**: This is an academic project designed for learning and research purposes. Please ensure compliance with your institution's policies when using this system.

