# Admin Panel & Payment Integration Plan
**Version**: 1.8.0  
**Date**: March 11, 2026

---

## ✅ Phase 1: Admin User Management (COMPLETED TODAY)

### Features Implemented

#### 1. **Admin Panel Page**
- New `/admin` route accessible only to admin users
- Real-time user statistics dashboard
- Complete user management interface

#### 2. **User List Management**
- View all registered users with details:
  - Name and email
  - Account status (Active/Locked)
  - Subscription status (Trial/Active/Expired/Cancelled)
  - Registration date
  - Learning progress (entries and words learned)
  - Admin role badge

#### 3. **Account Lock/Unlock**
- One-click toggle to lock or unlock user accounts
- Locked users cannot log in
- Confirmation dialog before changing status
- Instant UI update after status change

#### 4. **Admin Statistics**
- Total users count
- Active users count
- Trial users count
- Paid users count
- Recent signups (last 7 days)
- Total content statistics

### Database Changes

**New columns added to `users` table:**
```sql
is_admin                 INTEGER DEFAULT 0
subscription_status      TEXT DEFAULT 'trial'
subscription_start_date  TIMESTAMP
subscription_end_date    TIMESTAMP
stripe_customer_id       TEXT
stripe_subscription_id   TEXT
```

### API Endpoints

#### GET `/api/admin/users`
- **Auth**: Admin only
- **Returns**: List of all users with stats
- **Response**:
```json
{
  "users": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2026-03-01T10:00:00Z",
      "last_login": "2026-03-11T15:30:00Z",
      "is_active": 1,
      "is_admin": 0,
      "subscription_status": "trial",
      "subscription_start_date": null,
      "subscription_end_date": null,
      "entries_count": 15,
      "progress_count": 8
    }
  ]
}
```

#### PATCH `/api/admin/users/:userId/toggle-active`
- **Auth**: Admin only
- **Action**: Toggle user's active status
- **Response**:
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "is_active": 0
  }
}
```

#### GET `/api/admin/stats`
- **Auth**: Admin only
- **Returns**: Admin statistics
- **Response**:
```json
{
  "users": {
    "total_users": 45,
    "active_users": 42,
    "locked_users": 3,
    "trial_users": 40,
    "paid_users": 5,
    "expired_users": 0
  },
  "recent_signups": 12,
  "content": {
    "total_entries": 352,
    "total_progress_records": 1250
  }
}
```

### Setting Up First Admin User

**Option 1: Via Database Console**
```sql
-- Replace with your email
UPDATE users 
SET is_admin = 1 
WHERE email = 'your-admin@email.com';
```

**Option 2: Via Migration**
```sql
-- In migration file
UPDATE users SET is_admin = 1 WHERE email = 'admin@yourdomain.com';
```

### Admin Access
1. Only users with `is_admin = 1` can access admin panel
2. Admin link only appears for admin users
3. All admin routes protected with `requireAdmin` middleware
4. Non-admin users get 403 Forbidden error

---

## 📋 Phase 2: Payment Integration (NEXT STEPS)

### Overview
- **Free Trial**: 10 days from registration
- **Payment**: After trial ends
- **Method**: Stripe subscription
- **Price**: TBD (e.g., $9.99/month or $99/year)

### Implementation Plan

#### Step 1: Stripe Setup (15-30 min)
1. Create Stripe account
2. Get API keys (test & live)
3. Create product in Stripe Dashboard
4. Create pricing plans:
   - Monthly: $9.99/month
   - Yearly: $99/year (2 months free)

#### Step 2: Backend Integration (2-3 hours)

**New API Endpoints:**

```typescript
// Create checkout session
POST /api/subscription/create-checkout
{
  "priceId": "price_xxx",
  "userId": "user-uuid"
}

// Handle Stripe webhook
POST /api/webhooks/stripe
// Handles: checkout.session.completed, customer.subscription.updated, etc.

// Get subscription status
GET /api/subscription/status
// Returns current user's subscription details

// Cancel subscription
POST /api/subscription/cancel
// User-initiated cancellation

// Reactivate subscription
POST /api/subscription/reactivate
```

**New Environment Variables:**
```bash
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_MONTHLY_PRICE_ID=price_xxx
STRIPE_YEARLY_PRICE_ID=price_xxx
```

#### Step 3: Frontend Changes (2-3 hours)

**New UI Components:**
1. **Trial Banner** - Shows days remaining
2. **Subscription Page** - Pricing plans and payment
3. **Payment Modal** - Stripe Checkout integration
4. **Billing Settings** - Manage subscription

**Trial Expiration Logic:**
```javascript
// Check on every login/page load
function checkSubscriptionStatus() {
  const user = getCurrentUser();
  
  if (user.subscription_status === 'trial') {
    const daysLeft = calculateDaysLeft(user.created_at, 10);
    
    if (daysLeft <= 0) {
      // Trial expired - show payment required
      showPaymentRequiredModal();
    } else if (daysLeft <= 3) {
      // Trial ending soon - show warning
      showTrialExpiringBanner(daysLeft);
    }
  } else if (user.subscription_status === 'expired') {
    // Subscription expired - block access
    showPaymentRequiredModal();
  }
}
```

#### Step 4: Subscription Flow

**New User Registration:**
```javascript
1. User signs up
2. subscription_status = 'trial'
3. subscription_start_date = NOW()
4. subscription_end_date = NOW() + 10 days
5. Show welcome message with trial info
```

**Trial Expiration:**
```javascript
1. Day 10: Trial expires
2. subscription_status = 'expired'
3. User can only view payment page
4. All other features locked
```

**Payment Success:**
```javascript
1. User completes payment via Stripe
2. Webhook received: checkout.session.completed
3. Update user:
   - subscription_status = 'active'
   - stripe_customer_id = xxx
   - stripe_subscription_id = xxx
   - subscription_end_date = next billing date
4. Send confirmation email
5. Unlock all features
```

#### Step 5: Stripe Webhook Handler

```typescript
app.post('/api/webhooks/stripe', async (c) => {
  const sig = c.req.header('stripe-signature')
  const body = await c.req.text()
  
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    return c.json({ error: 'Webhook signature verification failed' }, 400)
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      // User completed payment
      await activateSubscription(event.data.object)
      break
      
    case 'customer.subscription.updated':
      // Subscription changed (upgrade/downgrade)
      await updateSubscription(event.data.object)
      break
      
    case 'customer.subscription.deleted':
      // Subscription cancelled
      await deactivateSubscription(event.data.object)
      break
      
    case 'invoice.payment_failed':
      // Payment failed
      await handlePaymentFailure(event.data.object)
      break
  }
  
  return c.json({ received: true })
})
```

#### Step 6: Admin Enhancements

**Additional Admin Features:**
- View revenue statistics
- Manually grant/extend subscriptions
- View payment history
- Export user data for accounting
- Send email notifications

---

## 💰 Pricing Strategy Recommendations

### Option 1: Monthly Only
- **$9.99/month**
- Simple, low commitment
- Easy to get started

### Option 2: Monthly + Yearly (Recommended)
- **$9.99/month** ($119.88/year)
- **$99/year** (save $20.88, ~17% off)
- Encourages annual subscriptions
- Better cash flow

### Option 3: Tiered Pricing
- **Basic**: $4.99/month - 100 words/month
- **Pro**: $9.99/month - Unlimited words
- **Lifetime**: $199 - One-time payment

---

## 🔒 Access Control During Trial/Expiration

### Active Features (Free Trial):
- ✅ Dashboard
- ✅ Browse entries (limited to 50)
- ✅ Learn mode (limited to 10/day)
- ✅ Review mode
- ✅ Driving mode (limited to 20 min/day)
- ✅ Progress tracking

### Locked Features (Trial Expired):
- ❌ Cannot add new entries
- ❌ Cannot access learning modes
- ❌ Can only view payment page
- ✅ Can still access account settings
- ✅ Can export progress data

---

## 📊 Implementation Checklist

### Phase 1: Admin Panel ✅ DONE
- [x] Database migration for admin fields
- [x] Admin API endpoints
- [x] Admin middleware
- [x] Admin panel UI
- [x] User list with stats
- [x] Lock/unlock functionality
- [x] Admin statistics

### Phase 2: Payment Integration (Next)
- [ ] Stripe account setup
- [ ] Create products and pricing
- [ ] Add Stripe SDK to backend
- [ ] Implement checkout endpoint
- [ ] Implement webhook handler
- [ ] Add subscription status checks
- [ ] Create payment UI
- [ ] Add trial expiration logic
- [ ] Test payment flow
- [ ] Deploy to production

### Phase 3: Email Notifications (Optional)
- [ ] Welcome email
- [ ] Trial expiring warning (day 7)
- [ ] Trial expired notice
- [ ] Payment successful
- [ ] Payment failed
- [ ] Subscription cancelled

---

## 🚀 Quick Start Guide

### For Admins

**1. Set yourself as admin:**
```sql
UPDATE users SET is_admin = 1 WHERE email = 'your@email.com';
```

**2. Access admin panel:**
- Log in to the app
- You'll see "Admin" link in navigation
- Click to view admin panel

**3. Manage users:**
- View all registered users
- Lock/unlock accounts with one click
- Monitor subscription status

### For Developers

**1. Run migration:**
```bash
npx wrangler d1 migrations apply thai-learning --remote
```

**2. Test admin features:**
```bash
# Set your user as admin in database
# Then visit /admin page
```

**3. Next: Stripe integration**
```bash
npm install stripe
# Add STRIPE_SECRET_KEY to .env
# Follow Phase 2 implementation plan
```

---

## 📈 Expected Benefits

### Revenue Projection (Example)
- 100 users @ $9.99/month = $999/month
- 25% annual subscribers @ $99/year = $2,475/year
- **Annual revenue**: ~$14,463

### Cost Analysis
- Cloudflare Pages: $0-5/month (generous free tier)
- Neon Database: $0-19/month (free tier)
- Stripe fees: 2.9% + $0.30 per transaction
- **Net profit**: ~95% of revenue

---

## 🎯 Success Metrics

### Track These KPIs:
1. **Conversion rate**: Trial → Paid (target: 20-30%)
2. **Churn rate**: Monthly cancellations (target: <5%)
3. **LTV**: Customer lifetime value
4. **CAC**: Customer acquisition cost
5. **MRR**: Monthly recurring revenue
6. **ARR**: Annual recurring revenue

---

## 🛡️ Security Considerations

1. **Admin access**: Only grant to trusted users
2. **Stripe keys**: Keep secret, never commit to git
3. **Webhook signature**: Always verify
4. **PCI compliance**: Use Stripe Checkout (handles all card data)
5. **Data privacy**: Follow GDPR/CCPA if applicable

---

## ✅ Summary

**Phase 1 (Today)**: ✅ COMPLETE
- Admin panel fully functional
- User management working
- Lock/unlock accounts operational
- Ready for user testing

**Phase 2 (Next)**:
- Stripe integration (2-4 hours dev time)
- Payment flow implementation
- Trial/subscription logic
- Email notifications (optional)
- Ready for production revenue

---

**Estimated Timeline:**
- Phase 1: ✅ Complete (3 hours)
- Phase 2: 1-2 days development + testing
- Total: Ready to accept payments in 2-3 days

**Need help with Phase 2?** Let me know when you're ready to implement Stripe!
