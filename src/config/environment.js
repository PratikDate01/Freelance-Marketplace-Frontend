// Environment configuration
const config = {
  development: {
    API_URL: process.env.REACT_APP_API_URL ,
    STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
    SOCKET_URL: process.env.REACT_APP_API_URL
  },
  production: {
    API_URL: process.env.REACT_APP_PRODUCTION_API_URL || process.env.REACT_APP_API_URL,
    STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
    SOCKET_URL: process.env.REACT_APP_PRODUCTION_API_URL || process.env.REACT_APP_API_URL
  }
};

const environment = process.env.NODE_ENV || 'development';

export default config[environment];