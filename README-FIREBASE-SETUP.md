# Firebase Setup Guide for Hybrid Thinking Workflow

This guide provides step-by-step instructions for setting up the Firebase backend for the Hybrid Thinking Workflow application.

## Prerequisites

- Node.js and npm installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Google Cloud CLI installed (for Secret Manager setup)

## 1. Firebase Project Setup

### 1.1 Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "Hybrid Thinking Workflow")
4. Choose whether to enable Google Analytics (recommended)
5. Accept the terms and click "Create project"

### 1.2 Enable Required Services

1. In the Firebase console, navigate to your project
2. Enable the following services:
   - **Authentication**: In the left sidebar, click "Authentication" > "Get started" > Enable "Email/Password" authentication
   - **Firestore Database**: Click "Firestore Database" > "Create database" > Choose "Start in production mode" > Select a location
   - **Storage**: Click "Storage" > "Get started" > Choose "Start in production mode" > Select a location

## 2. Configure Environment Variables

1. Copy the Firebase configuration from your Firebase project settings
2. Update the `.env` file in the project root with your Firebase configuration:

```
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## 3. Set Up Cloud Functions

### 3.1 Initialize Firebase in Your Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project directory
cd copilot
firebase init
```

Select the following features when prompted:
- Firestore
- Functions
- Hosting
- Storage
- Emulators

Choose your Firebase project when prompted.

### 3.2 Set Up Google Cloud Secret Manager

1. Enable the Secret Manager API in your Google Cloud project:

```bash
gcloud services enable secretmanager.googleapis.com
```

2. Create secrets for your AI API keys:

```bash
# For Gemini API key
gcloud secrets create gemini-api-key --replication-policy="automatic"
gcloud secrets versions add gemini-api-key --data-file="/path/to/gemini-api-key.txt"

# For OpenAI API key (if needed)
gcloud secrets create openai-api-key --replication-policy="automatic"
gcloud secrets versions add openai-api-key --data-file="/path/to/openai-api-key.txt"
```

3. Grant the Cloud Functions service account access to the secrets:

```bash
# Get your project ID
PROJECT_ID=$(gcloud config get-value project)

# Get the Cloud Functions service account
SERVICE_ACCOUNT=$(gcloud functions describe callAIModel --format="value(serviceAccountEmail)")

# Grant access to the secrets
gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding openai-api-key \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"
```

## 4. Deploy Cloud Functions

```bash
cd copilot
firebase deploy --only functions
```

## 5. Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

## 6. Testing the Setup

1. Start the local development server:

```bash
npm run dev
```

2. Test user authentication by signing up and signing in
3. Test the AI functionality by running a prompt through the application

## Troubleshooting

### Cloud Function Issues

- Check the Firebase Functions logs in the Firebase Console
- Ensure the service account has proper permissions to access Secret Manager
- Verify that the API keys are correctly stored in Secret Manager

### Authentication Issues

- Ensure Email/Password authentication is enabled in the Firebase Console
- Check for any errors in the browser console
- Verify that the Firebase configuration in `.env` is correct

### API Key Security

- Never commit API keys to your repository
- Always use environment variables or Secret Manager for API keys
- Use Firebase security rules to restrict access to your data