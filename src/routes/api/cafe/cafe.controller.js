const { Types: { ObjectId } } = require('mongoose');
const { models: { Cafe, Tag, User }, validateMethods: { validateTag }, schemas: { tagSchema } } = require('../../../model');
const { utility: { getDistance, getLogger, getRandom } } = require('../../../lib');
const { collaborativeFiltering: { cfWithUsers, cfWithCafelist }, googleMap: { getLatLng } } = require('../../../service');

const logger = getLogger('api/cafe');
const LAT_DISTANCE = 0.0018; // 약 200m
const LNG_DISTANCE = 0.00227; // 약 200m

// GET /api/cafe/detail/:id
exports.getDetail = async (req, res) => {
  try {
    // Id 에 일치하는 카페를 검색한다.
    let { id } = req.params; id = ObjectId(id);
    const { latitude, longitude } = req.headers;
    const cafe = await Cafe.findById(id).populate('tags');
    if (!cafe) return res.status(400).send('해당 카페가 존재하지 않습니다.');

    // 카페의 거리를 추가 검색하여 응답한다.
    const { _doc: newCafe, location: { lat, lng } } = cafe;
    newCafe.distance = Math.floor(getDistance(latitude, longitude, lat, lng) * 1000);
    return res.status(200).send(cafe);
  } catch (error) {
    logger.error(error.message);
    logger.error(`At '/detail/:id' : headers: ${req.headers}`);
    return res.status(400).send(error.message);
  }
};

// GET /api/cafe/tags/:id
exports.getTagsForCafe = async (req, res) => {
  try {
    // Id 에 일치하는 태그를 검색한다.
    let { id } = req.params; id = ObjectId(id);
    const tags = await Tag.findById(id);
    if (!tags) return res.status(400).send('아직 평가가 되지 않은 카페입니다.');
    return res.status(200).send(tags);
  } catch (error) {
    logger.error(error.message);
    logger.error(`At '/tags/:id' : params: ${req.params}`);
    return res.status(400).send(error.message);
  }
};

// GET /api/cafe/curLoc
exports.curLoc = async (req, res) => {
  console.log(req.originalUrl);
  try {
    // 카페검색 bounds 를 지정한다.
    const { address } = req.headers;
    let { latitude, longitude } = req.headers;
    if (address) {
      const { lat, lng } = await getLatLng(address);
      latitude = lat; longitude = lng;
    }

    const sLat = latitude - LAT_DISTANCE;
    const sLng = longitude - LNG_DISTANCE;
    const eLat = latitude + LAT_DISTANCE;
    const eLng = longitude + LNG_DISTANCE;

    // Bounds 내의 카페를 검색한다.
    const cafeList = await Cafe.find({
      'location.lat': { $gte: sLat, $lte: eLat },
      'location.lng': { $gte: sLng, $lte: eLng },
    });

    // 카페까지의 거리가 200m 이내인 카페로 추린다.
    const [cafeAround, cafeIdList] = cafeList.reduce((acc, cafe) => {
      const { location: { lat, lng } } = cafe;
      const { _doc: newCafe } = cafe;
      const distance = Math.floor(getDistance(latitude, longitude, lat, lng) * 1000);
      newCafe.distance = distance;
      if (distance <= 200) {
        const { _id } = newCafe;
        acc[0].push(newCafe);
        acc[1].push(_id);
      }
      return acc;
    }, [[], []]);
    cafeAround.sort((a, b) => a.distance - b.distance);

    // 주위 카페를 좋아하는 유저를 찾는다.
    let { _id } = req.tokenPayload; _id = ObjectId(_id);
    const users = await User.find({ favorites: { $in: cafeIdList }, _id: { $ne: _id } }).populate('favorites');

    // 유저들 중 성향이 비슷한 neighbor 및 추천될만한 Tag 를 찾는다.
    const user = await User.findById(_id);
    const { neighborsIdList, tag } = await cfWithUsers(users, user);

    // (Top 3 태그) + (추천된 태그) 로 추천할 카페를 찾는다.
    const recommendations = [];
    const { top3Tags } = user;
    const tags = tag ? [...top3Tags, tag] : top3Tags;
    const cafeIdListRecommendedByTag = await cfWithCafelist(user, tags, cafeAround);
    if (cafeIdListRecommendedByTag) {
      cafeAround.forEach((cafe) => {
        const { _id: cafeId } = cafe;
        if (cafeIdListRecommendedByTag.includes(cafeId)) recommendations.push(cafe);
      });
    }

    // Neighbor 들이 좋아하는 200m 범위 내의 카페들을 찾는다.
    if (neighborsIdList) {
      const neighbors = users.reduce((acc, neighbor) => {
        const { _id: userId } = neighbor;
        if (neighborsIdList.includes(userId)) acc.push(neighbor);
        return acc;
      }, []);
      neighbors.map(neighbor => ({
        [neighbor.name]: neighbor.favorites.forEach((favorite) => {
          const { location: { lat, lng } } = favorite;
          const distance = getDistance(latitude, longitude, lat, lng);
          if (distance <= 0.2 && !recommendations.includes(favorite)) {
            recommendations.push(favorite);
          }
        }),
      }));
    }

    // TODO 추천할 카페가 없을 시 주위 카페 중 랜덤으로 보내기
    if (recommendations.length === 0) {
      recommendations.push(...getRandom(cafeAround));
    }

    res.status(200).send({ cafeAround, recommendations });
  } catch (error) {
    logger.error(error.message);
    logger.error(`At '/curLoc' : headers: ${req.headers}`);
    res.status(400).send(error);
  }
};

// GET /api/cafe/search/:query
exports.search = async (req, res) => {
  try {
    // 사용자 query 로 카페를 검색한다.
    const { query } = req.params;
    const { latitude, longitude } = req.headers;
    const cafeList = await Cafe.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { addresses: { $regex: query, $options: 'i' } },
      ],
    });

    // 카페까지의 거리를 property 에 추가한다.
    const newCafeList = cafeList.reduce((acc, cafe) => {
      const { location: { lat, lng } } = cafe;
      const { _doc: newCafe } = { ...cafe };
      newCafe.distance = Math.floor(getDistance(latitude, longitude, lat, lng) * 1000);
      acc.push(newCafe);
      return acc;
    }, []);
    newCafeList.sort((a, b) => a.distance - b.distance);
    res.status(200).send(newCafeList);
  } catch (error) {
    logger.error(error.message);
    logger.error(`At '/search/:query' : headers: ${req.headers}`);
    res.status(400).send(error.message);
  }
};

// 태그를 받아서 TOP 3 를 계산하는 함수
const getTop3 = (tags) => {
  const { _doc } = tags;
  const schema = Object.keys(tagSchema.obj);
  const sortedTags = Object.entries(_doc)
    .filter(tag => (schema.includes(tag[0]) && tag[1] > 0))
    .sort((a, b) => b[1] - a[1]);
  return sortedTags.reduce((acc, tag) => {
    if (acc.length === 0) return [tag];
    if (acc.length < 3 || acc[acc.length - 1][1] === tag[1]) {
      acc.push(tag);
    }
    return acc;
  }, []).map(tag => tag[0]);
};

// 피드백을 반영하는 함수
const applyFeedback = async (id, value, Model) => {
  // 유저의 태그를 확인한다.
  const { tags: tagsId } = await Model.findById(id).select('tags');
  const tags = await Tag.findById(tagsId);

  // 카페 태그에 사용자 피드백을 반영한다.
  let result;
  if (!tags) {
    // 카페에 대한 태그가 없을 경우 새로 생성한다.
    const newTags = Object.keys(value).reduce((acc, tag) => {
      acc[tag] = 1;
      return acc;
    }, {});
    result = await Tag.create(newTags);
    const top3Tags = getTop3(result);
    const { _id: newTagId } = result;
    await Model.findOneAndUpdate({ _id: id }, { tags: newTagId, top3Tags });
  } else {
    // 있을 경우 해당 태그에 반영한다.
    const newTags = Object.entries(value).reduce((acc, tag) => {
      const [tagName] = tag;
      acc[tagName] += 1;
      return acc;
    }, tags);
    const top3Tags = getTop3(newTags);
    await Model.findOneAndUpdate({ _id: id }, { top3Tags });
    result = await Tag.findOneAndUpdate({ _id: tagsId }, newTags, { new: true });
  }

  return result;
};

// POST /api/cafe/feedback/:id
exports.feedback = async (req, res) => {
  try {
    // 올바른 태그들이 입력됐는지 확인한다.
    let { id: cafeId } = req.params; cafeId = ObjectId(cafeId);
    let { _id: userId } = req.tokenPayload; userId = ObjectId(userId);
    const { feedback } = req.body;
    const { value, error } = validateTag(feedback);
    if (error) return res.status(400).send('입력하신 태그가 스키마에 부합하지 않습니다.');

    const userResult = await applyFeedback(userId, value, User);
    const cafeResult = await applyFeedback(cafeId, value, Cafe);

    return res.status(201).send({ userResult, cafeResult });
  } catch (error) {
    logger.error(error.message);
    logger.error(`At '/feedback/:cafeId' : body: ${req.body}; params: ${req.params}`);
    return res.status(400).send(error.message);
  }
};
