/**
 * Horarios.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'Estudiantil',
  migrate: 'safe',
  tableName: 'GRUPOMATERIA_HORARIOS',
  attributes: {
          id: { type:'number', columnName:'GrupoMateriaHorarioId', required:true },
  },

  get: async function(dependId,fecha) {
    const memkey = sails.config.prefix.horarias+dependId+','+fecha;
    try {

      const result = await sails.memcached.Get(memkey);
      if (typeof result === 'undefined') {
        throw 'CACHE MISS';
      }
      return result;

    } catch (e) {

      const result = await this.getDatastore().sendNativeQuery(`
        select Curricula_Grado GradoId,Curricula_Orient OrientacionId,Curricula_Opcion OpcionId,AsignId,GrupoMateriaId id,GrupoMateriaDesc,TipoDictadoDesc,TipoDuracionDesc,MateriaNombre,HorarioDiaSemana dia,time_format(HorarioHrInicio,'%H:%i') desde,time_format(HorarioHrFin,'%H:%i') hasta
        from GRUPOMATERIA_HORARIOS
        join LICEOPLANTURNO_HORARIOS USING (LiceoPlanDependId,LiceoPlanPlanId,TurnoId,HorarioId)
        join GRUPOMATERIA GM USING (GrupoMateriaId)
        join TIPODURACION USING (TipoDuracionId)
        join TIPO_DICTADO on TipoDictadoId=GrupoMateriaTipoDictadoId
        join ASIGNATURAS_MATERIAS on MateriaId=GrupoMateriaMateriaId
        join MATERIAS USING (MateriaId)
        join CURRICULA C on CurriculaPlanId=LiceoPlanPlanId and CurriculaMateriaId=MateriaId and CurriculaTipoDictadoId=GrupoMateriaTipoDictadoId and C.TipoDuracionId=GM.TipoDuracionId
        where GrupoMateriaHorarioFchDesde <= $2
          and GrupoMateriaHorarioFchHasta >= $2
          and LiceoPlanTurnoHorarioActivo=1
          and (ifnull(HorarioFchDesde,'1000-01-01')='1000-01-01' or HorarioFchDesde <= $2)
          and (ifnull(HorarioFchHasta,'1000-01-01')='1000-01-01' or HorarioFchHasta >= $2)
          and LiceoPlanPlanId = 14
          and LiceoPlanDependId = $1
          and Curricula_Ciclo = 2
      `,[dependId,fecha]);

      if (result) {
        try {
          await sails.memcached.Set(memkey, result.rows, sails.config.memcachedTTL);
        } catch (ignore) { }

        return result.rows;
      } else {
        return undefined;
      }
    }
  },

};