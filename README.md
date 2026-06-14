# 💼 Freelance Marketplace Frontend

A comprehensive React-based frontend application for a freelance marketplace platform (CodeHire) enabling users to connect with freelancers, manage projects, and track payments.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## ✨ Features

- **User Authentication** - Secure login and registration
- **Freelancer Profiles** - Browse and view freelancer portfolios
- **Project Management** - Post projects and manage bids
- **Real-time Chat** - Socket.io integration for instant messaging
- **Payment Integration** - Stripe payment processing
- **Rating & Reviews** - Comprehensive review system
- **Responsive Design** - Mobile-first approach
- **Form Validation** - React Hook Form with Zod validation
- **File Upload** - Cloudinary integration
- **Notifications** - React Toastify for alerts

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^19.1.0 | UI Framework |
| React Router | ^7.7.0 | Routing |
| React Hook Form | ^7.60.0 | Form management |
| Axios | ^1.10.0 | HTTP client |
| Socket.io | ^4.8.1 | Real-time communication |
| Stripe | ^7.8.0 | Payment processing |
| React Icons | ^5.5.0 | Icon library |
| React Toastify | ^11.0.5 | Notifications |
| Zod | ^4.0.5 | Schema validation |

## 📦 Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (v6 or higher) or **yarn**
- **Git** - [Download](https://git-scm.com/)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PratikDate01/Freelance-Marketplace-Frontend.git
   cd Freelance-Marketplace-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment configuration**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   ```env
   REACT_APP_API_BASE_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
   REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
   ```

## 🚀 Getting Started

### Development Mode

```bash
npm start
```

Opens at `http://localhost:3000`

### Production Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## 📁 Project Structure

```
Freelance-Marketplace-Frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── ProjectCard/
│   │   └── FreelancerCard/
│   ├── pages/            # Page components
│   │   ├── Home/
│   │   ├── Projects/
│   │   ├── Freelancers/
│   │   ├── Dashboard/
│   │   └── Profile/
│   ├── hooks/            # Custom hooks
│   ├── services/         # API services
│   ├── context/          # Context API
│   ├── utils/            # Utility functions
│   ├── styles/           # Global styles
│   ├── App.js            # Main component
│   └── index.js          # Entry point
├── .env.example          # Environment template
├── package.json          # Dependencies
└── README.md            # This file
```

## 📜 Available Scripts

### `npm start`
Runs development server with hot reload.

### `npm run build`
Creates production build.

### `npm test`
Launches test runner in watch mode.

### `npm run eject`
Exposes all configuration (irreversible).

## ⚙️ Configuration

### Environment Variables

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=30000

# Stripe
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_key

# Cloudinary
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_preset

# Feature Flags
REACT_APP_ENABLE_CHAT=true
```

### API Configuration

Configure proxy in `package.json`:

```json
{
  "proxy": "http://localhost:5000"
}
```

## 🔌 API Integration

### Authentication

```javascript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Register
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password",
  "userType": "freelancer" // or "client"
}
```

### Projects

```javascript
// Get all projects
GET /api/projects

// Create project
POST /api/projects
{
  "title": "Build a website",
  "description": "...",
  "budget": 5000,
  "deadline": "2024-12-31"
}

// Get project details
GET /api/projects/:id

// Place bid
POST /api/projects/:id/bids
{
  "amount": 4500,
  "duration": "2 weeks"
}
```

### Real-time Chat

```javascript
import io from 'socket.io-client'

const socket = io(process.env.REACT_APP_SOCKET_URL)

socket.on('message', (message) => {
  console.log('New message:', message)
})

socket.emit('send-message', {
  conversationId: '123',
  message: 'Hello!'
})
```

## 💳 Stripe Integration

```javascript
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLIC_KEY
)

function PaymentComponent() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}
```

## 🤝 Contributing

Follow these steps to contribute:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📄 License

Licensed under ISC License.

## 🆘 Support

- **Issues** - [GitHub Issues](https://github.com/PratikDate01/Freelance-Marketplace-Frontend/issues)
- **Live Demo** - [CodeHire](https://codehire-brown.vercel.app)

## 🔗 Related Projects

- [Freelance Marketplace Backend](https://github.com/PratikDate01/Freelance-Marketplace-Backend)

---

Made with ❤️ by the CodeHire Team
