LLM Prompt - Chunk 2: Firestore Collections & Basic Security
Prompt:
"Phase 1: Firebase Project Setup & Authentication - Part 2

Objective: Establish the initial Firestore data structure and basic security.

Tasks for this chunk:

Create Initial Firestore Collections (Structure Definition):

Define the conceptual structure for the following collections. For each, list key fields based on the previously discussed data models (referencing the persistent context for UserProfile, WorkflowTemplate, and SavedWorkflow structures if available to you, otherwise use common sense for a workflow application):

users/: For user profiles (e.g., uid, displayName, email, role, createdAt, lastLogin).

workflowTemplates/: For global or user-created workflow templates (e.g., name, description, stages, createdBy, isPublic).

savedWorkflows/: For user-specific saved workflow instances (e.g., userId, templateId, name, status, stages with user inputs and outputs).

Basic Firestore Security Rules:

Write initial Firestore security rules to:

Restrict access to users/{userId} documents so only the authenticated owner (request.auth.uid == userId) can read, update, and delete their own profile.

Allow an authenticated user to create their own users/{userId} document if request.auth.uid == userId.

For workflowTemplates/{templateId}:

Allow read if resource.data.isPublic == true OR if request.auth.uid == resource.data.createdBy.

Allow create for any authenticated user (request.auth != null), assuming createdBy will be set to request.auth.uid by the client or a Cloud Function.

Allow update, delete if request.auth.uid == resource.data.createdBy.

For savedWorkflows/{workflowId}:

Allow read, write (create, update, delete) if request.auth.uid == resource.data.userId.

Scaffold User Profile Model & Creation Logic:

When a new user signs up successfully via Firebase Authentication, we need to create a corresponding user document in the users/{uid} collection in Firestore.

Primary Method: Firebase Authentication Cloud Function Trigger:

Provide a simple Cloud Function (Node.js/TypeScript) using functions.auth.user().onCreate() that automatically creates this document.

The document should include these fields:

uid: (from event.uid or user.uid)

email: (from event.email or user.email)

displayName: (from event.displayName or user.displayName, can be null initially)

role: Set to "user" by default.

createdAt: Firestore server timestamp.

lastLogin: Firestore server timestamp (this could also be updated client-side or by another function on actual login events).

Alternative Method (Briefly describe): Client-side logic after successful registration. Mention why a Cloud Function trigger is generally more robust for this task.

Provide detailed Firestore data structure examples (JSON format for conceptual documents), the complete Firestore security rules for these initial collections, and the Cloud Function code for user profile creation. Explain any assumptions made. This completes Phase 1."