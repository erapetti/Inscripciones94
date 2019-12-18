/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  '/': { controller: 'main', action: 'inicio' },
  '/main/paso1': { controller: 'main', action: 'paso1' },
  '/main/paso2': { controller: 'main', action: 'paso2' },

};
