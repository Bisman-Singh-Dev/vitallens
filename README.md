# RoboDoc (Vitallens)

Hey! Welcome to RoboDoc (formerly Vitallens). This is a personal AI Health Assistant project I've been building to act as a smart diagnostic lab right from your browser. 

I designed it to work on pretty much any device (including Raspberry Pi!) by leveraging a bunch of cutting-edge AI models for vision, speech, and text processing.

## What it does

- **Voice Activated:** I just switched the whole speech engine to use the Groq Whisper API so it's crazy fast and actually reliable across different browsers. Just click the mic button to talk.
- **Emergency Detection:** If you say "help" or "emergency", it instantly opens the camera, scans the situation, and pulls up relevant first-aid instructions or video tutorials.
- **Smart Diagnosis:** You can upload pictures of injuries/symptoms or just point your camera at it, and it analyzes what's going on.
- **Multilingual:** Supports both English and Hindi voice commands natively. 

## Tech Stack

This project is built using:
- **Next.js** (App Router) + React
- **Tailwind CSS** & Framer Motion for the UI/animations
- **MediaPipe Tasks Vision** for edge-based gesture detection (like recognizing a thumbs-up to take a photo)
- **Groq Whisper API** for ultra-fast Speech-to-Text
- **Deepgram / Native Speech Synthesis** for Text-to-Speech

## Getting Started

1. Clone the repo and install packages:
   ```bash
   npm install
   ```

2. Set up your environment variables. You'll need to create a `.env.local` file with your keys for Groq, Firebase, OpenAI, Gemini, etc.

3. Run the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app in action.

## Deployment

The app is fully optimized to be deployed on Vercel. Just connect your GitHub repo to Vercel and it should deploy out of the box. Make sure you add all the API keys in your Vercel project settings!

---
*Built with love (and a lot of coffee) to make AI health assistance accessible anywhere.*
