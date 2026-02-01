project:
  name: Virtual Psychological Support System (Backend)
  description: >
    An AI-powered, privacy-first backend system designed to support student mental well-being
    through natural language interaction, standardized psychological assessments,
    and ethical crisis handling.

objectives:
  - Provide empathetic AI-based mental health support
  - Integrate standardized psychological assessments
  - Ensure ethical and safe AI behavior during crisis situations
  - Maintain user privacy and data security

key_features:
  - Natural language chat using Google Gemini
  - Psychological self-assessments:
      - PHQ-9 (Depression)
      - GAD-7 (Anxiety)
      - PSS-10 (Stress)
      - CBI (Burnout)
  - Crisis detection and intervention:
      - Self-harm detection
      - Harm-to-others detection
      - AI bypass during crisis
  - Severity-based AI responses
  - Privacy-first architecture
  - Anonymous in-memory analytics
  - Modular and scalable backend design

backend_architecture:
  structure:
    src:
      app_js: Express application setup and middleware
      server_js: Server bootstrap
      routes:
        chat_js: Chat, crisis handling, and assessment orchestration
      services:
        llm_js: Google Gemini AI integration
        prompts_js: Prompt engineering and system instructions
        safety_js: Risk and crisis detection logic
        crisisResponse_js: Backend-controlled crisis responses
        assessments_js: Questionnaire loader service
        scoring_js: Assessment scoring and severity categorization
      data:
        phq9_json: PHQ-9 questionnaire
        gad7_json: GAD-7 questionnaire
        pss10_json: PSS-10 questionnaire
        cbi_burnout_json: Burnout questionnaire

tech_stack:
  runtime: Node.js
  framework: Express.js
  ai_model: Google Gemini
  validation: Zod
  logging: Morgan
  security:
    - Environment variables
    - No sensitive data logging
  data_format: JSON
  version_control: Git and GitHub

system_flow:
  - User sends message to /chat endpoint
  - Backend analyzes message for risk or crisis
  - If crisis detected:
      - AI is bypassed
      - Backend returns safe predefined response
      - Emergency contact information included
  - If no crisis:
      - AI responds empathetically
      - User may be prompted to take a psychological assessment
  - Assessment responses are scored on the backend
  - AI response is personalized based on severity

ethical_ai_handling:
  principles:
    - AI never handles crisis responses directly
    - Crisis responses are backend-controlled
    - Emergency helpline information is provided
    - No diagnosis or medical advice given
    - User safety is the top priority

privacy_and_security:
  - No user conversations stored
  - No personally identifiable information logged
  - Environment variables excluded from repository
  - Analytics are anonymous and in-memory only

api_endpoints:
  health_check:
    method: GET
    path: /health
    response: "{ ok: true }"

  chat:
    normal_chat:
      method: POST
      path: /chat
      payload:
        text: "I feel stressed because of exams"

    start_assessment:
      method: POST
      path: /chat
      payload:
        action: start_assessment
        type: pss10

    submit_assessment:
      method: POST
      path: /chat
      payload:
        action: submit_assessment
        type: pss10
        answers:
          q1: 3
          q2: 2
          q3: 4

getting_started:
  steps:
    - Clone the repository from GitHub
    - Install dependencies using npm install
    - Create .env file from .env.example
    - Add Gemini API key to .env
    - Run server using npm run dev
  server_url: http://localhost:8080

academic_and_expo_relevance:
  demonstrates:
    - Responsible AI deployment
    - Mental health domain awareness
    - Backend system design
    - Ethical crisis intervention
    - Scalable and modular architecture
  suitable_for:
    - College expos
    - Capstone projects
    - Research demonstrations
    - AI ethics discussions

future_enhancements:
  - JWT-based authentication
  - Persistent assessment history
  - Frontend dashboard
  - Professional therapist referrals
  - Multilingual support
  - Severity-based follow-up plans

author:
  name: Manish Reddy
  role: Backend and AI Integration
  degree: B.Tech CSE
  github: https://github.com/manishreddy731

disclaimer: >
  This system is not a replacement for professional mental health care.
  It is intended only as a supportive and educational tool.
