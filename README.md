# User Onboarding System

A full-stack user onboarding system built with Next.js and .NET Core Web API.

## Features

- Multi-step onboarding form with progress tracking
- Account verification (mobile and email)
- eKYC submission
- Company details collection
- Director details collection
- Admin panel for submission review
- JWT-based authentication
- SQL Server database

## Tech Stack

### Frontend
- Next.js 13+ (App Router)
- Ant Design
- Redux Toolkit + RTK Query
- TypeScript

### Backend
- .NET Core 7 Web API
- Entity Framework Core
- SQL Server
- JWT Authentication

## Prerequisites

- Node.js 16+
- .NET 7 SDK
- SQL Server (LocalDB or full instance)
- Visual Studio 2022 or VS Code

## Setup

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at http://localhost:3000

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Update the connection string in `appsettings.json` if needed

3. Run the database migrations:
   ```bash
   dotnet ef database update
   ```

4. Start the API:
   ```bash
   dotnet run
   ```

The API will be available at http://localhost:5000

## API Endpoints

### Account Verification
- POST /api/account/verify-mobile
- POST /api/account/verify-email

### eKYC
- POST /api/ekyc

### Company Details
- POST /api/company-details

### Director Details
- POST /api/director-details

### Admin
- POST /api/admin/login
- GET /api/admin/submissions
- POST /api/admin/submission/{id}/approve
- POST /api/admin/submission/{id}/reject

## Development

### Frontend Structure
```
frontend/
├── app/
│   ├── onboarding/
│   │   └── page.tsx
│   └── layout.tsx
├── components/
│   └── onboarding/
│       ├── AccountVerification.tsx
│       ├── EKYCForm.tsx
│       ├── CompanyDetailsForm.tsx
│       ├── DirectorDetailsForm.tsx
│       └── Confirmation.tsx
└── store/
    ├── index.ts
    ├── slices/
    │   └── authSlice.ts
    └── services/
        └── onboardingApi.ts
```

### Backend Structure
```
backend/
├── UserOnboarding.API/
│   ├── Controllers/
│   │   ├── AccountController.cs
│   │   └── AdminController.cs
│   ├── Models/
│   │   ├── User.cs
│   │   ├── EKYC.cs
│   │   ├── CompanyDetails.cs
│   │   ├── DirectorDetails.cs
│   │   ├── SubmissionStatus.cs
│   │   └── Admin.cs
│   ├── Data/
│   │   └── ApplicationDbContext.cs
│   └── Program.cs
```

## Security

- JWT tokens are used for admin authentication
- Passwords are hashed using BCrypt
- CORS is configured to allow only the frontend origin
- Input validation is implemented on both frontend and backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 