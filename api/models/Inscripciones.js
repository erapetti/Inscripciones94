/**
 * Inscripciones.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */


/* OJO: Uso la función buscar para obtener las inscripciones y por lo tanto
        los registros no quedan con la sintaxis común de sails:

        En lugar de ser:
           inscripcion.DependId.DependDesc

        queda como:
           inscripcion.DependDesc
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

  buscar: async function(perId,planId) {
    const result = await this.getDatastore().sendNativeQuery(`
      select *
      from INSCRIPCIONES
      join Direcciones.DEPENDENCIAS using (DependId)
      join PLANES using (PlanId)
      join CICLOS using (CicloId)
      join GRADOS using (GradoId)
      join ORIENTACION using (OrientacionId)
      join OPCION using (OpcionId)
      where PerId = $1
        and PlanId = $2
        and EstadosInscriId < 5
      order by FechaInicioCurso DESC, InscripcionId DESC
      limit 1
    `, [perId, planId]);

    if (!result || !result.rows[0]) {
      return undefined;
    }

    return result.rows[0];
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
    const hoy = new Date();
    const memkey = sails.config.prefix.hechasHoy+hoy.fecha_ymd_toString();

    try {

      const result = await sails.memcached.Get(memkey);
      if (result  > sails.config.custom.maximoDiario) {
        return undefined;
      }
    } catch (ignore) {}

    const result = await this.getDatastore().sendNativeQuery(`
      select ifnull(max(inscripcionid)+1, $1) InscripcionId
      from INSCRIPCIONES
      where InscripcionId >= $1
        and InscripcionId <= $2
    `, [sails.config.custom.minInscripcionId, sails.config.custom.maxInscripcionId]).usingConnection(dbh);

    if (!result || !result.rows[0] || result.rows[0].InscripcionId > sails.config.custom.maxInscripcionId) {
      return undefined;
    }
    return result.rows[0].InscripcionId;
  },

  agrego: async function(dbh, dependId, perId, grupoMateriaId, gradoId, orientacionId, opcionId, fechaInicioCurso, ultDependId, ultPlanId, ultCursoId, recursa) {

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

    for (let intento = 0; intento<10; intento++, id++) {
      try {
        inscripcion.id = await Inscripciones.nextId(dbh);
        if (!inscripcion.id) {
          throw new Error("Por el día de hoy no hay números disponibles para realizar inscripciones");
        }
        inscripcion.InscripcionId = inscripcion.id; // por las dudas

        // tuve que usar fetch porque si no pierdo el contenido de inscripcion:
        inscripcion = await this.create(inscripcion).fetch().usingConnection(dbh);

        // contabilizo la inscripción aunque: puede estar repetida para la persona, puede ser deshecha por rollback más adelante
        try {
          const hoy = new Date();
          const memkey = sails.config.prefix.hechasHoy+hoy.fecha_ymd_toString();
          if (! await sails.memcached.Increment(memkey, 1) ) {
            await this.hechasHoy();
            await sails.memcached.Increment(memkey, 1);
          }

        } catch (ignore) { }

        break;
      } catch(e) {
        if (e.code !== 'E_UNIQUE') {
          throw e;
        }
      }
    }
    return inscripcion.id;
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
        AND GrupoMateriaMateriaId = MateriaId
        AND InscripcionGrupoCursoActivo = 1
        AND GrupoCursoMateriaActivo = 1
        AND GrupoMateriaFchHasta > curdate /* '2019-04-01' */
      `);

    if (!result || !result.rows) {
      return undefined;
    }
    return result.rows;
  },

  recursa: async function(perId,planId,cicloId,gradoId,orientacionId,opcionId,fechaInicioCurso) {
    const result = await this.find({EstadosInscriId:{'<':5},FechaInicioCurso:{'<':fechaInicioCurso},PerId:perId,PlanId:planId,CicloId:cicloId,GradoId:gradoId,OrientacionId:orientacionId,OpcionId:opcionId});

    return (result && result.rows && result.rows.length>0);
  },

  hechasHoy: async function() {
    const hoy = new Date();
    const memkey = sails.config.prefix.hechasHoy+hoy.fecha_ymd_toString();

    try {

      const result = await sails.memcached.Get(memkey);
      if (typeof result === 'undefined') {
        throw 'CACHE MISS';
      }
      return result;

    } catch (e) {

      const result = await this.getDatastore().sendNativeQuery(`
        select count(*) cant
        from INSCRIPCIONES
        where InscripcionId >= $1
          and InscripcionId <= $2
          and InscriFecha = curdate()
      `, [sails.config.custom.minInscripcionId, sails.config.custom.maxInscripcionId]);

      if (!result) {
        return undefined;
      }
      try {
        await sails.memcached.Set(memkey, result.rows[0], sails.config.memcached15minTTL);
      } catch (ignore) { }

      return result.rows[0];
    }
  },

};
