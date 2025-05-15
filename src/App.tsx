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

function App() {
  const archetypes: ArchetypesMap = archetypesData;
  const [selectedArchetypeKey, setSelectedArchetypeKey] = useState<keyof ArchetypesMap>('IDEATION_AND_EXPLORATION');
  const [inputs, setInputs] = useState<Record<string, string | number>>({});
  const [currentPromptTemplate, setCurrentPromptTemplate] = useState('');
  const [editablePromptTemplate, setEditablePromptTemplate] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('configuration');
  
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
      const valStr = typeof value === 'number' ? String(value) : value || '';
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
        return <TextAreaField {...props} />;
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
              Preview
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
                <h3>Preview:</h3>
                <pre>{currentPromptTemplate}</pre>
              </div>
              <button onClick={handleResetToDefaults}>Reset to Default</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
