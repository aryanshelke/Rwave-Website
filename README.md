# R-Wave Cardio Products NX — Web Platform & Catalog

[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)

Official web portal and digital product catalog for **R-Wave Cardio Products NX**, providing healthcare facilities with electro-medical systems, technical documentation, and product inquiries.

---

## Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Local Development](#-local-development)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Installation & Running](#installation--running)
- [API Overview](#-api-overview)
- [License](#-license)

---

## Overview

The platform serves two functions:
1. **Public Catalog**: A responsive interface showcasing medical equipment, categorized specifications, dynamic lead-generation forms, and technical brochures.
2. **Catalog Administration**: A role-restricted internal console for catalog curation, specification updates, and media synchronization.

---

## Key Features

### Client-Facing Portal
- **Segmented Catalog**: Real-time filtering across core clinical segments:
  - ECG Machines (12-Channel, 3-Channel, Holter Systems)
  - Patient Monitors (ICU Multi-Parameter, Bedside, Central Stations)
  - Blood Pressure Monitors (Clinical Digital, Stand Aneroid, ABPM)
  - DVT Compression Systems (Dual-Chamber, Portable)
  - Fluid & Blood Warming Systems
- **Procurement Inquiries**: Integrated quote request modals and direct inquiry dispatch.
- **Responsive Layout**: Cross-platform responsive design with fluid CSS styling.

### Internal Management
- **Catalog Management**: Dynamic item creation, updates, and archival status.
- **Media Pipeline**: Cloud-hosted asset optimization and delivery.
- **Session Authentication**: Token-based validation on all state-altering operations.

---

## Tech Stack

### Frontend
- **Framework**: React 19
- **Bundler**: Vite 8
- **Styling**: Vanilla CSS3 design tokens and responsive CSS Grid/Flexbox
- **Icons**: Lucide React

### Backend & Cloud Services
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: MongoDB Atlas with Mongoose ODM
- **Asset Storage**: Cloudinary SDK
- **Hosting**: Vercel Serverless Functions

---

## Project Architecture

```text
├── api/                  # Serverless API routes and database connector
├── public/               # Static assets, sitemaps, and robots configuration
├── server/               # Local development server and seed scripts
├── src/                  # React application source
│   ├── assets/           # UI media and branding assets
│   ├── components/       # Interface components and page views
│   ├── App.jsx           # Main routing and application layout
│   └── main.jsx          # DOM entry point
├── vercel.json           # Platform rewrites and routing rules
├── vite.config.js        # Vite bundler configuration
└── package.json          # Dependencies and scripts

## License
This repository and its codebase are proprietary and confidential. All rights reserved by R-Wave Cardio Products NX. Unauthorized copying, distribution, or commercial use is strictly prohibited.
