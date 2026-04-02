# Bike Rental Hub 🏍️

A fully responsive, light-themed bike rental website for **Bike Rental Hub**, Hyderabad.  
Built with pure HTML, CSS, and vanilla JavaScript on the frontend, and **Node.js + Express + MongoDB** on the backend.

---

## 🌐 Live Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page with hero, features, safety, testimonials, location & contact |
| Bikes | `bikes.html` | Browse, filter, search & book bikes |
| Admin | `admin.html` | JWT-protected admin dashboard |
| Terms | `terms.html` | Rental terms, deposit, documents, cancellation policy |
| My Bookings | `mybookings.html` | Lookup bookings by phone number |
| 404 | `404.html` | Custom error page |

---

## 📁 Project Structure

```
Bike_R_H/
├── index.html
├── bikes.html
├── admin.html
├── terms.html
├── mybookings.html
├── 404.html
│
├── styles.css
├── bikes.css
├── admin.css
│
├── script.js
├── bikes.js
├── admin.js
│
├── assets/
│   ├── uploads/
│   ├── logo.webp
│   ├── Royal-Enfield.webp
│   ├── Activa.webp
│   ├── Honda.webp
│   ├── KTM.webp
│   ├── Pulsar.webp
│   ├── Suzuki.webp
│   └── Suzuki2.webp
│
└── backend/
    ├── server.js
    ├── seed.js
    ├── package.json
    ├── .env
    ├── .env.example
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── Bike.js
    │   ├── Booking.js
    │   ├── Review.js
    │   └── User.js
    ├── controllers/
    │   ├── authController.js
    │   ├── bikeController.js
    │   ├── bookingController.js
    │   └── reviewController.js
    ├── routes/
    │   ├── auth.js
    │   ├── bikes.js
    │   ├── bookings.js
    │   ├── reviews.js
    │   └── upload.js
    └── middleware/
        └── auth.js
```

---

## ✅ Features

### Home Page
- Sticky navbar with hamburger menu (mobile)
- Hero section with animated count-up stats
- "Why Choose Us" — 6 feature cards with scroll-reveal
- Safety & Trust section
- Testimonials section
- Location section with Google Map + contact details
- Footer with social links
- Floating Call & WhatsApp FABs

### Bikes Page
- Animated page loader
- Bikes fetched live from backend API
- Filter by category, sort, live search with debounce
- Booking Modal (3-step): details → payment (UPI/Card/QR) → success
- WhatsApp booking option
- Reviews tab per bike

### Admin Dashboard
- JWT login with session persistence
- Dashboard stats + recent bookings
- Add / Edit / Delete bikes
- Manage bookings (confirm / cancel)
- Payments history
- Toast notifications

### My Bookings
- Lookup bookings by phone number

### Terms & Conditions
- Deposit, documents, helmet, fuel, damage, cancellation policies

---

## 🔌 Backend API

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/bikes` | Public | Get all bikes |
| POST | `/bikes` | Admin | Add bike |
| PUT | `/bikes/:id` | Admin | Update bike |
| DELETE | `/bikes/:id` | Admin | Delete bike |
| POST | `/bookings` | Public | Create booking |
| GET | `/bookings` | Admin | All bookings |
| GET | `/bookings/stats` | Admin | Revenue & stats |
| GET | `/bookings/phone/:phone` | Public | Bookings by phone |
| PATCH | `/bookings/:id/status` | Admin | Update status |
| GET | `/reviews/:bikeId` | Public | Get reviews |
| POST | `/reviews/:bikeId` | Public | Submit review |
| POST | `/upload` | Admin | Upload bike image |

---

## 🚀 Getting Started

### 1. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
ADMIN_EMAIL=admin@bikerentalhub.in
ADMIN_PASSWORD=your_admin_password
```

### 2. Install & Seed

```bash
npm install
npm run seed
```

### 3. Start Server

```bash
npm run dev    # development
npm start      # production
```

### 4. Open

```
http://localhost:5000
```

---

## 🔐 Admin Login

| Field | Value |
|-------|-------|
| URL | `http://localhost:5000/admin.html` |
| Email | `admin@bikerentalhub.in` |
| Password | *(set in .env)* |

---

## 📞 Business Info

- **Address:** 13-6-831/A/52, Karan Singh Marg, Kphs Colony, Karwan East, Hyderabad, Telangana – 500006
- **Areas Served:** Tellapur and nearby areas
- **Phone / WhatsApp:** +91 93912 65697
- **Email:** hello@bikerentalhub.in
- **Hours:** Open daily · Closes 11:00 PM

---

## 👨‍💻 Developer

Developed by **Venky**
