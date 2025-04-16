'use strict';

/**
 * video router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::video.video', {
    only: ["find", "findOne"],
    config: {
        find: {
            middlewares: ["api::video.populate"],
        },
        findOne: {
            middlewares: ["api::video.populate"],
        },
    },
});
