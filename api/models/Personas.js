/**
 * Dependencias.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'Personas',
  migrate: 'safe',
  tableName: 'V_PERSONAS',
  attributes: {
          id: { type:'number', columnName:'PerId', required:true },
          PaisCod: 'string',
          DocCod: 'string',
          PerDocId: 'string',
          PerNombreCompleto: 'string',
          PerSexo: 'string',
          PerFchNac: { type:'ref', columnType:'date' },
          PerFchFall: { type:'ref', columnType:'date' },
  },

};
