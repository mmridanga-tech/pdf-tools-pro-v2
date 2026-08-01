interface ApiOptions extends RequestInit {
  timeoutMs?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
  Robust API client for AI Gemini endpoints:
  1. Prevents calling response.json() on invalid/empty/non-JSON responses.
  2. Verifies response.ok, Content-Type (application/json), and non-empty response body.
  3. Maps HTTP status codes (400, 401, 403, 404, 429, 500, Timeout, Network Failure) to friendly errors.
  4. Returns the structured data payload or JSON object safely without crashing the UI.
 */
export async function postApiJson<T>(url: string, bodyData: any, options: ApiOptions = {}): Promise<T> {
  const { timeoutMs = 60000, ...customInit } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(customInit.headers || {}),
      },
      body: JSON.stringify(bodyData),
      signal: controller.signal,
      ...customInit,
    });
  } catch (err: any) {
    clearTimeout(timer);
    console.error(`Network or fetch error while calling ${url}:`, err);

    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The operation took too long to complete. Please try again.');
    }
    throw new Error('Network failure: Unable to reach the server. Please check your network connection.');
  } finally {
    clearTimeout(timer);
  }

  // 1. Check Content-Type header
  const contentType = response.headers.get('content-type') || '';
  const isJsonHeader = contentType.toLowerCase().includes('application/json');

  // 2. Read response body safely as text first (NEVER call response.json() directly)
  let rawText = '';
  try {
    rawText = await response.text();
  } catch (err: any) {
    console.error(`Error reading response body stream from ${url}:`, err);
    throw new Error('Failed to read response content from server.');
  }

  // 3. Verify response body is not empty
  const trimmedText = rawText ? rawText.trim() : '';
  if (!trimmedText) {
    console.error(`Server returned an empty response body (0 bytes) from ${url} [Status ${response.status}]`);
    throw new Error(`Server returned an empty response (HTTP ${response.status}). Please try again.`);
  }

  if (!isJsonHeader) {
    console.warn(`Response from ${url} does not specify application/json Content-Type (Got: ${contentType}). Raw text:`, trimmedText);
  }

  // 4. Safely parse JSON
  let parsedJson: any;
  try {
    parsedJson = JSON.parse(trimmedText);
  } catch (err: any) {
    console.error(`JSON Parse error for ${url}:`, err, 'Raw body:', trimmedText);
    throw new Error(`Invalid JSON payload received from server (HTTP ${response.status}).`);
  }

  // 5. Verify response.ok and parsed success flag
  if (!response.ok || parsedJson.success === false) {
    const backendError = parsedJson?.error || parsedJson?.message || `API error HTTP ${response.status}`;
    console.error(`API Error [HTTP ${response.status}] from ${url}:`, backendError);

    let friendlyError = '';
    switch (response.status) {
      case 400:
        friendlyError = backendError || 'Bad request (400). Please check your input and try again.';
        break;
      case 401:
        friendlyError = backendError || 'Unauthorized (401). Gemini API key is invalid or missing.';
        break;
      case 403:
        friendlyError = backendError || 'Forbidden (403). Permission denied for this AI request.';
        break;
      case 404:
        friendlyError = backendError || 'Not Found (404). The requested AI service endpoint was not found.';
        break;
      case 429:
        friendlyError = backendError || 'Rate limit exceeded (429). Too many requests. Please wait a moment.';
        break;
      case 500:
      default:
        friendlyError = backendError || `Server error (${response.status}). Please try again later.`;
        break;
    }

    throw new Error(friendlyError);
  }

  // 6. Return data safely
  if (parsedJson && typeof parsedJson === 'object' && 'data' in parsedJson) {
    return parsedJson.data as T;
  }

  return parsedJson as T;
}
