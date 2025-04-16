module.exports = async (policyContext, config, { strapi }) => {
    if (policyContext.state.user) {
        const { id: blogId } = policyContext.params;
        const isChefOwner = await strapi.db
            .query("api::blog.blog")
            .findOne({
                where: { documentId: blogId, user: policyContext.state.user.id },
            });
        if (isChefOwner) {
            return true;
        }
    }
    return false; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
};
