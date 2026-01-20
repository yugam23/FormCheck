# Implementation Plan - Start Frontend & Backend

This plan outlines the steps to start the FastAPI backend and the Vite frontend for the FormCheck application.

## Goal: Start both backend and frontend servers.

## Components:
### Backend
- Directory: `c:/Users/yugam/Desktop/FormCheck/backend`
- Command: `.\.env\Scripts\python.exe main.py`
- Description: Starts the FastAPI server with WebSocket support for real-time pose estimation.

### Frontend
- Directory: `c:/Users/yugam/Desktop/FormCheck/frontend`
- Command: `npm run dev`
- Description: Starts the Vite development server for the React application.

## Verification Strategy:
- Check terminal output for successful startup messages.
- Verify backend health endpoint: `http://localhost:8000/health`.
- Verify frontend is accessible (usually `http://localhost:5173`).
