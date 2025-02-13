const api_key = "local-order";

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
};