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

  buscar: async function (paisCod,docCod,perDocId) {

    const persona = await this.findOne({PaisCod:paisCod,DocCod:docCod,PerDocId:perDocId,or:[{PerFchFall:'1000-01-01'},{PerFchFall:null}]});
    if (!persona) {
      throw new Error('El número de cédula ingresado no se encuentra registrado en nuestra base de datos. Verifique que lo escribió correctamente.');
    }

    return persona;
  },
};
