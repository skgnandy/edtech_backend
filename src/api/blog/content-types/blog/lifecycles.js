const api_key = "blog";

const utils = require("@strapi/utils");
const { UnauthorizedError, ApplicationError } = utils.errors;
module.exports = {
    async beforeCreate(event) {
        const { data } = event.params;
        const ctx = strapi.requestContext.get();
        console.log(">>>>>user", ctx.state.user);
        if (!ctx.state.user) {
            throw new UnauthorizedError("User not found!");
        }
        //check user role type if autheniticated
        if (ctx.state.user.role?.type === "authenticated") {
            data.user = ctx.state.user.id;
        }

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