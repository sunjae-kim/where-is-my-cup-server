const g = require('ger');

const esm = new g.MemESM();
const ger = new g.GER(esm);

const cfWithUsers = async (users, targetUser) => {
  // 추천 알고리즘을 위한 액션을 구한다.
  const events = [...users, targetUser].flatMap((user) => {
    const { _id, top3Tags } = user;
    return top3Tags.map(tag => ({
      namespace: 'user',
      person: _id,
      actions: 'likes',
      thing: tag,
      expires_at: '2020-07-10',
    }));
  });

  // 머신러닝 위한 데이터를 세팅한다.
  await ger.initialize_namespace('user');
  await ger.events(events);

  // 가장 연관성이 깊은 데이터를 구한다.
  const { _id, top3Tags } = targetUser;
  const { neighbourhood, recommendations } = await ger.recommendations_for_person('user', _id, { actions: { likes: 1 } });
  let neighbors;
  if (neighbourhood) {
    neighbors = Object.entries(neighbourhood)
      // 타겟 본인 및 연관성이 0.5 미만인 유저들은 포함하지 않는다.
      .filter(user => (user[0] !== _id) && (user[1] >= 0.5));
  }

  // 추천되는 태그를 구한다.
  const [tag] = recommendations
    .filter(recommendation => !top3Tags.includes(recommendation.thing))
    .sort((a, b) => b.weight - a.weight);

  return { neighbors, tag };
};

const cfWithCafelist = async ({ _id: userId }, tags, cafeArround) => {
  // 추천 알고리즘을 위한 액션을 구한다.
  const targets = [...cafeArround, { _id: userId, top3Tags: tags }];
  const events = targets.flatMap((target) => {
    const { _id, top3Tags } = target;
    return top3Tags.map(tag => ({
      namespace: 'user',
      person: _id,
      actions: 'likes',
      thing: tag,
      expires_at: '2020-07-10',
    }));
  });

  // 머신러닝 위한 데이터를 세팅한다.
  await ger.initialize_namespace('cafe');
  await ger.events(events);

  const { neighbourhood } = await ger.recommendations_for_person('cafe', userId, { actions: { likes: 1 } });
  if (neighbourhood) {
    return Object.entries(neighbourhood)
    // 연관성 기준으로 정렬한다.
      .sort((a, b) => b[1] - a[1])
    // 타겟 본인 및 연관성이 0.5 미만인 유저들은 포함하지 않는다.
      .filter(user => (user[0] !== userId) && (user[1] >= 0.5));
  }
  return null;
};

module.exports = {
  cfWithUsers, cfWithCafelist,
};
