module.exports = {
  responses: {
    privateAttributes: ['publishedAt', 'createdAt', 'updatedAt', 'provider'],
  },
  rest: {
    prefix: '/v1',
    defaultLimit: 25,
    maxLimit: 100,
    withCount: true,
  },
};
