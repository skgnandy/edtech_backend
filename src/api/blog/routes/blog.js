'use strict';

/**
 * blog router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::blog.blog', {
    only: ["find", "create", "findOne"],
    config: {
        find: {
            middlewares: ["api::blog.populate"],
        },
        create: {
            middlewares: ["api::blog.populate"],
        },
    },
});
