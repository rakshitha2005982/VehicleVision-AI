# 🚗 VehicleVision-AI Backend

An Intelligent Media Processing Pipeline built using **Node.js**, **Express.js**, **MySQL**, **Redis (BullMQ)**, **Sharp**, **Tesseract OCR**, and **YOLO AI**.

This project processes uploaded vehicle images asynchronously and performs multiple image analysis checks before returning structured results.

---

# Features

- Image Upload API
- Asynchronous Image Processing (BullMQ + Redis)
- MySQL Database Integration
- Image Metadata Storage
- OCR for Vehicle Number Detection
- Indian Vehicle Number Validation
- AI Object Detection (YOLO)
- Blur Detection
- Brightness Analysis
- Duplicate Image Detection using SHA-256 Hash
- Image Dimension Analysis
- Processing Status API
- Processing Result API

---

# Tech Stack

Backend
- Node.js
- Express.js

Database
- MySQL

Queue
- Redis
- BullMQ

AI / Image Processing
- Sharp
- Tesseract.js
- YOLO
- Crypto (SHA-256)

---

# Project Structure

```
VehicleVision-AI
│
├── src
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── queue
│   ├── routes
│   ├── services
│   ├── uploads
│   ├── utils
│   └── workers
│
├── server.js
├── package.json
└── README.md
```

---

# Processing Flow

1. User uploads an image.
2. Image metadata is stored in MySQL.
3. A Processing ID is generated.
4. Job is added to Redis Queue.
5. Worker processes image asynchronously.
6. Image analysis is performed.
7. OCR extracts vehicle number.
8. Vehicle number is validated.
9. Duplicate image detection is performed.
10. Results are stored in MySQL.
11. User fetches processing status and results.

---

# Installation

Clone the repository

```bash
git clone <repository-url>
```

Install dependencies

```bash
npm install
```

Start Redis

```bash
docker run -d --name redis-server -p 6379:6379 redis
```

Start Backend

```bash
npm start
```

Start Worker

```bash
node src/workers/imageWorker.js
```

---

# Environment Variables

Create a `.env` file

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vehiclevision

REDIS_HOST=localhost
REDIS_PORT=6379
```

---

# API Endpoints

## Upload Image

POST

```
/api/upload
```

Response

```json
{
    "processingId":"UUID",
    "status":"pending"
}
```

---

## Get Processing Status

GET

```
/api/status/:processingId
```

---

## Get Processing Result

GET

```
/api/result/:processingId
```

---

# AI Usage Disclosure

AI was used to assist with:

- BullMQ queue integration
- OCR integration
- Image analysis implementation
- Duplicate detection approach
- Vehicle number validation logic
- API design guidance

All generated code was manually reviewed, tested, debugged, and integrated into the project.

---

# Trade-offs

Due to limited development time:

- Implemented heuristic-based duplicate detection using SHA-256.
- Vehicle number validation uses regex for Indian registration format.
- AI detection uses a lightweight YOLO model.
- Processing is asynchronous using BullMQ.

---

# Future Improvements

- Screenshot detection
- Photo-of-photo detection
- Image tampering detection
- Confidence scoring
- Automated testing
- Docker Compose
- Cloud Storage
- Deployment

---

# Sample Workflow

1. Upload Image
2. Receive Processing ID
3. Check Processing Status
4. Fetch Processing Result

---

# Author

Rakshitha