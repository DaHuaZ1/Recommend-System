## PoJFit Backend (Flask)

A Flask and SQLAlchemy based backend that provides APIs for authentication, resume, project, group, and recommendation modules for the PoJFit project. This document mirrors the frontend structure and focuses on the current backend implementation.

## Features

- Authentication and authorization: student and teacher registration and login, JWT authentication, middleware protection
- Resume management: students can upload, view, update, and delete resumes; basic info and skills extraction supported
- Group management: students create and manage groups; teachers can view all groups
- Project management: teachers upload, update, and delete projects; students view project lists and details
- Recommendation service: a unified endpoint returns recommendations based on role (student to project, teacher to student, group to project)

## Tech Stack

- Framework: Flask
- ORM: SQLAlchemy
- Database: MySQL 8 (test container provided by docker compose)
- Authentication: PyJWT (custom `utils/jwt_utils.py`)
- CORS: Flask CORS
- API Docs: Flasgger (partial coverage)

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed

### One-click startup
```bash
# Navigate to project root directory
cd /path/to/capstone-project-25t2-9900-w16a-cake

# Start all services (backend + MySQL)
docker compose up --build -d

# Check service status
docker compose ps

# View logs
docker compose logs -f backend
```

The backend will be available at `http://localhost:5000` and the MySQL database at `localhost:3306`.

### Stop services
```bash
docker compose down
```

### Clean up (remove volumes)
```bash
docker compose down -v
```

## Directory structure

```
backend/
├── app.py                     # Create and configure Flask app, register blueprints (url_prefix='/api')
├── config.py                  # Configuration (database, JWT, etc.)
├── init_db.py                 # Initialize database
├── requirements.txt
├── auth/                      # Authentication module
│   ├── controller.py          # Routes and input validation
│   ├── service.py             # Business logic
│   └── dao.py                 # Data access (if needed)
├── group/                     # Group module
│   ├── controller.py
│   ├── service.py
│   └── dao.py
├── project/                   # Project module
│   ├── controller.py
│   ├── service.py
│   └── dao.py
├── resume/                    # Resume module
│   ├── controller.py
│   ├── service.py
│   └── dao.py
├── recommend/                 # Recommendation module
│   ├── controller.py
│   └── service.py
├── models/                    # Data models
│   ├── user.py
│   ├── group.py
│   ├── group_project_recommendation.py
│   ├── project.py
│   └── student_resume.py
└── utils/                     # Utilities
    ├── jwt_utils.py
    ├── email_utils.py
    ├── project_utils.py
    ├── resume_utils.py
    └── time_utils.py
```

## API Overview (actual backend routes)

All endpoints are prefixed with `/api` (see blueprint registration in `app.py`). The main routes and key parameters are:

### Authentication (`auth/controller.py`)
- POST `/api/register`: student registration (`email`, `password`)
- POST `/api/register/teacher`: teacher registration (`email`, `password`, `secretKey`)
- POST `/api/login`: login (`email`, `password`)
- POST `/api/login/student` and `/api/login/teacher`: role based login (teacher requires `secretKey`)
- GET `/api/profile`: get current user info (Header: `Authorization: Bearer <token>`)

### Resume (`resume/controller.py`)
- POST `/api/student/resume`: student uploads resume (`multipart/form-data`, file field: `resume`)
- GET `/api/resume/{student_id}`: get a student's resume
- GET `/api/resumes`: teacher gets all student resumes
- PUT `/api/resume/{student_id}`: update resume (commonly `skill`)
- DELETE `/api/resume/{student_id}`: delete resume

### Group (`group/controller.py`)
- POST `/api/student/group`: student creates group (`groupName`, `groupMember` list of emails)
- GET `/api/student/group`: get current student's groups
- GET `/api/student/group/{group_id}`: get single group details
- POST `/api/student/group/{group_id}/members`: add member
- PUT `/api/student/group/{group_id}/members/{member_id}`: update member
- DELETE `/api/student/group/{group_id}/members/{member_id}`: delete member
- DELETE `/api/student/group/{group_id}`: delete group
- GET `/api/staff/groups`: teacher views all groups

### Project (`project/controller.py`)
- POST `/api/staff/projects`: teacher creates project
- PUT `/api/staff/projects/{project_id}`: teacher updates project
- DELETE `/api/staff/projects/{project_id}`: teacher deletes project
- GET `/api/student/projects`: student lists projects
- GET `/api/project/{project_id}`: get project details

### Recommendation (`recommend/controller.py`)
- GET `/api/student/recommend`: unified recommendation endpoint
  - Student role: returns project recommendations
  - Teacher role: returns student recommendations
  - If user is in a group: returns project recommendations for the group

Note: some error responses may return a mixture of `status`/`message`/`error`. Tests are written to accept both Chinese and English messages.

## Testing

### Run tests with Docker (recommended)
```bash
cd backend/tests/docker
# Clean up previous runs (containers, volumes)
docker compose -f docker-compose.test.yml down -v
# Run tests and return backend-test exit code
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from backend-test
```

To view test logs only:
```bash
docker compose -f docker-compose.test.yml logs backend-test
```

## Docker Configuration

The project includes a `docker-compose.yml` file in the root directory that sets up:

- **Backend service**: Flask application on port 5000
- **MySQL database**: MySQL 8.0 on port 3306
- **Environment variables**: Pre-configured for immediate use

### Environment Variables (auto-configured)
```bash
MYSQL_HOST=db
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DB=capstone_project
SECRET_KEY=your-secret-key
JWT_EXPIRATION_HOURS=24
TEACHER_SECRET_KEY=123456
```

### Sample test results

Below is a sample summary from recent runs. Results can vary with environment and data, but this reflects the current suite design (bilingual assertions, flexible response handling):

```
tests completed: 69
passed: 69
failed: 0
```

Modules covered by tests: authentication, groups, projects, resumes, recommendations, utility functions, and algorithm ranking/normalization.

## Configuration notes

- URL prefix: all routes start with `/api` (blueprints registered in `app.py`)
- JWT: pass as `Authorization: Bearer <token>`; secret set by `SECRET_KEY`
- Teacher secret: `TEACHER_SECRET_KEY` is required for teacher registration/login
- File uploads: resume file field name is `resume`
- Database: using the docker compose provided MySQL database for consistency

## License

This repository is part of the UNSW Capstone project. Licensing follows the course requirements.
