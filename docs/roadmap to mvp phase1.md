Actionable Task List for MVP
This task list prioritizes getting the foundational backend pieces in place, then integrating them with your existing frontend.
Phase 0: Project Setup & Security (Immediate Priorities - Blockers)
Firebase Project Setup (Real):
Task: If not already done, create a new Firebase project in the console.
Action: Follow docs/firebase-auth-implementation-guide.md (Section 1).
Action: Replace placeholder Firebase config in src/services/firebase.ts with your actual project config, using environment variables (e.g., VITE_FIREBASE_API_KEY). Create a .env file for this.
Update src/services/firebase.ts to use import.meta.env.VITE_FIREBASE_... for all config values.
Note: The API key AIzaSyB... in firebase.ts looks like a real (but perhaps test) key. Ensure this is properly secured and replaced with env vars.
Secure AI API Key with a Cloud Function Proxy:
Task: Move LLM API calls to a Firebase Cloud Function to protect your API keys.
Action:
Set up Firebase Cloud Functions in your project (firebase init functions, choose TypeScript).
Store your Gemini (and any other) API keys in Google Cloud Secret Manager (as outlined in docs/full step by step plan.md - Chunk 7).
Create an HTTP Callable Cloud Function (e.g., callAIModel) that:
Receives prompt, modelId (for future model switching), and generationConfig.
Retrieves the appropriate API key from Secret Manager.
Makes the call to the LLM provider.
Returns the response (handle streaming if possible, or start with non-streaming for simplicity).
Modify src/services/ai.ts and src/hooks/useAIExecution.ts to call this Cloud Function instead of the Gemini API directly.
Benefit: Secures API keys, centralizes AI logic, foundation for multi-model support.
Phase 1: Core Authentication & User Identity
Implement Real Firebase Authentication:
Task: Integrate Firebase Authentication services into your auth components.
Action:
Update src/components/auth/SignIn.tsx and src/components/auth/SignUp.tsx to use actual Firebase signInWithEmailAndPassword and createUserWithEmailAndPassword methods from firebase/auth. Refer to docs/firebase-auth-implementation-guide.md (Section 2.3 and components).
Create an AuthContext (as in docs/firebase-auth-implementation-guide.md - Section 3.1) to manage and provide user state globally.
In src/services/auth.ts (create if it doesn't exist, or adapt from guide), implement functions to create user documents in Firestore upon successful sign-up (as per docs/phase1.2.md - Cloud Function trigger method is best).
users/{uid} collection with fields: uid, email, displayName, createdAt, role: 'user'.
Integrate Auth into the Main Application:
Task: Decide how App.tsx and AppWithAuth.tsx will merge or interact. The goal is a single app experience where users sign in.
Recommendation:
Modify src/main.tsx (or your primary entry point if you switch it for dev) to wrap the main application component with your AuthProvider.
Your main app component (App.tsx or a new root component) should use useAuth() to:
Show a login/signup view (e.g., your AuthContainer or AuthDemo adapted) if currentUser is null.
Show the "Hybrid Thinking Workflow Builder" UI from App.tsx if currentUser exists.
Include a "Sign Out" button that calls your sign-out function.
Action: Update index.html to point to src/main.tsx (or your chosen main entry) and ensure main.tsx renders the auth-aware application structure.
Phase 2: Basic Workflow Storage
Define Firestore Data Models & Security Rules:
Task: Implement Firestore collections for storing workflows.
Action:
Create savedWorkflows collection in Firestore.
Define the structure for a document in savedWorkflows (e.g., userId, templateId (from stage_archetypes.ts key), name, inputs (user-filled values for the archetype), editablePromptTemplate, createdAt, updatedAt). Refer to docs/hybrid-thinking-firebase-architecture.md - SavedWorkflow interface for inspiration.
Implement basic Firestore security rules for savedWorkflows: only the authenticated user can create, read, update, delete their own workflows (allow read, write: if request.auth.uid == resource.data.userId;). Refer to docs for more examples.
Implement Save Workflow Logic:
Task: Add functionality to save the current archetype configuration to Firestore.
Action:
In App.tsx, add a "Save Workflow" button.
When clicked, this button should:
Gather current selectedArchetypeKey, inputs state, and editablePromptTemplate.
Get the currentUser.uid from your AuthContext.
Create a new document in the savedWorkflows Firestore collection with this data.
Provide user feedback (e.g., "Workflow saved!").
Implement Load Workflow Logic:
Task: Add functionality to list and load saved workflows from Firestore.
Action:
Create a new component/section (e.g., "My Workflows").
Fetch and display a list of workflows from savedWorkflows where userId == currentUser.uid.
When a user clicks on a saved workflow:
Fetch the full workflow document from Firestore.
Update the state in App.tsx (setSelectedArchetypeKey, setInputs, setEditablePromptTemplate) with the loaded data.
(Optional for MVP, but good) Workflow Naming/Management:
Allow users to name their saved workflows.
Allow users to delete their saved workflows.
Phase 3: LLM Model Switching (Basic)
Modify AI Proxy Cloud Function:
Task: Enhance the callAIModel Cloud Function to support different models/providers.
Action:
The function should accept a parameter indicating the desired model or provider (e.g., modelId: 'gemini-1.5-flash', modelId: 'openai-gpt-4o').
Based on this parameter, the function should:
Retrieve the correct API key from Secret Manager.
Call the appropriate LLM provider's API endpoint.
Adapt the request payload if necessary for different providers.
Frontend UI for Model Selection:
Task: Add a simple way for users to select an LLM.
Action:
In App.tsx (likely in the "Preview & Run AI" tab), add a dropdown menu to select the AI model.
Initially, this could just be between two Gemini models (e.g., "Gemini 1.5 Flash," "Gemini 1.5 Pro") or even a conceptual "OpenAI Model (coming soon)" placeholder.
Store the selected model in React state.
Pass Model Selection to AI Service:
Task: Ensure the selected model is used for the AI call.
Action:
When run from useAIExecution is called, pass the selected model ID.
useAIExecution should pass this to the (refactored) sendPrompt function in src/services/ai.ts.
sendPrompt should now include this modelId in its call to the callAIModel Cloud Function.
Post-MVP Considerations (but keep in mind):
Workflow Templates: Allowing users to save their own customized archetypes/prompt templates as new base templates (workflowTemplates collection).
Output History: Storing AI outputs per stage within savedWorkflows.
Validation: Implementing the validator profiles and logic.
Robust Error Handling & UX: More specific error messages, retries, toasts/notifications.
UI Polish: Refining the UI, possibly integrating a component library.
Shared Workflows/Templates: If collaboration is a goal.