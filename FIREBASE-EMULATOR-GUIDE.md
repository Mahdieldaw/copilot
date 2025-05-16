# Firebase Emulator Suite Setup Guide

## Firebase Emulators Initialization

To set up the Firebase Emulator Suite for your project, follow these steps:

1. Open a terminal in your project root directory (`mahdieldaw-copilot/`)

2. Run the following command:
   ```
   firebase init emulators
   ```

3. When prompted, make the following selections:
   - **Which Firebase features do you want to set up for this directory?**
     - Use arrow keys to navigate and space to select:
     - ✓ Emulators: Set up local emulators for Firebase products
     - Press Enter to confirm

   - **Please select an option:**
     - Use an existing project
     - Select your project from the list (mahdieldaw-copilot)

   - **Which Firebase emulators do you want to set up?**
     - Use arrow keys to navigate and space to select:
     - ✓ Authentication Emulator
     - ✓ Functions Emulator
     - ✓ Firestore Emulator
     - Press Enter to confirm

   - **Would you like to enable the Emulator UI?**
     - Yes

   - **Which port do you want to use for the Authentication Emulator?**
     - Accept the default (9099) by pressing Enter

   - **Which port do you want to use for the Functions Emulator?**
     - Accept the default (5001) by pressing Enter

   - **Which port do you want to use for the Firestore Emulator?**
     - Accept the default (8080) by pressing Enter

   - **Which port do you want to use for the Emulator UI?**
     - Accept the default (4000) by pressing Enter

   - **Would you like to download the emulators now?**
     - Yes

4. Wait for the emulators to download and install

## Configure Environment Variables

1. Create or update your `.env` file in the project root to include the emulator flag:

```
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Enable Firebase Emulators
VITE_USE_EMULATORS=true
```

## Starting the Emulators

To start all configured emulators, run the following command in your project root:

```
firebase emulators:start
```

This will start the Authentication Emulator (port 9099), Firestore Emulator (port 8080), Functions Emulator (port 5001), and the Emulator UI (port 4000).

You can access the Emulator UI at: http://localhost:4000

## Connecting Your Application

The `firebase.ts` file has been updated to automatically connect to the emulators when the `VITE_USE_EMULATORS` environment variable is set to 'true'.

## Developing with Emulators

1. Start your application in development mode
2. The application will connect to the local emulators instead of the production Firebase services
3. Any authentication, Firestore operations, and function calls will be processed by the local emulators
4. You can view and manage the emulator data through the Emulator UI at http://localhost:4000

## Notes

- The emulators do not persist data by default when restarted. If you need data persistence, refer to the [Firebase Emulator Suite documentation](https://firebase.google.com/docs/emulator-suite/install_and_configure#data_persistence).
- The `callAIModel` Cloud Function will use the mocked version as previously defined when running against the local emulators.