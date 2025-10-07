# DuelCode - Real-Time Coding Battle Platform

A platform where user can complete coding problems and also start a 1 vs 1 duel battle with their friends.


## Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Future Improvements](#future-improvements)
- [License](#license)

## About
DuelCode is a real-time competitive coding platform where two users can battle 1v1. 
Users can generate a session token, invite another user, and solve the same coding problem 
simultaneously. The first to solve the problem correctly wins the match.

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
   ```bash
   git clone https://github.com/Yoshwa006/duelcode.git
   cd duelcode

