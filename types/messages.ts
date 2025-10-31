// Message passing types for communication between components

import type { FormContext, FillStrategy, ContextEngineRequest, ContextEngineResponse } from './form';

export type MessageType =
  | 'GET_FORM_CONTEXT'
  | 'FILL_FIELDS'
  | 'CLEAR_FIELD'
  | 'CLEAR_FORM'
  | 'FOCUS_FIELD'
  | 'TOGGLE_CHAT'
  | 'CONTEXT_ENGINE_REQUEST'
  | 'CONTEXT_ENGINE_RESPONSE'
  | 'VALIDATE_FIELD'
  | 'READ_ALL_FIELDS'
  | 'HIGHLIGHT_FIELD';

export interface BaseMessage {
  type: MessageType;
  id: string; // Unique message ID for responses
}

export interface GetFormContextMessage extends BaseMessage {
  type: 'GET_FORM_CONTEXT';
}

export interface FillFieldsMessage extends BaseMessage {
  type: 'FILL_FIELDS';
  strategies: FillStrategy[];
}

export interface ClearFieldMessage extends BaseMessage {
  type: 'CLEAR_FIELD';
  fieldId: string;
}

export interface ClearFormMessage extends BaseMessage {
  type: 'CLEAR_FORM';
  formId: string;
}

export interface FocusFieldMessage extends BaseMessage {
  type: 'FOCUS_FIELD';
  fieldId: string;
}

export interface ToggleChatMessage extends BaseMessage {
  type: 'TOGGLE_CHAT';
}

export interface ContextEngineRequestMessage extends BaseMessage {
  type: 'CONTEXT_ENGINE_REQUEST';
  request: ContextEngineRequest;
}

export interface ContextEngineResponseMessage extends BaseMessage {
  type: 'CONTEXT_ENGINE_RESPONSE';
  response: ContextEngineResponse;
}

export interface ValidateFieldMessage extends BaseMessage {
  type: 'VALIDATE_FIELD';
  fieldId: string;
}

export interface ReadAllFieldsMessage extends BaseMessage {
  type: 'READ_ALL_FIELDS';
}

export interface HighlightFieldMessage extends BaseMessage {
  type: 'HIGHLIGHT_FIELD';
  fieldId: string;
}

export type Message =
  | GetFormContextMessage
  | FillFieldsMessage
  | ClearFieldMessage
  | ClearFormMessage
  | FocusFieldMessage
  | ToggleChatMessage
  | ContextEngineRequestMessage
  | ContextEngineResponseMessage
  | ValidateFieldMessage
  | ReadAllFieldsMessage
  | HighlightFieldMessage;

export interface MessageResponse<T = any> {
  id: string; // Matches request message ID
  success: boolean;
  data?: T;
  error?: string;
}
