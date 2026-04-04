# DuelCode

A real-time competitive coding battle platform where users can solve coding problems and compete in 1v1 battles.

## Overview

DuelCode is a full-stack competitive programming platform inspired by Codeforces. Users can:
- Solve coding problems individually
- Create and join 1v1 battles with friends
- Compete in real-time code duels
- Build their profiles with stats and rankings
- Connect with other users via friend system

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Backend | Spring Boot (Java) |
| Database | MySQL, Redis |
| Code Execution | Judge0 API (via Node.js service) |
| Real-time | WebSocket (STOMP) |
| Auth | JWT |

## Quick Start (Docker)

```bash
cd duelcode
docker-compose up -d
```

Services:
- Frontend: http://localhost
- Backend API: http://localhost:8080
- Judge Service: http://localhost:3001
- MySQL: localhost:3306
- Redis: localhost:6379

## Quick Start (Manual)

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Node Backend (Judge):**
```bash
cd node_backend
npm install
node src/judge.js
```

## Features

### Core
- User authentication (JWT)
- Problem management (CRUD)
- Code execution with multiple language support
- Real-time 1v1 battles with WebSocket
- Session management (create/join/cancel/surrender)

### Social
- User profiles with stats
- Friend system (send/accept/reject requests)
- User directory with search & filtering
- Comments on problems

### UI
- Codeforces-inspired theme
- Monaco code editor with syntax highlighting
- Multi-language support with starter templates
- File upload for code submission

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/auth/*` | Authentication |
| `/api/questions` | Problems |
| `/api/match/*` | Battle sessions |
| `/api/users` | User management |
| `/api/friends` | Friend system |
| `/api/submit` | Code submission |

## Project Structure

```
duelcode/
├── backend/           # Spring Boot API
│   ├── src/main/java/com/example/comp/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── model/
│   │   ├── dto/
│   │   └── config/
│   └── pom.xml
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── service/
│   └── package.json
├── node_backend/       # Judge0 service
│   └── src/judge.js
└── docker-compose.yml
```

## Configuration

Environment variables (`.env`):
- `MYSQL_*` - Database credentials
- `JWT_SECRET` - Token signing key
- `VITE_API_URL` - Backend URL
- `VITE_WS_URL` - WebSocket URL

## License

MIT