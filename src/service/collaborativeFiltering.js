const g = require('ger');

const esm = new g.MemESM();
const ger = new g.GER(esm);

// FIXME 추천 알고리즘 모듈별로 구현
// 1. Neighbors
// 2. Recommended tag
// 3. Recommended cafelist

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
  const recommendations = { neighbors: null, tag: null };

  // 가장 연관성이 깊은 데이터를 구한다.
  const { _id, top3Tags } = targetUser;
  {
    const { neighbourhood } = await ger.recommendations_for_person('user', _id, { actions: { likes: 1 } });
    if (neighbourhood) {
      recommendations.neighbors = Object.entries(neighbourhood)
      // 연관성 기준으로 정렬한다.
        .sort((a, b) => b[1] - a[1])
      // 타겟 본인 및 연관성이 0.5 미만인 유저들은 포함하지 않는다.
        .filter(user => (user[0] !== targetUser.name) && (user[1] >= 0.5));
    }
  }

  // 타겟의 Top 3 태그와 가장 연관성이 깊은 태그를 찾는다.
  let results = await Promise.all(top3Tags.map(
    // Tag 3 개 모두 탐색한다.
    tag => ger.recommendations_for_thing('cafe', tag, { actions: { likes: 1 } }),
  ));

  // 탐색한 결과에서 가장 연관성이 깊은 태그를 추린다.
  results = results.reduce((acc, result) => {
    const { neighbourhood } = result;
    if (neighbourhood) acc.push(Object.entries(neighbourhood));
    return acc;
  }, []);

  // Top 3 태그를 포함하지 않으며 연관성이 가장 깊은 태그 1개를 찾는다.
  const [itemRecommendation] = results
    .filter(tag => !top3Tags.includes(tag[0]))
    .sort((a, b) => b[1] - a[1]);
  recommendations.tag = itemRecommendation;

  return recommendations;
};

const cfWithCafelist = async ({ _id: userId, name }, tags, cafeArround) => {
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
      .filter(user => (user[0] !== name) && (user[1] >= 0.5));
  }
  return null;
};

module.exports = {
  cfWithUsers, cfWithCafelist,
};
