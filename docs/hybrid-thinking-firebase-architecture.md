# Hybrid Thinking: Firebase & Google Cloud Architecture

## Architecture Overview

This document outlines the Firebase and Google Cloud Platform (GCP) implementation architecture for Hybrid Thinking Workflow, an AI-orchestration platform for AI layman users and innovators.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATION                          │
│                                                                     │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────────┐  │
│  │   Workflow   │  │    Prompt     │  │    Model Selection &     │  │
│  │ Orchestrator │  │   Executor    │  │    Provider Integration  │  │
│  └──────────────┘  └───────────────┘  └──────────────────────────┘  │
│          │                │                        │                │
│          ▼                ▼                        ▼                │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────────┐  │
│  │    Output    │  │  Workflow     │  │      User Progress       │  │
│  │  Validator   │  │  Engine       │  │        Tracker           │  │
│  └──────────────┘  └───────────────┘  └──────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       FIREBASE / GCP SERVICES                       │
│                                                                     │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────────┐  │
│  │ Firebase     │  │  Firestore    │  │    Firebase Storage      │  │
│  │ Auth         │  │  Database     │  │                          │  │
│  └──────────────┘  └───────────────┘  └──────────────────────────┘  │
│                                                                     │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────────┐  │
│  │  Cloud       │  │  Pub/Sub &    │  │    Cloud Functions       │  │
│  │  Logging     │  │  Cloud Tasks  │  │                          │  │
│  └──────────────┘  └───────────────┘  └──────────────────────────┘  │
│                                                                     │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────────┐  │
│  │  Secret      │  │  Cloud Run    │  │    Vertex AI &           │  │
│  │  Manager     │  │  (Optional)   │  │    API Gateway           │  │
│  └──────────────┘  └───────────────┘  └──────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                           │
│                                                                     │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────────┐  │
│  │ OpenAI API   │  │  Gemini API   │  │    Other AI Model        │  │
│  │ (GPT)        │  │               │  │      Providers           │  │
│  └──────────────┘  └───────────────┘  └──────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Service Mapping

### Authentication & Security
- **Firebase Authentication**
  - User registration, login, session management
  - OAuth integration for social login
  - Role-based access control (admin, standard user)
  - Security rules for Firestore and Storage

- **Secret Manager**
  - Store API keys for AI providers (OpenAI, Gemini, etc.)
  - Secure credentials for external services
  - Environment-specific configuration values

### Data Storage & Persistence
- **Firestore**
  - User profiles document collection
  - Workflow templates collection 
  - Saved workflows collection (user-specific)
  - Prompt library collection
  - Execution history collection
  - Output validation records

- **Firebase Storage**
  - Large workflow artifacts (images, documents)
  - Exported workflow packages
  - User uploaded reference materials
  - Example outputs and templates

### Serverless Processing
- **Cloud Functions**
  - Authentication triggers (user creation, deletion)
  - Workflow validation functions
  - AI provider proxy endpoints (for API key protection)
  - Scheduled workflow execution
  - Notification sending
  - Output processing and enhancement

- **Cloud Run** (Optional for complex processing)
  - Heavy workflow orchestration services
  - Advanced validation engines
  - Custom model serving

### Integration & Messaging
- **Pub/Sub**
  - Asynchronous workflow step triggers
  - Event-driven architecture enablement
  - Parallel processing coordination
  - Integration with external systems

- **Cloud Tasks**
  - Scheduled workflow executions
  - Delayed processing of workflow steps
  - Retry logic for failed API calls
  - Rate limiting for external API usage

### AI Integration
- **Vertex AI** (Optional enhancement)
  - Custom model deployment
  - Model registry integration
  - Workflow optimization analysis

- **API Gateway**
  - Unified interface for multiple AI providers
  - Request transformation
  - Response normalization
  - Rate limiting and quota management

### Observability
- **Cloud Logging**
  - Application logs aggregation
  - User activity tracking
  - Error monitoring
  - Audit logs for security events

- **Cloud Monitoring**
  - System health dashboards
  - User engagement metrics
  - Performance monitoring
  - Cost optimization insights

## Data Models

### User Profile
```typescript
interface UserProfile {
  uid: string;              // Firebase Auth UID
  displayName: string;
  email: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  role: 'admin' | 'user';
  preferences: {
    defaultModelProvider: string;
    defaultTemperature: number;
    uiTheme: string;
    notificationPreferences: {
      email: boolean;
      inApp: boolean;
    }
  };
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  usage: {
    promptCount: number;
    tokensUsed: number;
    lastResetDate: Timestamp;
  }
}
```

### Workflow Template
```typescript
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string[];
  tags: string[];
  createdBy: string;         // User ID or 'system'
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
  stages: Array<{
    id: string;
    name: string;
    archetypeKey: string;    // References archetype in system
    position: number;
    inputs: Record<string, any>;
    validators: Array<{
      id: string;
      type: string;
      config: Record<string, any>;
    }>;
    nextStages: string[];    // IDs of potential next stages (for branching)
    uiConfig: {
      collapsed: boolean;
      showValidation: boolean;
    }
  }>;
  modelRecommendations: Record<string, string[]>;  // Stage ID -> recommended models
}
```

### Saved Workflow
```typescript
interface SavedWorkflow {
  id: string;
  userId: string;
  templateId: string;        // Original template this was based on
  name: string;
  description: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastExecuted: Timestamp | null;
  status: 'draft' | 'in_progress' | 'completed';
  stages: Array<{
    id: string;
    stageTemplateId: string;
    position: number;
    inputs: Record<string, any>;   // User-provided values
    outputs: Array<{
      id: string;
      modelId: string;
      promptText: string;
      responseText: string;
      timestamp: Timestamp;
      validationResults: Array<{
        validatorId: string;
        passed: boolean;
        message: string;
        timestamp: Timestamp;
      }>
    }>;
    notes: string;
    completedAt: Timestamp | null;
  }>;
  currentStageId: string | null;
}
```

### Prompt Library
```typescript
interface PromptTemplate {
  id: string;
  userId: string | null;     // null for system prompts
  name: string;
  description: string;
  category: string[];
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic: boolean;
  prompt: string;
  variableDefinitions: Array<{
    name: string;
    description: string;
    defaultValue: string | null;
    examples: string[];
  }>;
  recommendedModels: string[];
  usage: {
    count: number;
    lastUsed: Timestamp | null;
    averageRating: number;
  }
}
```

### System Configuration (for admin use)
```typescript
interface SystemConfig {
  aiProviders: Record<string, {
    name: string;
    isEnabled: boolean;
    models: Array<{
      id: string;
      displayName: string;
      capabilities: string[];
      maxTokens: number;
      costPerToken: number;
    }>;
    quotaSettings: {
      dailyLimit: number;
      userDefaultLimit: number;
      rateLimitPerMinute: number;
    }
  }>;
  featureFlags: Record<string, boolean>;
  archetypes: Record<string, any>;  // System archetypes configuration
  validatorRegistry: Record<string, {
    type: string;
    displayName: string;
    description: string;
    configSchema: Record<string, any>;
  }>;
}
```

## Security Rules Structure

### Firestore Rules
```
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles - users can read/write only their own profile
    match /users/{userId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Workflow templates - users can read public templates and their own
    match /workflowTemplates/{templateId} {
      allow read: if resource.data.isPublic == true || 
                   (request.auth != null && resource.data.createdBy == request.auth.uid);
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.createdBy == request.auth.uid;
    }
    
    // Saved workflows - users can only access their own
    match /savedWorkflows/{workflowId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Prompt library - users can read public prompts and their own
    match /promptLibrary/{promptId} {
      allow read: if resource.data.isPublic == true || 
                   (request.auth != null && resource.data.userId == request.auth.uid);
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // System config - admin access only
    match /systemConfig/{configId} {
      allow read: if request.auth != null; // All authenticated users can read
      allow write: if request.auth != null && 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Storage Rules
```
// Storage security rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User workflow artifacts - users can access only their own
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public assets - anyone can read
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Template assets - users can read public templates and their own
    match /templates/{templateId}/{allPaths=**} {
      allow read: if resource.metadata.isPublic == 'true' || 
                   (request.auth != null && resource.metadata.createdBy == request.auth.uid);
      allow write: if request.auth != null && resource.metadata.createdBy == request.auth.uid;
    }
  }
}
```

## Implementation Phases

### Phase 1: MVP Foundation
1. Set up Firebase project and basic configuration
2. Implement Firebase Auth with basic user profiles
3. Create Firestore collections for workflow templates and saved workflows
4. Integrate client app with Firebase Auth
5. Establish basic Cloud Logging implementation
6. Create initial Cloud Functions for AI provider proxying

### Phase 2: Core Workflow Features
1. Expand Firestore data model with full workflow capabilities
2. Implement workflow saving and loading functionality
3. Create prompt library structure
4. Develop validator framework with cloud functions
5. Set up Cloud Tasks for workflow scheduling

### Phase 3: Advanced Features & Observability
1. Implement Pub/Sub for async workflow steps
2. Add Firebase Storage for workflow artifacts
3. Develop comprehensive logging and monitoring
4. Implement API Gateway for unified AI provider access
5. Enhance security rules for production

### Phase 4: Scale & Optimize
1. Set up Vertex AI for custom model serving (if needed)
2. Implement advanced analytics and user insights
3. Optimize performance and reduce costs
4. Add Cloud Run services for heavy processing
5. Implement advanced security measures

## Cost Optimization Strategy
- Use Firestore document limits strategically to minimize read operations
- Implement caching for frequently accessed data
- Use Cloud Functions with optimal memory configurations
- Monitor and adjust resource allocation based on usage patterns
- Leverage free tier limits effectively for MVP
