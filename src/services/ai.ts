// src/services/ai.ts
// Gemini API related interfaces (assuming these are correct for your model)
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

  const MODEL_NAME = 'models/gemini-1.5-flash-latest'; // Or your preferred model
  let url = `https://generativelanguage.googleapis.com/v1beta/${MODEL_NAME}:streamGenerateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;
  
  let response = await fetch(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: abortController.signal,
    }
  );

  // Fallback for specific errors or if streaming endpoint is problematic
  if (!response.ok && (response.status === 404 || response.status === 500 || response.status === 400)) {
    console.warn(`Streaming endpoint returned ${response.status}, attempting fallback to non-streaming.`);
    const nonStreamingModelName = 'models/gemini-1.5-flash-latest'; // Ensure this is a valid non-streaming model
    url = `https://generativelanguage.googleapis.com/v1beta/${nonStreamingModelName}:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;
    
    response = await fetch(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: abortController.signal,
      }
    );
  }

  if (!response.ok) {
    let errorBody = '';
    try { errorBody = await response.text(); } catch (e) { /* ignore */ }
    console.error(`HTTP error! Status: ${response.status}. Body: ${errorBody}`);
    throw new Error(`HTTP error! status: ${response.status} ${response.statusText}. Details: ${errorBody}`);
  }

  const isStreaming = url.includes(':streamGenerateContent');
  
  if (isStreaming) {
    if (!response.body) throw new Error('Response body is null for streaming request.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Try to find and parse complete JSON objects in the buffer
        // This looks for standalone JSON objects starting with '{' and ending with '}'
        let objStartIndex = buffer.indexOf('{');
        while (objStartIndex !== -1) {
          let openBraces = 0;
          let objEndIndex = -1;

          for (let i = objStartIndex; i < buffer.length; i++) {
            if (buffer[i] === '{') {
              openBraces++;
            } else if (buffer[i] === '}') {
              openBraces--;
              if (openBraces === 0) {
                objEndIndex = i;
                break;
              }
            }
          }

          if (objEndIndex !== -1) {
            // Found a complete JSON object string
            const jsonString = buffer.substring(objStartIndex, objEndIndex + 1);
            buffer = buffer.substring(objEndIndex + 1); // Remove processed part from buffer

            try {
              const jsonData: GeminiStreamResponse = JSON.parse(jsonString);
              
              if (jsonData.promptFeedback?.blockReason) {
                console.error("Prompt blocked by API:", jsonData.promptFeedback.blockReason, jsonData.promptFeedback.safetyRatings);
                throw new Error(`Prompt blocked: ${jsonData.promptFeedback.blockReason}`);
              }

              if (jsonData.candidates && jsonData.candidates.length > 0) {
                const candidate = jsonData.candidates[0];
                // Check for finishReason to avoid processing empty final chunks if any
                if (candidate.finishReason && candidate.finishReason !== "STOP" && candidate.finishReason !== "MAX_TOKENS") {
                     console.warn("Candidate finished due to:", candidate.finishReason, candidate.safetyRatings);
                }

                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                  const text = candidate.content.parts[0].text;
                  if (text) { // Ensure text is not null or undefined
                    console.log("Yielding text chunk:", text);
                    yield text;
                  }
                }
              }
            } catch (e) {
              console.error('Failed to parse JSON object from stream buffer. Object string:', jsonString, 'Error:', e);
              // Optionally, decide whether to skip this malformed object or throw an error
              // For now, we log and continue, trying to find the next valid object.
            }
            objStartIndex = buffer.indexOf('{'); // Look for the next potential object in the modified buffer
          } else {
            // Incomplete JSON object in buffer, need more data
            break; 
          }
        }
      }
      // After the loop, if there's remaining data in the buffer that wasn't processed
      // (e.g. a truncated final JSON object or non-JSON text), log it.
      if (buffer.trim()) {
        console.warn("Unprocessed data remaining in stream buffer:", buffer.trim());
      }
    } finally {
      reader.releaseLock();
    }
  } else { // Non-streaming response
    try {
      const jsonData = await response.json();
      console.log('Non-streaming response received:', jsonData);
      
      if (jsonData.promptFeedback?.blockReason) {
        console.error("Prompt blocked by API (non-streaming):", jsonData.promptFeedback.blockReason, jsonData.promptFeedback.safetyRatings);
        throw new Error(`Prompt blocked: ${jsonData.promptFeedback.blockReason}`);
      }

      if (jsonData.candidates && jsonData.candidates.length > 0) {
        const candidate = jsonData.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          const text = candidate.content.parts[0].text;
          if (text) {
            console.log("Yielding text from non-stream:", text);
            yield text;
          } else {
            console.warn("Non-streaming response had candidate part with no text.");
          }
        } else {
           console.warn("Non-streaming response candidate had no content parts.");
        }
      } else if (jsonData.error) {
        console.error('API returned an error in non-streaming response JSON:', jsonData.error);
        throw new Error(`API Error: ${jsonData.error.message} (Code: ${jsonData.error.code}, Status: ${jsonData.error.status})`);
      } else {
        console.warn("Non-streaming response did not contain expected candidates or error structure.");
      }
    } catch (error) {
      console.error('Failed to parse or handle non-streaming response:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.startsWith('API Error:') || errorMessage.startsWith('Prompt blocked:')) {
          throw error; // Re-throw our specific errors
      }
      throw new Error(`Failed to process non-streaming response: ${errorMessage}`);
    }
  }
}

export function cancelRequest(): void {
  abortController.abort();
  console.log('AI request cancelled by user.');
  abortController = new AbortController(); // Re-initialize for future requests
}