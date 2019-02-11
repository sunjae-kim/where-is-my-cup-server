const { User } = require('../../../model/user');

// GET /api/users/list
exports.getList = async (req, res) => {
  const allUsers = await User.find();
  res.send(allUsers);
};
