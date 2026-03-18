import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const sendChatQuery = async (query) => {
  console.log(`[API REQUEST] Sending query to ${API_URL}`);
  console.log(`[API REQUEST] Payload:`, { query });
  
  try {
    const response = await axios.post(
      API_URL,
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
        timeout: 300000, // 5 minute timeout for cold starts and complex routing
      }
    );
    
    console.log(`[API RESPONSE] Success:`, response.data);
    
    // Explicitly return only the clean, requested metadata map
    return {
      responseText: response.data?.answer || "No response received.",
      modelUsed: response.data?.modelUsed || "UNKNOWN",
      latencyMs: response.data?.latencyMs || 0,
      fallbackUsed: response.data?.fallbackUsed || false,
      cost: response.data?.cost || 0.0,
      confidenceScore: response.data?.confidenceScore || 0.0,
    };

  } catch (error) {
    console.error(`[API ERROR] Failure encountered:`, error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401 || error.response.status === 403) {
        throw new Error("Invalid API key configured. Check application secrets.");
      }
      if (error.response.status >= 500) {
        throw new Error("Server error encountered. The MoE Cloud Router failed to execute.");
      }
      throw new Error(error.response.data?.message || `Server Error: ${error.response.status}`);
    } else if (error.request) {
      // The request was made but no response was received
      if (error.code === 'ECONNABORTED') {
        throw new Error("Request timed out after 5 minutes. The model took too long to respond.");
      }
      throw new Error("Server unreachable. Please check your internet connection or backend CORS configuration.");
    }
    
    // Something happened in setting up the request that triggered an Error
    throw new Error("An unexpected internal application error occurred.");
  }
};
