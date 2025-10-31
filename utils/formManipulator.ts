// Fast form field manipulation - CRUD operations on form fields

import type { FormField, FillStrategy } from '../types/form';
import { formDetector } from './formDetector';

export class FormManipulator {
  /**
   * Fill a single field with a value (crazy fast)
   */
  fillField(fieldId: string, value: string): boolean {
    const field = formDetector.getField(fieldId);
    if (!field) return false;

    return this.setFieldValue(field, value);
  }

  /**
   * Fill multiple fields from strategies
   */
  async fillFields(strategies: FillStrategy[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const strategy of strategies) {
      const result = this.fillField(strategy.fieldId, strategy.value);
      if (result) success++;
      else failed++;

      // Tiny delay to allow UI to update (keeps it smooth)
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    return { success, failed };
  }

  /**
   * Set value on a field element (handles all input types)
   */
  private setFieldValue(field: FormField, value: string): boolean {
    try {
      const el = field.element;

      // Store original value for undo
      const originalValue = this.getFieldValue(field);

      // Handle different field types
      switch (field.type) {
        case 'checkbox':
          if (el instanceof HTMLInputElement) {
            el.checked = value === 'true' || value === '1' || value.toLowerCase() === 'yes';
          }
          break;

        case 'radio':
          if (el instanceof HTMLInputElement) {
            // Find radio with matching value
            const radioGroup = document.querySelectorAll(`input[name="${field.name}"]`);
            radioGroup.forEach((radio) => {
              if (radio instanceof HTMLInputElement) {
                radio.checked = radio.value === value;
              }
            });
          }
          break;

        case 'select':
          if (el instanceof HTMLSelectElement) {
            el.value = value;
          }
          break;

        case 'file':
          // File inputs can't be set programmatically for security
          console.warn('File inputs cannot be filled programmatically');
          return false;

        default:
          // Text, email, number, textarea, etc.
          if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            el.value = value;
          }
      }

      // Trigger events to notify the page
      this.triggerEvents(el);

      // Highlight the field briefly
      this.highlightField(field);

      return true;
    } catch (error) {
      console.error('Failed to fill field:', error);
      return false;
    }
  }

  /**
   * Get current value of a field
   */
  getFieldValue(field: FormField): string {
    const el = field.element;

    if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox') return el.checked ? 'true' : 'false';
      if (el.type === 'radio') return el.checked ? el.value : '';
      return el.value;
    }

    if (el instanceof HTMLSelectElement) return el.value;
    if (el instanceof HTMLTextAreaElement) return el.value;

    return '';
  }

  /**
   * Clear a field
   */
  clearField(fieldId: string): boolean {
    return this.fillField(fieldId, '');
  }

  /**
   * Clear all fields in a form
   */
  clearForm(formId: string): void {
    const context = formDetector.getContext();
    const form = context.forms.find(f => f.id === formId);

    if (form) {
      form.fields.forEach(field => {
        this.fillField(field.id, '');
      });
    }
  }

  /**
   * Trigger native events on the element
   */
  private triggerEvents(el: HTMLElement): void {
    // Trigger input event
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    el.dispatchEvent(inputEvent);

    // Trigger change event
    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    el.dispatchEvent(changeEvent);

    // Trigger blur event (some forms validate on blur)
    const blurEvent = new Event('blur', { bubbles: true, cancelable: true });
    el.dispatchEvent(blurEvent);

    // For React/Vue apps, trigger a keyboard event
    const keyEvent = new KeyboardEvent('keyup', { bubbles: true, cancelable: true });
    el.dispatchEvent(keyEvent);
  }

  /**
   * Highlight field with animation
   */
  private highlightField(field: FormField): void {
    const el = field.element;
    const originalOutline = el.style.outline;
    const originalTransition = el.style.transition;

    el.style.transition = 'outline 0.2s ease';
    el.style.outline = '2px solid #3b82f6';

    setTimeout(() => {
      el.style.outline = originalOutline;
      setTimeout(() => {
        el.style.transition = originalTransition;
      }, 200);
    }, 500);
  }

  /**
   * Read all values from current page
   */
  readAllFields(): Record<string, string> {
    const context = formDetector.getContext();
    const values: Record<string, string> = {};

    context.forms.forEach(form => {
      form.fields.forEach(field => {
        values[field.id] = this.getFieldValue(field);
      });
    });

    return values;
  }

  /**
   * Validate a field (basic validation)
   */
  validateField(fieldId: string): { valid: boolean; error?: string } {
    const field = formDetector.getField(fieldId);
    if (!field) return { valid: false, error: 'Field not found' };

    const value = this.getFieldValue(field);

    // Required check
    if (field.required && !value) {
      return { valid: false, error: 'This field is required' };
    }

    // Pattern check
    if (field.pattern && value) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) {
        return { valid: false, error: 'Value does not match required pattern' };
      }
    }

    // Type-specific validation
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, error: 'Invalid email address' };
      }
    }

    return { valid: true };
  }

  /**
   * Focus on a specific field
   */
  focusField(fieldId: string): void {
    const field = formDetector.getField(fieldId);
    if (field) {
      field.element.focus();
      field.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

// Singleton instance
export const formManipulator = new FormManipulator();
