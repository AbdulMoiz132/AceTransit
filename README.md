# 🚀 AceTransit - Smart Courier Web Application

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=for-the-badge&logo=supabase" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Framer_Motion-12.0-FF0055?style=for-the-badge&logo=framer" />
</div>

## 📖 Overview

**AceTransit** is a cutting-edge, intelligent courier web application designed to revolutionize the delivery experience. Built with modern web technologies and powered by Supabase, it offers a sleek, vibrant, and extremely user-friendly interface with powerful features including real-time authentication, AI-powered chatbot assistance, live tracking, automatic bill calculation, and smart location detection.

### ✨ Key Features

- **🎯 Home-to-Home Delivery System** - Convenient pickup requests directly from users' homes
- **💰 Smart Bill Calculation** - Real-time distance and weight-based price estimation
- **📍 Auto-Location Detection** - Intelligent location detection with address auto-fill
- **🤖 AI Chatbot Assistant** - Conversational AI for booking guidance, tracking, and FAQs
- **📊 Advanced Order Tracking** - Real-time movement tracking with progress stages and courier details
- **🎨 Modern UI/UX** - Vibrant orange color scheme with smooth animations and micro-interactions
- **📱 Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- **🔐 Full Authentication** - Email/password and Google OAuth with Supabase
- **👤 User Profiles** - Comprehensive profile management with real-time data sync
- **🗄️ Database Integration** - PostgreSQL database with Row Level Security

## 🎨 Design Philosophy

The application follows strong principles of:
- **Interactivity** - Engaging micro-animations and smooth transitions
- **Clarity** - Clean, intuitive navigation with minimal steps
- **Minimalism** - Modern, sleek interface with vibrant yet professional aesthetics
- **Accessibility** - User-friendly for all experience levels

## 🛠️ Technology Stack

### Frontend Framework
- **Next.js 16.0** - React framework with App Router
- **React 19.2** - UI library
- **TypeScript 5.0** - Type safety

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication (Email, Google OAuth)
  - Row Level Security
  - Real-time subscriptions
  - RESTful API

### Styling
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Framer Motion 12.0** - Animation library
- **Lucide React** - Beautiful icon set

### Utilities
- **clsx & tailwind-merge** - Conditional class management
- **@supabase/ssr** - Server-side rendering support
- **@supabase/supabase-js** - Supabase client library

## 📂 Project Structure

```
AceTransit/
├── src/
│   ├── app/
│   │   ├── splash/          # Animated splash screen
│   │   ├── welcome/         # Onboarding flow
│   │   ├── auth/
│   │   │   ├── login/       # Login page
│   │   │   └── signup/      # Signup page
│   │   ├── dashboard/       # Main dashboard with shipment overview
│   │   ├── booking/         # Multi-step booking flow
│   │   ├── tracking/        # Real-time order tracking
│   │   ├── chat/            # AI chatbot interface
│   │   ├── profile/         # User profile and settings
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing/redirect page
│   │   └── globals.css      # Global styles with orange theme
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Container.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navbar.tsx
│   │   └── ui/
│   │       ├── Badge.tsx    # Badge component
│   │       ├── Button.tsx   # Button with variants
│   │       ├── Card.tsx     # Card component
│   │       └── Input.tsx    # Input with icons
│   └── lib/
│       └── utils.ts         # Utility functions
├── public/                  # Static assets
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AbdulMoiz132/AceTransit.git
   cd AceTransit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Follow the detailed guide in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
   - Create a Supabase project
   - Run the SQL schema from `supabase-schema.sql`
   - Configure authentication providers
   - Copy your API keys

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

## 📱 Application Flow

1. **Splash Screen** → Animated branding introduction
2. **Welcome/Onboarding** → Feature highlights and app tour
3. **Authentication** → Login or create new account
4. **Dashboard** → View recent shipments and quick actions
5. **Booking Flow** → 
   - Step 1: Location detection and address input
   - Step 2: Package details (type, weight, dimensions)
   - Step 3: Delivery options and bill estimation
6. **Tracking** → Real-time package tracking with courier info
7. **Chatbot** → AI assistance for any queries
8. **Profile** → Account management and settings

## 🎯 Core Features in Detail

### 1. Splash & Onboarding
- Animated splash screen with brand logo
- Multi-step onboarding showcasing key features
- Smooth transitions and engaging visuals

### 2. Authentication
- Email/password authentication
- Social login (Google, Facebook)
- Secure password handling
- Remember me functionality

### 3. Dashboard
- "Welcome Back! Ready to ship?" greeting
- Recent shipments overview with status indicators
- Quick stats (Active, Delivered, Pending)
- Bottom navigation for easy access
- Floating chatbot button

### 4. Booking System
- **Auto-location Detection** - GPS-based address detection
- **Smart Address Input** - Manual entry with city selection
- **Package Details** - Type, weight, and dimension inputs
- **Delivery Options** - Standard, Express, Fast Track
- **Bill Estimation** - Real-time price calculation based on:
  - Base fare
  - Distance calculation
  - Weight-based pricing
  - Delivery speed multiplier

### 5. Tracking Dashboard
- Live tracking map visualization
- Progress timeline with status updates
- Courier information with ratings
- Direct call/message to courier
- Estimated delivery time
- Delivery progress percentage

### 6. AI Chatbot
- Conversational interface
- Quick action buttons
- Smart response generation
- Typing indicators
- Suggestion chips
- Context-aware assistance

### 7. Profile Management
- User information display
- Customer rating
- Order statistics
- Saved addresses
- Payment methods
- Notification preferences
- Privacy settings

## 🎨 Color Scheme

The vibrant orange theme creates an energetic and modern feel:

```css
Primary: #FF9D42 (Vibrant Orange)
Secondary: #FF6B35 (Deep Orange)
Accent: #FF8C61 (Warm Orange)
Success: #10b981 (Green)
```

## 🔧 Customization

### Updating Theme Colors
Edit `src/app/globals.css`:
```css
:root {
  --primary-start: #FF9D42;
  --primary-end: #FF6B35;
  --accent: #FF8C61;
}
```

### Adding New Pages
1. Create a new folder in `src/app/`
2. Add `page.tsx` file
3. The route will be automatically available

## 📦 Dependencies

### Core
- `next`: 16.0.10
- `react`: 19.2.1
- `react-dom`: 19.2.1

### UI & Animation
- `framer-motion`: 12.23.26
- `lucide-react`: 0.561.0
- `clsx`: 2.1.1
- `tailwind-merge`: 3.4.0

### Development
- `typescript`: ^5
- `tailwindcss`: ^4
- `eslint`: ^9

## 🚧 Future Enhancements

- [ ] Payment gateway integration
- [ ] Real GPS tracking integration
- [ ] Push notifications
- [ ] Multiple language support
- [ ] Dark mode optimization
- [ ] Admin dashboard
- [ ] Delivery partner app
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] SMS integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Abdul Moiz**
- GitHub: [@AbdulMoiz132](https://github.com/AbdulMoiz132)

## 🙏 Acknowledgments

- Design inspiration from Figma mockups
- Icons by Lucide React
- Animations powered by Framer Motion
- Built with Next.js and Tailwind CSS

---

<div align="center">
  <p>Made with ❤️ and ☕ by Abdul Moiz</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
