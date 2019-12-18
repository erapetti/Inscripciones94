/**
 * Inscripciones.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'Estudiantil',
  migrate: 'safe',
  tableName: 'INSCRIPCIONES',
  attributes: {
          id: { type:'number', columnName:'InscripcionId', required:true },
          EstadosInscriId: 'number',
          DependId: { model: 'Dependencias' },
          PerId: { model: 'Personas' },
          PlanId: { model: 'Planes' },
          CicloId: { model: 'Ciclos' },
          GradoId: { model: 'Grados' },
          OrientacionId: { model: 'Orientaciones' },
          OpcionId: { model: 'Opciones' },
          FechaInicioCurso: { type:'ref', columnType:'date' },
          InscriTurno: 'string',
  },

};
