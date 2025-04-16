'use strict';

/**
 * blog-comment-comment router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::blog-comment.blog-comment', {
    config: {
        find: {
            middlewares: ["api::blog-comment.populate"],
        },
        findOne: {
            middlewares: ["api::blog-comment.populate"],
        },
        create: {
            middlewares: ["api::blog-comment.populate"],
        },
        update: {
            middlewares: ["api::blog-comment.populate"],
            policies: ["is-owner"],
        },
        delete: {
            middlewares: ["api::blog-comment.populate"],
            policies: ["is-owner"],
        },
    },
});
