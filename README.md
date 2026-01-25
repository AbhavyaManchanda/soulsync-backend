SoulSync AI - Backend Architecture
SoulSync is an AI-driven mental health ecosystem designed to provide real-time emotional support through sentiment analysis and generative AI therapy sessions.

🛠 Tech Stack
Runtime: Node.js

Framework: Express.js

Database: MongoDB Atlas

AI Models: * Google Cloud Natural Language API (Sentiment Analysis)

Gemini 1.5 Flash (Therapeutic Dialogue & Summarization)

Authentication: JSON Web Tokens (JWT) & Bcrypt

🏗 System Design
The backend follows a Layered Architecture to separate concerns:

API Layer (Routes): Defines endpoints for Auth, Mood Logs, and Chat Sessions.

Controller Layer: The "Brain" that orchestrates requests between the user and AI services.

Service Layer: Handles direct communication with Google Cloud AI and Gemini APIs.

Data Layer (Models): Mongoose schemas for Users, Sessions, and Mood Logs.

🚀 Key Features
Stateful Therapy Sessions: Uses Gemini's startChat history to provide context-aware responses.

Hybrid Safety Guard: Combines AI sentiment scoring with a custom keyword filter to detect crisis moments.

The "Crux" Generator: Automatically generates a clinical summary at the end of every session using LLM summarization.

Mood-to-Session Bridge: Analyzes daily check-ins and proactively suggests a therapy session if distress is detected.
