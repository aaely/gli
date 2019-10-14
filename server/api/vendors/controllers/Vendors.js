'use strict';

/**
 * Vendors.js controller
 *
 * @description: A set of functions called "actions" for managing `Vendors`.
 */

module.exports = {

  /**
   * Retrieve vendors records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.vendors.search(ctx.query);
    } else {
      return strapi.services.vendors.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a vendors record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.vendors.fetch(ctx.params);
  },

  /**
   * Count vendors records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.vendors.count(ctx.query);
  },

  /**
   * Create a/an vendors record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.vendors.add(ctx.request.body);
  },

  /**
   * Update a/an vendors record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.vendors.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an vendors record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.vendors.remove(ctx.params);
  }
};
