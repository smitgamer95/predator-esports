# EmailJS Setup Guide for OTP System

## Overview
This application uses EmailJS to send OTP (One-Time Password) codes to users during registration. The OTP is **NEVER** displayed on the website - it is only sent via email for security.

---

## EmailJS Configuration Steps

### Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Add Email Service
1. After login, go to **Email Services** in the dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail recommended):
   - **Gmail**: Select "Gmail" and connect your Google account
   - **Outlook**: Select "Outlook" and connect your Microsoft account
   - **Other**: Configure SMTP settings manually
4. Click **Create Service**
5. **Copy the Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template
1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Set up the template:

**Template Name:** `OTP Verification`

**Subject:** `Your OTP Code - Predator E-Sports`

**Content (HTML):**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0e14; color: #e2e8f0;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #00d4ff; margin: 0;">Predator E-Sports</h1>
  </div>
  
  <div style="background-color: #1a1f2e; padding: 30px; border-radius: 10px; border: 1px solid #00d4ff;">
    <h2 style="color: #00d4ff; margin-top: 0;">Your OTP Code</h2>
    
    <p style="font-size: 16px; line-height: 1.6;">
      Hello,
    </p>
    
    <p style="font-size: 16px; line-height: 1.6;">
      Your One-Time Password (OTP) for registration is:
    </p>
    
    <div style="background-color: #00d4ff; color: #0a0e14; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
      <h1 style="margin: 0; font-size: 36px; letter-spacing: 8px;">{{otp}}</h1>
    </div>
    
    <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
      This OTP will expire in <strong>5 minutes</strong>.
    </p>
    
    <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
      If you didn't request this OTP, please ignore this email.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #64748b;">
    <p>© 2026 Predator E-Sports. All rights reserved.</p>
  </div>
</div>
```

**Template Variables:**
- `{{to_email}}` - Recipient email (auto-filled)
- `{{otp}}` - The 6-digit OTP code

4. Click **Save**
5. **Copy the Template ID** (e.g., `template_xyz789`)

### Step 4: Get Public Key
1. Go to **Account** → **General**
2. Find **Public Key** section
3. **Copy the Public Key** (e.g., `WfDRrTYlq3oH0xMfyxnYU`)

### Step 5: Update Environment Variables
1. Open `.env` file in your project
2. Update the following variables with your EmailJS credentials:

```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
```

Example:
```env
VITE_EMAILJS_PUBLIC_KEY=WfDRrTYlq3oH0xMfyxnYU
VITE_EMAILJS_SERVICE_ID=service_t5ze169
VITE_EMAILJS_TEMPLATE_ID=template_6f3clm6
```

### Step 6: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Start again
npm run dev
```

---

## Testing the OTP System

### Method 1: Using the Application

1. **Go to Registration Page:**
   - Navigate to `/register`

2. **Enter Email:**
   - Use a real email address you have access to
   - Agree to terms and conditions
   - Click "Continue"

3. **Check Email:**
   - Check your inbox for email from your configured service
   - Check spam/junk folder if not in inbox
   - Copy the 6-digit OTP code

4. **Enter OTP:**
   - Paste the OTP in the verification field
   - Click "Verify OTP"

5. **Complete Registration:**
   - Create your password
   - Click "Create Account"

### Method 2: Using Debug Page

1. **Go to Debug Page:**
   - Navigate to `/debug`

2. **Test OTP System:**
   - Click "Test OTP System" button
   - Check the results panel
   - Should show "✅ OTP sent successfully"

3. **Check Email:**
   - Check the test email inbox
   - Verify OTP was received

---

## Troubleshooting

### Issue: "Email service not configured"

**Solution:**
- Verify all three environment variables are set in `.env`
- Restart the development server
- Check that variable names start with `VITE_`

### Issue: "Failed to send email"

**Possible Causes:**
1. **EmailJS Service Not Active:**
   - Go to EmailJS dashboard
   - Check if service is connected and active
   - Try reconnecting your email account

2. **Template Not Found:**
   - Verify Template ID is correct
   - Check template exists in EmailJS dashboard

3. **Invalid Public Key:**
   - Verify Public Key is correct
   - Check for extra spaces or characters

4. **Email Provider Blocking:**
   - Some email providers block automated emails
   - Try using a different email service (Gmail works best)

### Issue: OTP Not Received

**Solutions:**
1. **Check Spam Folder:**
   - OTP emails might be marked as spam
   - Mark as "Not Spam" to receive future emails

2. **Wait a Few Minutes:**
   - Email delivery can take 1-2 minutes
   - Check again after waiting

3. **Verify Email Address:**
   - Make sure email address is typed correctly
   - Try a different email address

4. **Check EmailJS Dashboard:**
   - Go to EmailJS dashboard
   - Check "Email Logs" to see if email was sent
   - Look for error messages

### Issue: "Invalid or expired OTP"

**Solutions:**
1. **OTP Expired:**
   - OTP expires after 5 minutes
   - Request a new OTP by going back and re-entering email

2. **Wrong OTP:**
   - Double-check the OTP from email
   - Make sure all 6 digits are correct

3. **Already Used:**
   - Each OTP can only be used once
   - Request a new OTP if needed

---

## Security Features

✅ **OTP Never Displayed on Website** - OTP is only sent via email, never shown in UI

✅ **5-Minute Expiration** - OTP automatically expires after 5 minutes

✅ **One-Time Use** - Each OTP can only be used once, then deleted

✅ **Secure Storage** - OTP stored in database with RLS policies

✅ **Email Verification** - Ensures user has access to the email address

---

## Admin Login

### Admin Credentials
- **Email:** admin@predator.com
- **Password:** #Predator@2026!

### How to Login as Admin

1. **Go to Admin Login:**
   - Navigate to `/admin-login`
   - Or double-tap the footer on any page

2. **Enter Credentials:**
   - Email: admin@predator.com
   - Password: #Predator@2026!

3. **Click "Admin Login"**

4. **Access Admin Dashboard:**
   - Will redirect to `/admin` after successful login

### Admin Login Troubleshooting

If admin login fails:

1. **Check Console (F12):**
   - Look for error messages
   - Verify credentials being used

2. **Verify Admin Account:**
   - Go to `/debug`
   - Click "Check Admin User"
   - Should show admin profile with role='admin'

3. **Test Login:**
   - Go to `/debug`
   - Click "Test Admin Login"
   - Should show successful login

---

## Important Notes

⚠️ **EmailJS Free Tier Limits:**
- 200 emails per month
- Suitable for testing and small applications
- Upgrade to paid plan for production use

⚠️ **Email Delivery Time:**
- Usually instant, but can take 1-2 minutes
- Check spam folder if not received

⚠️ **Security:**
- Never share your EmailJS credentials
- Keep `.env` file secure and never commit to Git
- OTP is never logged or displayed for security

---

## Testing Checklist

Before deploying to production, test:

- [ ] Registration with OTP works end-to-end
- [ ] OTP email is received in inbox
- [ ] OTP verification works correctly
- [ ] OTP expiration works (wait 5 minutes)
- [ ] Admin login works with correct credentials
- [ ] Admin dashboard is accessible after login
- [ ] Email template displays correctly
- [ ] Spam folder checked if email not in inbox

---

## Support

If you continue to have issues:

1. Check EmailJS dashboard for error logs
2. Verify all environment variables are correct
3. Test with different email addresses
4. Check browser console for error messages
5. Use `/debug` page to test individual components
