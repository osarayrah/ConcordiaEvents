# Concordia Events Prototype

A lightweight full-stack prototype for `CampusHub`, a Concordia University event discovery app.

## Overview

This prototype is designed to help students discover campus events in one place instead of searching across Instagram, Discord, email, and posters.

The experience focuses on:

- event discovery
- personalized recommendations
- social coordination with friends
- lightweight event creation for student clubs and organizers

## Screens Included

- Splash screen
- Login / signup
- Interest selection
- Home feed
- Search and filters
- Event details
- Friends attending / social coordination
- Saved events
- Notifications
- Profile
- Create event

## Prototype Features

- iPhone-style device frame
- Concordia-inspired color palette
- Scrollable in-phone experience
- Clickable navigation between screens
- Working filters
- Save and join interactions
- Event creation flow that saves new events through a backend API
- Node.js backend that serves the frontend and exposes event endpoints
- JSON-backed event persistence for local development

## Project Files

- [index.html](./index.html): main prototype shell
- [styles.css](./styles.css): UI styling and iPhone frame
- [app.js](./app.js): frontend UI, navigation, API fetching, and interactions
- [server.js](./server.js): Node HTTP server and backend API
- [data/events.json](./data/events.json): persisted event data for the backend

## How to Run

1. Start the server:

```bash
npm start
```

2. Open `http://localhost:3000` in a browser.

## API Endpoints

- `GET /api/health`: backend health check
- `GET /api/events`: fetch all events
- `POST /api/events`: create a new event

## GitHub

Repository: `https://github.com/osarayrah/ConcordiaEvents`
