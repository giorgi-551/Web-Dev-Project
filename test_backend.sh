#!/bin/bash

# ===========================
# Step 1: Login to get JWT
# ===========================
echo "1️⃣ Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}')

# Extract token from response
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" == "null" ]; then
  echo "❌ Login failed. Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Logged in. Token: $TOKEN"

# ===========================
# Step 2: List all users
# ===========================
echo -e "\n2️⃣ Fetching all users..."
sudo curl -s http://localhost:4000/api/users \
  -H "Authorization: Bearer $TOKEN" | jq

# ===========================
# Step 3: List all events
# ===========================
echo -e "\n3️⃣ Fetching all events..."
EVENTS_RESPONSE=$(curl -s http://localhost:4000/api/events \
  -H "Authorization: Bearer $TOKEN" | jq)

echo $EVENTS_RESPONSE

# Extract first event id for registration
EVENT_ID=$(echo $EVENTS_RESPONSE | jq -r '.[0].id')
TICKET_ID=$(echo $EVENTS_RESPONSE | jq -r '.[0].tickets[0].id')

if [ -z "$EVENT_ID" ] || [ "$EVENT_ID" == "null" ]; then
  echo "❌ No events found to register."
  exit 1
fi

echo "✅ Using Event ID: $EVENT_ID"
echo "✅ Using Ticket ID: $TICKET_ID"

# ===========================
# Step 4: Register for event
# ===========================
echo -e "\n4️⃣ Registering for the event..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:4000/api/registrations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"eventId\":\"$EVENT_ID\",\"ticketId\":\"$TICKET_ID\"}")

echo $REGISTER_RESPONSE | jq

# ===========================
# Step 5: List my registrations
# ===========================
echo -e "\n5️⃣ Fetching my registrations..."
curl -s http://localhost:4000/api/registrations \
  -H "Authorization: Bearer $TOKEN" | jq

# ===========================
# Step 6: Optional - simulate payment
# ===========================
# If you have Stripe configured, you can simulate a payment:
# PAY_RESPONSE=$(curl -s -X POST http://localhost:4000/api/payments \
#   -H "Authorization: Bearer $TOKEN" \
#   -H "Content-Type: application/json" \
#   -d "{\"registrationId\":\"<REGISTRATION_ID>\",\"amount\":49.99}")
# echo $PAY_RESPONSE | jq

echo -e "\n✅ Backend test completed!"
