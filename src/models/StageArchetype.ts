export interface ArchetypeInput {
  name: string;
  type: 'TextInput' | 'LargeTextArea' | 'Dropdown' | 'Slider' | 'CheckboxGroup' | 'TagInput' | 'TwoPanelEditor' | 'ReadOnlyTextArea' | 'JSON';
  description: string;
  ui_guidance: string;
  defaultValue?: string | number;
  optional?: boolean;
  values?: string[];
  min?: number;
  max?: number;
  conditional?: boolean;
}

export interface ValidatorProfile {
  name: string;
  method: string;
  description: string;
  expected_outcome: string;
}

export interface StageArchetype {
  name: string;
  purpose: string;
  inputs: ArchetypeInput[];
  ai_instructions_template: string;
  validator_profiles?: ValidatorProfile[];
}

export type ArchetypesMap = Record<string, StageArchetype>;
