# 🚀 SwiftDrop - File Sharing Made Simple

**SwiftDrop** is a modern, secure, and user-friendly file-sharing application that allows users to upload and share files effortlessly. It features a stylish frontend, smooth animations, S3 file storage, email notifications, and quote-rotating inspiration—designed for simplicity, speed, and scalability.

---

## ⚙️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript, EJS (with rotating quotes, background images, and elegant animations)
- **Backend:** Node.js, Express.js
- **Storage:** AWS S3
- **Notifications:** AWS SNS + Lambda Email Consumer
- **Templating:** EJS for email and frontend UI
- **Database:** MongoDB (for email logs)

---

## 📂 Features

- ✅ Upload and share files via a sleek web form  
- 📤 Files stored securely on **AWS S3**
- 📧 Email notification to recipients using **EJS templates**
- ✨ Motivational quotes and UI animations
- 🧠 Quote rotation, logo branding, file preview, cancel buttons, etc.
- 🗂 MongoDB logging for email transactions

---

## 🧑‍💻 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/swiftdrop.git
cd swiftdrop


3. Setup Environment Variables
Create a .env file in the project root see .env.example

🧪 Local Testing
Upload File (Frontend)
Start your server locally:
node server.js