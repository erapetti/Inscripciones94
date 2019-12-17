/**
 * Planes.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'Estudiantil',
  migrate: 'safe',
  tableName: 'PLANES',
  attributes: {
          id: { type:'number', columnName:'PlanId', required:true },
          PlanNombre: 'string',
          PlanActivo: 'number',
  },

};
