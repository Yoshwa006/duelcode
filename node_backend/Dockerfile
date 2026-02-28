FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# 👇 move working directory
WORKDIR /app/src

EXPOSE 3001

CMD ["node", "judge.js"]

