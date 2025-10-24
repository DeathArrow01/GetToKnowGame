#!/bin/bash

# Test script for Go backend API
BASE_URL="http://localhost:5012"

echo "Testing Go Backend API..."
echo "=========================="

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s "$BASE_URL/health" | jq .
echo ""

# Test questions endpoint
echo "2. Testing questions endpoint..."
curl -s "$BASE_URL/api/questions" | jq .
echo ""

# Test creating a session
echo "3. Testing session creation..."
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/sessions" \
  -H "Content-Type: application/json" \
  -d '{"player1Name": "Alice", "player2Name": "Bob"}')
echo "$SESSION_RESPONSE" | jq .

# Extract session ID
SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.sessionId')
echo "Session ID: $SESSION_ID"
echo ""

# Test getting session
echo "4. Testing get session..."
curl -s "$BASE_URL/api/sessions/$SESSION_ID" | jq .
echo ""

echo "API tests completed!"
