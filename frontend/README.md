# Full-Stack E-Commerce Platform

A modern, highly responsive, and full-stack E-commerce application built with the MERN stack (MongoDB, Express, React, Node.js). This project features a clean, "Soft UI" design aesthetic, role-based access control, and a seamless shopping experience.

## 🚀 Features at a Glance

### 1. Robust Storage & State Management
- **Zustand with Persistence**: Global state is managed using `zustand`. We utilize the `persist` middleware to automatically save the User session (`useAuthStore`) and the Shopping Cart (`useCartStore`) directly into the browser's `localStorage`. This ensures that data survives page refreshes.
- **Image Storage**: Integrated with **Cloudinary** and **Multer** on the backend. Product images uploaded by admins are securely sent to the cloud, and the MongoDB database stores the direct URL, ensuring fast delivery and zero local storage bloat.
- **Secure Authentication**: JWT Tokens are securely passed and stored in **HTTP-only Cookies** by the backend, rather than local storage. Axios is configured with `withCredentials: true` to automatically pass cookies for secure Admin routes.

### 2. Smart Search Functionality
- **Debounced Searching**: Implemented a global search bar in the Navbar and Admin Dashboard. To optimize performance and prevent unnecessary re-renders, the search input uses a **400ms debounce** function.
- **Real-time Filtering**: Products are instantly filtered locally based on matching the product name or category without requiring repeated backend API calls.

### 3. Comprehensive Shopping Cart System
- **Dynamic Cart Store**: Users can add products to their cart, which dynamically updates a notification badge in the Navbar.
- **Intelligent Quantity Management**: If a user attempts to add a product that is already in the cart, the system intelligently increases the `quantity` rather than duplicating the item card.
- **Interactive Cart Page**: A dedicated `/cart` route where users can increment/decrement quantities, remove items, and see a dynamically calculated Order Summary (Subtotal, Taxes, Grand Total).

### 4. SEO-Friendly Slugs & Routing
- **Timestamped Slugs**: Product URLs use human-readable slugs (e.g., `/product/samsung-galaxy-s25-1715000100`) instead of ugly MongoDB ObjectIDs. 
- **Conflict Prevention**: Slugs are generated automatically on the backend using the product's name converted to lowercase and dashed, appended with `Date.now()`. This guarantees 100% uniqueness even if two distinct products share the exact same name.
- **Flexible Backend Queries**: The backend `getProductById` endpoint dynamically detects if the incoming request parameter is a MongoDB `ObjectId` or a `slug`, allowing for seamless backward compatibility.

### 5. Role-Based Dashboards
- **Public Store**: Guests and normal users can browse products, search, and view detailed product pages. "Add to Cart" forces a login if the user is unauthenticated.
- **Admin Layout**: A completely protected, isolated layout accessible only by `role === 'admin'`. Features a secure Sidebar and full CRUD capabilities for Categories and Products, designed in a premium Card-based layout.

### 6. UI / UX Enhancements
- **Light Soft Theme**: The app utilizes a premium aesthetic with `slate` background colors, rounded corners (`rounded-3xl`), soft drop-shadows, and `indigo` accents.
- **Non-blocking Notifications**: Replaced native browser `alert()` prompts with beautiful, non-intrusive toast notifications via `react-hot-toast`.
- **Responsive & Stable**: Designed to be mobile-first and fully responsive. Prevented mobile horizontal pull-to-refresh and shifting bugs by setting global `overflow-x: hidden`.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- TailwindCSS v4
- Zustand (State Management)
- React Router DOM
- React Hot Toast
- Lucide React (Icons)
- Axios

**Backend:**
- Node.js & Express
- MongoDB (Mongoose ODM)
- JWT (JSON Web Tokens) & Cookie Parser
- Cloudinary & Multer (Image Uploads)
- Bcrypt (Password Hashing)
