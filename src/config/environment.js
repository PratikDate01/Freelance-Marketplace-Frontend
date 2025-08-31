// Environment configuration with safe defaults for deployment
const DEFAULT_API = "https://freelance-marketplace-backend-bppe.onrender.com";

const config = {
  development: {
    API_URL: process.env.REACT_APP_API_URL || DEFAULT_API,
    STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
    SOCKET_URL: process.env.REACT_APP_API_URL || DEFAULT_API,
  },
  production: {
    API_URL:
      process.env.REACT_APP_PRODUCTION_API_URL ||
      process.env.REACT_APP_API_URL ||
      DEFAULT_API,
    STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
    SOCKET_URL:
      process.env.REACT_APP_PRODUCTION_API_URL ||
      process.env.REACT_APP_API_URL ||
      DEFAULT_API,
  },
};

const environment = process.env.NODE_ENV || "development";

const resolved = config[environment];
if (!resolved.API_URL) {
  // Last-resort safeguard; should never happen with DEFAULT_API
  // eslint-disable-next-line no-console
  console.warn("[env] API_URL is not set. Falling back to:", DEFAULT_API);
  resolved.API_URL = DEFAULT_API;
  resolved.SOCKET_URL = DEFAULT_API;
}

export default resolved;