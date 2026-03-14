# 🎓 AI Student Support System

A premium, full-stack AI-powered student support platform designed to assist university students with admissions, mental health, academics, and administrative queries.

![Banner](file:///C:/Users/akhil/.gemini/antigravity/brain/e48cfc05-ba77-4b02-abab-f4bb035fc7d0/media__1773404420675.png)

## ✨ Features

### 🤖 Intelligent AI Chatbot (CampusAI)
- **Deep Sentiment Analysis**: Real-time detection of student stress and urgency.
- **Multilingual Support**: Switch between 6+ languages seamlessly.
- **Context-Aware Responses**: Powered by OpenAI/Groq models for high-quality reasoning.
- **Urgent Priority Flags**: Automatically detects potential mental health crises and routes to human support channels.

### 🏥 Mental Health & Wellness Center
- **Live Appointment Booking**: Fully integrated with the backend and MongoDB.
- **Crisis Directives**: Immediate access to hotlines and emergency resources.
- **Confidential Support**: Privacy-first design for sensitive student communications.

### 📑 Dynamic Admissions Tracker
- **Real-Time Progress**: Live tracking of application status (Applied → Under Review → Accepted).
- **Document Checklist**: Automated tracking of submitted vs. pending documents.
- **Persistent Student Identity**: Identity management that remembers student progress across sessions.

### 👔 Admin Dashboard
- **System-Wide Analytics**: Monitor total queries, active students, and urgent cases at a glance.
- **Knowledge Base Manager**: Add and categorize FAQs to update the AI's training data live.
- **Interaction Stream**: View real-time student-AI interactions and sentiment labels.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS (Dark Glassmorphism UI), Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **AI Engine**: OpenAI API / Groq (Llama-3 Support).
- **Architecture**: Modular Service Layer, Centralized Error Handling, Joi Validation.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on port 27017)

### Installation

1. **Clone the repository** (or navigate to the folder).
2. **Install Root Dependencies**:
   ```bash
   npm install
   ```
3. **Configure the Server**:
   Navigate to `server/.env` and add your credentials:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/student-support
   OPENAI_API_KEY=your_key_here
   ```
4. **Run the Application**:
   From the root directory:
   ```bash
   npm run dev
   ```

## 📐 Professional Refactor Notes
The backend has been refactored from a simple script into a production-ready architecture featuring:
- **Centralized API Response Helpers** for unified frontend communication.
- **Global Error Handling Middleware** to standardize all server exceptions.
- **Student Profile Identity System** to link queries and appointments to persistent users.
- **Clean Service Layer** to separate business logic from routing.

---
*Created with ❤️ for Advanced Student Support.*
