
// Utility to get the correct API base URL for both development and production
export const getApiUrl = (endpoint: string): string => {
  // Always use relative API routes - Vite will proxy to Vercel functions in dev
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
    });    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Helper function for fetching data from the database
export const fetchData = async () => {
  const url = getApiUrl('/getData');
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Fetch Error ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
