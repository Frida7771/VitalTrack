# VitalTrack

A personal health management system for tracking and monitoring health data.

## Tech Stack

### Backend
- **Framework**: ASP.NET Core 8.0
- **ORM**: Entity Framework Core
- **Database**: MySQL
- **Authentication**: JWT Bearer Authentication

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Ant Design
- **Routing**: React Router

## Features

- **User Management**: Registration, login, profile management
- **Health Records**: Track weight, blood pressure, heart rate, and more
- **Health Evaluation**: Health status assessment based on configurable models
- **Notifications**: System messages and health reminders
- **Data Visualization**: Charts and graphs for health metrics

## Getting Started

### Backend

1. Configure database connection

Edit `backend/VitalTrack.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=vital_track;User=root;Password=your-password;"
  }
}
```

2. Run the backend

```bash
cd backend
dotnet restore
dotnet run --project VitalTrack.Api
```

The backend will start at `http://localhost:21090`.

### Frontend

1. Install dependencies

```bash
cd frontend
npm install
```

2. Run the frontend

```bash
npm run dev
```

The frontend will start at `http://localhost:5173`.

## API Documentation

After starting the backend, access Swagger docs at:

```
http://localhost:21090/swagger
```


