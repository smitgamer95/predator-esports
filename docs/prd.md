# Requirements Document

## 1. Application Overview

### 1.1 Application Name
Predator E-Sports

### 1.2 Application Description
A production-ready esports tournament management website featuring user authentication, tournament registration with payment verification, admin management system, and result display. The platform supports Google login and email-based registration with OTP verification, enabling players to join tournaments and admins to manage the entire tournament lifecycle.

## 2. Users and Usage Scenarios

### 2.1 Target Users
- Players: Esports enthusiasts who want to participate in Free Fire tournaments
- Administrators: Platform managers who create and manage tournaments, verify payments, and publish results

### 2.2 Core Usage Scenarios
- Players register/login, browse available tournaments, pay entry fees, upload payment screenshots, and view results
- Admins create tournaments, manage user accounts, verify payment screenshots, publish winners, and configure platform settings

## 3. Page Structure and Functionality

### 3.1 Page Structure
```
Predator E-Sports Website
├── Home Page
├── Login Page
├── Register Page
├── User Profile Page
├── Tournament List Page
├── Tournament Detail Page
├── Admin Login Page (hidden)
├── Admin Dashboard
│   ├── Tournament Management
│   ├── User Management
│   ├── Payment Verification
│   ├── Result Management
│   └── Settings
├── Privacy Policy Page
└── Terms & Conditions Page
```

### 3.2 Home Page
- Display platform logo (left side of header)
- Hamburger menu (right side of header) with navigation links: Home, Tournaments, Profile (if logged in), Logout
- Background: Subtle animated text FREE FIRE with glow edges (low opacity)
- Footer: © 2026 Predator E-Sports (double tap to open admin login)
- Theme: Black + Blue + White color scheme
- Login/Register button for unauthenticated users
- Tournament list preview for authenticated users

### 3.3 Login Page
**Google Login (Primary Method)**
- Button: Sign in with Google (full width, top position, visible on all screen sizes)
- Trigger Supabase OAuth: supabase.auth.signInWithOAuth({provider: google})
- On success:
  - Fetch user: supabase.auth.getUser()
  - Check if profile exists
  - If profile NOT exists: redirect to /profile-setup
  - If profile exists: redirect to /tournaments
- On error: display Google login failed message

**Email Login**
- Input fields: Email, Password
- Button: Login
- Logic:
  - If user exists and password correct: login and redirect to tournament list
  - If user does not exist: redirect to register page
  - If password incorrect: display Invalid credentials message

### 3.4 Register Page
**Google Login Button**
- Button: Sign in with Google (full width, top position, visible on all screen sizes)
- Same logic as login page

**Step 1: Email Check**
- Input field: Email
- Button: Continue
- Logic:
  - Check if email exists in database
  - If exists: display Account already exists, redirect to login
  - If not exists: proceed to OTP verification

**Step 2: OTP Verification**
- Generate 6-digit OTP: Math.floor(100000 + Math.random() * 900000)
- Store in otp_verification table (email, otp, expires_at: 5 minutes)
- Send OTP via EmailJS:
  - Service ID: service_t5ze169
  - Template ID: template_6f3clm6
  - Public Key: WfDRrTYlq3oH0xMfyxnYU
  - Parameters: {to_email: email, otp: otp}
- Backend MUST NOT return OTP in response JSON
- Frontend MUST NOT receive OTP
- Display: OTP sent to your email
- Input field: Enter OTP
- Button: Verify
- Logic:
  - Match OTP with database
  - Check expiry time
  - If valid: proceed to registration form
  - If invalid: display Invalid or expired OTP
  - If EmailJS fails: allow manual registration (fallback)

**Step 3: Registration Form**
- Input fields: Email (pre-filled), Password, Confirm Password
- Button: Register
- On success: create user account and redirect to user profile page

### 3.5 User Profile Page
**Mandatory Profile Completion (First Login)**
- Input fields:
  - Name (required)
  - Phone (required)
  - Game Name (required)
  - UID (required)
  - Avatar (optional, file upload)
- Button: Save Profile
- Store data in user profile table
- After completion: redirect to tournament list page

**Profile View/Edit (Subsequent Visits)**
- Display current profile information
- Button: Edit Profile (allows updating all fields)
- Button: Logout

### 3.6 Tournament List Page
- Display all active tournaments in card format
- Each card shows:
  - Tournament name
  - Entry fee
  - Mode (Solo/Duo/Squad)
  - Prize pool (1st, 2nd, 3rd)
  - Button: View Details
- Filter options: All, Solo, Duo, Squad

### 3.7 Tournament Detail Page
- Display tournament information:
  - Name
  - Entry fee
  - Mode
  - Prize distribution
  - Registered players count
- Button: Join Tournament

**Join Tournament Flow**
- Before joining: check if profile is complete
  - If profile incomplete: redirect to /profile, show Complete profile first
- Click Join Tournament
- Fetch UPI ID from admin settings
  - If UPI ID empty: disable Join button, show Payment not configured
- Display payment information:
  - Entry fee amount
  - UPI ID (dynamically fetched from admin settings)
- Button: PAY NOW
  - Redirect to: window.location.href = `upi://pay?pa=${upi_id}&pn=Predator%20Esports`
- After payment:
  - Display: Already Paid? Upload Screenshot
  - File upload field (required)
  - Button: Submit
- On submit: store registration with pending status
- Display: Payment verification pending message

**Registration Status Display**
- Show current status: Pending / Approved / Rejected
- If approved: display tournament details and schedule
- If rejected: display rejection reason

### 3.8 Admin Login Page (Hidden)
- Access method: Double tap footer text © 2026 Predator E-Sports
  - Double tap detection logic:
    ```
    let tapCount = 0
    onFooterClick:
      tapCount++
      setTimeout(() => tapCount = 0, 300)
      if tapCount === 2:
        redirect to /admin-login
    ```
- Input fields: Email, Password
- Button: Admin Login
- Logic:
  - Check if email matches ADMIN_EMAIL (admin@predator.com)
  - Verify password matches ADMIN_PASSWORD (#Predator@2026!)
  - If correct:
    - Login user normally
    - UPSERT user_roles table: set role = admin for current user
    - Redirect to admin dashboard
  - If incorrect: display Invalid admin credentials

### 3.9 Admin Dashboard
**Navigation Menu**
- Tournament Management
- User Management
- Payment Verification
- Result Management
- Settings
- Logout

**Access Control (Applied to ALL Admin Pages)**
- On EVERY admin page load:
  - Fetch current user: supabase.auth.getUser()
  - Query user_roles table where user_id = user.id
  - If no record found: INSERT role = user
  - If role != admin: display Access denied, redirect to home
  - If role == admin: allow access

### 3.10 Tournament Management (Admin)
**Create Tournament**
- Input fields:
  - Tournament name (required)
  - Entry fee (required)
  - Mode: dropdown (Solo/Duo/Squad)
  - 1st prize (required)
  - 2nd prize (required)
  - 3rd prize (required)
- Button: Create Tournament
- On success: add tournament to database, display success message

**Tournament List**
- Display all tournaments (active and completed)
- Each row shows: Name, Entry Fee, Mode, Status, Actions
- Actions:
  - Button: Edit (opens edit form with pre-filled data)
  - Button: Delete (confirmation prompt, then remove from database)
  - Button: View Players (shows registered players list)

### 3.11 User Management (Admin)
- Display all registered users in table format
- Columns: Name, Email, Phone, Game Name, UID, Registration Date, Actions
- Button: Delete Inactive Users (removes users with no activity for 3 months)
- Action per user:
  - Button: Delete (confirmation prompt, then remove user)

### 3.12 Payment Verification (Admin)
- Display all pending payment submissions
- Each entry shows:
  - Player name
  - Tournament name
  - Entry fee
  - Payment screenshot (clickable to view full size)
  - Submission time
- Actions:
  - Button: Approve (change status to approved, notify player)
  - Button: Reject (change status to rejected, optional rejection reason)

### 3.13 Result Management (Admin)
- Select tournament from dropdown
- Display all approved players for selected tournament
- Select winners:
  - Dropdown: 1st place (select from player list)
  - Dropdown: 2nd place (select from player list)
  - Dropdown: 3rd place (select from player list)
- Button: Publish Results
- On publish: save results to database, display on tournament detail page

### 3.14 Settings (Admin)
**Platform Configuration**
- Upload logo (file upload, replaces current logo)
- Contact information:
  - Input field: Email
  - Input field: Phone
- UPI ID for payments:
  - Input field: UPI ID
- Button: Save Settings

**Manage Slots**
- Input field: Maximum slots per tournament
- Button: Update

### 3.15 Privacy Policy Page
- Display privacy policy content
- Accessible from footer link

### 3.16 Terms & Conditions Page
- Display terms and conditions content
- Accessible from footer link

## 4. Business Rules and Logic

### 4.1 Authentication Rules
- Google login uses Supabase OAuth provider
- After successful Google login: check profile existence, redirect to /profile-setup if not exists, otherwise to /tournaments
- Email login requires existing account
- Registration requires OTP verification
- OTP NEVER displayed in UI, NEVER returned in backend response JSON
- Only database and EmailJS know OTP value
- OTP expires after 5 minutes
- Admin role assigned when login email matches ADMIN_EMAIL and password correct, using UPSERT operation

### 4.2 User Profile Rules
- Profile completion mandatory after first login
- Name, Phone, Game Name, UID are required fields
- Avatar is optional
- Profile must be complete before joining tournaments

### 4.3 Tournament Registration Rules
- User must be logged in to join tournament
- User must complete profile before joining (redirect to /profile if incomplete)
- UPI ID must be dynamically fetched from admin settings
- If UPI ID empty: disable Join button, show Payment not configured
- Payment screenshot upload is mandatory
- Registration status: Pending → Approved/Rejected
- User cannot join same tournament multiple times

### 4.4 Admin Access Rules
- Admin login page hidden from navigation menu
- Access via double tap on footer text (tapCount detection with 300ms timeout)
- Role verification required on EVERY admin page load
- If no user_roles record exists: INSERT role = user
- Only users with role = admin can access admin dashboard

### 4.5 Payment Verification Rules
- Admin must approve or reject each payment submission
- Approved registrations allow player to participate
- Rejected registrations can be resubmitted

### 4.6 Result Publication Rules
- Admin selects 1st, 2nd, 3rd place winners
- Winners must be from approved players list
- Results displayed on tournament detail page after publication

### 4.7 User Deletion Rules
- Admin can delete individual users manually
- Bulk deletion: users with no activity for 3 months

### 4.8 Routing Configuration
- Use multi-page routing (NOT SPA)
- Add vercel.json:
  ```
  {
    routes: [
      { src: /(.*), dest: / }
    ]
  }
  ```
- Every page must work on direct URL access
- No blank screen on refresh

## 5. Exception and Boundary Conditions

| Scenario | Handling |
|----------|----------|
| No internet connection | Display No internet connection. Please check your network message |
| EmailJS send failure | Allow manual registration as fallback, display OTP sending failed, proceeding with manual verification |
| Google login failure | Display Google login failed. Please try email login message |
| Supabase connection failure | Display Service temporarily unavailable. Please try again later, prevent application crash |
| Invalid OTP | Display Invalid or expired OTP. Please request a new one |
| OTP expired | Display OTP has expired. Please request a new one |
| Duplicate email registration | Display Account already exists. Please login |
| Unauthorized admin access | Display Access denied. Admin privileges required, redirect to home |
| Invalid admin credentials | Display Invalid admin credentials |
| Payment screenshot upload failure | Display Upload failed. Please try again |
| Tournament deletion with registered players | Show confirmation: This tournament has X registered players. Delete anyway? |
| User deletion | Show confirmation: Delete user [name]? This action cannot be undone |
| Blank screen on page refresh | Use multi-page routing with server-side rendering or static pages, ensure every page works on direct URL access |
| UPI ID not configured | Disable Join button, show Payment not configured |
| Incomplete profile on tournament join | Redirect to /profile, show Complete profile first |

## 6. Acceptance Criteria

1. Multi-page routing implemented with vercel.json configuration, no blank screen on page refresh or direct URL access
2. All environment variables configurable:
   - SUPABASE_URL: https://znpcqizqsxuauuxdhsdg.supabase.co
   - SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpucGNxaXpxc3h1YXV1eGRoc2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MzE0MDAsImV4cCI6MjA5MzIwNzQwMH0.x9DVh3tXreJMZ0Dpj4DqOD5BfPmng8wRhlJUIlsdUBU
   - GOOGLE_CLIENT_ID: 869251372199-g060qaaacdmhahueh3s81astu5g1hpji.apps.googleusercontent.com
   - GOOGLE_CLIENT_SECRET: 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
   - EMAILJS_PRIVATE_KEY: WfDRrTYlq3oH0xMfyxnYU
   - EMAILJS_SERVICE_ID: service_t5ze169
   - EMAILJS_TEMPLATE_ID: template_6f3clm6
   - ADMIN_EMAIL: admin@predator.com
   - ADMIN_PASSWORD: #Predator@2026!
3. UI theme: Black + Blue + White, clean esports design
4. Header: Logo left, hamburger menu right with Home, Tournaments, Profile (if logged in), Logout
5. Background: Subtle animated FREE FIRE text with low opacity glow edges
6. Google login button visible on login page, register page, and mobile view (full width, top position)
7. Google login functional using Supabase OAuth, redirects to /profile-setup if profile not exists, otherwise to /tournaments
8. Email login checks user existence, redirects to register if not found
9. Registration flow: email check → OTP verification → registration form
10. OTP NEVER displayed in UI, NEVER returned in backend response JSON, sent via EmailJS, stored in database with 5-minute expiry
11. EmailJS fallback: manual registration allowed if sending fails
12. User profile completion mandatory after first login (Name, Phone, Game Name, UID required)
13. Profile completion check before joining tournament, redirect to /profile if incomplete
14. Admin login accessible only via double tap on footer text (tapCount detection with 300ms timeout)
15. Admin role assigned using UPSERT when login email matches ADMIN_EMAIL and password correct
16. Admin access control on EVERY page load: fetch user, query user_roles, insert role = user if not exists, block if role != admin
17. Tournament creation functional with all required fields
18. Tournament list displays all tournaments with edit/delete/view players actions
19. Player join flow: check profile completion → fetch UPI ID from admin settings → disable Join if UPI empty → PAY NOW redirects to upi://pay → upload screenshot required
20. Payment verification: admin can approve or reject submissions
21. Result system: admin selects 1st, 2nd, 3rd place winners and publishes results
22. Admin panel features: create tournament, manage users, delete inactive users (3 months), manage slots, upload logo, change contact info, set UPI ID
23. Privacy Policy and Terms & Conditions pages accessible and functional
24. Error handling: no internet, EmailJS failure, Google login failure, Supabase failure, UPI not configured, incomplete profile handled without crash
25. No console errors in browser
26. All buttons functional
27. No fake login or authentication

## 7. Out of Scope for This Release

1. Multi-language support
2. Mobile app version
3. Live chat support
4. Automated payment verification via payment gateway integration
5. Tournament bracket visualization
6. Player statistics and leaderboards
7. Social media sharing features
8. Email notifications for tournament updates
9. Advanced search and filtering options
10. User rating and review system