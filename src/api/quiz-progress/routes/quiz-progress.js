'use strict';

/**
 * quiz-progress router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::quiz-progress.quiz-progress', {
    config: {
        create: {
            policies: ["is-duplicate-entry"],
        },
    },
});
