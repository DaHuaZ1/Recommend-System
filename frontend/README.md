# PoJFit Frontend

A modern React-based frontend application for the PoJFit project management system. This application provides a comprehensive interface for both students and staff to manage projects, groups, and recommendations.

## 🚀 Features

### Student Features
- **User Authentication**: Secure login and registration system with captcha verification
- **Profile Management**: View and edit personal information
- **Resume Upload**: Upload and manage resume files (PDF, DOCX)
- **Group Management**: Create and manage project groups
- **Project Recommendations**: Get AI-powered project recommendations based on skills and preferences
- **Project Browsing**: View available projects and their details

### Staff Features
- **Staff Authentication**: Secure login with secret key verification
- **Project Management**: Upload, edit, and manage project files
- **Project Review**: Review and approve student submissions
- **Group Oversight**: Monitor and manage student groups
- **File Management**: Handle various document formats (PDF, DOCX, PPTX)

### General Features
- **Responsive Design**: Mobile-friendly interface using Material-UI
- **Modern UI/UX**: Clean and intuitive user interface with animations
- **File Viewer**: Built-in PDF viewer for document preview
- **Navigation**: Smooth navigation with React Router
- **State Management**: Efficient state management with React hooks

## 🛠️ Technology Stack

- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.2.6
- **UI Library**: Material-UI (MUI) 7.0.2, Ant Design 5.24.6
- **Routing**: React Router DOM 6.30.0
- **Styling**: Styled Components 6.1.17, Emotion
- **Testing**: Vitest 3.0.8, React Testing Library 16.0.0, Cypress 14.5.3
- **File Handling**: React Dropzone 14.3.8, PDF.js 3.11.174
- **Charts**: Recharts 2.15.3
- **Animations**: Framer Motion 12.7.4, TSParticles 3.8.1

## 📦 Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd capstone-project-25t2-9900-w16a-cake/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   - Create a `.env` file in the frontend directory (if not exists)
   - Configure backend URL in `src/backendURL.js` if needed

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
```
The application will start on `http://localhost:3000`

### Production Build
```bash
npm run build
# or
yarn build
```

### Preview Production Build
```bash
npm run preview
# or
yarn preview
```

### Linting
```bash
npm run lint
# or
yarn lint
```

## 🧪 Testing

### Unit Tests
Run unit tests using Vitest:
```bash
npm test
# or
yarn test
```

### Test Coverage Areas

#### Component Testing
The application includes comprehensive unit tests covering:

1. **Authentication Components**
   - `loginPageStd.test.jsx` - Student login functionality
   - `loginPageStf.test.jsx` - Staff login functionality
   - `registerPage.test.jsx` - User registration process

2. **Navigation Components**
   - `Bar.test.jsx` - Student navigation bar
   - `BarStf.test.jsx` - Staff navigation bar

3. **Page Components**
   - `HomepageStd.test.jsx` - Student homepage
   - `homepageStf.test.jsx` - Staff homepage
   - `profilePageStd.test.jsx` - Student profile page
   - `groupPageStd.test.jsx` - Student group management
   - `groupPageStf.test.jsx` - Staff group oversight
   - `projectSingleStf.test.jsx` - Staff project management
   - `uploadPageStf.test.jsx` - Staff file upload functionality

4. **Utility Components**
   - `CanvasCaptcha.test.jsx` - Captcha verification component

#### Test Features Covered
- **Component Rendering**: All components render correctly
- **User Interactions**: Button clicks, form submissions, navigation
- **Form Validation**: Input validation and error handling
- **State Management**: Component state changes and updates
- **Navigation**: Route changes and page transitions
- **API Integration**: Mock API calls and responses
- **Error Handling**: Error states and user feedback

### End-to-End Testing
Run E2E tests using Cypress:
```bash
npx cypress open
# or
npx cypress run
```

#### E2E Test Scenarios

1. **Student Path Testing** (`studentPath.cy.js`)
   - User registration process
   - Student login and authentication
   - Group creation and management
   - Project recommendation system
   - Complete student workflow

2. **Staff Path Testing** (`staffPath.cy.js`)
   - Staff registration and login
   - Project upload and management
   - File handling and editing
   - Complete staff workflow

3. **Sample Testing** (`sample.cy.js`)
   - Basic application functionality
   - Navigation and routing
   - UI component interactions

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── Bar.jsx          # Student navigation bar
│   │   ├── BarStf.jsx       # Staff navigation bar
│   │   ├── HomepageStd.jsx  # Student homepage
│   │   ├── HomepageStf.jsx  # Staff homepage
│   │   ├── loginPageStd.jsx # Student login
│   │   ├── loginPageStf.jsx # Staff login
│   │   ├── registerPage.jsx # User registration
│   │   ├── uploadPageStd.jsx # Student file upload
│   │   ├── uploadPageStf.jsx # Staff file upload
│   │   ├── groupPageStd.jsx # Student group management
│   │   ├── groupPageStf.jsx # Staff group oversight
│   │   ├── profilePageStd.jsx # Student profile
│   │   ├── recommendStd.jsx # Project recommendations
│   │   ├── projectSingle.jsx # Project details
│   │   ├── projectSingleStf.jsx # Staff project management
│   │   ├── pdfView.jsx      # PDF viewer
│   │   ├── CanvasCaptcha.jsx # Captcha component
│   │   ├── backToTop.jsx    # Back to top button
│   │   └── scrollToTop.jsx  # Scroll to top utility
│   ├── __test__/            # Unit tests
│   │   ├── Bar.test.jsx
│   │   ├── BarStf.test.jsx
│   │   ├── loginPageStd.test.jsx
│   │   ├── loginPageStf.test.jsx
│   │   ├── registerPage.test.jsx
│   │   ├── HomepageStd.test.jsx
│   │   ├── homepageStf.test.jsx
│   │   ├── profilePageStd.test.jsx
│   │   ├── groupPageStd.test.jsx
│   │   ├── groupPageStf.test.jsx
│   │   ├── projectSingleStf.test.jsx
│   │   ├── uploadPageStf.test.jsx
│   │   └── CanvasCaptcha.test.jsx
│   ├── assets/              # Static assets
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   ├── setup.js             # Test setup configuration
│   ├── backendURL.js        # Backend API configuration
│   └── Constant.jsx         # Application constants
├── cypress/                 # E2E testing
│   ├── e2e/
│   │   ├── studentPath.cy.js
│   │   ├── staffPath.cy.js
│   │   └── sample.cy.js
│   ├── fixtures/            # Test data
│   └── support/             # Cypress support files
├── public/                  # Public assets
├── dist/                    # Build output
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── cypress.config.cjs       # Cypress configuration
└── README.md               # This file
```

## 🔧 Configuration

### Vite Configuration
The application uses Vite for fast development and building:
- React plugin for JSX support
- JSDOM environment for testing
- Port 3000 for development server

### Testing Configuration
- Vitest for unit testing with JSDOM environment
- React Testing Library for component testing
- Cypress for E2E testing

## 🚀 Deployment

### Docker Deployment
The application includes a Dockerfile for containerized deployment:
```bash
docker build -t pojfit-frontend .
docker run -p 3000:3000 pojfit-frontend
```

### Nginx Configuration
A sample nginx configuration is provided for production deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests to ensure everything works
6. Submit a pull request

## 📝 License

This project is part of the PoJFit capstone project for UNSW.

## 🆘 Support

For issues and questions, please refer to the project documentation or contact the development team.
