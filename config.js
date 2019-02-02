require('dotenv').config();

const config = {
  development: {
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dbName: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  },
};

module.exports = config[process.env.NODE_ENV];
