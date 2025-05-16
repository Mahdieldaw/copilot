1. Addressing the Missing AI Output (Stream Parsing)
The console logs like Received non-JSON or malformed line in stream (will be ignored): "[{" indicate that the previous stream parsing logic in ai.ts was still encountering fragments of JSON (or non-JSON data) that it couldn't process into text output. This happens when the incoming data stream is broken into chunks that don't align perfectly with complete JSON objects, or if the API sends data in a slightly different structure than anticipated (e.g., wrapped in an array, or error messages mixed in).

I'll provide an updated src/services/ai.ts with a more robust stream parsing mechanism. This version will try to accumulate data in a buffer and then find and parse complete JSON objects within that buffer by looking for matching curly braces {}. This is generally more resilient to how data chunks arrive.

2. Fixing the Controlled/Uncontrolled Input Error
This React warning typically occurs when an input component's value prop transitions from undefined to a defined value (e.g., '' or some text). We need to ensure that input components in FormInputs.tsx always receive a defined value (like an empty string if no other value is appropriate) from the start.

I'll provide updates for src/components/inputs/FormInputs.tsx and a small adjustment in App.tsx to ensure this.

Here are the updated files:
Updated Files for AI Output and Input Control
May 16, 8:16 AM

Open

Key Changes and Explanations:

src/services/ai.ts (AI Stream Parsing):

Robust Object Finding: The core streaming loop now accumulates data in buffer and then actively tries to find the start ({) and matching end (}) of a JSON object. This is more resilient to how chunks arrive than simple newline splitting.
Error Handling for JSON Objects: If a string that looks like an object ({...}) fails to parse, it's logged, but the loop tries to continue to find the next valid object. This prevents one bad chunk from necessarily killing the whole stream if the API sometimes sends malformed bits.
Prompt Feedback Handling: Added checks for jsonData.promptFeedback?.blockReason in both streaming and non-streaming paths to identify if the API blocked the request due to safety or other reasons.
Logging: Added more console.log and console.warn statements to help trace what text is being yielded or if any data is being skipped.
Final Buffer Check: A warning is logged if any unprocessed data remains in the buffer after the stream ends.
src/components/inputs/FormInputs.tsx (Input Control):

TextInputField & TextAreaField: The value prop is now explicitly checked for undefined or null and defaults to '' (empty string) in such cases: value={value === undefined || value === null ? '' : String(value)}. This ensures the underlying <input> or <textarea> always gets a string.
DropdownField: Similar handling for value.
SliderField: Added more robust numericValue conversion to ensure the range input always gets a number, defaulting to config.min ?? 0.
TagInput & CheckboxGroup: Ensured stringValue defaults to '' if value is undefined or null.
readOnly prop: Correctly added and passed the readOnly prop to TextAreaField.
src/App.tsx (Application Logic):

useEffect for Inputs: The useEffect that initializes inputs now provides more specific defaults based on inputConfig.type (e.g., 0 for sliders if no defaultValue is present, '' for others). This further helps prevent undefined values. currentArchetype is added to the dependency array.
renderInput: The value passed to form input components is now directly from inputs[inputConfig.name]. The individual input components are now responsible for handling a potentially undefined value and converting it to their required type (e.g., string for text inputs, number for sliders).
Callbacks: Wrapped handleInputChange, handlePromptTemplateChange, handleResetToDefaults, and handleRunAI in useCallback for potential performance optimizations, though not strictly necessary for fixing the current issues.
Clarity in AI Output Display: Ensured the aiOutput is rendered within a <pre> tag for proper formatting.
Button Type: Explicitly set type="button" for the custom Button component to prevent accidental form submissions if it were ever used within a <form> tag.
Conditional Rendering: Added a check in the sidebar to only render the archetype list if isSidebarOpen is true, which can sometimes help with minor layout shifts or rendering issues. Also added a fallback message if currentArchetype is not yet selected.
Next Steps:

Replace the content of your existing src/services/ai.ts, src/components/inputs/FormInputs.tsx, and src/App.tsx with the code provided above.
Test Thoroughly:
Run the AI generation. Check if the AI output now appears in the UI.
Observe the browser's developer console for:
Any remaining "controlled/uncontrolled input" warnings.
Logs from ai.ts (e.g., "Yielding text chunk:", "Failed to parse JSON object from stream buffer", "Unprocessed data remaining"). These will be crucial if output is still missing.
Any HTTP errors or other console errors.
API Key and Model: Double-check your VITE_GEMINI_API_KEY and ensure the model name (models/gemini-1.5-flash-latest or your preferred one) is correct and active for your key.
This set of changes aims to make the stream parsing more robust and definitively resolve the controlled input warnings. Let me know what the results are after testing!
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
```typescript
// src/components/inputs/FormInputs.tsx
import React from 'react';
import type { ArchetypeInput } from '../../models/StageArchetype'; // Adjusted path assuming models is at src/models

export interface InputProps {
  config: ArchetypeInput;
  value: string | number; // Value can be string or number
  onChange: (value: string | number) => void;
  readOnly?: boolean;
}

export const TextInputField: React.FC<InputProps> = ({ config, value, onChange }) => {
  return (
    <input
      type="text"
      id={config.name}
      // Ensure value is never undefined for controlled input; default to empty string
      value={value === undefined || value === null ? '' : String(value)}
      onChange={(e) => onChange(e.target.value)}
      placeholder={config.ui_guidance}
      className="form-input"
    />
  );
};

export const TextAreaField: React.FC<InputProps> = ({ config, value, onChange, readOnly }) => {
  return (
    <textarea
      id={config.name}
      // Ensure value is never undefined; default to empty string
      value={value === undefined || value === null ? '' : String(value)}
      onChange={(e) => onChange(e.target.value)}
      placeholder={config.ui_guidance}
      className="form-textarea"
      rows={4}
      readOnly={readOnly} // Pass readOnly prop to the textarea element
    />
  );
};

export const DropdownField: React.FC<InputProps> = ({ config, value, onChange }) => {
  return (
    <select
      id={config.name}
      // Ensure value is string for select; default to empty string if undefined/null
      value={value === undefined || value === null ? '' : String(value)}
      onChange={(e) => onChange(e.target.value)}
      className="form-select"
    >
      {/* Add a default placeholder option if needed, especially if initial value can be empty */}
      {/* <option value="" disabled>{`Select ${config.ui_guidance}`}</option> */}
      {config.values?.map((option: string) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export const SliderField: React.FC<InputProps> = ({ config, value, onChange }) => {
  // Ensure value is a number for range input; default to min or 0 if undefined/null
  const numericValue = (v: string | number | undefined | null): number => {
    if (v === undefined || v === null || v === '') {
      return config.min ?? 0;
    }
    const num = Number(v);
    return isNaN(num) ? (config.min ?? 0) : num;
  };

  return (
    <div className="slider-container">
      <input
        type="range"
        id={config.name}
        min={config.min ?? 0}
        max={config.max ?? 100}
        value={numericValue(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="form-slider"
      />
      <span className="slider-value">{numericValue(value)}</span>
    </div>
  );
};

export const TagInput: React.FC<InputProps> = ({ config, value, onChange }) => {
  // Value for TagInput is expected to be a comma-separated string
  const stringValue = (value === undefined || value === null) ? '' : String(value);
  const tags = stringValue.split(',').filter(tag => tag.trim() !== '');


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const inputElement = e.currentTarget;
      const newTag = inputElement.value.trim();
      if (newTag && !tags.includes(newTag)) {
        const newTags = [...tags, newTag];
        onChange(newTags.join(','));
      }
      inputElement.value = ''; // Clear input field
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    onChange(newTags.join(','));
  };

  return (
    <div className="tag-input-container">
      <div className="tag-list">
        {tags.map((tag, index) => (
          <span key={`${tag}-${index}`} className="tag"> {/* Improved key */}
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="tag-remove">×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        onKeyDown={handleKeyDown}
        placeholder={config.ui_guidance}
        className="tag-input"
        id={config.name} // Add id for label association
      />
    </div>
  );
};

export const CheckboxGroup: React.FC<InputProps> = ({ config, value, onChange }) => {
  // Value for CheckboxGroup is expected to be a comma-separated string of selected values
  const stringValue = (value === undefined || value === null) ? '' : String(value);
  const selectedValues = stringValue.split(',').filter(v => v.trim() !== '');


  const toggleValue = (optionValue: string) => {
    const newSelected = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    onChange(newSelected.join(','));
  };

  return (
    <div className="checkbox-group" id={config.name}> {/* Add id for label association if needed */}
      {config.values?.map((option) => (
        <label key={option} className="checkbox-label">
          <input
            type="checkbox"
            checked={selectedValues.includes(option)}
            onChange={() => toggleValue(option)}
            className="checkbox-input"
            name={config.name} // Group checkboxes under the same name
            value={option} // Assign value to checkbox for form submission (if applicable)
          />
          {option}
        </label>
      ))}
    </div>
  );
};
```typescript
// src/App.tsx
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import './App.css';
import { archetypesData } from './data/stage_archetypes';
import type { ArchetypesMap, ArchetypeInput } from './models/StageArchetype';
import { 
  TextInputField, 
  TextAreaField, 
  DropdownField, 
  SliderField,
  TagInput,
  CheckboxGroup
} from './components/inputs/FormInputs';
import { useAIExecution } from '@/hooks/useAIExecution';

// Placeholder functions
const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    console.log('Text copied to clipboard');
    // Add user feedback, e.g., a temporary message
  }).catch(err => {
    console.error('Failed to copy text: ', err);
    // Add user feedback for error
  });
};

const recordFeedback = (isPositive: boolean) => {
  console.log(`Feedback recorded: ${isPositive ? 'Positive' : 'Negative'}`);
  // Add actual feedback recording logic here
};

// Simple Spinner component
const Spinner = () => <div className="spinner" style={{ padding: '10px', textAlign: 'center' }}>Loading AI response...</div>;

// Basic Button component (can be replaced with actual UI library button)
// Ensure it has a type="button" to prevent form submission if it's inside a form
const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button type="button" {...props} />;
};


function App() {
  const archetypes: ArchetypesMap = archetypesData;
  const [selectedArchetypeKey, setSelectedArchetypeKey] = useState<keyof ArchetypesMap>('IDEATION_AND_EXPLORATION');
  const [inputs, setInputs] = useState<Record<string, string | number>>({});
  const [currentPromptTemplate, setCurrentPromptTemplate] = useState(''); // This is the final prompt to be sent
  const [editablePromptTemplate, setEditablePromptTemplate] = useState(''); // This is the template string being edited by user
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('configuration');
  
  const { run: executeAIRun, cancel: cancelAIRun, response: aiOutput, status: aiStatus, error: aiError } = useAIExecution();

  const currentArchetype = archetypes[selectedArchetypeKey];

  // Initialize inputs and editable prompt template when archetype changes
  useEffect(() => {
    const initialInputs: Record<string, string | number> = {};
    if (currentArchetype && currentArchetype.inputs) {
      currentArchetype.inputs.forEach(inputConfig => {
        // Provide appropriate default based on type if defaultValue is not set
        if (inputConfig.type === 'Slider') {
          initialInputs[inputConfig.name] = inputConfig.defaultValue ?? (inputConfig.min ?? 0);
        } else if (inputConfig.type === 'CheckboxGroup' || inputConfig.type === 'TagInput') {
          initialInputs[inputConfig.name] = inputConfig.defaultValue ?? ''; // Expects string
        } else { // TextInput, LargeTextArea, Dropdown, ReadOnlyTextArea
          initialInputs[inputConfig.name] = inputConfig.defaultValue ?? '';
        }
      });
    }
    setInputs(initialInputs);
    setEditablePromptTemplate(currentArchetype?.ai_instructions_template ?? '');
  }, [selectedArchetypeKey, currentArchetype]); // currentArchetype is a direct dependency now

  // Update the current (final) prompt template whenever inputs or the editable template change
  useEffect(() => {
    let template = editablePromptTemplate;
    Object.entries(inputs).forEach(([key, value]) => {
      // Ensure value is string for replacement; handle null/undefined from state if necessary
      const valStr = (value === null || value === undefined) ? '' : String(value);
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), valStr);
    });
    setCurrentPromptTemplate(template);
  }, [inputs, editablePromptTemplate]);

  const handleInputChange = useCallback((name: string, value: string | number) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePromptTemplateChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditablePromptTemplate(e.target.value);
  }, []);

  const handleResetToDefaults = useCallback(() => {
    const initialInputs: Record<string, string | number> = {};
    if (currentArchetype && currentArchetype.inputs) {
      currentArchetype.inputs.forEach(inputConfig => {
         if (inputConfig.type === 'Slider') {
          initialInputs[inputConfig.name] = inputConfig.defaultValue ?? (inputConfig.min ?? 0);
        } else {
          initialInputs[inputConfig.name] = inputConfig.defaultValue ?? '';
        }
      });
    }
    setInputs(initialInputs);
    setEditablePromptTemplate(currentArchetype?.ai_instructions_template ?? '');
  }, [currentArchetype]);

  const handleRunAI = useCallback(() => {
    if (currentPromptTemplate.trim() && aiStatus !== 'loading') {
      // Pass the fully resolved prompt (currentPromptTemplate)
      executeAIRun(currentPromptTemplate);
    }
  }, [currentPromptTemplate, executeAIRun, aiStatus]);


  const renderInput = useCallback((inputConfig: ArchetypeInput) => {
    // Value from state; FormInput components will handle undefined with defaults
    const value = inputs[inputConfig.name]; 
    
    const props = {
      config: inputConfig,
      value: value, // Pass the direct value, FormInput component handles its default if undefined
      onChange: (val: string | number) => handleInputChange(inputConfig.name, val)
    };

    switch (inputConfig.type) {
      case 'TextInput':
        return <TextInputField {...props} />;
      case 'LargeTextArea':
        return <TextAreaField {...props} />;
      case 'Dropdown':
        return <DropdownField {...props} />;
      case 'Slider':
        return <SliderField {...props} />;
      case 'TagInput':
        return <TagInput {...props} />;
      case 'CheckboxGroup':
        return <CheckboxGroup {...props} />;
      case 'ReadOnlyTextArea':
        // For ReadOnlyTextArea, its value might come from aiOutput or another source
        // If it's meant to show AI output, you'd pass aiOutput to its value prop
        // For now, assuming it's configured like other inputs but read-only.
        // If it's for displaying the 'content_for_analysis' which is an input:
        return <TextAreaField {...props} readOnly={true} />; 
      default:
        // Log or handle unknown input types
        console.warn("Unknown input type:", inputConfig.type);
        return null;
    }
  }, [inputs, handleInputChange]);

  return (
    <div className="app-container">
      <h1>Hybrid Thinking Workflow Builder</h1>
      <div className="main-content">
        <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? '←' : '→'}
          </button>
          {isSidebarOpen && ( // Only render list if sidebar is open to prevent layout shift issues
            <div className="archetype-list">
              {Object.entries(archetypes).map(([key, archetype]) => (
                <button
                  key={key}
                  className={key === selectedArchetypeKey ? 'selected' : ''}
                  onClick={() => setSelectedArchetypeKey(key as keyof ArchetypesMap)}
                >
                  {archetype.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="content-area">
          <h2>{currentArchetype?.name ?? 'Select Archetype'}</h2>
          <p>{currentArchetype?.purpose ?? ''}</p>
          
          <div className="tab-buttons">
            <Button 
              className={activeTab === 'configuration' ? 'active' : ''} 
              onClick={() => setActiveTab('configuration')}
            >
              Configuration
            </Button>
            <Button 
              className={activeTab === 'preview' ? 'active' : ''} 
              onClick={() => setActiveTab('preview')}
            >
              Preview & Run AI
            </Button>
          </div>

          {activeTab === 'configuration' && currentArchetype ? (
            <div className="configuration-panel">
              <div className="inputs-section">
                {currentArchetype.inputs.map(inputConfig => ( // Renamed to inputConfig
                  <div key={inputConfig.name} className="input-group">
                    <label htmlFor={inputConfig.name}>
                      {inputConfig.ui_guidance}
                      {inputConfig.optional && <span className="optional">(optional)</span>}
                    </label>
                    {renderInput(inputConfig)}
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'preview' && currentArchetype ? (
            <div className="preview-panel">
              <label htmlFor="prompt-template-editor">Edit AI Prompt Template:</label>
              <textarea
                id="prompt-template-editor"
                value={editablePromptTemplate}
                onChange={handlePromptTemplateChange}
                placeholder="Edit the prompt template..."
                rows={10} // Increased rows for better visibility
              />
              <div className="preview-output">
                <h3>Live Preview (Final Prompt to be Sent):</h3>
                <pre>{currentPromptTemplate}</pre>
              </div>
              <Button onClick={handleResetToDefaults}>Reset to Default Template</Button>
              
              <hr style={{margin: '20px 0'}} />

              <h3>AI Interaction</h3>
              <Button onClick={handleRunAI} disabled={aiStatus === 'loading' || !currentPromptTemplate.trim()}>
                {aiStatus === 'loading' ? 'Running AI…' : 'Run AI'}
              </Button>

              <div className="ai-output-panel" style={{marginTop: '10px', border: '1px solid #eee', padding: '10px', minHeight: '100px', background: '#f9f9f9'}}>
                <h4>AI Output:</h4>
                {aiStatus === 'idle' && !aiOutput && <p>Click “Run AI” to generate output.</p>}
                {aiStatus === 'loading' && <Spinner />}
                {/* Ensure aiOutput is displayed. If it's an object, stringify it. Assuming it's text. */}
                {aiOutput && <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{aiOutput}</pre>} 
                {aiStatus === 'error' && <p className="error" style={{color: 'red'}}>Error: {aiError}</p>}
              </div>

              {aiStatus === 'loading' && <Button onClick={cancelAIRun}>Cancel AI Run</Button>}
              {(aiStatus === 'done' || aiStatus === 'error') && aiOutput && ( // Show regenerate if there was an output or error
                 <Button onClick={handleRunAI} disabled={!currentPromptTemplate.trim() || aiStatus === 'loading'} style={{marginLeft: '5px'}}>
                   Regenerate
                 </Button>
              )}

              {aiStatus === 'done' && aiOutput && (
                <div className="actions-panel" style={{marginTop: '10px'}}>
                  <Button onClick={() => copyText(aiOutput)}>Copy Output</Button>
                  <Button onClick={() => recordFeedback(true)} style={{marginLeft: '5px'}}>👍</Button>
                  <Button onClick={() => recordFeedback(false)} style={{marginLeft: '5px'}}>👎</Button>
                </div>
              )}
            </div>
          ) : (
             <p>Please select an archetype to begin.</p> // Fallback if no archetype selected
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
