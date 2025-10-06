# Firebase Console Walkthrough - Visual Guide

This guide provides a visual walkthrough of setting up Firebase Security Rules in the Firebase Console.

## 🖥️ Step-by-Step Visual Guide

### Step 1: Access Firebase Console
1. Open your browser and go to: `https://console.firebase.google.com/`
2. Sign in with your Google account
3. You should see your project: **"narayanganj-traveller-bd"**

### Step 2: Navigate to Realtime Database
1. In the left sidebar, look for **"Realtime Database"** (it should be under "Build" section)
2. Click on **"Realtime Database"**
3. If you see "Get started" or "Create Database", click it

### Step 3: Database Setup (if needed)
If you need to create the database:
1. Click **"Create Database"**
2. Choose location: **"asia-south1 (Mumbai)"** (closest to Bangladesh)
3. Select **"Start in test mode"** (we'll change this)
4. Click **"Done"**

### Step 4: Access Security Rules
1. Once in the Realtime Database section, you'll see several tabs at the top
2. Click on the **"Rules"** tab
3. You should see something like this:

```
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Step 5: Replace with Production Rules
1. **Select all the existing rules** (Ctrl+A or Cmd+A)
2. **Delete them**
3. **Copy and paste** the following rules:

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

### Step 6: Publish Rules
1. Click the **"Publish"** button (usually blue, at the bottom or top of the rules editor)
2. You should see a confirmation message
3. The rules are now active!

## 🔍 What Each Section Does

### Users Section
```
"users": {
  "$uid": {
    ".read": "$uid === auth.uid",
    ".write": "$uid === auth.uid || auth.token.admin === true"
  }
}
```
- **$uid**: This is a variable that matches any user ID
- **".read"**: Users can only read their own data
- **".write"**: Users can write their own data, admins can write any user's data

### Tours Section
```
"tours": {
  ".read": true,
  ".write": "auth != null"
}
```
- **".read": true**: Anyone can read tours (public)
- **".write": "auth != null"**: Only logged-in users can create/update tours

### Blogs Section
```
"blogs": {
  ".read": true,
  ".write": "auth != null"
}
```
- Same as tours - public read, authenticated write

### Bookings Section
```
"bookings": {
  "$bookingId": {
    ".read": "auth != null && (auth.token.admin === true || data.child('userId').val() === auth.uid)"
  }
}
```
- Users can only read their own bookings
- Admins can read all bookings

### Notifications Section
```
"notifications": {
  "$notificationId": {
    ".read": "auth != null && (auth.token.admin === true || data.child('userId').val() === auth.uid || !data.child('userId').exists())"
  }
}
```
- Users can read their own notifications
- Users can read global notifications (no userId)
- Admins can read all notifications

## 🧪 Testing Your Rules

### Using the Rules Simulator
1. In the Rules tab, click **"Simulator"**
2. You can test different scenarios:
   - **Location**: Enter a path like `users/123`
   - **Type**: Select "read" or "write"
   - **Auth**: Choose "unauthenticated" or provide a user ID
   - **Data**: Add sample data to test validation

### Test Scenarios to Try

#### Test 1: Unauthenticated User Reading Tours
- **Location**: `tours`
- **Type**: `read`
- **Auth**: `unauthenticated`
- **Expected**: ✅ **Allow** (tours are public)

#### Test 2: Authenticated User Creating Tour
- **Location**: `tours/newTourId`
- **Type**: `write`
- **Auth**: `authenticated` (provide any user ID)
- **Data**: 
```json
{
  "title": "Test Tour",
  "description": "Test Description",
  "price": 100,
  "duration": "1 day",
  "location": "Test Location",
  "isActive": true,
  "createdBy": "testUser"
}
```
- **Expected**: ✅ **Allow**

#### Test 3: User Reading Another User's Data
- **Location**: `users/otherUserId`
- **Type**: `read`
- **Auth**: `authenticated` (provide different user ID)
- **Expected**: ❌ **Deny** (users can only read their own data)

## 🚨 Common Issues and Solutions

### Issue: "Rules are not valid JSON"
**Solution**: 
- Check for missing commas
- Ensure all brackets are properly closed
- Use a JSON validator online

### Issue: "Permission denied" in your app
**Solution**:
- Make sure user is authenticated
- Check if the user has the required permissions
- Verify the data structure matches validation rules

### Issue: Rules not updating
**Solution**:
- Wait 2-3 minutes for propagation
- Clear browser cache
- Check for syntax errors

## 🔐 Making Users Admin

To make a user an admin, you need to set custom claims. Here's how:

### Method 1: Using Firebase Admin SDK (Recommended)
You'll need to create a server-side function or use Firebase Functions.

### Method 2: Temporary Manual Method (for testing)
1. Go to **Authentication** → **Users** in Firebase Console
2. Find the user you want to make admin
3. Click on the user
4. In the **Custom claims** section, add:
```json
{
  "admin": true
}
```

## 📱 Verifying Rules Work in Your App

Add this test code to your app to verify rules are working:

```typescript
import { useRTDB } from '@/hooks/useRTDB';

function TestRules() {
  const { createTour, error } = useRTDB();
  
  const testCreateTour = async () => {
    try {
      await createTour({
        title: "Test Tour",
        description: "Testing security rules",
        price: 100,
        duration: "1 day",
        location: "Test",
        images: [],
        isActive: true,
        createdBy: "testUser"
      });
      console.log("✅ Tour created successfully - Rules working!");
    } catch (err) {
      console.log("❌ Error:", err);
    }
  };
  
  return (
    <div>
      <button onClick={testCreateTour}>Test Create Tour</button>
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

## 🎯 Next Steps

1. **Deploy the rules** using the steps above
2. **Test with the simulator** to ensure they work
3. **Test in your app** to make sure everything functions correctly
4. **Set up admin users** using custom claims
5. **Monitor your database** for any issues

Your Firebase Security Rules are now properly configured and ready for production use!
