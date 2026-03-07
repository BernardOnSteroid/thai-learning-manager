#!/bin/bash
set -e

echo "🚀 Deploying Thai Learning Manager v1.5.0 to Cloudflare Pages"
echo ""

# Use the correct account ID
ACCOUNT_ID="1a27f217b48b91817acfba9a30f8c125"
PROJECT_NAME="thai-learning"

echo "📦 Building project..."
npm run build

echo ""
echo "📤 Deploying to Cloudflare Pages..."
echo "   Account: $ACCOUNT_ID"
echo "   Project: $PROJECT_NAME"
echo ""

# Deploy with explicit account ID
npx wrangler pages deploy dist \
  --project-name="$PROJECT_NAME" \
  --branch=main \
  --commit-dirty=true

echo ""
echo "✅ Deployment complete!"
echo "🌐 Check: https://thai.collin.cc"
