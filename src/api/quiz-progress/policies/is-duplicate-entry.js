const { errors } = require("@strapi/utils");
const { ApplicationError } = errors;

module.exports = async (policyContext, config, { strapi }) => {
    if (policyContext.state.user) {
        const { data } = policyContext.request.body;
        const isDuplicateEntry = await strapi.db
            .query("api::quiz-progress.quiz-progress")
            .findOne({
                where: { video: data.video, user: policyContext.state.user.id },
            });
        if (isDuplicateEntry) {
            throw new ApplicationError('A quiz progress entry for this user & video already exists.');
            //return false;
        }
    }
    return true; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
};
