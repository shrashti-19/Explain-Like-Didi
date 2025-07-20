# Explain-Like-Didi
A GenAI chatbot that explains complex topics to girls &amp; women in Bharat in a warm, simple tone — like an elder sister.

---
#### ✅ Live URLs
🔹 Frontend (User Interface):
https://explain-like-didi.vercel.app/

🔹 Backend (Gemini API Proxy):
https://didi-proxy-server.onrender.com

---
## ✨ Features
- 🌗 Light/Dark mode toggle
- 🧭 Sidebar filters (All / You / Didi)
- 🏷️ Tag-based filtering
- 🎤 Voice input with mic glow effect
- 👋 Warm welcome greeting screen
- 💬 Scrollable chat with timestamps
- 🤖 AI replies powered by **Google Gemini API**
- 🔐 Secure proxy backend using environment variables
---

## 🛠️ Tech Stack
| Layer      | Technology               |
|-----------|--------------------------|
| Frontend  | React + Vite + HTML/CSS  |
| Backend   | Node.js + Express        |
| API       | Google Gemini 2.5 Flash  |
| Styling   | Vanilla CSS              |
| Deployment| *(Planned: Vercel + Render)* |

---

## 🚀 Getting Started
### ✅ Prerequisites

- Node.js installed on your machine
- A valid [Gemini API Key](https://ai.google.dev/)


---

### 📂 Project Structure
    EXPLAIN-LIKE-DIDI
    |-client/ # Frontend (React+Vite)
    |-didi-proxy-server/ # Backend(Node.js + Express)
    |-Readme.md 


### 🔧 Local Setup
#### 1. Clone the Repo
     ```bash
     git clone https://github.com/yourusername/explain-like-didi.git

     cd explain-like-didi

     ```

#### 2. Start the Frontend
    ```bash
    cd client 
    npm install
    npm run dev
    # -> App runs at http://localhost:5173
    ```

#### Start the Backend Proxy
    ```bash
    cd ../didi-proxy-server
    npm install

    # Create a .env file in this folder
    # .env

    GEMINI_API_KEY = your_google_gemini_api_key_here

    node index.js

    # -> Proxy runs at http://localhost:5000

    ```

#### 📷 Preview


## 📷 Preview

### 🖼️ Interface Overview

#### 1. Greeting Screen
![Greeting UI](client/src/assets/UI_1.png)

#### 2. Sidebar & Chat Interface
![Sidebar UI](client/src/assets/UI_2.png)




#### Upcoming Features
- Chat export / save history
- Multilingual support
- Emoji and tone enhanced replies
- Text-to-speech for Didi replies
- Mobile UI enhancements


#### 👩‍💻Author
Made with ❤️ by Shrashti Dwivedi


## This project was created by Shrashti Dwivedi as part of the Meesho ScriptedByHer 2025 hackathon
