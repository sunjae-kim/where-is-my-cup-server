exports.getDetail = (req, res) => {
  res.status(200).send(`GET /cafe/detail/${req.params.id} Success`);
};
