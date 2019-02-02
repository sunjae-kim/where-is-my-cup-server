// const logger = require('log4js').getLogger();

// GET api/cafe/detail/:id
exports.getDetail = (req, res) => {
  res.status(200).send(`GET /cafe/detail/${req.params.id} Success`);
};

// POST api/cafe/detail/
exports.postDetail = (req, res) => {
  res.status(201).send(req.body);
};

// GET api/cafe/list/query
exports.getList = (req, res) => {
  res.status(200).send(`GET /cafe/list/${req.params.query} Success`);
};
