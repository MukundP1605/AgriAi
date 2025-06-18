# AgriAI Futuristic Theme - Pages and Components

## 📂 Pages and Components Implementation Guide

This document provides a technical guide focusing on the structure, features, and components of each page in the AgriAI Futuristic Theme.

## 🧩 Core Components

These are the core components used across multiple pages in the application:

1. **Navbar Component**
   - Main navigation bar with links to all major sections
   - User profile dropdown and notification system
   - Search functionality

2. **Footer Component**
   - Site links and copyright information
   - Social media connections
   - Newsletter subscription

3. **ThemeSwitcher Component**
   - Toggle between classic and futuristic themes
   - Theme state management

4. **Card Component**
   - Container for content sections
   - Used in multiple pages for consistent content presentation
         ${noPadding ? '' : 'p-4'}
         transition-all duration-300
         ${className}
       `}>
         {children}
       </div>
     );
   };
   
   export default Card;
   ```

2. **Button Component**
   ```jsx
   // src/themes/futuristic/components/ui/Button.jsx
   import React from 'react';
   
   const Button = ({ 
     children, 
     onClick, 
     type = "button",
     variant = "primary", // primary, secondary, outline, danger
     size = "md", // sm, md, lg
     className = "",
     disabled = false,
     fullWidth = false,
     icon = null
   }) => {
     // Variant styles
     const variantClasses = {
       primary: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white",
       secondary: "bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white",
       outline: "bg-transparent border border-gray-600 hover:border-cyan-500 hover:text-cyan-400 text-gray-300",
       danger: "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white"
     };
     
     // Size styles
     const sizeClasses = {
       sm: "py-1 px-3 text-sm",
       md: "py-2 px-4",
       lg: "py-3 px-6 text-lg"
     };
     
     return (
       <button
         type={type}
         onClick={onClick}
         disabled={disabled}
         className={`
           ${variantClasses[variant]}
           ${sizeClasses[size]}
           ${fullWidth ? 'w-full' : ''}
           rounded-lg font-medium
           transition-all duration-200
           focus:ring-2 focus:ring-cyan-500/50 focus:outline-none
           disabled:opacity-50 disabled:cursor-not-allowed
           flex items-center justify-center gap-2
           ${className}
         `}
       >
         {icon && <span className="inline-block">{icon}</span>}
         {children}
       </button>
     );
   };
   
   export default Button;
   ```

3. **Badge Component**
   ```jsx
   // src/themes/futuristic/components/ui/Badge.jsx
   import React from 'react';
   
   const Badge = ({ 
     children, 
     variant = "info", // info, success, warning, danger
     glow = false,
     className = "" 
   }) => {
     // Variant styles
     const variantClasses = {
       info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
       success: "bg-green-500/20 text-green-400 border-green-500/30",
       warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
       danger: "bg-red-500/20 text-red-400 border-red-500/30"
     };
     
     return (
       <span
         className={`
           ${variantClasses[variant]}
           ${glow ? `shadow-sm shadow-${variant === 'info' ? 'blue' : variant === 'success' ? 'green' : variant === 'warning' ? 'amber' : 'red'}-500/50` : ''}
           inline-flex items-center px-2.5 py-0.5
           text-xs font-medium rounded-full
           border
           ${className}
         `}
       >
         {children}
       </span>
     );
   };
   
   export default Badge;
   ```

## 📂 Main Pages and Components

### 1. Home Page (`pages/Home.jsx`)
**Purpose:** Main landing page for the application.

**Components:**
- Feature card grid displaying main application features
- Call-to-action buttons for primary functions
- Hero section with main app description

**Features:**
- Smart Crop Planning
- Disease Detection 
- AI Farm Assistant
- Farm Analytics
- Marketplace access

### 2. Enhanced Dashboard (`pages/EnhancedDashboard.jsx`)
**Purpose:** Main control center with farm data visualization.

**Components:**
- Tabbed navigation system with 4 main tabs
- Weather forecast panel with 4-day predictions
- Crop health monitoring panel
- Soil sensor metrics display
- Analytics panel with yield trends
- Real-time alert notifications

**Features:**
- Overview tab with all key metrics
- Crops tab with CropManagementDashboard
- Alerts tab with AlertManagement
- Profile tab with UserProfile management

### 3. Crop Management (`pages/Crop.jsx`)
**Purpose:** Crop recommendation and management system.

**Components:**
- CropForm - Input form for soil and climate data
- RecommendationDisplay - Shows crop suggestions
- CropManagementDashboard - Detailed crop tracking

**Features:**
- AI-powered crop recommendations
- Soil parameter analysis
- Climate data integration
- Yield prediction tools

### 4. Disease Detection (`pages/Disease.jsx`)
**Purpose:** Plant disease identification system.

**Components:**
- DiseaseUpload - Image upload interface
- AnalysisResult - Disease identification display
- TreatmentRecommendation - Treatment suggestions

**Features:**
- Image upload (drag-and-drop)
- Real-time disease analysis
- Treatment recommendations
- Disease information database
- History of previous scans

### 5. Fertilizer Advisor (`pages/FuturisticFertilizer.jsx`)
**Purpose:** Smart fertilizer recommendation system.

**Components:**
- SoilInputForm - Collect soil nutrient data
- NutrientVisualization - Visual representation of levels
- FertilizerRecommendation - Suggested products and rates

**Features:**
- Custom fertilizer recommendations
- Nutrient deficiency identification
- Application rate calculator
- Environmental impact assessment

### 6. AI Chat Assistant (`pages/Chat.jsx`)
**Purpose:** Interactive AI chatbot for agricultural assistance.

**Components:**
- ChatBot - Main conversation interface
- MessageList - Display of conversation history
- InputArea - User message input
- TypingIndicator - Shows when AI is responding

**Features:**
- Natural language processing
- Context-aware conversations
- Agricultural knowledge base
- Image analysis integration
- Chat history storage

### 7. Marketplace (`pages/FuturisticMarketplace.jsx`)
**Purpose:** E-commerce platform for agricultural products.

**Components:**
- ProductGrid - Display of available products
- CategoryFilter - Product category filtering
- SearchFunction - Product search capability
- CartManagement - Shopping cart functionality

**Features:**
- Product browsing and filtering
- Add to cart functionality
- Order processing
- Payment integration
- Product recommendations

**Related Pages:**
- Cart (`pages/FuturisticCart.jsx`) - Shopping cart management
- Order History (`pages/FuturisticOrderHistory.jsx`) - Past order tracking
- Order Success (`pages/FuturisticOrderSuccess.jsx`) - Order confirmation

### 8. User Account Pages
A collection of pages for user account management.

**Pages:**
- Login (`pages/Login.jsx`) - User authentication
- SignUp (`pages/SignUp.jsx`) - New account creation
- Profile (`pages/Profile.jsx`) - User profile management
- Settings (`pages/Settings.jsx`) - Application preferences
- History (`pages/History.jsx`) - Activity history tracking

**Key Features:**
- User authentication
- Profile information management
- Preference settings
- Activity logging and history
- Security settings

### 9. About Page (`pages/About.jsx`)
Information about the AgriAI platform.

**Components:**
- Team section - Team member profiles
- Features section - Platform capabilities
- Technology section - Tech stack information
- Mission section - Company mission and vision

**Features:**
- Company information
- Team profiles
- Technology stack details
- Mission and values statement
- Contact information

## 🧩 Reusable Components

### UI Components
- **Card** - Container for content sections
- **Button** - Interactive buttons with various states
- **Badge** - Status indicators and labels
- **Navbar** - Main navigation bar
- **Footer** - Page footer with links
- **ThemeSwitcher** - Theme toggle functionality
- **PanelWrapper** - Dashboard panel container

### Feature Components
- **WeatherPanel** - Weather forecast display
- **CropHealthPanel** - Crop status visualization
- **SoilSensorPanel** - Soil metrics display
- **AlertsPanel** - Notification display
- **AnalyticsPanel** - Data visualization charts
- **UserProfile** - User information management
- **DiseaseAnalyzer** - Plant disease detection tool

## 📊 Data Management

### API Integration Points
- Crop recommendation API
- Weather data API
- Disease identification API
- Fertilizer recommendation API
- User authentication API
- E-commerce APIs for marketplace

### State Management
- AuthContext for user authentication
- UIThemeContext for theme management
- Various component-level state with useState and useReducer

## 🔄 Navigation Flow

1. Home Page - Entry point with feature overview
2. Login/Signup - User authentication
3. Dashboard - Main control center after login
4. Feature Pages - Specific tools like crop recommendations, disease detection
5. Marketplace - Shopping for agricultural products
6. User Account - Profile and settings management

---

This documentation outlines the structure, features, and components of the AgriAI Futuristic Theme pages without focusing on UI/UX preferences.

## 🔧 Technical Structure

### File Organization
- `/pages` - All main application pages
- `/components` - Reusable UI components
- `/components/ui` - Basic UI elements
- `/components/CropManagement` - Crop-specific components
- `/components/Alerts` - Notification components
- `/components/Profile` - User profile components

### Route Structure
- `/` - Home page
- `/enhanced-dashboard` - Main dashboard
- `/crop` - Crop recommendation
- `/disease` - Disease detection
- `/fertilizer` - Fertilizer advisor
- `/chat` - AI assistant
- `/marketplace` - Product marketplace
- `/login` & `/signup` - Authentication
- `/profile` & `/settings` - User management
- `/about` - About page

### Component Dependencies
- Most pages depend on Navbar and Footer
- Dashboard pages use multiple panel components
- Form pages use various input components
- All pages use the theme context for styling

## 🚀 Implementation Steps

1. Create base component structure
2. Implement page routing in FuturisticApp.jsx
3. Build core components (Navbar, Footer, etc.)
4. Implement page-specific components
5. Connect API endpoints for data
6. Integrate user authentication
7. Implement theme switching functionality

This document provides an overview of the pages and components required for the AgriAI Futuristic Theme. It focuses on the structural aspects and features without specific UI/UX preferences.
