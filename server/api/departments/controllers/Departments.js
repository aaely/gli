'use strict';

/**
 * Departments.js controller
 *
 * @description: A set of functions called "actions" for managing `Departments`.
 */

module.exports = {

  /**
   * Retrieve departments records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.departments.search(ctx.query);
    } else {
      return strapi.services.departments.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a departments record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.departments.fetch(ctx.params);
  },

  /**
   * Count departments records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.departments.count(ctx.query);
  },

  /**
   * Create a/an departments record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.departments.add(ctx.request.body);
  },

  /**
   * Update a/an departments record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.departments.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an departments record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.departments.remove(ctx.params);
  }
};
