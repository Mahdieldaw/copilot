LLM Prompt - Introduction & Context
Prompt:
"You are an expert Firebase and Google Cloud Platform developer. I am building the backend for a 'Hybrid Thinking Workflow' application. Your task is to help me implement the following plan step-by-step. For each prompt I give you, focus only on the tasks listed in that specific prompt. Provide detailed explanations, code snippets (for frontend integration, security rules, Cloud Functions, etc.), and configurations as appropriate for the tasks at hand.

Let's start with Phase 1."

LLM Prompt - Chunk 1: Firebase Project Setup & Core Authentication
Prompt:
"Phase 1: Firebase Project Setup & Authentication - Part 1

Objective: Lay the groundwork with Firebase project initialization, core Firebase services, and basic user authentication.

Tasks for this chunk:

Initialize Firebase Project:

Detail the steps to set up a new Firebase project in the Firebase console.

Explain how to enable Firestore (Native mode) and Firebase Authentication.

Implement Firebase Auth in the Frontend App (Conceptual - assume a React/Vite/TypeScript frontend):

Provide instructions and a clear code snippet for installing the Firebase SDK.

Show how to initialize Firebase in the frontend application.

Implement Email/Password authentication:

Sign-up function.

Sign-in function.

Sign-out function.

Set up onAuthStateChanged logic to track user sessions and update UI/redirects.

Provide guidance and code examples for these specific tasks. Once you've covered these, I'll move to the next part of Phase 1."

LLM Prompt - Chunk 2: Firestore Collections & Basic Security
Prompt:
"Phase 1: Firebase Project Setup & Authentication - Part 2

Objective: Establish the initial Firestore data structure and basic security.

Tasks for this chunk:

Create Initial Firestore Collections (Structure Definition):

Define the conceptual structure for the following collections. For each, list key fields based on the previously discussed data models:

users/: For user profiles.

workflowTemplates/: For global or user-created workflow templates.

savedWorkflows/: For user-specific saved workflow instances.

Basic Firestore Security Rules:

Write initial Firestore security rules to:

Restrict access to users/{userId} documents so only the authenticated owner can read/write their own profile.

Allow authenticated users to create their own users/{userId} document upon sign-up.

For workflowTemplates/:

Allow authenticated users to read documents where isPublic == true.

Allow authenticated users to read documents where createdBy == request.auth.uid.

Allow authenticated users to create new templates (they will own them).

Allow users to update/delete templates only if createdBy == request.auth.uid.

For savedWorkflows/:

Allow users to read/write documents only if userId == request.auth.uid.

Scaffold User Profile Model & Creation Logic (Conceptual Frontend + Firestore Trigger):

On new user creation (after successful Firebase Auth sign-up), how can we automatically create a corresponding users/{uid} document in Firestore?

Option 1: Client-side logic after successful registration. Provide a conceptual React snippet.

Option 2: Using a Firebase Authentication trigger (Cloud Function functions.auth.user().onCreate()). Provide a simple Cloud Function (Node.js) snippet for this.

The user document should include these fields: uid, displayName (can be null initially or derived from email), email, role: "user", createdAt (server timestamp), lastLogin (server timestamp, can be updated on login).

Provide guidance and code examples for these specific tasks. This completes Phase 1."

LLM Prompt - Chunk 3: Core Workflow Data Model - Schema & Save/Load
Prompt:
"Phase 2: Core Workflow Data Model - Part 1

Objective: Enable the creation, editing, and saving of workflows with stages, inputs, and output records, focusing on schema extension and basic save/load.

Tasks for this chunk:

Extend Firestore Schema - workflowTemplates/:

Based on the WorkflowTemplate data model previously discussed, detail how to structure the stages array within a workflowTemplates/{templateId} document. Each stage object in the array should support:

id (string, unique within the template)

name (string)

archetypeKey (string, references a system-defined archetype)

position (number, for ordering)

inputs (map, for default input values or configuration for this stage in the template)

validators (array of maps, each map defining a validator with id, type, config)

nextStages (array of strings, IDs of potential next stages for branching)

uiConfig (map, e.g., { collapsed: boolean, showValidation: boolean })

Also, ensure the workflowTemplates documents can store tags (array of strings) and other metadata like version (number), category (array of strings).

Implement Save/Load Workflow Logic (Conceptual for savedWorkflows/):

Saving a Workflow:

When a user saves a workflow (e.g., as a draft or an in-progress instance), a new document should be created in savedWorkflows/.

This document should persist all user inputs for each stage, any outputs generated so far, stage-specific notes, and any validation results for outputs.

Include a field for currentStageId (string, nullable) to track user progress.

The userId (string, creator of this saved instance) and templateId (string, original template it was based on) are crucial.

Loading a Workflow:

Describe the process of fetching a document from savedWorkflows/{workflowId} and rehydrating the application state (inputs, outputs, notes, current stage) for the user.

Provide detailed structural examples for Firestore and conceptual logic for save/load operations. We will address the StageArchetype model usage and output history in the next part."

LLM Prompt - Chunk 4: Core Workflow Data Model - Archetypes & Output History
Prompt:
"Phase 2: Core Workflow Data Model - Part 2

Objective: Finalize the core workflow data model by detailing stage archetype alignment and prompt output history.

Tasks for this chunk:

StageArchetype Model Usage in savedWorkflows/:

When a workflow is saved (in savedWorkflows/), each stage within its stages array needs to align with the local client-side StageArchetype structure (which defines available input fields, types, etc.).

How should the savedWorkflows/{workflowId}.stages[N] document structure store user-provided data for inputs defined by the archetype?

Include a stageTemplateId (string) in each saved stage, mapping back to the id of the corresponding stage in the workflowTemplates/{templateId}.stages array from which it originated. This helps maintain a link to the original template's stage definition.

Prompt Output History in savedWorkflows/:

For each stage in a savedWorkflows/{workflowId}.stages[N] document, we need to store a history of prompt outputs.

Propose a structure for an outputs array within each stage. Each object in this outputs array should represent a single AI interaction and include:

id (string, unique ID for this output record)

modelId (string, e.g., 'gemini-1.5-flash')

promptText (string, the actual prompt sent)

responseText (string, the AI's response)

timestamp (Firestore timestamp)

validationResults (array of maps, each map containing validatorId, passed (boolean), message (string), timestamp).

Provide detailed structural examples for these Firestore sub-collections or embedded arrays within the savedWorkflows documents. This completes Phase 2."

LLM Prompt - Chunk 5: Prompt Library & Validator Profiles
Prompt:
"Phase 3: Prompt Library & Validators - Part 1

Objective: Enable reusable prompts and define validator profiles.

Tasks for this chunk:

Add promptLibrary/ Collection:

Define the Firestore structure for a promptLibrary/{promptId} document. It should allow saving prompts both globally (system prompts where userId is null or 'system') and per user (userId is the user's UID).

The document should include fields like:

id (string)

userId (string, nullable for system prompts)

name (string)

description (string)

prompt (string, the actual template text with placeholders like {{variable}})

variableDefinitions (array of maps, each defining a variable: { name: string, description: string, defaultValue: string | null, examples: string[] })

category (array of strings)

tags (array of strings)

isPublic (boolean, for user-created prompts that can be shared)

createdAt (timestamp)

updatedAt (timestamp)

usage (map: { count: number, lastUsed: timestamp | null, averageRating: number })

recommendedModels (array of strings, e.g., model IDs)

Create validatorProfiles/ (or System Config for Validators):

Explain how to store definitions for reusable validator profiles. This could be a top-level validatorProfiles/{validatorProfileId} collection or part of a larger systemConfig document in Firestore.

Each validator profile definition should include:

id (string, unique ID for this validator profile)

name (string, human-readable name)

type (string, e.g., 'regex', 'llm_check', 'length_check', 'custom_function')

description (string)

configSchema (map, defining the expected configuration parameters for this validator type, e.g., for regex: { pattern: string, flags: string })

defaultConfig (map, default values for its configuration)

These profiles would be referenced by validatorId in workflowTemplates and savedWorkflows.

Provide Firestore data structures for these collections. We'll cover the Cloud Function for validation next."

LLM Prompt - Chunk 6: Cloud Function for Output Validation
Prompt:
"Phase 3: Prompt Library & Validators - Part 2

Objective: Implement server-side validation logic using a Cloud Function.

Tasks for this chunk:

Cloud Function for Output Validation:

Design and provide a Node.js (TypeScript if possible) Firebase Callable Cloud Function named validateOutput.

Input to the function:

responseText (string): The AI-generated text to validate.

validatorConfig (object): An object containing:

validatorType (string): e.g., 'regex', 'length_check', 'keyword_match'.

config (object): Specific parameters for that validator type (e.g., for 'regex', it would be { pattern: string, flags: string }; for 'length_check', { min: number, max: number }).

Output from the function:

An object: { passed: boolean, message: string | string[] }. message can provide details on why validation failed or succeeded.

Implementation Details:

The function should use a switch statement or similar logic based on validatorConfig.validatorType to perform different kinds of validation.

Implement basic logic for a few example types:

regex: Test responseText against config.pattern.

length_check: Check if responseText.length is within config.min and config.max.

keyword_match: Check if responseText includes/excludes certain keywords from config.keywords_include / config.keywords_exclude.

Optional Enhancement: Briefly discuss how this function could be triggered automatically after an AI output is generated (e.g., client calls it, or a Firestore trigger on output creation calls it).

Provide the Cloud Function code and explain its deployment and usage. This completes Phase 3."

LLM Prompt - Chunk 7: AI Proxy Cloud Function & Secret Management
Prompt:
"Phase 4: AI Proxy, Storage, and Observability - Part 1

Objective: Secure AI API key usage via a proxy and set up Google Cloud Secret Manager.

Tasks for this chunk:

Set up Google Cloud Secret Manager:

Explain the steps to store an AI provider's API key (e.g., Gemini API key) in Google Cloud Secret Manager.

Detail how to grant the Firebase Cloud Functions service account permission to access this secret.

Cloud Function as AI Proxy:

Design and provide a Node.js (TypeScript if possible) Firebase HTTP Callable Cloud Function named callAIModel.

Input to the function:

modelId (string): Identifier for the AI model to use (e.g., 'gemini-1.5-flash-latest').

prompt (string): The prompt text.

generationConfig (object, optional): Configuration for the AI model (e.g., temperature, maxOutputTokens).

Function Logic:

Retrieve the AI API key from Secret Manager at runtime (show how to access it within the function).

Make an HTTPS request to the specified AI provider's API endpoint (e.g., Google AI Gemini API).

Forward the prompt and generationConfig to the AI provider.

Return the AI provider's response (or stream it if the provider supports streaming and the function is designed for it; for simplicity, a non-streaming example is fine first).

Implement basic error handling for API calls.

Logging (Basic):

Inside this function, add simple console.log statements to log: timestamp, calling user's UID (if available from context.auth), modelId used, and perhaps the first 50 chars of the prompt (for brevity).

Provide the Cloud Function code, including Secret Manager integration, and explain its deployment and usage."

LLM Prompt - Chunk 8: Firebase Storage & Basic Cloud Logging
Prompt:
"Phase 4: AI Proxy, Storage, and Observability - Part 2

Objective: Integrate Firebase Storage for artifacts and set up basic Google Cloud Logging.

Tasks for this chunk:

Firebase Storage Integration:

Purpose: Explain how Firebase Storage will be used to store:

Image uploads by users (e.g., as part of a workflow input).

Exported workflow snapshots (e.g., a JSON representation of a savedWorkflows document).

Optionally, large AI response logs or artifacts if they don't fit well in Firestore.

Security Rules for Storage: Provide example Firebase Storage security rules to:

Allow authenticated users to upload files to a path like users/{uid}/uploads/{fileName}.

Allow authenticated users to read files from their own path.

Consider rules for public assets if any (e.g., public_assets/{fileName}).

Conceptual Frontend Snippet (React): Show a basic example of how to upload a file from a React component to Firebase Storage and get its download URL.

Basic Google Cloud Logging Setup:

Explain that console.log, console.warn, console.error within Cloud Functions automatically send logs to Google Cloud Logging.

Discuss how to view these logs in the Google Cloud Console (under Logging > Logs Explorer).

Mention filtering logs by function name, severity, etc.

Tasks for Logging:

Track AI API usage (as started in the AI Proxy function).

Ensure errors from Cloud Functions are captured (this is default behavior, but emphasize checking).

Optional: Discuss how to add simple user action logs for auditing from the client-side (e.g., client calls a simple logging Cloud Function, or directly if appropriate for non-sensitive actions, though a function is better for structure).

Provide guidance, code examples for Storage rules and frontend upload, and best practices for leveraging Cloud Logging. This completes Phase 4."

LLM Prompt - Chunk 9: Advanced Execution - Cloud Tasks
Prompt:
"Phase 5: Advanced Execution & Scheduling - Part 1

Objective: Add asynchronous job support using Cloud Tasks for long-running workflow steps.

Tasks for this chunk:

Cloud Tasks for Long-Running Workflows:

Use Case: Explain when to use Cloud Tasks. For example, for workflow steps that might take a long time (e.g., complex validations, batch processing of multiple AI calls, waiting for an external human approval step before proceeding, or calling an external service that might be slow).

Setup:

Briefly describe how to enable the Cloud Tasks API in Google Cloud.

How to create a Cloud Tasks queue in the Google Cloud Console.

Creating Tasks:

Show how to create a Cloud Task from within a Firebase Cloud Function (Node.js). The task's payload should contain necessary information (e.g., workflowId, stageId, dataToProcess).

The task's target should be an HTTP Cloud Function (create a simple placeholder HTTP function that would act as the task handler).

Task Handler Function:

Provide a skeleton for the HTTP Cloud Function that will be triggered by Cloud Tasks. This function will receive the payload and perform the long-running work.

Mention how to handle retries with backoff (Cloud Tasks can be configured for this).

Example Scenario: A stage in a workflow requires validating a 100-page document. The main workflow execution function should offload this to a Cloud Task. The task handler function would then perform the validation and update the workflow status in Firestore.

Provide code snippets for creating a task and for the HTTP task handler function. Explain the flow."

LLM Prompt - Chunk 10: Advanced Execution - Pub/Sub & Cloud Run (Optional)
Prompt:
"Phase 5: Advanced Execution & Scheduling - Part 2

Objective: Introduce Pub/Sub for event-driven architecture and discuss optional Cloud Run setup.

Tasks for this chunk:

Pub/Sub for Workflow Step Events (Optional but good practice):

Use Case: Explain how Google Cloud Pub/Sub can be used to decouple services and broadcast events like "StageComplete", "ValidatorFailed", "NewWorkflowSaved". Other services or Cloud Functions can subscribe to these topics to perform actions (e.g., logging, notifications, triggering other workflows).

Setup:

Briefly describe how to enable the Pub/Sub API and create a Pub/Sub topic.

Publishing Messages:

Show a simple example of how a Cloud Function (e.g., after a stage completes in savedWorkflows) can publish a message to a Pub/Sub topic. The message payload should contain relevant event data.

Subscribing to Messages:

Show how to create a Pub/Sub-triggered Cloud Function that listens to the topic and processes incoming messages.

Cloud Run Setup (Optional - for very heavy use cases):

When to Consider: Explain that Cloud Run is suitable if validators or large prompt processing tasks become too resource-intensive or long-running for standard Cloud Functions (e.g., consistently exceeding memory or timeout limits, or requiring custom binaries/dependencies not easily managed in Cloud Functions).

Conceptual Steps (High-Level):

Containerize the application/service (e.g., a Python validation engine using Docker).

Push the container image to Google Container Registry (GCR) or Artifact Registry.

Deploy the image to Cloud Run, configuring CPU, memory, concurrency, etc.

How would a Cloud Function or Cloud Task invoke this Cloud Run service (e.g., via an authenticated HTTP request to the Cloud Run service URL)?

Provide conceptual explanations and simple code snippets for Pub/Sub integration. For Cloud Run, a high-level overview of the process is sufficient. This completes Phase 5 and the implementation plan."

