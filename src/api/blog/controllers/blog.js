'use strict';

/**
 * blog controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::blog.blog', ({ strapi }) => ({
    async find(ctx) {
        try {
            const { query } = ctx;
            const entries = await strapi.entityService.findMany('api::blog.blog', {
                ...query,
            });
            return this.transformResponse(entries);
        } catch (err) {
            return ctx.badRequest("Error Occured inside find!");
        }
    }
}));
