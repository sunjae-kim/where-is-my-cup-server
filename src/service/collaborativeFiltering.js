const g = require('ger');
const { utility: { getLogger } } = require('../lib');

const logger = getLogger('Recommendation System');
const esm = new g.MemESM();
const ger = new g.GER(esm);

const cfWithUsers = async (users, targetUser) => {
  logger.trace('############################################################');
  logger.trace(`Start find neighbors and recommended tag for '${targetUser.name}'`);
  logger.trace();
  logger.trace('(1/4) Building events');
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
  logger.trace('(2/4) Machine is learning the data');
  await ger.initialize_namespace('user');
  await ger.events(events);

  // 가장 연관성이 깊은 데이터를 구한다.
  logger.trace();
  logger.trace('(3/4) Finding the neighbourhood of the user');
  const { _id, top3Tags, name } = targetUser;
  const result = await ger.recommendations_for_person('user', `${_id} / ${name}`, { actions: { likes: 1 } });
  const { neighbourhood, recommendations } = result;
  let neighborsIdList = [];
  if (neighbourhood) {
    logger.trace('## neighbourhood ##');
    neighborsIdList = Object.entries(neighbourhood)
    // 타겟 본인 및 연관성이 0.5 미만인 유저들은 포함하지 않는다.
      .filter(user => user[1] < 1 && user[1] >= 0.5)
      .map((user) => {
        logger.debug(user);
        return user[0].split('/')[0].trimRight();
      });
  }
  logger.trace(`Found '${neighborsIdList.length}' neighbors`);

  // 추천되는 태그를 구한다.
  const [item] = recommendations
    .filter(recommendation => !top3Tags.includes(recommendation.thing))
    .sort((a, b) => b.weight - a.weight);
  const tag = item ? item.thing : null;
  logger.trace();
  logger.trace('(4/4) Finish work');
  logger.trace('## recommendations ##');
  logger.debug(`'${tag}'`);
  logger.trace();
  logger.trace('############################################################');
  return { neighborsIdList, tag };
};

const cfWithCafelist = async ({ _id: userId }, tags, cafeAround) => {
  // 추천 알고리즘을 위한 액션을 구한다.
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

  // 머신러닝 위한 데이터를 세팅한다.
  await ger.initialize_namespace('cafe');
  await ger.events(events);

  let recommendedCafeList;
  const result = await ger.recommendations_for_person('cafe', userId, { actions: { likes: 1 } });
  const { neighbourhood } = result;
  if (neighbourhood) {
    recommendedCafeList = Object.entries(neighbourhood)
    // 연관성 기준으로 정렬한다.
      .sort((a, b) => b[1] - a[1])
    // 타겟 본인 및 연관성이 0.5 미만인 유저들은 포함하지 않는다.
      .filter(user => (user[1] < 1) && (user[1] >= 0.5))
      .map(cafe => cafe[0]);
  }
  return recommendedCafeList;
};

module.exports = {
  cfWithUsers, cfWithCafelist,
};
