'use strict';

/**
 * quiz-progress controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::quiz-progress.quiz-progress', ({ strapi }) => ({
    async find(ctx) {
        try {
            const { query } = ctx;
            const user = ctx.state.user;
            if (!user) {
                return ctx.unauthorized("You must be logged in to access this data");
            }
            const entries = await strapi.db.query('api::quiz-progress.quiz-progress').findMany({
                ...query,
                where: {
                    user: user.id,
                },
                orderBy: { createdAt: 'desc' },
            });
            const sanitizedEntity = await this.sanitizeOutput(entries, ctx);
            return this.transformResponse(sanitizedEntity);
        } catch (err) {
            console.error("Quiz progress find error:", err);
            return ctx.badRequest(`Error in find: ${err.message}`);
        }
    }
}));
