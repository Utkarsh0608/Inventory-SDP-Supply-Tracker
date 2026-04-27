# Inventory & SDP Supply Tracker

A full-stack application for managing inventory, supply requests, and service delivery point (SDP) workflows.

## Overview

- **Backend:** FastAPI + SQLAlchemy + PostgreSQL
- **Frontend:** React + Vite + Tailwind CSS
- **Auth:** JWT-based role system for Admin and SDP users
- **Features:** inventory tracking, low-stock alerting, request management, role-based dashboard views

## Repository Structure

- `backend/`
  - `app/` - FastAPI application code
    - `main.py` - API entrypoint
    - `database.py` - SQLAlchemy database configuration
    - `models/` - ORM models for users, inventory, requests
    - `routes/` - API routers for auth, inventory, requests
    - `schemas/` - Pydantic validation models
    - `services/` - helper services such as email alerts
    - `utils/` - authentication utilities
  - `requirements.txt` - Python dependency list
  - `create_tables.py` - creates database tables and ensures schema columns
  - `setup_database.py` - creates the PostgreSQL database if needed
  - `.env` - local environment configuration

- `frontend/`
  - `src/` - React application source files
  - `package.json` - frontend package manifest
  - `vite.config.js` - Vite configuration
  - `tailwind.config.js` - Tailwind configuration

## Built With

- Python 3.x
- FastAPI
- SQLAlchemy
- PostgreSQL
- React
- Vite
- Tailwind CSS
- Recharts
- Axios
- react-router-dom

## Setup Instructions

### 1. Backend Setup

1. Change to the backend folder:

```powershell
cd backend
```

2. Create and activate a virtual environment (recommended):

```powershell
python -m venv backend_venv
.\backend_venv\Scripts\Activate.ps1
```

3. Install dependencies:

```powershell
pip install -r requirements.txt
```

4. Configure environment variables:

- Update `backend/.env` with your PostgreSQL credentials and JWT settings.
- Ensure `DATABASE_URL` points to a valid PostgreSQL database.

5. Create the database if needed:

```powershell
python setup_database.py
```

6. Create database tables:

```powershell
python create_tables.py
```

7. Run the backend API:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

### 2. Frontend Setup

1. Change to the frontend folder:

```powershell
cd ..\frontend
```

2. Install dependencies:

```powershell
npm install
```

3. Start the frontend development server:

```powershell
npm run dev
```

4. Open the provided local URL in your browser.

## Features

- Role-based dashboards for Admin and SDP users
- Inventory item listing, low-stock indication, and threshold management
- Request submission and approval workflow
- Authentication and user session handling
- Responsive dashboard layout and analytics charts

## Routes

- `GET /` - API status check
- `GET /health` - health check endpoint
- Auth routes under `/auth`
- Inventory routes under `/inventory`
- Request routes under `/requests`

## Notes

- The backend currently allows all CORS origins for development.
- `backend/.env` contains sensitive values and should be kept private.
- If you want to deploy, update the CORS settings and secure the secret key.

## Quick Start

```powershell
cd backend
python -m venv backend_venv
.\backend_venv\Scripts\Activate.ps1
pip install -r requirements.txt
python setup_database.py
python create_tables.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

## License

This repository does not include a license file. Add one if you want to share or publish publicly.
