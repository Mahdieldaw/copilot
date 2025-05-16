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
import { useAIExecution } from '@/hooks/useAIExecution';

function App() {
  const archetypes: ArchetypesMap = archetypesData;
  const [selectedArchetypeKey, setSelectedArchetypeKey] = useState<keyof ArchetypesMap>('IDEATION_AND_EXPLORATION');
  const [inputs, setInputs] = useState<Record<string, string | number>>({});
  const [currentPromptTemplate, setCurrentPromptTemplate] = useState('');
  const [editablePromptTemplate, setEditablePromptTemplate] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('configuration');
  const [selectedModelId, setSelectedModelId] = useState<string>('gemini-1.5-flash-latest');
  
  const { run, response: aiOutput, status, error } = useAIExecution();

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
      const valStr = String(value ?? '');
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), valStr);
    });
    setCurrentPromptTemplate(template);
  }, [inputs, editablePromptTemplate]);

  // Handle input changes
  const handleInputChange = (name: string, value: string | number) => {
    setInputs(prev => ({ ...prev, [name]: value }));
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
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <div className={`sidebar ${isSidebarOpen ? '' : 'closed'}`}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? '◀' : '▶'}
        </button>
        {isSidebarOpen && (
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
            Preview & Execute
          </button>
        </div>

        {activeTab === 'configuration' && (
          <div className="configuration-panel">
            <h2>{currentArchetype.name}</h2>
            <p>{currentArchetype.purpose}</p>
            <div className="inputs-container">
              {currentArchetype.inputs.map(input => (
                <div key={input.name} className="input-group">
                  <label>
                    {input.ui_guidance}
                    {input.optional && <span className="optional">(Optional)</span>}
                  </label>
                  {renderInput(input)}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="preview-panel">
            <div className="model-selector" style={{ marginBottom: '1rem' }}>
              <label htmlFor="model-select" style={{ marginRight: '10px' }}>Select Model:</label>
              <select
                id="model-select"
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="form-select"
                style={{ marginRight: '20px', padding: '5px' }}
              >
                <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash (Mocked)</option>
                <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Mocked)</option>
                <option value="custom-mock-model-001">Custom Mock Model (Mocked)</option>
              </select>
            </div>

            <textarea
              value={currentPromptTemplate}
              readOnly
              className="preview-output"
            />
            <button 
              onClick={() => run(currentPromptTemplate, selectedModelId, {})}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Running...' : 'Run AI'}
            </button>
            {error && <div className="error-message" style={{ color: 'red', marginTop: '1rem' }}>{error.message}</div>}
            {aiOutput && (
              <div className="ai-output">
                <h3>AI Response:</h3>
                <pre className="preview-output">{aiOutput}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
