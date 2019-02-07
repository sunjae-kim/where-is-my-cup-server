const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const logger = require('./src/lib').getLogger('Server');
const { database } = require('./config');

const app = express();
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());
/* extended 는 중첩된 객체표현을 허용할지 말지를 정하는 것이다.
객체 안에 객체를 파싱할 수 있게하려면 true. */
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

// database connection
mongoose.connect(
  `${database.host}:${database.port}`,
  {
    user: database.username,
    pass: database.password,
    dbName: database.dbName,
    useNewUrlParser: true,
  },
  (error) => {
    if (error) {
      logger.error(error);
    } else {
      logger.info('The database is successfully connected!');
    }
  },
);
