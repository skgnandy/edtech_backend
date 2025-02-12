module.exports = {
  responses: {
    privateAttributes: ['publishedAt', 'createdAt', 'updatedAt'],
  },
  rest: {
    prefix: '/v1',
    defaultLimit: 25,
    maxLimit: 100,
    withCount: true,
  },
};
