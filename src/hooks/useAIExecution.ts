import { useState, useCallback } from 'react';
import { sendPrompt } from '../services/ai';

type AIExecutionStatus = 'idle' | 'loading' | 'done' | 'error';

interface UseAIExecutionReturn {
  response: string;
  status: AIExecutionStatus;
  error: Error | null;
  run: (prompt: string, modelId: string, generationConfig?: object) => Promise<void>;
}

export function useAIExecution(): UseAIExecutionReturn {
  const [response, setResponse] = useState<string>('');
  const [status, setStatus] = useState<AIExecutionStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(async (prompt: string, modelId: string, generationConfig?: object) => {
    setResponse('');
    setError(null);
    setStatus('loading');

    try {
      const resultText = await sendPrompt(prompt, modelId, generationConfig);
      setResponse(resultText);
      setStatus('done');
    } catch (e: any) {
      console.error("Error in useAIExecution run:", e);
      if (e instanceof Error) {
        setError(e);
      } else {
        setError(new Error(String(e.message || 'An unknown error occurred')));
      }
      setStatus('error');
    }
  }, []);

  return { run, response, status, error };
}