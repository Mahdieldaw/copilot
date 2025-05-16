import { useState, useCallback } from 'react';
import { sendPrompt, cancelRequest } from '../services/ai'; // Corrected import path

type AIExecutionStatus = 'idle' | 'loading' | 'done' | 'error';

interface UseAIExecutionReturn {
  response: string;
  status: AIExecutionStatus;
  error: string | null;
  run: (prompt: string) => Promise<void>;
  cancel: () => void;
}

export function useAIExecution(): UseAIExecutionReturn {
  const [response, setResponse] = useState<string>('');
  const [status, setStatus] = useState<AIExecutionStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (prompt: string) => {
    setResponse('');
    setError(null);
    setStatus('loading');

    try {
      for await (const chunk of sendPrompt(prompt)) {
        setResponse((prev) => prev + chunk);
      }
      setStatus('done');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      // Check if the error is due to an abort operation
      if (e instanceof DOMException && e.name === 'AbortError') {
        console.log('Request aborted by user.');
        setStatus('idle'); // Or 'done' if partial response is acceptable, or a new 'cancelled' state
      } else {
        setError(errorMessage);
        setStatus('error');
      }
    }
  }, []);

  const cancel = useCallback(() => {
    cancelRequest();
    // Optionally, set status here if needed, e.g., if a request was loading
    // setStatus('idle'); // Or a 'cancelled' state
    // The sendPrompt loop should catch the AbortError and handle status
  }, []);

  return { run, cancel, response, status, error };
}