# SlotSwapper

SlotSwapper is a web application that allows users to manage their calendar events and swap time slots with other users. It features user authentication, event management, and a marketplace for swappable slots.

## Features
- User authentication (signup, login, JWT-based authorization)
- Event management (create, update, and view events)
- Marketplace for swappable slots
- Notifications for incoming and outgoing swap requests

## Local Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the `.env` file in the `backend` directory with your MongoDB connection string:
   ```env
   MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/slot-swapper?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:5173`

## API Endpoints

| Method | Endpoint                     | Description                                      | Request Body                          |
|--------|------------------------------|--------------------------------------------------|---------------------------------------|
| POST   | /api/auth/signup             | Create a new user                               | `{ name, email, password }`          |
| POST   | /api/auth/login              | Authenticate user and return JWT                | `{ email, password }`                |
| GET    | /api/events                  | Fetch all events for the authenticated user     | None                                  |
| POST   | /api/events                  | Create a new event                              | `{ title, startTime, endTime }`      |
| PUT    | /api/events/:id              | Update an event (e.g., make it swappable)       | `{ status }`                         |
| GET    | /api/swappable-slots         | Fetch all swappable slots                       | None                                  |
| POST   | /api/swap-request            | Create a swap request                           | `{ mySlotId, theirSlotId }`          |
| POST   | /api/swap-response/:requestId| Respond to a swap request (accept/reject)       | `{ accepted: true/false }`           |

## Deployment

### Frontend
Deploy the frontend to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/):
1. Connect your GitHub repository.
2. Select the `frontend` directory as the root.
3. Deploy the application.

### Backend
Deploy the backend to [Render](https://render.com/):
1. Create a new web service.
2. Connect your GitHub repository.
3. Add environment variables (`MONGO_URI`, `JWT_SECRET`, `PORT`).
4. Deploy the application.