// Utility to get the correct API base URL for both development and production
export const getApiUrl = (endpoint: string): string => {
  // In development, use localhost server
  if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
    return `http://localhost:3001${endpoint}`;
  }
  
  // In production (Vercel), use relative API routes
  return `/api${endpoint}`;
};

// Helper function for making API calls with proper error handling
export const apiCall = async (endpoint: string, data: any) => {
  const url = getApiUrl(endpoint);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};
