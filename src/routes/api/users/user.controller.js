const { Types: { ObjectId } } = require('mongoose');
const { models: { User } } = require('../../../model');
const { utility: { getLogger } } = require('../../../lib');

const logger = getLogger('api/users');

// DELETE /api/users
exports.deleteUser = async (req, res) => {
  try {
    let { _id } = req.tokenPayload; _id = ObjectId(_id);
    const result = await User.findByIdAndRemove(ObjectId(_id));
    res.status(200).send(result);
  } catch (error) {
    logger.error(error.message);
    logger.error(`At '/api/users' : body: ${req.params}`);
    res.status(400).send(error.message);
  }
};

// GET /api/users/list
exports.getList = async (req, res) => {
  const allUsers = await User.find();
  res.send(allUsers);
};

// GET /api/users/favorites
exports.getFavorites = async (req, res) => {
  try {
    // Id 를 통해서 사용자 정보를 찾는다.
    let { _id } = req.tokenPayload; _id = ObjectId(_id);
    const user = await User.findById(_id).populate('favorites');
    if (!user) return res.status(400).send('존재하지 않는 유저입니다.');

    // 사용자의 즐겨찾기를 찾고 응답한다.
    const { favorites } = user;
    return res.status(200).send(favorites);
  } catch (error) {
    logger.error(error.message);
    logger.error(`At '/favorites' : body: ${req.params}`);
    return res.status(400).send(error.message);
  }
};

// POST /api/users/favorites
exports.postFavorites = async (req, res) => {
  try {
    // Id 를 통해서 사용자 정보를 찾는다.
    let { _id } = req.tokenPayload; _id = ObjectId(_id);
    let { cafeId } = req.body; cafeId = ObjectId(cafeId);
    let user = await User.findById(_id).populate('Cafes');
    if (!user) return res.status(400).send('존재하지 않는 유저입니다.');

    // 사용자의 즐겨찾기에 이미 추가된 항목인지 확인한다.
    const { favorites } = user;
    const flag = favorites.some(favorite => favorite.toString() === cafeId);
    if (flag) return res.send(`Already saved : ${cafeId}`);

    // 추가돼있지 않다면 로직을 수행한다.
    user = await User.findOneAndUpdate(
      { _id },
      { $set: { favorites: [...favorites, cafeId] } },
      { new: true },
    );
    return res.status(201).send({ user });
  } catch (error) {
    logger.error(error.message);
    logger.error(`At '/favorites' : body: ${req.body}`);
    return res.status(400).send(error.message);
  }
};

// DELETE /api/users/favorites
exports.deleteFavorites = async (req, res) => {
  try {
    // Id 를 통해서 사용자 정보를 찾는다.
    let { _id } = req.tokenPayload; _id = ObjectId(_id);
    const { cafeId } = req.body;
    let user = await User.findById(_id).populate('Cafes');
    if (!user) return res.status(400).send('존재하지 않는 유저입니다.');

    // 추가돼있지 않다면 로직을 수행한다.
    const { favorites } = user;
    user = await User.findOneAndUpdate(
      { _id },
      { $set: { favorites: favorites.filter(favorite => favorite !== ObjectId(cafeId)) } },
      { new: true },
    );
    return res.status(201).send({ user });
  } catch (error) {
    logger.error(error.message);
    logger.error(`At '/favorites' : body: ${req.body}`);
    return res.status(400).send(error.message);
  }
};
