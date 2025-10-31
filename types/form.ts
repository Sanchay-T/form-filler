// Core types for form detection and manipulation

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'hidden';

export interface FormField {
  id: string;
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  type: FormFieldType;
  name: string;
  label: string | null;
  placeholder: string | null;
  value: string;
  required: boolean;
  pattern: string | null;
  options?: string[]; // For select/radio/checkbox
  boundingBox: DOMRect;
}

export interface DetectedForm {
  id: string;
  element: HTMLFormElement | HTMLElement;
  fields: FormField[];
  action: string | null;
  method: string | null;
  boundingBox: DOMRect;
}

export interface FormContext {
  url: string;
  title: string;
  forms: DetectedForm[];
  timestamp: number;
}

export interface FillStrategy {
  fieldId: string;
  value: string;
  confidence: number;
}

export interface ContextEngineRequest {
  formContext: FormContext;
  userInput?: string;
  previousAttempts?: FillStrategy[];
}

export interface ContextEngineResponse {
  strategies: FillStrategy[];
  explanation?: string;
}
