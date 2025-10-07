
# DuelCode - Real-Time Coding Battle Platform

![GitHub repo size](https://img.shields.io/github/repo-size/Yoshwa006/duelcode)
![GitHub stars](https://img.shields.io/github/stars/Yoshwa006/duelcode)
![GitHub forks](https://img.shields.io/github/forks/Yoshwa006/duelcode)
![GitHub issues](https://img.shields.io/github/issues/Yoshwa006/duelcode)
![MIT license](https://img.shields.io/github/license/Yoshwa006/duelcode)
![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)

A platform where users can complete coding problems and also start a 1 vs 1 duel battle with their friends.

---

## Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)
- [License](#license)

## About
DuelCode is a real-time competitive coding platform where two users can battle 1v1.  
Users can generate a session token, invite another user, and solve the same coding problem simultaneously. The first to solve the problem correctly wins the match.

## Features
- Real-time code collaboration and competition
- 1v1 coding battles using session tokens
- Multiple programming languages supported
- Code execution using Judge0 API
- Leaderboard to track top players
- Authentication with JWT and role-based access
- Microservices architecture with Spring Boot

## Tech Stack
**Backend:** Java, Spring Boot, Spring Security (JWT, RBAC), MySQL, MongoDB, Apache Kafka, Redis  
**Frontend:** React.js, Vite, JavaScript, CSS  
**Other:** Docker, Git, Postman  

## Setup & Installation

1. Clone the repository:
   ```
   git clone https://github.com/Yoshwa006/duelcode.git
   cd duelcode
   ```

2. **Backend:**
   ```
   cd backend
   ./mvnw spring-boot:run
   ```
   Make sure MySQL and MongoDB are running locally and configured in `application.properties`.

3. **Frontend:**
   ```
   cd frontend
   npm install
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) (or the port shown) in your browser.

## Usage

1. Register and log in to the platform.
2. Generate a session token for a coding battle.
3. Share the token with a friend.
4. Both users are redirected to a shared coding problem.
5. Write code in the editor and submit your solution.
6. The first user to solve the problem correctly wins.
7. Check the leaderboard to track top players.



## Future Improvements
- Add more coding challenges and difficulty levels
- Integrate chat functionality during battles
- Notifications for incoming battle invites
- Enhance leaderboard with weekly/monthly stats
- Add profile customization and achievements

## License
This project is licensed under the MIT License.

Built and maintained by Yoshwa.
```

