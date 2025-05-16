interface Part {
  text: string;
}

interface Content {
  parts: Part[];
  role?: string;
}

interface GenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  candidateCount?: number;
  stopSequences?: string[];
}

interface GeminiStreamResponseCandidate {
  content?: {
    parts?: Part[];
    role?: string;
  };
  finishReason?: string;
  index?: number;
  safetyRatings?: Array<{
    category: string;
    probability: string;
  }>;
}

interface GeminiStreamResponse {
  candidates?: GeminiStreamResponseCandidate[];
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  };
}

let abortController = new AbortController();

export async function* sendPrompt(
  prompt: string,
  systemInstructionText?: string,
  generationConfig?: GenerationConfig
): AsyncGenerator<string, void, undefined> {
  console.log(`Sending prompt: ${prompt}`);
  if (systemInstructionText) {
    console.log(`With system instruction: ${systemInstructionText}`);
  }
  if (generationConfig) {
    console.log(`With generation config: ${JSON.stringify(generationConfig)}`);
  }

  const requestBody: {
    contents: Content[];
    system_instruction?: Content;
    generation_config?: GenerationConfig;
  } = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  if (systemInstructionText) {
    requestBody.system_instruction = { parts: [{ text: systemInstructionText }] };
  }

  if (generationConfig) {
    requestBody.generation_config = generationConfig;
  }

  // Using Gemini 2.0 Flash model
  const MODEL_NAME = 'models/gemini-2.0-flash';
  let url = `https://generativelanguage.googleapis.com/v1beta/${MODEL_NAME}:streamGenerateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;
  
  let response = await fetch(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: abortController.signal,
    }
  );

  // Fallback to non-streaming endpoint if streaming endpoint returns 404
  if (response.status === 404) {
    console.log('Streaming endpoint returned 404, falling back to non-streaming endpoint');
    url = `https://generativelanguage.googleapis.com/v1beta/${MODEL_NAME}:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;
    
    response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal,
      }
    );
  }

  if (!response.ok) {
    let errorBody = '';
    try {
      errorBody = await response.text();
    } catch (e) {
      // Ignore if can't read body
    }
    throw new Error(
      `HTTP error! status: ${response.status} ${response.statusText}. Body: ${errorBody}`
    );
  }

  // Check if we're using the streaming or non-streaming endpoint
  const isStreaming = url.includes(':streamGenerateContent');
  
  if (isStreaming) {
    // Handle streaming response
    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
          const line = buffer.substring(0, newlineIndex).trim();
          buffer = buffer.substring(newlineIndex + 1);

          if (line) {
            try {
              const jsonData: GeminiStreamResponse = JSON.parse(line);
              if (jsonData.candidates && jsonData.candidates.length > 0) {
                const candidate = jsonData.candidates[0];
                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                  const text = candidate.content.parts[0].text;
                  if (text) {
                    yield text;
                  }
                }
              }
            } catch (error) {
              console.error('Failed to parse JSON chunk from stream:', line, error);
              throw new Error(
                `Failed to parse JSON response chunk: ${error instanceof Error ? error.message : String(error)}`
              );
            }
          }
        }
      }

      // Process any remaining data in the buffer after the stream ends
      if (buffer.trim()) {
        try {
          const jsonData: GeminiStreamResponse = JSON.parse(buffer.trim());
          if (jsonData.candidates && jsonData.candidates.length > 0) {
            const candidate = jsonData.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
              const text = candidate.content.parts[0].text;
              if (text) {
                yield text;
              }
            }
          }
        } catch (error) {
          console.error('Failed to parse final JSON chunk:', buffer.trim(), error);
          throw new Error(
            `Failed to parse final JSON response: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    } finally {
      reader.releaseLock();
    }
  } else {
    // Handle non-streaming response
    try {
      const jsonData = await response.json();
      console.log('Non-streaming response:', jsonData);
      
      if (jsonData.candidates && jsonData.candidates.length > 0) {
        const candidate = jsonData.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          const text = candidate.content.parts[0].text;
          if (text) {
            yield text;
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse non-streaming response:', error);
      throw new Error(
        `Failed to parse non-streaming response: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

export function cancelRequest(): void {
  abortController.abort();
  console.log('Request cancelled');
  abortController = new AbortController(); // Re-initialize for future requests
}