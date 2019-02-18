const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { database } = require('./config');
const { utility: { getLogger } } = require('./src/lib');

const logger = getLogger('Server');
const app = express();
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('jwt-secret', process.env.JWT_SECRET);
const port = process.env.PORT || 3000;

app.use('/api', require('./src/routes/api'));
app.use('/oauth', require('./src/routes/oauth'));

app.get('/', (req, res) => {
  res.status(200).send('Success');
});

app.listen(port, () => {
  logger.info(`The server is listening on port ${port}`);
});

mongoose.connect(
  `${database.host}:${database.port}`,
  {
    user: database.username,
    pass: database.password,
    dbName: database.dbName,
    useNewUrlParser: true,
    useCreateIndex: true,
  },
  (error) => {
    if (error) {
      logger.error(error);
    } else {
      logger.info('The database is successfully connected!');
    }
  },
);
