'use client';

export const INITIAL_WELCOME_TEXT = `Hey, I'm Marky.
Your AI marketing consultant.

Tell me what you're building, what you're trying to sell, or what you're trying to solve — and I'll help you figure out the strategy.`;

export const STORAGE_KEY = 'marketpulse_marky_history';

export function getInitialMarkyMessages() {
  if (typeof window === 'undefined') {
    return [
      {
        role: 'model',
        content: INITIAL_WELCOME_TEXT,
        model: 'Gemini 2.5 Flash',
        timestamp: '12:00 PM'
      }
    ];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse Marky short term memory:', err);
  }

  const defaultMsg = [
    {
      role: 'model',
      content: INITIAL_WELCOME_TEXT,
      model: 'Gemini 2.5 Flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];
  return defaultMsg;
}

export function saveMarkyMessages(messages) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('marky-memory-sync', { detail: messages }));
    }, 0);
  } catch (err) {
    console.warn('Failed to save Marky short term memory:', err);
  }
}

export function clearMarkyMemory() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    const resetMsg = [
      {
        role: 'model',
        content: INITIAL_WELCOME_TEXT,
        model: 'Gemini 2.5 Flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('marky-memory-sync', { detail: resetMsg }));
    }, 0);
    return resetMsg;
  } catch (err) {
    console.warn('Failed to clear Marky memory:', err);
  }
}
