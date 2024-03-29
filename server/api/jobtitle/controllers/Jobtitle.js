'use strict';

/**
 * Jobtitle.js controller
 *
 * @description: A set of functions called "actions" for managing `Jobtitle`.
 */

module.exports = {

  /**
   * Retrieve jobtitle records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.jobtitle.search(ctx.query);
    } else {
      return strapi.services.jobtitle.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a jobtitle record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.jobtitle.fetch(ctx.params);
  },

  /**
   * Count jobtitle records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.jobtitle.count(ctx.query);
  },

  /**
   * Create a/an jobtitle record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.jobtitle.add(ctx.request.body);
  },

  /**
   * Update a/an jobtitle record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.jobtitle.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an jobtitle record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.jobtitle.remove(ctx.params);
  }
};
