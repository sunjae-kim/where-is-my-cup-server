const { Users } = require('../../../model/users');

// GET /api/users/list
exports.getList = async (req, res) => {
  const allUsers = await Users.find();
  res.send(allUsers);
};
