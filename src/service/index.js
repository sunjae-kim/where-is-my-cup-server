const g = require('ger');

const esm = new g.MemESM();
const ger = new g.GER(esm);

// FIXME 추천 알고리즘 모듈별로 구현
// 1. Neighbors
// 2. Recommended tag
// 3. Recommended cafelist
async function init() {
  await ger.initialize_namespace('cafe');
  await ger.events([
    {
      namespace: 'cafe',
      person: '지원',
      action: 'likes',
      thing: 'walli-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '지원',
      action: 'likes',
      thing: 'code-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '지원',
      action: 'likes',
      thing: 'ji-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '지원',
      action: 'unlikes',
      thing: 'sunjae-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '준홍',
      action: 'likes',
      thing: 'walli-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '준홍',
      action: 'likes',
      thing: 'code-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '선재',
      action: 'likes',
      thing: 'bangs-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '선재',
      action: 'unlikes',
      thing: 'sunjae-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '선재',
      action: 'unlikes',
      thing: 'code-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '지훈',
      action: 'unlikes',
      thing: 'walli-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '지훈',
      action: 'unlikes',
      thing: 'bangs-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '지훈',
      action: 'likes',
      thing: 'code-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '지훈',
      action: 'likes',
      thing: 'ji-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '재준',
      action: 'likes',
      thing: 'bangs-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '재준',
      action: 'likes',
      thing: 'ji-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '지현',
      action: 'unlikes',
      thing: 'walli-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '지현',
      action: 'likes',
      thing: 'sunjae-cafe',
      expires_at: '2020-07-10',
    },
    {
      namespace: 'cafe',
      person: '지현',
      action: 'unlikes',
      thing: 'code-cafe',
      expires_at: '2020-07-10',
    },

  ]);
  const userRecommendations = await ger.recommendations_for_person('cafe', '지', { actions: { likes: 1 } });
  console.log("\nRecommendations For '지'");
  console.log(JSON.stringify(userRecommendations, null, 2));

  const itemRecommendation = await ger.recommendations_for_thing('cafe', 'bangs-cafe', { actions: { likes: 1 } });
  console.log("\nRecommendations Like 'bangs-cafe'");
  console.log(JSON.stringify(itemRecommendation, null, 2));
}

init();
