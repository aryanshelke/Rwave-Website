# R-Wave Cardio Products NX — Official Web Platform & Inventory Control Portal

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://rwave-website.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)

A modern, full-stack medical technology web application and administrative inventory control portal designed for **R-Wave Cardio Products NX**, a premier manufacturer and distributor of critical cardiology, ICU monitoring, and hospital equipment.

🌐 **Live URL**: [https://rwave-website.vercel.app](https://rwave-website.vercel.app)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [API Documentation](#-api-documentation)
- [Security & Access Control](#-security--access-control)
- [SEO & Search Engine Indexing](#-seo--search-engine-indexing)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🩺 Overview

R-Wave Cardio Products NX provides hospitals, cardiac clinics, and intensive care units with specialized electro-medical systems. This platform serves two core purposes:

1. **Client-Facing Digital Catalog**: A clinical, high-performance web showcase featuring interactive product category filtering, real-time quote generation forms, technical specifications, and company credentials.
2. **Administrative Inventory Console (`/admin`)**: A secure, authenticated control center allowing authorized staff to manage live inventory, upload media directly to Cloudinary, modify clinical specifications, and adjust stock status with instantaneous updates to the public catalog.

---

## ✨ Key Features

### Public Portal
- **Interactive Medical Catalog**: Instant filtering across five specialized clinical segments:
  - ECG Machines (12-Channel, 3-Channel, Stress Systems, Holter Recorders)
  - Patient Monitors (ICU Multi-Parameter, Bedside, Transport, Central Monitoring Stations)
  - Blood Pressure Monitors (Digital Clinical, Stand Aneroid, Ambulatory ABPM)
  - DVT Compression Pumps (Dual-Chamber, Portable, Sleeves)
  - Blood & Fluid Warmers (High-Flow Rapid Infusion, Transfusion Systems)
- **High-Performance Animations**: Optimized scroll-reveal interactions, responsive hero video background, and responsive drawer navigation.
- **Direct Quote Request System**: Interactive modal and embedded lead generation forms for hospital procurement teams.

### Admin Inventory Control (`/admin`)
- **Desktop-Only Hardware Guard**: For administrative integrity and precision catalog management, access is locked exclusively to desktop/laptop environments ($\ge 1024\text{px}$). Handheld mobile devices and tablets are restricted.
- **JWT-Secured Authentication**: Role-based administrative access protected with encrypted JSON Web Tokens.
- **Dynamic Product CRUD**: Add, edit, or retire products with real-time database synchronization.
- **Cloudinary Image Pipeline**: Dual-mode image ingestion supporting direct local file uploads (via in-memory Multer buffers) or CDN image URLs.

---

## 🛠 Tech Stack

### Frontend
- **Library**: React 19
- **Build Tool**: Vite 8
- **Styling**: Vanilla CSS3 Glassmorphism with custom design tokens, dark clinical aesthetic, and fluid responsive layouts
- **Icons**: Lucide React
- **Linter**: Oxlint

### Backend & Cloud Services
- **Runtime**: Node.js (Full ES Modules in serverless runtime, CommonJS local server support)
- **Framework**: Express 5
- **Database**: MongoDB Atlas with Mongoose ODM (connection caching across serverless warm starts)
- **Asset Storage**: Cloudinary SDK v2
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Hosting**: Vercel Serverless Functions (`/api/*`) with automated Edge CDN routing

---

## 📂 Project Architecture

```text
├── api/                        # Vercel Serverless Backend (Native ES Modules)
│   ├── index.js                # Express API entry point & route definitions
│   ├── db.js                   # Mongoose Atlas connector with serverless pooling
│   ├── Product.js              # Mongoose Product Schema with model caching
│   └── cloudinary.js           # Cloudinary buffer upload stream utility
├── public/                     # Static production assets
│   ├── sitemap.xml             # Search engine XML sitemap
│   ├── robots.txt              # Crawler permissions & indexing rules
│   ├── favicon.svg             # Vector brand favicon
│   └── google*.html            # Search Console verification file
├── server/                     # Standalone local development server (CommonJS)
│   ├── config/                 # DB & Cloudinary configuration
│   ├── middleware/             # Auth & Multer upload middleware
│   ├── models/                 # Mongoose models
│   ├── routes/                 # Express route handlers
│   ├── seed.js                 # Database seeder script
│   └── server.js               # Standalone Express daemon (Port 5001)
├── src/                        # React Frontend Source
│   ├── assets/                 # Brand imagery, product photography & video
│   ├── components/
│   │   ├── AdminPortal.jsx     # Desktop-enforced inventory dashboard
│   │   ├── AdminPortal.css     # Admin dark-theme glassmorphism styles
│   │   ├── ProductsPage.jsx    # Standalone full catalog browse view
│   │   └── ProductsPage.css    # Catalog responsive grid styles
│   ├── App.jsx                 # Root component, routing & dynamic SEO tags
│   ├── App.css                 # Public theme & landing page design tokens
│   └── main.jsx                # Application root entry point
├── vercel.json                 # Vercel route rewrites & serverless configuration
├── vite.config.js              # Vite bundler configuration & local API proxies
└── package.json                # Root dependencies and project scripts
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (v9 or higher)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster connection URI
- A [Cloudinary](https://cloudinary.com/) account for image uploads

### Environment Variables

Create a `.env` file in the root directory (and/or inside `server/.env`):

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
ADMIN_USER=admin
ADMIN_PASS=your_secure_admin_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Installation

```bash
# Clone the repository
git clone https://github.com/aryanshelke/Rwave-Website.git
cd "Rwave(Final Website)"

# Install root dependencies
npm install

# (Optional) Seed the database with initial catalog products
node server/seed.js
```

### Running Locally

```bash
# Option 1: Run frontend and backend concurrently
npm run dev:all

# Option 2: Run separately in two terminals
npm run server   # Starts Express backend on http://localhost:5001
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 📡 API Documentation

All endpoints are mounted under `/api/*`:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Serverless health status & MongoDB connection state |
| `GET` | `/api/ping` | Public | Instant diagnostic endpoint verifying environment variables |
| `POST` | `/api/auth/login` | Public | Authenticates admin credentials and returns JWT bearer token |
| `GET` | `/api/products` | Public | Returns product catalog (supports optional `?category=` filter) |
| `GET` | `/api/products/:id` | Public | Returns details for a single product |
| `POST` | `/api/products` | Admin Only | Uploads image to Cloudinary and creates new product |
| `PUT` | `/api/products/:id` | Admin Only | Updates product specifications, stock status, or image |
| `DELETE` | `/api/products/:id`| Admin Only | Deletes product record and destroys associated Cloudinary asset |

---

## 🛡 Security & Access Control

- **Administrative Viewport Lock**: The `/admin` portal enforces a strict viewport resolution threshold ($\ge 1024\text{px}$) and user-agent filter to prevent unauthorized or degraded mobile modifications.
- **Protected Endpoints**: Write, update, and delete API routes require a valid `Bearer <token>` verified through JWT middleware.
- **Search Engine Isolation**: The `/admin` route dynamically updates `<meta name="robots">` to `noindex, nofollow` to prevent indexing by crawlers.

---

## 🔍 SEO & Search Engine Indexing

- **Dynamic Canonical Links**: Automatically updates `<link rel="canonical">` across `/`, `/products`, and `/admin`.
- **Search Console Ready**: Configured with Google verification metadata and standard XML sitemaps:
  - `https://rwave-website.vercel.app/sitemap.xml`
  - `https://rwave-website.vercel.app/robots.txt`
- **Social Graph Optimization**: Complete OpenGraph (`og:title`, `og:image`, `og:description`) and Twitter Card metadata included.

---

## ☁️ Deployment

The project is structured for **zero-configuration All-in-One deployment on Vercel**:

1. Import your repository into [Vercel](https://vercel.com).
2. Set the framework preset to **Vite**.
3. Add your environment variables in **Project Settings $\rightarrow$ Environment Variables**:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `ADMIN_USER`
   - `ADMIN_PASS`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Deploy! Vercel compiles the Vite frontend into `dist/` and runs `/api/index.js` as high-performance Serverless Edge Functions.

---

## 📄 License

This project is proprietary and confidential. All rights reserved by **R-Wave Cardio Products NX**.
