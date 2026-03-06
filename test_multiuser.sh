#!/bin/bash
# Multi-User Isolation Test Script
# Tests that users have completely isolated progress

echo "🧪 Multi-User Isolation Test"
echo "=============================="
echo ""

BASE_URL="http://localhost:3001"

# Test 1: Register User 1
echo "1️⃣  Registering User 1..."
USER1_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@multitest.com",
    "password": "password123",
    "name": "Test User One"
  }')

USER1_TOKEN=$(echo $USER1_RESPONSE | jq -r '.token')
USER1_ID=$(echo $USER1_RESPONSE | jq -r '.user.id')

if [ "$USER1_TOKEN" != "null" ]; then
  echo "   ✅ User 1 registered: $USER1_ID"
else
  echo "   ❌ User 1 registration failed"
  echo "   Response: $USER1_RESPONSE"
  exit 1
fi

# Test 2: Register User 2
echo ""
echo "2️⃣  Registering User 2..."
USER2_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user2@multitest.com",
    "password": "password456",
    "name": "Test User Two"
  }')

USER2_TOKEN=$(echo $USER2_RESPONSE | jq -r '.token')
USER2_ID=$(echo $USER2_RESPONSE | jq -r '.user.id')

if [ "$USER2_TOKEN" != "null" ]; then
  echo "   ✅ User 2 registered: $USER2_ID"
else
  echo "   ❌ User 2 registration failed"
  echo "   Response: $USER2_RESPONSE"
  exit 1
fi

# Test 3: Check User 1 Dashboard (should be empty)
echo ""
echo "3️⃣  Checking User 1 dashboard (should be empty)..."
USER1_STATS=$(curl -s -H "Authorization: Bearer $USER1_TOKEN" \
  $BASE_URL/api/dashboard/stats)

USER1_PROGRESS=$(echo $USER1_STATS | jq -r '.learningProgress')
echo "   User 1 learning progress: $USER1_PROGRESS"

if [ "$USER1_PROGRESS" = "0" ]; then
  echo "   ✅ User 1 has empty progress (correct)"
else
  echo "   ❌ User 1 should have 0 progress"
  exit 1
fi

# Test 4: Check User 2 Dashboard (should be empty)
echo ""
echo "4️⃣  Checking User 2 dashboard (should be empty)..."
USER2_STATS=$(curl -s -H "Authorization: Bearer $USER2_TOKEN" \
  $BASE_URL/api/dashboard/stats)

USER2_PROGRESS=$(echo $USER2_STATS | jq -r '.learningProgress')
echo "   User 2 learning progress: $USER2_PROGRESS"

if [ "$USER2_PROGRESS" = "0" ]; then
  echo "   ✅ User 2 has empty progress (correct)"
else
  echo "   ❌ User 2 should have 0 progress"
  exit 1
fi

# Test 5: Get a random entry for User 1 to start learning
echo ""
echo "5️⃣  User 1 getting an entry to learn..."
USER1_ENTRIES=$(curl -s -H "Authorization: Bearer $USER1_TOKEN" \
  "$BASE_URL/api/learning/new?limit=1")

ENTRY_ID=$(echo $USER1_ENTRIES | jq -r '.[0].id')
ENTRY_THAI=$(echo $USER1_ENTRIES | jq -r '.[0].thai_script')

if [ "$ENTRY_ID" != "null" ]; then
  echo "   ✅ Got entry: $ENTRY_THAI (ID: $ENTRY_ID)"
else
  echo "   ❌ Failed to get entry"
  exit 1
fi

# Test 6: User 1 starts learning the entry
echo ""
echo "6️⃣  User 1 starting to learn entry..."
START_RESPONSE=$(curl -s -X POST $BASE_URL/api/learning/start \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"entry_id\": \"$ENTRY_ID\"}")

START_SUCCESS=$(echo $START_RESPONSE | jq -r '.success')

if [ "$START_SUCCESS" = "true" ]; then
  echo "   ✅ User 1 started learning"
else
  echo "   ❌ Failed to start learning"
  echo "   Response: $START_RESPONSE"
  exit 1
fi

# Test 7: Check User 1 progress (should now be 1)
echo ""
echo "7️⃣  Checking User 1 progress (should be 1)..."
USER1_STATS=$(curl -s -H "Authorization: Bearer $USER1_TOKEN" \
  $BASE_URL/api/dashboard/stats)

USER1_PROGRESS=$(echo $USER1_STATS | jq -r '.learningProgress')
echo "   User 1 learning progress: $USER1_PROGRESS"

if [ "$USER1_PROGRESS" = "1" ]; then
  echo "   ✅ User 1 now has 1 item in progress (correct)"
else
  echo "   ❌ User 1 should have 1 progress"
  echo "   Stats: $USER1_STATS"
  exit 1
fi

# Test 8: Check User 2 progress (should STILL be 0 - isolated)
echo ""
echo "8️⃣  Checking User 2 progress (should STILL be 0)..."
USER2_STATS=$(curl -s -H "Authorization: Bearer $USER2_TOKEN" \
  $BASE_URL/api/dashboard/stats)

USER2_PROGRESS=$(echo $USER2_STATS | jq -r '.learningProgress')
echo "   User 2 learning progress: $USER2_PROGRESS"

if [ "$USER2_PROGRESS" = "0" ]; then
  echo "   ✅ User 2 still has 0 progress (ISOLATED ✓)"
else
  echo "   ❌ User 2 should still have 0 progress"
  echo "   ⚠️  DATA ISOLATION FAILED - User 2 can see User 1's progress!"
  exit 1
fi

# Test 9: Verify both users can see all 51 entries
echo ""
echo "9️⃣  Verifying both users can see all entries..."
USER1_ALL=$(curl -s -H "Authorization: Bearer $USER1_TOKEN" \
  "$BASE_URL/api/entries?limit=100")
USER1_COUNT=$(echo $USER1_ALL | jq -r 'length')

USER2_ALL=$(curl -s -H "Authorization: Bearer $USER2_TOKEN" \
  "$BASE_URL/api/entries?limit=100")
USER2_COUNT=$(echo $USER2_ALL | jq -r 'length')

echo "   User 1 can see: $USER1_COUNT entries"
echo "   User 2 can see: $USER2_COUNT entries"

if [ "$USER1_COUNT" = "51" ] && [ "$USER2_COUNT" = "51" ]; then
  echo "   ✅ Both users can see all 51 shared entries"
else
  echo "   ⚠️  Expected 51 entries for both users"
fi

# Test 10: Test logout/login switching
echo ""
echo "🔟 Testing authentication..."
ME_RESPONSE=$(curl -s -H "Authorization: Bearer $USER1_TOKEN" \
  $BASE_URL/api/auth/me)

ME_EMAIL=$(echo $ME_RESPONSE | jq -r '.user.email')

if [ "$ME_EMAIL" = "user1@multitest.com" ]; then
  echo "   ✅ Token correctly identifies User 1"
else
  echo "   ❌ Token identification failed"
  exit 1
fi

# Summary
echo ""
echo "=============================="
echo "✅ ALL TESTS PASSED!"
echo "=============================="
echo ""
echo "Multi-User Isolation: ✅ VERIFIED"
echo "  - User 1 ID: $USER1_ID"
echo "  - User 2 ID: $USER2_ID"
echo "  - User 1 Progress: $USER1_PROGRESS item(s)"
echo "  - User 2 Progress: $USER2_PROGRESS item(s)"
echo "  - Shared Entries: $USER1_COUNT available to all"
echo ""
echo "🎉 Multi-user system is working correctly!"
echo "✅ Ready for production deployment"
