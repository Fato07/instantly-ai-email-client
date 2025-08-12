const API_BASE_URL = 'http://localhost:3002';

// Generic fetch wrapper
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Email API functions
export const emailAPI = {
  async getAll() {
    const data = await fetchAPI('/api/emails');
    return data.emails;
  },

  async getById(id) {
    const data = await fetchAPI(`/api/emails/${id}`);
    return data.email;
  },

  async create(emailData) {
    const data = await fetchAPI('/api/emails', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
    return data.email;
  },

  async delete(id) {
    return fetchAPI(`/api/emails/${id}`, {
      method: 'DELETE',
    });
  },
};

// AI API functions
export const aiAPI = {
  async classifyIntent(prompt) {
    return fetchAPI('/api/ai/classify', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  },

  async generateEmail(prompt, assistantType, recipientContext) {
    return fetchAPI('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, assistantType, recipientContext }),
    });
  },

  // Stream email generation
  streamEmailGeneration(prompt, type, onChunk, onComplete, onError) {
    const eventSource = new EventSource(
      `${API_BASE_URL}/api/ai/generate?prompt=${encodeURIComponent(prompt)}&type=${encodeURIComponent(type)}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'complete') {
          eventSource.close();
          if (onComplete) onComplete();
        } else {
          if (onChunk) onChunk(data);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
        if (onError) onError(error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
      if (onError) onError(error);
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  },
};