// src/services/ai.ts
// AI model related interfaces
import { httpsCallable } from 'firebase/functions';
import type { HttpsCallableResult } from 'firebase/functions';
import { functions } from './firebase';

export const sendPrompt = async (
    prompt: string,
    modelId: string,
    generationConfig?: object
): Promise<string> => {
    const callAIModelCallable = httpsCallable(functions, 'callAIModel');
    try {
        const result: HttpsCallableResult = await callAIModelCallable({ prompt, modelId, generationConfig });
        const data = result.data as { text?: string; message?: string; [key: string]: any };

        if (data && typeof data.text === 'string') {
            return data.text;
        } else if (data && data.message) {
            throw new Error(data.message);
        } else {
            throw new Error('Invalid response format from Cloud Function or missing text.');
        }
    } catch (error: any) {
        console.error('Error calling Firebase Function "callAIModel":', error);
        if (error.code && error.message) {
            throw new Error(`Firebase Function Error (${error.code}): ${error.message}`);
        }
        throw error;
    }
};