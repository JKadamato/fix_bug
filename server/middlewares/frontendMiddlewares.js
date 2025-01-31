/* eslint-disable global-require */

/**
 * Front-end middleware
 */
module.exports = (app, options) => {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    const addProdMiddlewares = require("./addProdMiddlewares");
    addProdMiddlewares(app, options);
  } else {
    const webpackConfig = require("../../webpack/dev");
    const addDevMiddlewares = require("./addDevMiddlewares");
    addDevMiddlewares(app, webpackConfig);
  }

  return app;
};
