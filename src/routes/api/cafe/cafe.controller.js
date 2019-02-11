const { models: { Cafe, Tag }, validateMethods: { validateTag } } = require('../../../model');
const { getDistance } = require('../../../lib');

const LAT_DISTANCE = 0.0018; // 약 200m
const LNG_DISTANCE = 0.00227; // 약 200m

// GET /api/cafe/detail/:id
exports.getDetail = (req, res) => {
  res.status(200).send(`GET /cafe/detail/${req.params.id} Success`);
};

// POST /api/cafe/detail
exports.postDetail = (req, res) => {
  res.status(201).send(req.body);
};

// POST /api/cafe/curLoc
exports.curLoc = async (req, res) => {
  // 카페검색 bounds 를 지정한다.
  const { latitude, longitude } = req.body;
  const sLat = Number(latitude) - LAT_DISTANCE;
  const sLng = Number(longitude) - LNG_DISTANCE;
  const eLat = Number(latitude) + LAT_DISTANCE;
  const eLng = Number(longitude) + LNG_DISTANCE;

  // Bounds 내의 카페를 검색한다.
  let cafeList = await Cafe.find({
    'location.lat': { $gte: sLat, $lte: eLat },
    'location.lng': { $gte: sLng, $lte: eLng },
  });

  // 카페까지의 거리가 200m 이내인 카페로 추린다.
  cafeList = cafeList.reduce((acc, cafe) => {
    const { location: { lat, lng } } = cafe;
    const distance = Math.floor(getDistance(Number(latitude), Number(longitude), lat, lng) * 1000);
    if (distance <= 200) acc.push({ ...cafe, distance });
    return acc;
  }, []);

  res.status(200).send(cafeList);
};

// POST /api/cafe/search
exports.search = async (req, res) => {
  // 사용자 query 로 카페를 검색한다.
  const { latitude, longitude, query } = req.params;
  let cafeList = await Cafe.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { addresses: { $regex: query, $options: 'i' } },
    ],
  });

  // 카페까지의 거리를 property 에 추가한다.
  cafeList = cafeList.reduce((acc, cafe) => {
    const { location: { lat, lng } } = cafe;
    const distance = Math.floor(getDistance(Number(latitude), Number(longitude), lat, lng) * 1000);
    acc.push({ ...cafe, distance });
    return acc;
  }, []);

  res.status(200).send(cafeList);
};

// POST /api/cafe/feedback
exports.feedback = async (req, res) => {
  // 올바른 태그들이 입력됐는지 확인한다.
  const { cafeId, feedback } = req.body;
  const { value, error } = validateTag(feedback);
  if (error) return res.status(400).send('입력하신 태그가 스키마에 부합하지 않습니다.');

  // 카페의 태그를 확인한다.
  const { tagId } = await Cafe.findById(cafeId);
  const tags = await Tag.findById(tagId);

  // 카페 태그에 사용자 피드백을 반영한다.
  if (!tags) {
    const { _id: newTagId } = await Tag.create(value);
    await Cafe.findOneAndUpdate({ _id: cafeId }, { tagId: newTagId });
  } else {
    const newTags = Object.entries(value).reduce((acc, tag) => {
      const [tagName] = tag;
      acc[tagName] += 1;
      return acc;
    }, tags);

    await Tag.findOneAndUpdate({ _id: tagId }, newTags);
  }

  return res.status(201).send('입력하신 태그가 성공적으로 반영되었습니다.');
};
