import { useState, useEffect } from 'react';
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
import { useAIExecution } from '@/hooks/useAIExecution'; // Updated import path to use alias

// Placeholder functions
const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    console.log('Text copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
};

const recordFeedback = (isPositive: boolean) => {
  console.log(`Feedback recorded: ${isPositive ? 'Positive' : 'Negative'}`);
};

// Simple Spinner component (can be moved to a separate file later)
const Spinner = () => <div className="spinner">Loading...</div>;

function App() {
  const archetypes: ArchetypesMap = archetypesData;
  const [selectedArchetypeKey, setSelectedArchetypeKey] = useState<keyof ArchetypesMap>('IDEATION_AND_EXPLORATION');
  const [inputs, setInputs] = useState<Record<string, string | number>>({});
  const [currentPromptTemplate, setCurrentPromptTemplate] = useState('');
  const [editablePromptTemplate, setEditablePromptTemplate] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('configuration');
  
  const { run, cancel, response: aiOutput, status, error } = useAIExecution(); // Initialize hook

  const currentArchetype = archetypes[selectedArchetypeKey];

  // Initialize inputs when archetype changes
  useEffect(() => {
    const initialInputs: Record<string, string | number> = {};
    currentArchetype.inputs.forEach(input => {
      initialInputs[input.name] = input.defaultValue ?? '';
    });
    setInputs(initialInputs);
    setEditablePromptTemplate(currentArchetype.ai_instructions_template);
  }, [selectedArchetypeKey]);

  // Update prompt template preview
  useEffect(() => {
    let template = editablePromptTemplate;
    Object.entries(inputs).forEach(([key, value]) => {
      const valStr = String(value ?? ''); // Ensure value is always a string
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), valStr);
    });
    setCurrentPromptTemplate(template);
  }, [inputs, editablePromptTemplate]);

  // Handle input changes
  const handleInputChange = (name: string, value: string | number) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  // Handle prompt template changes
  const handlePromptTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditablePromptTemplate(e.target.value);
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    const initialInputs: Record<string, string | number> = {};
    currentArchetype.inputs.forEach(input => {
      initialInputs[input.name] = input.defaultValue ?? '';
    });
    setInputs(initialInputs);
    setEditablePromptTemplate(currentArchetype.ai_instructions_template);
  };

  // Render input based on type
  const renderInput = (input: ArchetypeInput) => {
    const value = inputs[input.name];
    const props = {
      config: input,
      value,
      onChange: (val: string | number) => handleInputChange(input.name, val)
    };

    switch (input.type) {
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
        // Ensure ReadOnlyTextArea also gets the correct value prop if it's meant to display aiOutput
        // For now, assuming it's like other inputs
        return <TextAreaField {...props} readOnly={true} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <h1>Hybrid Thinking Workflow Builder</h1>
      <div className="main-content">
        <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? '←' : '→'}
          </button>
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
        </div>

        <div className="content-area">
          <h2>{currentArchetype.name}</h2>
          <p>{currentArchetype.purpose}</p>
          
          <div className="tab-buttons">
            <button 
              className={activeTab === 'configuration' ? 'active' : ''} 
              onClick={() => setActiveTab('configuration')}
            >
              Configuration
            </button>
            <button 
              className={activeTab === 'preview' ? 'active' : ''} 
              onClick={() => setActiveTab('preview')}
            >
              Preview & Run AI
            </button>
          </div>

          {activeTab === 'configuration' ? (
            <div className="configuration-panel">
              <div className="inputs-section">
                {currentArchetype.inputs.map(input => (
                  <div key={input.name} className="input-group">
                    <label htmlFor={input.name}>
                      {input.ui_guidance}
                      {input.optional && <span className="optional">(optional)</span>}
                    </label>
                    {renderInput(input)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="preview-panel">
              <textarea
                value={editablePromptTemplate}
                onChange={handlePromptTemplateChange}
                placeholder="Edit the prompt template..."
              />
              <div className="preview-output">
                <h3>Preview (Editable Template):</h3>
                <pre>{currentPromptTemplate}</pre>
              </div>
              <button onClick={handleResetToDefaults}>Reset to Default Template</button>
              
              <hr style={{margin: '20px 0'}} />

              <h3>AI Interaction</h3>
              <Button onClick={() => run(currentPromptTemplate)} disabled={status === 'loading' || !currentPromptTemplate.trim()}>
                {status === 'loading' ? 'Running…' : 'Run AI'}
              </Button>

              <div className="ai-output-panel">
                {status === 'idle' && !aiOutput && <p>Click “Run AI” to generate output.</p>}
                {status === 'loading' && <Spinner />}
                {aiOutput && <pre>{aiOutput}</pre>}
                {status === 'error' && <p className="error">Error: {error}</p>}
              </div>

              {status === 'loading' && <Button onClick={cancel}>Cancel</Button>}
              {status === 'done' && <Button onClick={() => run(currentPromptTemplate)} disabled={!currentPromptTemplate.trim()}>Regenerate</Button>}

              {status === 'done' && aiOutput && (
                <div className="actions-panel" style={{marginTop: '10px'}}>
                  <Button onClick={() => copyText(aiOutput)}>Copy Output</Button>
                  <Button onClick={() => recordFeedback(true)} style={{marginLeft: '5px'}}>👍</Button>
                  <Button onClick={() => recordFeedback(false)} style={{marginLeft: '5px'}}>👎</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Basic Button component to avoid TS errors for now, can be replaced with actual UI library button
const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button {...props} />;
};

export default App;
