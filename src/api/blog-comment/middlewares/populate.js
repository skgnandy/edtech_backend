"use strict";

/**
 * `populate` middleware
 */

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    ctx.query.populate = {
      blog: {
        fields: ["title", "content"],
      },
      user: {
        fields: ["firstName", "lastName"],
      }
    };
    await next();
  };
};
