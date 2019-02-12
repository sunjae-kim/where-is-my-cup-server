const { models: { User } } = require('../../../model');
const { utility: { getLogger } } = require('../../../lib');

const logger = getLogger('api/users');

// GET /api/users/list
exports.getList = async (req, res) => {
  const allUsers = await User.find();
  res.send(allUsers);
};

// GET /api/users/favorites/:id
exports.getFavorites = async (req, res) => {
  try {
    // Id 를 통해서 사용자 정보를 찾는다.
    const { id } = req.params;
    const user = await User.findById(id).populate('favorites');
    if (!user) return res.status(400).send('존재하지 않는 유저입니다.');

    // 사용자의 즐겨찾기를 찾고 응답한다.
    const { favorites } = user;
    return res.status(200).send(favorites);
  } catch (error) {
    logger.error(error.message);
    logger.error(`At '/favorites/:id' : body: ${req.params}`);
    return res.status(400).send(error.message);
  }
};

// POST /api/users/favorites/:id
exports.postFavorites = async (req, res) => {
  try {
    // Id 를 통해서 사용자 정보를 찾는다.
    const { id: _id } = req.params;
    const { cafeId } = req.body;
    const user = await User.findById(_id).populate('Cafes');
    if (!user) return res.status(400).send('존재하지 않는 유저입니다.');

    logger.debug(user);

    // 사용자의 즐겨찾기에 추가한다.
    const { favorites } = user;
    const result = await User.findOneAndUpdate(
      { _id },
      { $set: { favorites: [...favorites, cafeId] } },
      { new: true },
    );
    return res.status(201).send(result);
  } catch (error) {
    logger.error(error.message);
    logger.error(`At '/favorites/:id' : body: ${req.body}`);
    return res.status(400).send(error.message);
  }
};
