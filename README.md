# BusSaaS - Next-Gen Bus Booking & Fleet Management Platform

![BusSaaS Banner](frontend/public/premium_luxury_bus_hero_night.png)

BusSaaS is a modern, high-performance Software-as-a-Service (SaaS) platform built for bus operators and passengers. It serves as a centralized hub where transport companies can manage their entire fleet, schedule trips, track vehicles via GPS, and passengers can seamlessly book seats through a beautifully designed, responsive interface.

## 🌟 Key Features

### For Passengers:
- **Interactive Seat Selection**: Visual map of the bus layout allowing users to pick their exact seats.
- **Dynamic Search Engine**: Filter trips by AC/Non-AC, Sleeper, and Morning/Night departures.
- **Real-Time GPS Tracking**: Track the bus live on a map before boarding.
- **Dark/Light Mode**: Stunning, glassmorphic UI that automatically adapts to system preferences.
- **PDF Ticket Generation**: Instant ticket generation and downloading upon successful booking.

### For Bus Operators:
- **Fleet Management**: Add, edit, and maintain details of all buses in the fleet.
- **Trip Scheduler**: Advanced calendar and route manager to assign buses to specific journeys.
- **Driver Management**: Register drivers, track their license details, and assign them to active trips.
- **Financial Analytics**: Real-time charts showing commission, gross revenue, and monthly ticket sales.
- **Passenger Manifests**: Print out detailed boarding lists for conductors.

### For Super Admins (Platform Owners):
- **Global Overview**: Track total platform revenue, fleet size, and passenger volume.
- **Operator Tracking**: Monitor which operators are performing best and manage platform commission (e.g., 5% cut).

## 💻 Tech Stack
- **Frontend**: React (Vite), TailwindCSS, Recharts (Analytics), Lucide React (Icons)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB & Mongoose
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally or a MongoDB Atlas URI

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/your-username/bus-booking-saas.git
cd bus-booking-saas
\`\`\`

2. Install dependencies for both backend and frontend
\`\`\`bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
\`\`\`

3. Environment Variables
Create a \`.env\` file in the \`backend\` directory and add:
\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
\`\`\`

4. Run the application
\`\`\`bash
# Run backend (from /backend)
npm start

# Run frontend (from /frontend)
npm run dev
\`\`\`

## 🛡️ License
This project is licensed under the MIT License.
