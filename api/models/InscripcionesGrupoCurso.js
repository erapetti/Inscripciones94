/**
 * InscripcionesGrupoCurso.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'Estudiantil',
  migrate: 'safe',
  tableName: 'INSCRIPCIONES_GRUPOCURSO',
  primaryKey: 'id',
  attributes: {
    id: { type:'number', columnName:'InscripcionId', required:true },
    GrupoCursoId: 'number',
    InscripcionGrupoCursoActivo: 'number',
    InscripcionGrupoCursoNroLista: 'number',
  },

  agrego: async function(dbh, inscripcionId, grupoCursoId) {

    let inscripcionGrupoCurso = {
      id: inscripcionId,
      GrupoCursoId: grupoCursoId,
      InscripcionGrupoCursoActivo: 1,
      InscripcionGrupoCursoNroLista: 0,
    };

    await this.findOrCreate({id:inscripcionId,GrupoCursoId:grupoCursoId},inscripcionGrupoCurso).usingConnection(dbh);
    return;
  },

};
