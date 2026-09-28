import { HttpErrorResponse } from '@angular/common/http';

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';


export function getErrorMessage(
  err: unknown,
  fallback: string = DEFAULT_MESSAGE
): string {

  if (!(err instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (err.status === 0) {
    return 'Unable to connect to the server. Please check your connection and try again.';
  }

  if (err.status === 429) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  if (err.status >= 500) {
    return 'Server error. Please try again later.';
  }

  const validationMessage = extractValidationMessage(err.error);

  if (validationMessage) {
    return validationMessage;
  }

  const message = err.error?.message;

  if (err.status === 400 && message === 'Validation error') {
    return 'Some of the information you entered is invalid. Please check the form and try again.';
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return fallback;
}


function extractValidationMessage(body: any): string | null {

  const cause = body?.cause;

  if (!Array.isArray(cause)) {
    return null;
  }

  const messages = cause
    .flatMap((group: any) =>
      Array.isArray(group?.details) ? group.details : []
    )
    .map((detail: any) => {

      const text = String(detail?.message ?? '');

      if (text.includes('fails to match')) {

        const field = Array.isArray(detail?.path)
          ? detail.path[detail.path.length - 1]
          : 'field';

        return `Invalid ${field}`;
      }

      return text.replace(/"/g, '').trim();
    })
    .filter(Boolean);

  if (!messages.length) {
    return null;
  }

  return [...new Set<string>(messages)].join('. ') + '.';
}
