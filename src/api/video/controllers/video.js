'use strict';

/**
 * video controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::video.video', ({ strapi }) => ({
    async findOne(ctx) {
        try {
            const { id } = ctx.params;
            const userId = ctx.state.user.id;
            const { query } = ctx;
            // Fetch the video entry with quiz progresses
            const entry = await strapi.db.query('api::video.video').findOne({
                ...query,
                where: {
                    documentId: id,
                },
            });
            if (!entry) {
                return ctx.notFound("Video not found!");
            }

            // 🛠️ Manually filter quiz_progresses to keep only current user's progresses
            entry.quiz_progresses = entry.quiz_progresses.filter(qp => {
                return qp.user && qp.user.id === userId;
            });

            const sanitizedEntity = await this.sanitizeOutput(entry, ctx);
            return this.transformResponse(sanitizedEntity);

        } catch (err) {
            console.error("Error in findOne:", err);
            return ctx.badRequest("Error occurred inside findOne!", { error: err });
        }
    }
}));
