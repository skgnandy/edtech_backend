"use strict";

/**
 * `populate` middleware
 */

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    ctx.query.populate = {
      category: {
        fields: ["name", "description"],
      },
      user: {
        fields: ["firstName", "lastName"],
      }
    };
    await next();
  };
};
