'use strict';

/**
 * quiz router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::quiz.quiz', {
    only: ["find", "findOne"],
    config: {
        find: {
            middlewares: ["api::quiz.populate"],
        },
        findOne: {
            middlewares: ["api::quiz.populate"],
        },
    },
});
