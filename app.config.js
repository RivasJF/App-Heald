require('dotenv').config({ path: './.env.dev' });

export default ({ config }) => {
  return {
    ...config,
    extra: {
      API_URL: process.env.API_URL,
      USER: process.env.USER,
    },
  };
};