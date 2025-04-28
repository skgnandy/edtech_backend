'use strict';

/**
 * quiz-progress controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::quiz-progress.quiz-progress', ({ strapi }) => ({
    async find(ctx) {
        try {
            const user = ctx.state.user;

            if (!user) {
                return ctx.unauthorized("You must be logged in to access this data");
            }

            // Build where conditions
            const where = { user: user.id };

            // Handle filters from query parameters
            const filters = ctx.query.filters;

            // Check if we have a video filter with documentId
            if (
                filters &&
                typeof filters === 'object' &&
                filters !== null &&
                'video' in filters &&
                typeof filters.video === 'object' &&
                filters.video !== null
            ) {
                // Handle filtering by documentId
                if ('documentId' in filters.video) {
                    // First find the video by documentId
                    const video = await strapi.db.query('api::video.video').findOne({
                        where: { documentId: filters.video.documentId }
                    });

                    if (video) {
                        where.video = video.id;
                    } else {
                        // If no video found with that documentId, return empty result
                        const sanitizedEntity = await this.sanitizeOutput([], ctx);
                        return this.transformResponse(sanitizedEntity);
                    }
                }
                // Handle direct id filtering (keeping your original functionality)
                else if ('id' in filters.video) {
                    where.video = filters.video.id;
                }
            }

            // Execute query
            const entries = await strapi.db.query('api::quiz-progress.quiz-progress').findMany({
                where,
                populate: { video: true },
                orderBy: { createdAt: 'desc' }
            });

            const sanitizedEntity = await this.sanitizeOutput(entries, ctx);
            return this.transformResponse(sanitizedEntity);
        } catch (err) {
            console.error("Quiz progress find error:", err);
            return ctx.badRequest(`Error in find: ${err.message}`);
        }
    }
    // async find(ctx) {
    //     try {
    //         const { query } = ctx;
    //         const user = ctx.state.user;
    //         if (!user) {
    //             return ctx.unauthorized("You must be logged in to access this data");
    //         }

    //         const entries = await strapi.db.query('api::quiz-progress.quiz-progress').findMany({
    //             ...query,
    //             where: {
    //                 user: user.id,
    //             },
    //             populate: {
    //                 video: {
    //                     populate: {
    //                         select: ["id"],
    //                     },
    //                 },
    //             },
    //             orderBy: { createdAt: 'desc' },
    //         });
    //         const sanitizedEntity = await this.sanitizeOutput(entries, ctx);
    //         return this.transformResponse(sanitizedEntity);
    //     } catch (err) {
    //         console.error("Quiz progress find error:", err);
    //         return ctx.badRequest(`Error in find: ${err.message}`);
    //     }
    // }
}));
