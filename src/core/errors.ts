export type ErrorCode =
  | 'NotFound'
  | 'Validation'
  /** A product limit was reached (e.g. max babies). `message` names the limit. */
  | 'Limit'
  | 'Conflict'
  | 'Storage'
  | 'Network'
  | 'Permission'
  | 'Unknown';

export type AppError = { code: ErrorCode; message?: string; cause?: unknown };

export function appError(code: ErrorCode, message?: string, cause?: unknown): AppError {
  return { code, message, cause };
}

export function isAppError(value: unknown): value is AppError {
  return typeof value === 'object' && value !== null && 'code' in value;
}

export function toAppError(cause: unknown): AppError {
  return isAppError(cause) ? cause : appError('Unknown', undefined, cause);
}
