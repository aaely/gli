'use strict';

/**
 * Employees.js controller
 *
 * @description: A set of functions called "actions" for managing `Employees`.
 */

module.exports = {

  /**
   * Retrieve employees records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.employees.search(ctx.query);
    } else {
      return strapi.services.employees.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a employees record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.employees.fetch(ctx.params);
  },

  /**
   * Count employees records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.employees.count(ctx.query);
  },

  /**
   * Create a/an employees record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.employees.add(ctx.request.body);
  },

  /**
   * Update a/an employees record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.employees.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an employees record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.employees.remove(ctx.params);
  }
};
