"use strict";

/**
 * `populate` middleware
 */

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    ctx.query.populate = {
      subject: {
        fields: ["name", "Description"],
      },
    };
    await next();
  };
};
