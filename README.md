# 🌍 Explore Bangladesh - Travel & Tourism Website

A modern, full-featured travel and tourism website built with React, TypeScript, and Firebase. This project provides a complete solution for travel agencies to manage tours, bookings, and customer interactions.

## ✨ Features

### 🎯 **User Features**
- **Tour Discovery**: Browse and search through available tour packages
- **Interactive Media**: Image and video galleries with modal previews
- **Booking System**: Complete booking flow with seat selection
- **Blog Integration**: Travel stories and destination guides
- **Contact Forms**: Easy communication with travel agency
- **Responsive Design**: Mobile-first, modern UI/UX

### 🔧 **Admin Panel**
- **Tour Management**: Create, edit, and manage tour packages
- **Bulk Operations**: Enable/disable multiple tours at once
- **Booking Management**: View and manage customer bookings
- **Blog Management**: Create and publish travel content
- **Ad Management**: Display promotional banners
- **User Management**: Customer account administration
- **Settings**: Configure site branding and preferences

### 🚀 **Technical Features**
- **Real-time Updates**: Firebase Realtime Database integration
- **Media Management**: Cloudinary for image/video handling
- **Authentication**: Secure user and admin login
- **Progressive Web App**: Installable on mobile devices
- **SEO Optimized**: Search engine friendly
- **Professional Branding**: Custom favicon and theming

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Router** for navigation

### **Backend & Services**
- **Firebase Realtime Database** for data storage
- **Firebase Authentication** for user management
- **Cloudinary** for media management
- **Netlify** for deployment

### **UI Components**
- **Shadcn/ui** component library
- **Custom components** for travel-specific features
- **Responsive design** for all screen sizes

## 📦 Installation

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Cloudinary account

### **Setup Steps**

1. **Clone the repository**
   ```bash
   git clone https://github.com/mdsaif2022/NTB-WEB.git
   cd NTB-WEB
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_DATABASE_URL=your_firebase_database_url

   # Cloudinary Configuration
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
   VITE_CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Firebase Setup**
   - Create a Firebase project
   - Enable Realtime Database
   - Set up Authentication
   - Update security rules (see `FIREBASE_SECURITY_RULES_GUIDE.md`)

5. **Cloudinary Setup**
   - Create a Cloudinary account
   - Get your cloud name, API key, and API secret
   - Configure upload presets

6. **Run the development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### **Netlify Deployment**
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### **Vercel Deployment**
1. Import your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

## 📁 Project Structure

```
NTB-WEB/
├── client/                 # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts for state management
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries and configurations
│   └── global.css         # Global styles
├── public/                # Static assets
├── server/                # Backend API (if needed)
├── docs/                  # Documentation files
└── package.json           # Dependencies and scripts
```

## 🔧 Configuration

### **Firebase Security Rules**
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### **Cloudinary Upload Preset**
Configure upload presets in Cloudinary dashboard for optimal image handling.

## 📱 Features in Detail

### **Tour Management**
- Create tours with multiple images and videos
- Set pricing, duration, and capacity
- Enable/disable bus seat selection
- Bulk operations for multiple tours

### **Booking System**
- Step-by-step booking process
- Seat selection (when enabled)
- Customer information collection
- Booking confirmation and download

### **Media Management**
- Image and video uploads via Cloudinary
- Optimized image delivery
- Modal previews for media galleries
- Thumbnail generation

### **Admin Dashboard**
- Real-time statistics
- Quick actions for common tasks
- User-friendly interface
- Mobile-responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase** for backend services
- **Cloudinary** for media management
- **Shadcn/ui** for UI components
- **Tailwind CSS** for styling
- **React** ecosystem for the frontend framework

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation in the `docs/` folder

---

**Built with ❤️ for the travel and tourism industry**