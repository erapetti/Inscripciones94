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
  primaryKey: 'id',
  attributes: {
          id: { type:'number', columnName:'InscripcionId', required:true, unique:true, autoIncrement:true },
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

  ultCurso: async function(perId) {
    const result = await this.getDatastore().sendNativeQuery(`
      select DependId, PlanId, CONCAT(PLANID,CICLOID,RIGHT(CONCAT('  ',GRADOID),2),RIGHT(CONCAT('  ',ORIENTACIONID),2),RIGHT(CONCAT('  ',OPCIONID),2)) UltCursoId
      from INSCRIPCIONES
      where PerId = $1
      order by FechaInicioCurso DESC,CicloId DESC,GradoId DESC,InscripcionId DESC
    `, [perId]);

    if (!result) {
      return undefined;
    }

    return result.rows;
  },

  agregoInscripcionCurso: async function(dependId, perId, grupoMateriaId, gradoId, orientacionId, opcionId, fechaInicioCurso, ultDependId, ultPlanId, ultCursoId, recursa) {
    const inscripcion = {
      EtapasInscriId: 27,
      EstadosInscriId: 4,
      DependId: dependId,
      LugarId: dependId,
      PerId: perId,
      PlanId: 14,
      CicloId: 2,
      GradoId: gradoId,
      OrientacionId: orientacionId,
      OpcionId: opcionId,
      FechaInicioCurso: fechaInicioCurso,
      InscriTurno: '4',
      InscriFecha: new Date(),
      TipoModalidadId: 2,
      Semestre: 1,
      UsuarioInscriId: 'web',
      DependidOrigen: ultDependId,
      UltPlanId: ultPlanId,
      UltCursoId: ultCursoId,
      InscripcionFlgRecursa: recursa,
    };

    sails.log(inscripcion);
    sails.log( await this.create(inscripcion).fetch() );
throw new Error("test error");
  },

};
