# PLASTIK ♻️

> **Rewarding plastic recycling for a greener future.**

PLASTIK is a web platform that encourages plastic recycling by rewarding users with points. Users upload photos of plastic waste, an AI/ML model detects whether the image contains plastic, and points are awarded which can be redeemed for eco-friendly products made from recycled plastic.

---

## 🌟 Features

- 📸 **Photo Upload** — Upload images of plastic waste for AI analysis
- 🤖 **ML Detection** — CNN model detects plastic with probability score
- 🏆 **Points System** — Earn 10 points for every verified plastic upload
- 🛒 **Marketplace** — Redeem points for eco-friendly recycled products
- 🔐 **Authentication** — Secure JWT-based login and registration
- 📱 **Responsive UI** — Works on desktop and mobile

---

## 🏗️ Project Structure

```
plastik_backend/
├── client/                         # Frontend (HTML/CSS/JS)
│   ├── index.html                  # Homepage
│   ├── products.html               # Products marketplace
│   ├── product-detail.html         # Product detail + redeem
│   ├── Upload.html                 # Photo upload page
│   ├── sign-in.html                # Login page
│   ├── sign-up.html                # Register page
│   ├── about.html                  # About page
│   ├── contact.html                # Contact page
│   ├── faq.html                    # FAQ page
│   ├── css/                        # Stylesheets
│   ├── js/
│   │   ├── auth.js                 # Navbar auth state (all pages)
│   │   ├── signin.js               # Login logic
│   │   ├── signup.js               # Registration logic
│   │   ├── products.js             # Dynamic product loading
│   │   └── upload.js               # Photo upload + ML result
│   └── images/                     # Static images
│
├── server/                         # Backend (Node.js + Express)
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT auth middleware
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   ├── Product.js              # Product schema
│   │   ├── PhotoUpload.js          # Photo upload schema
│   │   └── Reward.js               # Reward/redemption schema
│   ├── routes/
│   │   ├── auth.js                 # /api/auth (login, register)
│   │   ├── users.js                # /api/users (profile, points)
│   │   ├── photos.js               # /api/photos (upload + ML)
│   │   ├── products.js             # /api/products (list, redeem)
│   │   └── rewards.js              # /api/rewards (history)
│   ├── uploads/                    # Uploaded images (local)
│   ├── server.js                   # Express app entry point
│   └── package.json
│
├── ml_api/                         # ML Service (Python + Flask)
│   ├── ml_api.py                   # Flask API for plastic detection
│   ├── requirements.txt            # Python dependencies
│   └── models/
│       └── plastic_classifier_02.keras   # ⚠️ Not in repo (see below)
│
├── .env.example                    # Environment variables template
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Bootstrap 5, Vanilla JS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (JSON Web Tokens) |
| ML Service | Python, Flask, TensorFlow/Keras |
| ML Model | CNN (Convolutional Neural Network) |
| Image Storage | Local / Cloudinary |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- Python 3.8+
- MongoDB (local or Atlas)
- Git

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/arpitz04/Plastik.git
cd Plastik
```

---

### 2️⃣ Setup Environment Variables
```bash
cp .env.example server/.env
```
Edit `server/.env` and fill in your values:
```env
MONGO_URI=mongodb://localhost:27017/plastikdb
JWT_SECRET=your_strong_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

---

### 3️⃣ Install Node.js Dependencies
```bash
cd server
npm install
```

---

### 4️⃣ Install Python Dependencies
```bash
cd ml_api
pip install -r requirements.txt
```

---

### 5️⃣ Download the ML Model
The trained model is not included in the repo due to file size.

📥 **[Download plastic_classifier_02.keras](#)** ← (https://drive.google.com/file/d/1xwol7MUYhvjQ3ePvwH9veHOcVwZ01rFN/view?usp=drive_link)

Place it at:
```
ml_api/models/plastic_classifier_02.keras
```

---

### 6️⃣ Start MongoDB
```bash
# Windows (run as Administrator)
net start MongoDB

# Or just open MongoDB Compass
```

---

## 🚀 Running the Project

You need **3 terminals** running simultaneously:

### Terminal 1 — Node.js Backend
```bash
cd server
node server.js
```
✅ Expected: `Server running on port 5000` and `MongoDB Connected`

### Terminal 2 — Flask ML API
```bash
cd ml_api
python ml_api.py
```
✅ Expected: `ML model loaded successfully` and `Running on http://0.0.0.0:5001`

### Terminal 3 — Open Browser
```
http://localhost:5000
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user, returns JWT |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | ✅ | Get current user + points |

### Photos
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/photos/upload` | ✅ | Upload photo, run ML, award points |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | ❌ | Get all products |
| GET | `/api/products/:id` | ❌ | Get product by ID |
| POST | `/api/products/redeem` | ✅ | Redeem product with points |

### Rewards
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/rewards/my` | ✅ | Get my redemption history |

---

## 🤖 ML Model Details

- **Architecture:** CNN (Convolutional Neural Network)
- **Input:** 150×150 RGB images
- **Output:** Binary classification (Plastic / Non-Plastic)
- **Training:** ~80% training accuracy, ~70% validation accuracy
- **Framework:** TensorFlow / Keras
- **Threshold:** Probability > 0.5 → Plastic detected

### Training Files
| File | Description |
|------|-------------|
| `training.py` | Final training script with data augmentation + early stopping |
| `model01.py` | model script |
| `requirements.txt` | Python dependencies |

---

## 🔄 How It Works

```
User uploads image
       ↓
Node.js receives image (Multer)
       ↓
Node.js forwards to Flask ML API (port 5001)
       ↓
Flask runs CNN model → returns { isPlastic, probability }
       ↓
If plastic → award 10 points to user in MongoDB
       ↓
Frontend shows result + updated points
```

---

## 📦 Adding Products to Marketplace

Products are stored in MongoDB. Add them via MongoDB Compass:

1. Open MongoDB Compass → connect to `localhost:27017`
2. Open `plastikdb` → `products` collection
3. Click **Add Data** → Insert Document:

```json
{
  "name": "Tote Bag",
  "description": "Carry Sustainability",
  "pricePoints": 500,
  "imageUrl": "/images/product/bagprod.png",
  "stock": 50,
  "badge": "Trending"
}
```

---

## 🌱 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/plastikdb` |
| `JWT_SECRET` | Secret for signing JWT tokens | `mysecretkey123` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name | `mycloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcdef...` |
| `PORT` | Server port | `5000` |

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Author

**arpitz04** — [GitHub](https://github.com/arpitz04)

---

*Made with ♻️ for a greener planet*
