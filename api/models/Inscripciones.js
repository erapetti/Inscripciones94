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
          EtapasInscriId: 'number',
          EstadosInscriId: 'number',
          DependId: { model: 'Dependencias' },
          LugarId: 'number',
          PerId: { model: 'Personas' },
          PlanId: { model: 'Planes' },
          CicloId: { model: 'Ciclos' },
          GradoId: { model: 'Grados' },
          OrientacionId: { model: 'Orientaciones' },
          OpcionId: { model: 'Opciones' },
          FechaInicioCurso: { type:'ref', columnType:'date' },
          InscriTurno: 'string',
          InscriFecha: { type:'ref', columnType:'date' },
          DependidOrigen: 'number',
          UltPlanId: 'number',
          UltCursoId: 'string',
          TipoModalidadId: 'number',
          Semestre: 'number',
          InscriObservacion: 'string',
          FormaIngresoId: 'number',
          UsuarioInscriId: 'string',
          AdultoIdInscri1: 'number',
          AdultoIdInscri2: 'number',
          InscripcionFlgRecursa: 'number',
          InscriTurnoId: 'string',
  },

};
