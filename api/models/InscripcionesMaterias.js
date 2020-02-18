/**
 * InscripcionesMaterias.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'Estudiantil',
  migrate: 'safe',
  tableName: 'INSCRIPCIONES_MATERIAS',
  primaryKey: 'id',
  attributes: {
    id: { type:'number', columnName:'InscripcionId', required:true },
    MateriaId: 'number',
    InscriMateriaFecha: { type:'ref', columnType:"date"},
    InscriMatTipoDuracionId: 'number',
    EstadosInscriIdMateria: 'number',
  },

  agrego: async function(dbh, inscripcionId, materiaId, tipoDuracionId) {

    let inscripcionMateria = {
      id: inscripcionId,
      MateriaId: materiaId,
      InscriMateriaFecha: new Date(),
      InscriMatTipoDuracionId: tipoDuracionId,
      EstadosInscriIdMateria: 1,
    };

    await this.findOrCreate({id:inscripcionId,MateriaId:materiaId},inscripcionMateria).usingConnection(dbh);
    return;
  },

};
