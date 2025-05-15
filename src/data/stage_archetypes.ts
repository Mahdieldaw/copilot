// Full archetype definitions for Hybrid Thinking

import type { ArchetypesMap } from '../models/StageArchetype';

export const archetypesData: ArchetypesMap = {
  SETUP_AND_BRIEFING: {
    name: "Setup & Briefing",
    purpose: "Gather initial requirements, context, and parameters from the user or system to define the scope and direction of the workflow or a significant part of it.",
    inputs: [
      {
        name: "project_goal",
        type: "TextInput",
        description: "High-level objective for the project or task.",
        ui_guidance: "What is the overall objective?",
        defaultValue: ""
      },
      {
        name: "target_audience_description",
        type: "LargeTextArea",
        optional: true,
        description: "Description of the intended audience.",
        ui_guidance: "Describe your ideal audience (optional).",
        defaultValue: ""
      },
      {
        name: "key_topic_or_product",
        type: "TextInput",
        description: "The central subject, topic, or product being addressed.",
        ui_guidance: "What is the main topic or product?",
        defaultValue: ""
      },
      {
        name: "constraints_and_boundaries",
        type: "LargeTextArea",
        optional: true,
        description: "Non-negotiables, limitations, or specific exclusions.",
        ui_guidance: "Any limitations, e.g., budget, time, specific exclusions? (optional)",
        defaultValue: ""
      }
    ],
    ai_instructions_template: `You are an expert project planner and requirements analyst.
Based on the provided project goal: "{{project_goal}}" for the key topic/product: "{{key_topic_or_product}}",
targeting audience: "{{target_audience_description | default('not specified')}}" with constraints: "{{constraints_and_boundaries | default('none specified')}}":
1. Clarify any ambiguities in the provided information.
2. Define the primary parameters or information pillars needed.
3. Structure your output clearly.`
  },

  IDEATION_AND_EXPLORATION: {
    name: "Ideation & Exploration",
    purpose: "Generate a broad range of ideas, possibilities, outlines, or initial concepts. Focus is on breadth rather than depth or polish.",
    inputs: [
      {
        name: "seed_concept",
        type: "TextInput",
        description: "Starting point or topic for ideation.",
        ui_guidance: "What topic or question do you want ideas for?",
        defaultValue: ""
      },
      {
        name: "number_of_ideas",
        type: "Slider",
        min: 1,
        max: 20,
        description: "Desired number of distinct ideas to generate.",
        ui_guidance: "How many ideas?",
        defaultValue: 5
      },
      {
        name: "creativity_level",
        type: "Dropdown",
        values: ["Conventional", "Balanced", "Highly Innovative"],
        description: "Preferred level of novelty and unconventionality for the ideas.",
        ui_guidance: "Select creativity level.",
        defaultValue: "Balanced"
      },
      {
        name: "output_format_preference",
        type: "Dropdown",
        values: ["Bulleted List", "Mind Map Concepts", "Short Paragraphs"],
        description: "Desired format for presenting the generated ideas.",
        ui_guidance: "Choose output format.",
        defaultValue: "Bulleted List"
      }
    ],
    ai_instructions_template: `You are a creative brainstorming assistant.
Generate {{number_of_ideas}} distinct ideas based on the seed concept: "{{seed_concept}}".
The desired creativity level is "{{creativity_level}}".
Present the ideas as a {{output_format_preference}}.
Focus on diversity and originality in your suggestions.`
  },
  DRAFTING_AND_CREATION: {
    name: "Drafting & Creation",
    purpose: "Generate the primary content or artifact.",
    inputs: [
      {
        name: "creation_brief",
        type: "LargeTextArea",
        description: "Outline, key points, or purpose guiding the content creation.",
        ui_guidance: "Provide the brief, outline, or key points for creation.",
        defaultValue: ""
      },
      {
        name: "content_type",
        type: "Dropdown",
        values: ["Blog Post Section", "Email Draft", "Python Function Stub", "Product Description Snippet", "Social Media Post Text", "Summary of Text"],
        defaultValue: "Blog Post Section",
        description: "The specific type of content to be generated.",
        ui_guidance: "Select the type of content to create."
      },
      {
        name: "tone_and_style",
        type: "Dropdown",
        values: ["Formal", "Conversational", "Technical", "Persuasive", "Humorous", "Empathetic"],
        defaultValue: "Conversational",
        description: "Desired tone and writing style for the content.",
        ui_guidance: "Choose the tone and style."
      },
      {
        name: "target_length",
        type: "Dropdown",
        values: ["Short (e.g., 1-2 paragraphs)", "Medium (e.g., 3-5 paragraphs)", "Long (e.g., 5+ paragraphs)"],
        description: "Approximate desired length of the generated content.",
        ui_guidance: "Select target length.",
        defaultValue: "Medium (e.g., 3-5 paragraphs)"
      },
      {
        name: "keywords_to_include",
        type: "TagInput",
        optional: true,
        description: "Specific keywords to be naturally incorporated into the content.",
        ui_guidance: "Enter keywords to include (optional, comma-separated).",
        defaultValue: ""
      }
    ],
    ai_instructions_template: `You are an expert {{content_type}} creator.
Draft the {{content_type}} based on this brief:
"{{creation_brief}}"
Adopt a {{tone_and_style}} tone and style.
Aim for a {{target_length}} length.
{{#if keywords_to_include}}Naturally incorporate these keywords: {{keywords_to_include}}.{{/if}}
Ensure the output is coherent, engaging, and serves the brief's purpose.`
  },

  INFORMATION_GATHERING_AND_RESEARCH: {
    name: "Information Gathering & Research",
    purpose: "Find and synthesize external information, data, or evidence relevant to the task.",
    inputs: [
      {
        name: "research_question",
        type: "LargeTextArea",
        description: "Specific question the research aims to answer.",
        ui_guidance: "What specific question do you need to research?",
        defaultValue: ""
      },
      {
        name: "key_terms_for_search",
        type: "TagInput",
        optional: true,
        description: "Keywords to focus the search on.",
        ui_guidance: "Enter keywords (optional, comma-separated).",
        defaultValue: ""
      },
      {
        name: "types_of_information",
        type: "CheckboxGroup",
        values: ["Statistics", "Facts", "Expert Opinions", "Case Studies", "Definitions", "Tutorials", "Recent News"],
        description: "Specific types of information to look for.",
        ui_guidance: "Select the types of information needed.",
        defaultValue: ["Facts", "Definitions"]
      },
      {
        name: "desired_depth",
        type: "Dropdown",
        values: ["Quick Overview", "Detailed Summary", "Comprehensive Report Snippet"],
        description: "Level of detail required for the research output.",
        ui_guidance: "Choose the desired depth of information.",
        defaultValue: "Detailed Summary"
      }
    ],
    ai_instructions_template: `You are an expert research assistant.
Investigate the research question: "{{research_question}}"
{{#if key_terms_for_search}}Focus on the following key terms: {{key_terms_for_search}}.{{/if}}
Gather the following types of information: {{types_of_information}}.
Provide a {{desired_depth}} of information.
Where possible, indicate the source or basis of the information. Present findings clearly and concisely.`
  },

  ANALYSIS_AND_EVALUATION: {
    name: "Analysis & Evaluation",
    purpose: "Critically examine existing information or generated content, identify patterns, assess quality, or derive insights.",
    inputs: [
      {
        name: "content_for_analysis",
        type: "ReadOnlyTextArea",
        description: "The input text, data, or artifact to be evaluated.",
        ui_guidance: "Paste or link the content to be analyzed.",
        defaultValue: ""
      },
      {
        name: "analysis_focus",
        type: "CheckboxGroup",
        values: ["Strengths", "Weaknesses", "Opportunities", "Threats (SWOT-like)", "Logical Fallacies", "Bias Detection", "Sentiment Analysis", "Key Themes Extraction", "Summarization Quality"],
        description: "Specific aspects or perspectives for the analysis.",
        ui_guidance: "Select the focus areas for analysis.",
        defaultValue: ["Strengths", "Weaknesses"]
      },
      {
        name: "evaluation_criteria",
        type: "LargeTextArea",
        optional: true,
        description: "Specific benchmarks, questions, or criteria to guide the evaluation.",
        ui_guidance: "Any specific questions or benchmarks for the analysis? (optional)",
        defaultValue: ""
      }
    ],
    ai_instructions_template: `You are an expert critical analyst.
Analyze the following content:
"{{content_for_analysis}}"
Your analysis should focus on identifying: {{analysis_focus}}.
{{#if evaluation_criteria}}Address these specific evaluation criteria: "{{evaluation_criteria}}"{{/if}}
Provide a structured report of your findings, clearly explaining your reasoning and providing examples where applicable.`
  },

  REFINEMENT_AND_ITERATION: {
    name: "Refinement & Iteration",
    purpose: "Improve upon existing drafted content or artifacts based on feedback, analysis, or further instructions.",
    inputs: [
      {
        name: "original_content",
        type: "TwoPanelEditor",
        description: "The draft content or code to be improved.",
        ui_guidance: "Original content for refinement.",
        defaultValue: ""
      },
      {
        name: "refinement_goals",
        type: "CheckboxGroup",
        values: ["Improve Clarity", "Enhance Engagement", "Correct Grammatical Errors", "Shorten/Condense", "Expand on Specific Section", "Change Tone", "Simplify Language", "Improve Flow"],
        description: "The primary objectives for refining the content.",
        ui_guidance: "Select the main goals for this refinement.",
        defaultValue: ["Improve Clarity", "Correct Grammatical Errors"]
      },
      {
        name: "specific_instructions",
        type: "LargeTextArea",
        optional: true,
        description: "Detailed changes, feedback, or specific sections to focus on.",
        ui_guidance: "Any detailed feedback or specific changes to make? (e.g., 'Make the introduction more impactful', 'Rephrase the third paragraph')",
        defaultValue: ""
      },
      {
        name: "target_tone_for_change",
        type: "Dropdown",
        conditional: true,
        values: ["Formal", "Conversational", "Technical", "Persuasive", "Humorous", "Empathetic"],
        description: "The new tone to adopt if 'Change Tone' is selected as a goal.",
        ui_guidance: "If changing tone, select the new target tone.",
        optional: true
      }
    ],
    ai_instructions_template: `You are an expert editor and content refiner.
Review and refine the following original content:
"{{original_content}}"
Your primary refinement goals are to: {{refinement_goals}}.
{{#if specific_instructions}}Incorporate the following specific instructions: "{{specific_instructions}}"{{/if}}
{{#if target_tone_for_change}}If 'Change Tone' is a goal, adjust the tone to be more {{target_tone_for_change}}.{{/if}}
Preserve the core intent of the original content unless explicitly instructed to change it.
Track changes or clearly indicate significant modifications if possible, or provide the fully revised text.`
  },

  VALIDATION_AND_QUALITY_ASSURANCE: {
    name: "Validation & Quality Assurance",
    purpose: "Check the output against predefined criteria, rules, or objectives.",
    inputs: [
      {
        name: "content_to_validate",
        type: "ReadOnlyTextArea",
        description: "The content or artifact requiring validation.",
        ui_guidance: "Content for validation.",
        defaultValue: ""
      },
      {
        name: "validation_type",
        type: "CheckboxGroup",
        values: ["Grammar & Spell Check", "Fact-Checking (against provided source or general knowledge)", "Style Guide Compliance", "Code Linting (specify language/rules)", "Accessibility Check (basic principles)", "Plagiarism Check (conceptual)", "Tone Consistency Check"],
        description: "Specific types of validation checks to perform.",
        ui_guidance: "Select the types of validation needed.",
        defaultValue: ["Grammar & Spell Check"]
      },
      {
        name: "reference_document_or_rules",
        type: "LargeTextArea",
        optional: true,
        description: "E.g., style guide, fact source, specific linting rules.",
        ui_guidance: "Provide reference style guide, rules, or source for fact-checking (optional).",
        defaultValue: ""
      }
    ],
    ai_instructions_template: `You are a meticulous Quality Assurance specialist.
Validate the following content:
"{{content_to_validate}}"
Perform the following checks: {{validation_type}}.
{{#if reference_document_or_rules}}Use this reference for relevant checks: "{{reference_document_or_rules}}"{{/if}}
Report all findings clearly. For each issue found, describe the issue, its location (if applicable), and suggest a correction or improvement.`
  },

  FORMATTING_AND_FINALIZATION: {
    name: "Formatting & Finalization",
    purpose: "Prepare the output for its final use or distribution according to specified formatting requirements.",
    inputs: [
      {
        name: "raw_content",
        type: "ReadOnlyTextArea",
        description: "The finalized content before platform-specific formatting.",
        ui_guidance: "Finalized content for formatting.",
        defaultValue: ""
      },
      {
        name: "target_format",
        type: "Dropdown",
        values: ["Markdown (CommonMark)", "HTML (Basic)", "Plain Text (with line breaks)", "JSON (Pretty Print)", "Formatted Word Document Outline (Conceptual)", "Social Media Snippet (e.g. Twitter-ready)"],
        description: "The desired output format for the content.",
        ui_guidance: "Select the target output format.",
        defaultValue: "Markdown (CommonMark)"
      },
      {
        name: "formatting_rules_or_template",
        type: "LargeTextArea",
        optional: true,
        description: "Specific rules (e.g., 'Ensure H2 for main sections, H3 for subsections') or a template structure.",
        ui_guidance: "Specify formatting rules or a template (e.g., 'Use bullet points for lists', 'Wrap code blocks in ```') (optional).",
        defaultValue: ""
      }
    ],
    ai_instructions_template: `You are an expert content formatter.
Convert the following raw content:
"{{raw_content}}"
Into {{target_format}} format.
{{#if formatting_rules_or_template}}Apply the following formatting rules/template: "{{formatting_rules_or_template}}"{{/if}}
Ensure the output is well-formed and syntactically correct for the {{target_format}}.
Preserve all substantive content from the original.`
  },

  META_MANAGEMENT_AND_UTILITY: {
    name: "Meta Management & Utility",
    purpose: "Internal system operations that support the workflow but may not be explicit user-facing AI tasks.",
    inputs: [
      {
        name: "operation_type",
        type: "Dropdown",
        values: ["SaveWorkflowState", "LogStageOutput", "ExecuteBranchingLogic", "AggregateParallelOutputs", "NotifyUser"],
        description: "The specific meta operation to perform.",
        ui_guidance: "Select the type of meta operation."
      },
      {
        name: "operation_payload",
        type: "JSON",
        description: "Flexible data structure for the operation",
        ui_guidance: "Provide the data payload for the operation."
      }
    ],
    ai_instructions_template: `N/A (Generally not AI-prompt driven by users. If AI is used for a sub-task like 'summarize workflow progress for logging', it would use a prompt structure from another archetype, configured by the system.)`
  }
};
