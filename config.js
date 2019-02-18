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
    log4js: {
      appenders: {
        app: {
          type: 'stdout',
        },
        errorFile: {
          type: 'file',
          filename: 'log/errors.log',
        },
        errors: {
          type: 'logLevelFilter',
          level: 'ERROR',
          appender: 'errorFile',
        },
        duplicated: {
          type: 'file',
          filename: 'log/duplicated.log',
        },
      },
      categories: {
        default: { appenders: ['app', 'errors'], level: 'TRACE' },
        Duplicated: { appenders: ['duplicated'], level: 'WARN' },
      },
    },
  },
};

module.exports = config[process.env.NODE_ENV];
