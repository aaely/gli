'use strict';

/**
 * Properties.js controller
 *
 * @description: A set of functions called "actions" for managing `Properties`.
 */

module.exports = {

  /**
   * Retrieve properties records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.properties.search(ctx.query);
    } else {
      return strapi.services.properties.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a properties record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.properties.fetch(ctx.params);
  },

  /**
   * Count properties records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.properties.count(ctx.query);
  },

  /**
   * Create a/an properties record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.properties.add(ctx.request.body);
  },

  /**
   * Update a/an properties record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.properties.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an properties record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.properties.remove(ctx.params);
  }
};
