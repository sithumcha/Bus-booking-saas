# BusSaaS - Comprehensive Bus Booking & Fleet Management SaaS

![BusSaaS Banner](frontend/public/premium_luxury_bus_hero_night.png)

**BusSaaS** is a full-stack, multi-tenant Software-as-a-Service (SaaS) platform designed to revolutionize the intercity bus travel industry. It provides a centralized digital infrastructure where independent bus operators can manage their fleets, and passengers can seamlessly search, filter, and book bus tickets through a modern, highly responsive interface.

---

## 🌟 Platform Architecture & Modules

The platform is divided into three main interfaces, each tailored with specific roles, permissions, and dashboards.

### 1. Passenger Portal (B2C)
The public-facing application built with a stunning, glassmorphic UI.
* **Dynamic Search Engine**: Search for buses by Origin, Destination, and Date.
* **Advanced Filters**: Filter search results by Bus Class (AC Luxury, Sleeper, Non-AC) and Departure Time (Morning/Night).
* **Interactive Seat Map**: A visual seating layout where users can click to select specific seats (e.g., Window, Aisle).
* **Smart Checkout**: Passenger details form and booking confirmation.
* **Passenger Dashboard**: View upcoming journeys, download digital PDF tickets, and manage profiles.
* **Responsive Design**: Flawlessly adapts to mobile, tablet, and desktop views with a built-in Dark/Light mode toggle.

### 2. Operator Dashboard (B2B)
A secure workspace for transport companies to manage their day-to-day operations.
* **Bus Fleet Management**: Add and configure buses (Registration Number, Seat Layout, Amenities, Total Seats, Images).
* **Trip Scheduler**: Assign buses to specific routes and dates, define departure/arrival times, and set ticket fares.
* **Driver Management**: Register drivers, store license details, and assign them to active buses.
* **Financial Analytics**: View monthly gross revenue, ticket sales volume, and bookings per vehicle via interactive charts (Recharts).
* **Passenger Manifests**: Generate and print detailed boarding lists for conductors (Seat numbers, Names, Contact Info).

### 3. Super Admin Dashboard (Platform Owner)
The high-level command center for the SaaS owner.
* **Global Network Volume**: Track the Gross Merchandise Value (GMV) of all tickets sold across all operators.
* **Commission Tracking**: Automatically calculates the platform's cut (e.g., 5% commission) from all operator sales, visualized on historical area charts.
* **Operator Metrics**: View a directory of all registered operators, their fleet sizes, and their individual revenue contributions.

---

## 💻 Technology Stack

### Frontend
* **React 18** (via Vite) - Component-based UI library
* **TailwindCSS** - Utility-first styling with custom glassmorphism extensions
* **React Router v6** - Dynamic client-side routing
* **Recharts** - SVG-based charting library for analytics
* **Lucide React** - Beautiful, consistent iconography
* **jsPDF / html2canvas** - Client-side PDF ticket generation

### Backend
* **Node.js & Express.js** - High-performance RESTful API server
* **MongoDB & Mongoose** - NoSQL database for flexible data modeling
* **JSON Web Tokens (JWT)** - Stateless, secure authentication for 3 different roles (User, Operator, Admin)
* **Bcrypt.js** - Secure password hashing

---

## 🔌 Core API Architecture

The backend exposes a secure REST API. Key endpoints include:

* **Authentication**:
  * `POST /api/auth/register` & `/login` (Passengers & Super Admins)
  * `POST /api/auth/operator/register` & `/login` (Bus Operators)
* **Trips & Search**:
  * `GET /api/trips` - Public search endpoint with query filters
  * `POST /api/trips` - Operator endpoint to schedule a journey
* **Bookings**:
  * `POST /api/bookings` - Create a new seat reservation
  * `GET /api/bookings/mybookings` - Fetch user's ticket history
* **Analytics**:
  * `GET /api/superadmin/stats` - Aggregated platform-wide financial data

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18 or higher)
* **MongoDB** (Local instance or MongoDB Atlas cluster)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sithumcha/Bus-booking-saas.git
   cd Bus-booking-saas
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `backend/` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Launch the Application**
   Open two terminal instances:
   ```bash
   # Terminal 1: Start Backend Server
   cd backend
   npm start

   # Terminal 2: Start Frontend Development Server
   cd frontend
   npm run dev
   ```

The application will be accessible at `http://localhost:5173`.

---

## 🛡️ Security & Authentication
The platform implements rigid Role-Based Access Control (RBAC) middleware:
- `protectUser`: Secures passenger routes (booking tickets, viewing history).
- `protectOperator`: Secures fleet management and trip scheduling.
- `admin`: Secures the platform owner's global financial views.

## 📄 License
This project is proprietary and built for demonstration of advanced SaaS capabilities.
