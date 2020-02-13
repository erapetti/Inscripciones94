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
          id: { type:'number', columnName:'InscripcionId', autoIncrement:true },
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
          FormaIngresoId: { type:'number', allowNull:true },
          UsuarioInscriId: 'string',
          AdultoIdInscri1: 'number',
          AdultoIdInscri2: 'number',
          InscripcionFlgRecursa: 'number',
          InscriTurnoId: { type:'string', allowNull:true },
  },

  ultCurso: async function(perId) {
    const result = await this.getDatastore().sendNativeQuery(`
      select DependId, PlanId, CONCAT(PLANID,CICLOID,RIGHT(CONCAT('  ',GRADOID),2),RIGHT(CONCAT('  ',ORIENTACIONID),2),RIGHT(CONCAT('  ',OPCIONID),2)) UltCursoId
      from INSCRIPCIONES
      where PerId = $1
      order by FechaInicioCurso DESC,CicloId DESC,GradoId DESC,InscripcionId DESC
    `, [perId]);

    if (!result || !result.rows[0]) {
      return undefined;
    }

    return result.rows[0];
  },

  // posible id base para un nuevo insert en INSCRIPCIONES. Si está duplicado probar con el siguiente
  nextId: async function(dbh) {
    const result = await this.getDatastore().sendNativeQuery(`
      select ifnull(max(inscripcionid)+1,10000000) InscripcionId
      from INSCRIPCIONES
      where InscripcionId>=10000000
        and InscripcionId<=19999999
    `).usingConnection(dbh);

    if (!result || !result.rows[0] || result.rows[0].InscripcionId==19999999) {
      return undefined;
    }
    return result.rows[0].InscripcionId;
  },

  agregoInscripcionCurso: async function(dbh, dependId, perId, grupoMateriaId, gradoId, orientacionId, opcionId, fechaInicioCurso, ultDependId, ultPlanId, ultCursoId, recursa) {

    let inscripcion = {
      EtapasInscriId: 15,
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
      InscriTurnoId: null,
      FormaIngresoId: null,
      Inscripciones_FchUltAct: new Date(),
      Inscripciones_UsrUltAct: 'web',
    };

    let id = await Inscripciones.nextId(dbh);
    if (!id) {
      throw new Error("No hay más números disponibles para realizar inscripciones");
    }

    let result;
    for (let intento = 0; intento<10; intento++, id++) {
      try {
        inscripcion.id = id;
        inscripcion.InscripcionId = id; // por las dudas
        sails.log(inscripcion);
        result = await this.create(inscripcion).fetch().usingConnection(dbh);
        break;
      } catch(e) {
        if (e.code === 'E_UNIQUE') {
        } else {
          throw e;
        }
      }
    }
    return id;
  },

  activas: async function(perId, fechaInicioCurso) {
    const result = await this.getDatastore().sendNativeQuery(`
      select InscripcionId id, DependId, PlanId, CicloId, GradoId, OrientacionId, OpcionId, Semestre, EstadosInscriId, UsuarioInscriId
      from INSCRIPCIONES
      where PerId = $1
        and FechaInicioCurso = $2
        and EstadosInscriId < 5
    `,[perId, fechaInicioCurso]);

    if (!result || !result.rows) {
      return undefined;
    }
    return result.rows;
  },

  GMactivas: async function(inscripciones) {
    const result = await this.getDatastore().sendNativeQuery(`
      SELECT GrupoMateriaId, PlanId, CicloId, GradoId, OrientacionId, OpcionId, Semestre, EstadosInscriId, AsignId
      FROM INSCRIPCIONES
      JOIN INSCRIPCIONES_MATERIAS USING (InscripcionId)
      JOIN INSCRIPCIONES_GRUPOCURSO USING (InscripcionId)
      JOIN GRUPOCURSOMATERIA USING (GrupoCursoId)
      JOIN GRUPOMATERIA USING (GrupoMateriaId)
      JOIN ASIGNATURAS_MATERIAS USING (MateriaId)
      WHERE InscripcionId in (`+inscripciones.join(',')+`)
        AND GrupoMateriaMateriaId=MateriaId
        AND InscripcionGrupoCursoActivo=1
        AND GrupoCursoMateriaActivo=1
        AND GrupoMateriaFchHasta>'2019-04-01' -- curdate()
      `);

    if (!result || !result.rows) {
      return undefined;
    }
    return result.rows;
  },


};
