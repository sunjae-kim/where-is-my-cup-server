const { models: { Cafe, Tag }, validateMethods: { validateTag } } = require('../../../model');
// const

const LAT_DISTANCE = 0.0045; // 약 500m
const LNG_DISTANCE = 0.006; // 약 500m

// GET api/cafe/detail/:id
exports.getDetail = (req, res) => {
  res.status(200).send(`GET /cafe/detail/${req.params.id} Success`);
};

// POST api/cafe/detail/
exports.postDetail = (req, res) => {
  res.status(201).send(req.body);
};

// GET api/cafe/curLoc/:latitude/:longitude
exports.curLoc = async (req, res) => {
  const { latitude, longitude } = req.params;

  const sLat = Number(latitude) - LAT_DISTANCE;
  const sLng = Number(longitude) - LNG_DISTANCE;
  const eLat = Number(latitude) + LAT_DISTANCE;
  const eLng = Number(longitude) + LNG_DISTANCE;

  const cafeList = await Cafe.find({
    'location.lat': { $gte: sLat, $lte: eLat },
    'location.lng': { $gte: sLng, $lte: eLng },
  });

  res.status(200).send(cafeList);
};

// GET api/cafe/search/:query
exports.search = async (req, res) => {
  const { query } = req.params;

  const cafeList = await Cafe.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { addresses: { $regex: query, $options: 'i' } },
    ],
  });

  res.status(200).send(cafeList);
};
