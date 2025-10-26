#!/bin/bash

echo "Starting Get to Know Game - Local Development"
echo

echo "Starting MongoDB..."
docker-compose -f docker-compose.dev.yml up -d mongodb

echo "Waiting for MongoDB to be ready..."
sleep 10

echo "Starting Backend..."
docker-compose -f docker-compose.dev.yml up -d backend

echo "Waiting for Backend to be ready..."
sleep 15

echo "Starting Frontend..."
cd src/frontend/get-to-know-game
npm install
npm run dev

echo
echo "Application is starting up!"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:5012"
echo "Admin Dashboard: http://localhost:5173/admin"
echo
echo "Press Ctrl+C to stop all services"
