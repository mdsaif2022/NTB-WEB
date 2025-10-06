# Firebase Security Rules Setup Guide

This guide will walk you through setting up Firebase Security Rules for your Realtime Database in the Firebase Console.

## 🚀 Step-by-Step Setup

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Select your project: **"narayanganj-traveller-bd"**

### Step 2: Navigate to Realtime Database

1. In the left sidebar, click on **"Realtime Database"**
2. If you haven't created a Realtime Database yet:
   - Click **"Create Database"**
   - Choose your location (recommended: `asia-south1` for Bangladesh)
   - Select **"Start in test mode"** (we'll change this later)

### Step 3: Access Security Rules

1. In the Realtime Database section, click on the **"Rules"** tab
2. You'll see the current rules (likely in test mode)

### Step 4: Replace with Production Rules

Replace the existing rules with the following comprehensive security rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid || auth.token.admin === true",
        ".validate": "newData.hasChildren(['name', 'email', 'role']) && newData.child('role').isString() && (newData.child('role').val() === 'user' || newData.child('role').val() === 'admin')"
      }
    },
    "tours": {
      ".read": true,
      ".write": "auth != null",
      "$tourId": {
        ".validate": "newData.hasChildren(['title', 'description', 'price', 'duration', 'location', 'isActive', 'createdBy']) && newData.child('price').isNumber() && newData.child('isActive').isBoolean()"
      }
    },
    "blogs": {
      ".read": true,
      ".write": "auth != null",
      "$blogId": {
        ".validate": "newData.hasChildren(['title', 'content', 'author', 'authorId', 'tags', 'isPublished']) && newData.child('isPublished').isBoolean() && newData.child('tags').isString()"
      }
    },
    "bookings": {
      "$bookingId": {
        ".read": "auth != null && (auth.token.admin === true || data.child('userId').val() === auth.uid)",
        ".write": "auth != null && (auth.token.admin === true || data.child('userId').val() === auth.uid)",
        ".validate": "newData.hasChildren(['userId', 'tourId', 'tourTitle', 'userName', 'userEmail', 'userPhone', 'numberOfPeople', 'totalPrice', 'status', 'bookingDate', 'tourDate']) && newData.child('numberOfPeople').isNumber() && newData.child('totalPrice').isNumber() && (newData.child('status').val() === 'pending' || newData.child('status').val() === 'confirmed' || newData.child('status').val() === 'cancelled' || newData.child('status').val() === 'completed')"
      }
    },
    "notifications": {
      "$notificationId": {
        ".read": "auth != null && (auth.token.admin === true || data.child('userId').val() === auth.uid || !data.child('userId').exists())",
        ".write": "auth != null",
        ".validate": "newData.hasChildren(['title', 'message', 'type', 'isRead']) && (newData.child('type').val() === 'info' || newData.child('type').val() === 'success' || newData.child('type').val() === 'warning' || newData.child('type').val() === 'error') && newData.child('isRead').isBoolean()"
      }
    },
    "admin": {
      ".read": "auth != null && auth.token.admin === true",
      ".write": "auth != null && auth.token.admin === true"
    }
  }
}
```

### Step 5: Publish Rules

1. Click **"Publish"** to save and activate the new rules
2. You'll see a confirmation message

## 🔐 Understanding the Rules

### Users Collection
- **Read**: Users can only read their own data
- **Write**: Users can only write their own data (admins can write any user data)
- **Validation**: Ensures required fields and valid role values

### Tours Collection
- **Read**: Public (anyone can read tours)
- **Write**: Only authenticated users can create/update tours
- **Validation**: Ensures required fields and correct data types

### Blogs Collection
- **Read**: Public (anyone can read blogs)
- **Write**: Only authenticated users can create/update blogs
- **Validation**: Ensures required fields and correct data types

### Bookings Collection
- **Read**: Users can only read their own bookings (admins can read all)
- **Write**: Users can only write their own bookings (admins can write any)
- **Validation**: Ensures required fields and valid status values

### Notifications Collection
- **Read**: Users can read their own notifications and global notifications
- **Write**: Only authenticated users can create notifications
- **Validation**: Ensures required fields and valid notification types

## 🛡️ Advanced Security Features

### Custom Claims for Admin Users

To make a user an admin, you need to set custom claims. Here's how:

#### Option 1: Using Firebase Admin SDK (Server-side)

```javascript
// This would be in your server code
const admin = require('firebase-admin');

// Set custom claims for admin user
await admin.auth().setCustomUserClaims(uid, { admin: true });
```

#### Option 2: Using Firebase Functions

Create a Cloud Function to promote users to admin:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.makeAdmin = functions.https.onCall(async (data, context) => {
  // Check if the current user is already an admin
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can promote users');
  }
  
  const { uid } = data;
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  
  return { success: true };
});
```

### Testing Security Rules

You can test your rules using the Firebase Console:

1. Go to **Realtime Database** → **Rules** tab
2. Click **"Simulator"**
3. Test different scenarios:
   - Authenticated vs unauthenticated users
   - Admin vs regular users
   - Different data paths

## 🚨 Important Security Considerations

### 1. Never Store Sensitive Data
- Don't store passwords, API keys, or personal information in RTDB
- Use Firebase Authentication for user management
- Store sensitive data in Firestore with proper security rules

### 2. Validate All Input
- The rules include validation for required fields
- Always validate data on the client side as well
- Use TypeScript interfaces for type safety

### 3. Monitor Usage
- Set up Firebase Analytics
- Monitor database usage and costs
- Set up alerts for unusual activity

### 4. Regular Security Audits
- Review and update rules regularly
- Test rules after any changes
- Keep Firebase SDK updated

## 🔧 Troubleshooting Common Issues

### Issue: "Permission Denied" Errors

**Solution**: Check if:
- User is authenticated (`auth != null`)
- User has the correct permissions
- Data structure matches validation rules

### Issue: Rules Not Updating

**Solution**: 
- Wait a few minutes for rules to propagate
- Clear browser cache
- Check for syntax errors in rules

### Issue: Admin Users Can't Access Admin Features

**Solution**:
- Ensure custom claims are set correctly
- Check if `auth.token.admin === true` in rules
- Verify user is properly authenticated

## 📱 Client-Side Implementation

### Check if User is Admin

```typescript
import { auth } from '@/lib/firebase';
import { getIdTokenResult } from 'firebase/auth';

const checkAdminStatus = async () => {
  const user = auth.currentUser;
  if (user) {
    const tokenResult = await getIdTokenResult(user);
    return tokenResult.claims.admin === true;
  }
  return false;
};
```

### Protect Admin Routes

```typescript
import { useCurrentUser } from '@/hooks/useRTDB';
import { useEffect, useState } from 'react';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useCurrentUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser) {
        const adminStatus = await checkAdminStatus();
        setIsAdmin(adminStatus);
      }
    };
    checkAdmin();
  }, [currentUser]);

  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  return <>{children}</>;
};
```

## 🎯 Best Practices

1. **Principle of Least Privilege**: Only grant necessary permissions
2. **Defense in Depth**: Validate on both client and server
3. **Regular Updates**: Keep rules updated with your app changes
4. **Testing**: Always test rules before deploying
5. **Monitoring**: Set up alerts for security events

## 🚀 Next Steps

1. **Deploy the rules** using the steps above
2. **Test with different user types** (admin, regular user, unauthenticated)
3. **Set up custom claims** for admin users
4. **Monitor your database** for any security issues
5. **Update rules** as your app evolves

Your Firebase Security Rules are now properly configured for a secure, production-ready application!
