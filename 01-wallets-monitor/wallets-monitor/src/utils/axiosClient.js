import axios from "axios";
import axiosRetry from "axios-retry";

// Create axios client with custom configuration
const axiosClient = axios.create({
  timeout: 30000,
  proxy: {
    host: "127.0.0.1",
    port: 7890,
    protocol: "http",
  },
  headers: {
    "User-Agent": "Mozilla/5.0",
    Accept: "*/*",
    "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
  },
});

// Configure retry mechanism
axiosRetry(axiosClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Custom retry conditions
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === "ECONNRESET" ||
      error.code === "ETIMEDOUT" ||
      (error.response && error.response.status >= 500)
    );
  },
});

export { axiosClient };
export default axiosClient;
