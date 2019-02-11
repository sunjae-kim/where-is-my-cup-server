const { models: { Cafe, Tag }, validateMethods: { validateTag } } = require('../../../model');
const { getDistance, getLogger } = require('../../../lib');

const logger = getLogger('api/cafe');
const LAT_DISTANCE = 0.0018; // 약 200m
const LNG_DISTANCE = 0.00227; // 약 200m

// GET /api/cafe/detail/:id
exports.getDetail = async (req, res) => {
  try {
    // Id 에 일치하는 카페를 검색한다.
    const { id } = req.params;
    const cafe = await Cafe.findById(id).populate('tags');
    if (!cafe) return res.status(400).send('해당 카페가 존재하지 않습니다.');
    return res.status(200).send(cafe);
  } catch (error) {
    logger.error(error.message);
    logger.error(`At '/feedback' : body: ${req.body}`);
    return res.status(400).send(error.message);
  }
};

// POST /api/cafe/detail
exports.postDetail = (req, res) => {
  res.status(201).send(req.body);
};

// POST /api/cafe/curLoc
exports.curLoc = async (req, res) => {
  try {
    // 카페검색 bounds 를 지정한다.
    const { latitude, longitude } = req.body;
    const sLat = latitude - LAT_DISTANCE;
    const sLng = longitude - LNG_DISTANCE;
    const eLat = latitude + LAT_DISTANCE;
    const eLng = longitude + LNG_DISTANCE;

    // Bounds 내의 카페를 검색한다.
    let cafeList = await Cafe.find({
      'location.lat': { $gte: sLat, $lte: eLat },
      'location.lng': { $gte: sLng, $lte: eLng },
    });

    // 카페까지의 거리가 200m 이내인 카페로 추린다.
    cafeList = cafeList.reduce((acc, cafe) => {
      const { location: { lat, lng } } = cafe;
      const { _doc: newCafe } = cafe;
      const distance = Math.floor(getDistance(latitude, longitude, lat, lng) * 1000);
      newCafe.distance = distance;
      if (distance <= 200) acc.push(newCafe);
      return acc;
    }, []);
    res.status(200).send(cafeList);
  } catch (error) {
    logger.error(error.message);
    logger.error(`At '/feedback' : body: ${req.body}`);
    res.status(400).send(error.message);
  }
};

// POST /api/cafe/search
exports.search = async (req, res) => {
  try {
    // 사용자 query 로 카페를 검색한다.
    const { latitude, longitude, query } = req.body;
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
    res.status(200).send(newCafeList);
  } catch (error) {
    logger.error(error.message);
    logger.error(`At '/feedback' : body: ${req.body}`);
    res.status(400).send(error.message);
  }
};

// POST /api/cafe/feedback
exports.feedback = async (req, res) => {
  try {
    // 올바른 태그들이 입력됐는지 확인한다.
    const { cafeId, feedback } = req.body;
    const { value, error } = validateTag(feedback);
    if (error) return res.status(400).send('입력하신 태그가 스키마에 부합하지 않습니다.');

    // 카페의 태그를 확인한다.
    const { tagId } = await Cafe.findById(cafeId);
    const tags = await Tag.findById(tagId);

    // 카페 태그에 사용자 피드백을 반영한다.
    let result;
    if (!tags) {
      // 카페에 대한 태그가 없을 경우 새로 생성한다.
      result = await Tag.create(value);
      const { _id: newTagId } = result;
      await Cafe.findOneAndUpdate({ _id: cafeId }, { tagId: newTagId });
    } else {
      // 있을 경우 해당 태그에 반영한다.
      const newTags = Object.entries(value).reduce((acc, tag) => {
        const [tagName] = tag;
        acc[tagName] += 1;
        return acc;
      }, tags);
      result = await Tag.findOneAndUpdate({ _id: tagId }, newTags, { new: true });
    }
    return res.status(201).send(result);
  } catch (error) {
    logger.error(error.message);
    logger.error(`At '/feedback' : body: ${req.body}`);
    return res.status(400).send(error.message);
  }
};
