'use strict';

/**
 * blog router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::blog.blog', {
    config: {
        find: {
            middlewares: ["api::blog.populate"],
        },
        findOne: {
            middlewares: ["api::blog.populate"],
        },
        create: {
            middlewares: ["api::blog.populate"],
        },
        update: {
            middlewares: ["api::blog.populate"],
        },
        delete: {
            middlewares: ["api::blog.populate"],
        },
    },
});
