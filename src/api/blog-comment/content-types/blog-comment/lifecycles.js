const api_key = "blog-comment";

const utils = require("@strapi/utils");
const { UnauthorizedError, ApplicationError } = utils.errors;
module.exports = {
    async beforeCreate(event) {
        const { data } = event.params;
        const ctx = strapi.requestContext.get();
        if (!ctx.state.user) {
            throw new UnauthorizedError("User not found!");
        }
        data.user = ctx.state.user.id;
    },
    beforeUpdate(event) {
        const { data } = event.params;
        const ctx = strapi.requestContext.get();
        if (!ctx.state.user) {
            throw new UnauthorizedError("No login user found");
        }
    },
    async beforeDelete(event) {
        const { data, where } = event.params;
        const ctx = strapi.requestContext.get();
        if (!ctx.state.user) {
            throw new UnauthorizedError("User not found!");
        }
    },
};