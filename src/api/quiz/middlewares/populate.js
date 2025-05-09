"use strict";

/**
 * `populate` middleware
 */

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    ctx.query.populate = {
      options: {
        fields: ["name"],
      },
      video: {
        fields: ["documentId"],
        // populate: {
        //   subject: {
        //     fields: ["name", "Description"],
        //   },
        // }
      }
    };
    await next();
  };
};
