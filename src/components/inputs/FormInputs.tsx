import React from 'react';
import type { ArchetypeInput } from '../../models/StageArchetype';

export interface InputProps {
  config: ArchetypeInput;
  value: string | number;
  onChange: (value: string | number) => void;
  readOnly?: boolean;
}

export const TextInputField: React.FC<InputProps> = ({ config, value, onChange }) => {
  return (
    <input
      type="text"
      id={config.name}
      value={value as string}
      onChange={(e) => onChange(e.target.value)}
      placeholder={config.ui_guidance}
      className="form-input"
    />
  );
};

export const TextAreaField: React.FC<InputProps> = ({ config, value, onChange }) => {
  return (
    <textarea
      id={config.name}
      value={value as string}
      onChange={(e) => onChange(e.target.value)}
      placeholder={config.ui_guidance}
      className="form-textarea"
      rows={4}
    />
  );
};

export const DropdownField: React.FC<InputProps> = ({ config, value, onChange }) => {
  return (
    <select
      id={config.name}
      value={value as string}
      onChange={(e) => onChange(e.target.value)}
      className="form-select"
    >
      {config.values?.map((option: string) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export const SliderField: React.FC<InputProps> = ({ config, value, onChange }) => {
  return (
    <div className="slider-container">
      <input
        type="range"
        id={config.name}
        min={config.min ?? 0}
        max={config.max ?? 100}
        value={value as number}
        onChange={(e) => onChange(Number(e.target.value))}
        className="form-slider"
      />
      <span className="slider-value">{value}</span>
    </div>
  );
};

export const TagInput: React.FC<InputProps> = ({ config, value, onChange }) => {
  const stringValue = String(value ?? '');
  const tags = stringValue.split(',').filter(Boolean);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const newTag = input.value.trim();
      if (newTag && !tags.includes(newTag)) {
        const newTags = [...tags, newTag];
        onChange(newTags.join(','));
      }
      input.value = '';
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
          <span key={index} className="tag">
            {tag}
            <button onClick={() => removeTag(tag)} className="tag-remove">×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        onKeyDown={handleKeyDown}
        placeholder={config.ui_guidance}
        className="tag-input"
      />
    </div>
  );
};

export const CheckboxGroup: React.FC<InputProps> = ({ config, value, onChange }) => {
  const stringValue = String(value ?? '');
  const selectedValues = stringValue.split(',').filter(Boolean);

  const toggleValue = (optionValue: string) => {
    const newSelected = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    onChange(newSelected.join(','));
  };

  return (
    <div className="checkbox-group">
      {config.values?.map((option) => (
        <label key={option} className="checkbox-label">
          <input
            type="checkbox"
            checked={selectedValues.includes(option)}
            onChange={() => toggleValue(option)}
            className="checkbox-input"
          />
          {option}
        </label>
      ))}
    </div>
  );
};
