"use strict";

/**
 * `populate` middleware
 */

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    ctx.query.populate = {
      subject: {
        select: ["name", "Description"],
      },
      quiz_progresses: {
        select: ["*"],
        populate: {
          user: {
            select: ["id"],
          }
        }
      }
    };
    await next();
  };
};
