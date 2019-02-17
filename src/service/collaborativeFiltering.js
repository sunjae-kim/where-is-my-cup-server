const g = require('ger');
const { utility: { getLogger } } = require('../lib');

const logger = getLogger('Recommendation System');
const esm = new g.MemESM();
const ger = new g.GER(esm);

const cfWithUsers = async (users, targetUser) => {
  logger.trace('############################################################');
  logger.trace(`@ Start find neighbors and recommended tag for '${targetUser.name}'`);
  logger.trace();
  logger.trace('(1/6) Building user events');
  // 추천 알고리즘을 위한 액션을 구한다.
  const targetUsers = [...users, targetUser];
  const events = targetUsers.flatMap((user) => {
    const { _id, top3Tags, name } = user;
    return top3Tags.map(tag => ({
      namespace: 'user',
      person: `${_id} / ${name}`,
      action: 'likes',
      thing: tag,
      expires_at: '2020-07-10',
    }));
  });
  logger.trace(`Built '${events.length}' events`);

  // 머신러닝 위한 데이터를 세팅한다.
  logger.trace();
  logger.trace('(2/6) Machine is learning user based the data');
  await ger.initialize_namespace('user');
  await ger.events(events);

  // 가장 연관성이 깊은 데이터를 구한다.
  logger.trace();
  logger.trace('(3/6) Finding the neighbourhood of the user');
  const { _id, top3Tags, name } = targetUser;
  const result = await ger.recommendations_for_person('user', `${_id} / ${name}`, { actions: { likes: 1 } });
  const { neighbourhood, recommendations } = result;
  let neighborsIdList = [];
  if (neighbourhood) {
    logger.trace('#### neighbourhood ####');
    neighborsIdList = Object.entries(neighbourhood)
    // 타겟 본인 및 연관성이 0.5 미만인 유저들은 포함하지 않는다.
      .filter(user => user[1] < 1 && user[1] >= 0.5)
      .map((user) => {
        logger.debug(user[1], user[0].split('/')[1].trimLeft());
        return user[0].split('/')[0].trimRight();
      });
    logger.trace(`Found '${neighborsIdList.length}' neighbors!`);
  } else {
    logger.warn('Found no neighbourhood!');
  }

  // 추천되는 태그를 구한다.
  const [item] = recommendations
    .filter(recommendation => !top3Tags.includes(recommendation.thing))
    .sort((a, b) => b.weight - a.weight);
  const tag = item ? item.thing : null;
  logger.trace();
  if (tag) {
    logger.trace('#### recommendated tag ####');
    logger.debug(`'${tag}'`);
  } else {
    logger.warn('Not enough data to recommend tag!');
  }

  await ger.destroy_namespace('user');
  return { neighborsIdList, tag };
};

const cfWithCafelist = async ({ _id: userId }, tags, cafeAround) => {
  // 추천 알고리즘을 위한 액션을 구한다.
  logger.trace();
  logger.trace('@ Start find recommended cafelist by tags :');
  tags.forEach((tag) => {
    logger.debug(`'${tag}'`);
  });
  logger.trace();
  logger.trace('(4/6) Building cafe events');
  const targets = [...cafeAround, { _id: userId, top3Tags: tags }];
  const events = targets.flatMap((target) => {
    const { _id, top3Tags } = target;
    return top3Tags.map(tag => ({
      namespace: 'cafe',
      person: _id,
      action: 'likes',
      thing: tag,
      expires_at: '2020-07-10',
    }));
  });
  logger.trace(`Built '${events.length}' events`);

  // 머신러닝 위한 데이터를 세팅한다.
  logger.trace();
  logger.trace('(5/6) Machine is learning cafe based the data');
  await ger.initialize_namespace('cafe');
  await ger.events(events);

  logger.trace();
  logger.trace('(6/6) Finding the cafelist of the user');
  let recommendedCafeList;
  const result = await ger.recommendations_for_person('cafe', userId, { actions: { likes: 1 } });
  const { neighbourhood } = result;
  if (neighbourhood) {
    logger.trace('#### recommendated cafelist ####');
    recommendedCafeList = Object.entries(neighbourhood)
    // 연관성 기준으로 정렬한다.
      .sort((a, b) => b[1] - a[1])
    // 타겟 본인 및 연관성이 0.5 미만인 유저들은 포함하지 않는다.
      .filter(user => (user[1] < 1) && (user[1] >= 0.5))
      .map((cafe) => {
        cafeAround.forEach((around) => {
          const { _id, title } = around;
          if (_id.toString() === cafe[0]) logger.debug(cafe[1], title);
        });
        return cafe[0];
      });
    logger.trace(`Found '${recommendedCafeList.length}' cafe!`);
  } else {
    logger.warn(' Not enough data to recommendate');
    logger.warn(result);
  }
  logger.trace();
  logger.trace('Finish work');
  logger.trace('############################################################');
  logger.trace();
  await ger.destroy_namespace('cafe');
  return recommendedCafeList;
};

module.exports = {
  cfWithUsers, cfWithCafelist,
};
