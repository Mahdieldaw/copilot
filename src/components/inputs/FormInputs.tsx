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
