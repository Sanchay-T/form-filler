// Fast form detection engine - detects all form fields on the page

import type { DetectedForm, FormField, FormFieldType, FormContext } from '../types/form';

export class FormDetector {
  private observer: MutationObserver | null = null;
  private detectedForms: Map<string, DetectedForm> = new Map();

  /**
   * Initialize the form detector with mutation observer for dynamic forms
   */
  initialize(onChange?: (forms: DetectedForm[]) => void): void {
    // Initial detection
    this.detectForms();

    // Watch for dynamic form changes
    this.observer = new MutationObserver(() => {
      this.detectForms();
      if (onChange) {
        onChange(Array.from(this.detectedForms.values()));
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['type', 'name', 'id', 'class']
    });
  }

  /**
   * Detect all forms on the page (super fast)
   */
  detectForms(): DetectedForm[] {
    const forms: DetectedForm[] = [];
    const formElements = document.querySelectorAll('form');

    // Detect explicit forms
    formElements.forEach((formEl, index) => {
      const form = this.processForm(formEl, `form-${index}`);
      if (form.fields.length > 0) {
        forms.push(form);
        this.detectedForms.set(form.id, form);
      }
    });

    // Detect implicit forms (fields not in <form> tags)
    const implicitForm = this.detectImplicitForms();
    if (implicitForm && implicitForm.fields.length > 0) {
      forms.push(implicitForm);
      this.detectedForms.set(implicitForm.id, implicitForm);
    }

    return forms;
  }

  /**
   * Process a single form element
   */
  private processForm(formEl: HTMLFormElement, id: string): DetectedForm {
    const fields: FormField[] = [];

    // Get all input-like elements
    const inputs = formEl.querySelectorAll('input, textarea, select');

    inputs.forEach((el, idx) => {
      const field = this.processField(el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, `${id}-field-${idx}`);
      if (field) {
        fields.push(field);
      }
    });

    return {
      id,
      element: formEl,
      fields,
      action: formEl.action || null,
      method: formEl.method || null,
      boundingBox: formEl.getBoundingClientRect()
    };
  }

  /**
   * Detect fields not in form tags (common in SPAs)
   */
  private detectImplicitForms(): DetectedForm | null {
    const inputs = document.querySelectorAll('input:not(form input), textarea:not(form textarea), select:not(form select)');

    if (inputs.length === 0) return null;

    const fields: FormField[] = [];
    inputs.forEach((el, idx) => {
      const field = this.processField(el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, `implicit-field-${idx}`);
      if (field) {
        fields.push(field);
      }
    });

    return {
      id: 'implicit-form',
      element: document.body,
      fields,
      action: null,
      method: null,
      boundingBox: document.body.getBoundingClientRect()
    };
  }

  /**
   * Process a single field element
   */
  private processField(
    el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    id: string
  ): FormField | null {
    // Skip hidden and submit buttons
    if (el instanceof HTMLInputElement) {
      if (el.type === 'submit' || el.type === 'button' || el.type === 'image' || el.style.display === 'none') {
        return null;
      }
    }

    const type = this.getFieldType(el);
    const label = this.getFieldLabel(el);

    let options: string[] | undefined;
    if (el instanceof HTMLSelectElement) {
      options = Array.from(el.options).map(opt => opt.value);
    }

    return {
      id,
      element: el,
      type,
      name: el.name || el.id || '',
      label,
      placeholder: el.placeholder || null,
      value: el instanceof HTMLSelectElement ? el.value : el.value,
      required: 'required' in el ? el.required : false,
      pattern: el instanceof HTMLInputElement ? el.pattern || null : null,
      options,
      boundingBox: el.getBoundingClientRect()
    };
  }

  /**
   * Get field type
   */
  private getFieldType(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): FormFieldType {
    if (el instanceof HTMLTextAreaElement) return 'textarea';
    if (el instanceof HTMLSelectElement) return 'select';
    return el.type as FormFieldType;
  }

  /**
   * Get field label (smart detection)
   */
  private getFieldLabel(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string | null {
    // Try explicit label
    const id = el.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent?.trim() || null;
    }

    // Try parent label
    const parentLabel = el.closest('label');
    if (parentLabel) {
      const clone = parentLabel.cloneNode(true) as HTMLElement;
      const input = clone.querySelector('input, textarea, select');
      if (input) input.remove();
      return clone.textContent?.trim() || null;
    }

    // Try aria-label
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Try previous sibling text
    let prev = el.previousElementSibling;
    if (prev?.tagName === 'LABEL') {
      return prev.textContent?.trim() || null;
    }

    // Try name/id as fallback
    return el.name || el.id || null;
  }

  /**
   * Get current form context
   */
  getContext(): FormContext {
    return {
      url: window.location.href,
      title: document.title,
      forms: Array.from(this.detectedForms.values()),
      timestamp: Date.now()
    };
  }

  /**
   * Get a specific field by ID
   */
  getField(fieldId: string): FormField | null {
    for (const form of this.detectedForms.values()) {
      const field = form.fields.find(f => f.id === fieldId);
      if (field) return field;
    }
    return null;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.detectedForms.clear();
  }
}

// Singleton instance
export const formDetector = new FormDetector();
