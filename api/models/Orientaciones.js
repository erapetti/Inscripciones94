/**
 * Orientaciones.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'Estudiantil',
  migrate: 'safe',
  tableName: 'ORIENTACION',
  attributes: {
          id: { type:'number', columnName:'OrientacionId', required:true },
          OrientacionDesc: 'string',
          OrientacionAbrev: 'string',
  },

};
