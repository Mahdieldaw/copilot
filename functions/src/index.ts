import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

try {
   admin.initializeApp();
 } catch (e) {
   functions.logger.info("Admin Initialization attempted more than once or failed", e);
 }

interface CallAIModelData {
    prompt: string;
    modelId: string;
    generationConfig?: object;
}

export const callAIModel = functions.https.onCall(async (data: CallAIModelData, context: functions.https.CallableContext) => {
     // Optional: Temporarily comment out auth check for easier initial testing if client isn't sending auth context yet
     /*
     if (!context.auth) {
         functions.logger.warn('Unauthenticated request to callAIModel.');
         throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
     }
     */

     if (!data.prompt) {
         functions.logger.error('callAIModel called without a prompt.');
         throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid "prompt".');
     }

     functions.logger.info(`callAIModel received - Prompt: "${data.prompt}", ModelId: "${data.modelId}"`);

     await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

     const responseText = `Mocked AI response for prompt: '${data.prompt}' using model '${data.modelId}'`;
     functions.logger.info(`callAIModel returning mock: "${responseText}"`);
     return { text: responseText };
 });

// Cloud Function that triggers when a new Firebase Authentication user is created
export const onCreateUser = functions.auth.user().onCreate(async (user) => {
    try {
        // Construct the new user profile object
        const newUserProfile = {
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || '',
            role: 'user',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
            preferences: {},
            usage: { promptCount: 0, tokensUsed: 0 }
        };

        // Get a reference to the Firestore database
        const db = admin.firestore();
        
        // Save the user profile to Firestore
        await db.collection('users').doc(user.uid).set(newUserProfile);
        
        functions.logger.info(`User profile created for ${user.uid}`, { structuredData: true });
        return null;
    } catch (error) {
        functions.logger.error('Error creating user profile:', error);
        throw error;
    }
});