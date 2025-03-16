'use strict';

/**
 * blog controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::blog.blog', ({ strapi }) => ({
    async find(ctx) {
        try {
            const { query } = ctx;
            const pagination = ctx.query?.pagination;
            const entries = await strapi.entityService.findMany('api::blog.blog', {
                ...query,
                sort: { createdAt: "desc" },
                start: pagination?.start ? pagination?.start : 0,
                limit: pagination?.limit ? pagination?.limit : 20
            });
            return this.transformResponse(entries);
        } catch (err) {
            return ctx.badRequest("Error Occured inside find!");
        }
    }
}));
