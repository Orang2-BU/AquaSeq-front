/** Galat dari backend (atau mock) dengan kode dari 09-API-KONTRAK §1. */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}
