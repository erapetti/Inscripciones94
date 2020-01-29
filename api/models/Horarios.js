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

  get: async function(dependId,fechaHorarioActivo) {

    const hoy = new Date();
    const anio = fechaHorarioActivo.substr(0,4);
    const desdeGM = (hoy.getMonth() < 5 ? anio+'-03-01' : (hoy.getMonth() < 10 ? anio+'-07-01' : (anio+1)+'-03-01'));
    const memkey = sails.config.prefix.horarias+dependId+','+fechaHorarioActivo+','+desdeGM;
    try {

      const result = await sails.memcached.Get(memkey);
//      if (typeof result === 'undefined') {
        throw 'CACHE MISS';
//      }
      return result;

    } catch (e) {

      const result = await this.getDatastore().sendNativeQuery(`
        select Curricula_Grado GradoId,
               Curricula_Orient OrientacionId,
               Curricula_Opcion OpcionId,
               AsignId,
               GrupoMateriaId id,
               GrupoMateriaDesc,
               TipoDictadoDesc,
               TipoDuracionDesc,
               MateriaId,
               MateriaNombre,
               group_concat(HorarioDiaSemana,
                            ' ',
                            time_format(HorarioHrInicio,'%H:%i'),
                            ' a ',
                            time_format(HorarioHrFin,'%H:%i')
                            order by case HorarioDiaSemana when 'JUE' then 'OJUE' when 'SAB' then 'XSAB' else HorarioDiaSemana end,HorarioHrInicio
               ) Horarios
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
          and GrupoMateriaFchDesde = $3
          /* and GrupoMateriaFchhasta >= curdate() */
          and LiceoPlanTurnoHorarioActivo=1
          and (ifnull(HorarioFchDesde,'1000-01-01')='1000-01-01' or HorarioFchDesde <= $2)
          and (ifnull(HorarioFchHasta,'1000-01-01')='1000-01-01' or HorarioFchHasta >= $2)
          and LiceoPlanPlanId = 14
          and LiceoPlanDependId = $1
          and Curricula_Ciclo = 2
        group by 1,2,3,4,5,6,7,8,9,10
      `,[dependId, fechaHorarioActivo, desdeGM]);

      if (!result) {
        return undefined;
      }

      try {
        await sails.memcached.Set(memkey, result.rows, sails.config.memcachedTTL);
      } catch (ignore) { }

      return result.rows;
    }
  },

};
