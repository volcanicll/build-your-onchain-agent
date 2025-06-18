import axios from "axios";
import axiosRetry from "axios-retry";

// Create axios client with custom configuration
export const axiosClient = axios.create({
  timeout: 30000,
  headers: {
    "User-Agent": "Mozilla/5.0",
    Connection: "keep-alive",
  },
});

// Configure retry mechanism
axiosRetry(axiosClient, {
  retries: 3,
  retryDelay: (retryCount) => {
    return Math.min(1000 * Math.pow(2, retryCount), 10000);
  },
  retryCondition: (error) => {
    // Custom retry conditions
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === "ECONNRESET" ||
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT"
    );
  },
  onRetry: (retryCount, error, requestConfig) => {
    console.log(
      `Retry attempt ${retryCount} for ${requestConfig.url}. Error: ${error.message}`
    );
  },
});

export default axiosClient;
