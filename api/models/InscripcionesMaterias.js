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

    await this.create(inscripcionMateria).usingConnection(dbh);
    return;
  },

  sync: async function(dbh, inscripcionId, materias) {

    const inscripciones = await this.find(inscripcionId).usingConnection(dbh);

    // materias que faltan:
    await materias.forEach(async m => {
      if (!inscripciones.find(i => i.MateriaId==m.materiaId)) {
        await this.agrego(dbh, inscripcionId, m.materiaId, m.tipoDuracionId);
      }
    });

    //materias que sobran:
    await inscripciones.forEach(async i => {
      if (!materias.find(m => m.materiaId==i.MateriaId)) {
        await this.delete({id:inscripcionId,MateriaId:i.MateriaId}).usingConnection(dbh);
      }
    });
  },
};
