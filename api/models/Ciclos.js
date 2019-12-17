/**
 * Ciclos.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'Estudiantil',
  migrate: 'safe',
  tableName: 'CICLOS',
  attributes: {
          id: { type:'number', columnName:'CicloId', required:true },
          CicloDesc: 'string',
          CicloAbrev: 'string',
  },

};
