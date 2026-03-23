# 🚀 Sraha - Advanced Backend Messaging Engine

A high-security, scalable RESTful API built with **Node.js** and **Express.js**. This project implements industry-standard practices for authentication, data encryption, and cloud media management.

## 🛠️ Tech Stack

- **Runtime:** Node.js & Express.js
- **Database:** MongoDB with Mongoose ODM
- **Security:** JWT (Access/Refresh Tokens), Bcrypt, Crypto (AES-256 Encryption), Joi (Schema Validation)
- **Middleware:** Helmet, CORS, Morgan, Rate Limit
- **Storage:** Cloudinary API for media assets
- **Deployment:** AWS EC2 & PM2

## ✨ Key Technical Features

### 🔐 Advanced Security & Auth Flow

- **Hybrid Security:** Used **Bcrypt** (`hashSync`) for one-way password hashing and **Crypto** for two-way encryption of sensitive data like phone numbers.
- **Dual Token System:** Secure session management using **Access Tokens** and **Refresh Tokens**.
- **Verified Access:** Encrypted **OTP system** for Email Confirmation and Password Recovery.
- **Request Sanitization:** Strict input validation using **Joi** to prevent malicious data injection.
- **API Protection:** Integrated **Rate Limiting** to prevent brute-force attacks and **Helmet** for HTTP header security.

### 👤 Account Lifecycle Management

- **State Control:** Built-in logic for **Account Freezing** and **Restoring**.
- **Safe Deletion:** Implemented a sequential delete policy (Account must be frozen before permanent deletion) to ensure data integrity.
- **Profile Customization:** Dynamic profile and cover image management.

### 🖼️ Smart Media Handling

- **Cloud Integration:** Fully integrated with **Cloudinary** for image uploads.
- **Auto-Cleanup:** Developed a logic to automatically delete old images from the cloud when a user uploads a new one to optimize storage space.

### ⚙️ Backend Architecture

- **Global Error Handling:** A centralized middleware to capture and format all application errors.
- **Success Factory:** Unified response structure for all successful API operations.
- **Async Wrapper:** Custom handler to manage asynchronous operations without redundant try-catch blocks.

## 🚀 Deployment

Successfully deployed on **AWS (EC2)** using **PM2** for process management, ensuring 24/7 availability and zero-downtime.
