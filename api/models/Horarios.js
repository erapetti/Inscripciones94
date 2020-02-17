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
          id: { type:'number', columnName:'GrupoMateriaHorarioId', required:true },//dummy
  },

  get: async function(dependId,fechaInicioCurso) {

    const memkey = sails.config.prefix.horarios+dependId+':'+fechaInicioCurso;
    try {

      const result = await sails.memcached.Get(memkey);
      if (typeof result === 'undefined') {
        throw 'CACHE MISS';
      }
      return result;

    } catch (e) {

      const result = await this.getDatastore().sendNativeQuery(`
        select Curricula_Grado GradoId,
               Curricula_Orient OrientacionId,
               Curricula_Opcion OpcionId,Curricula_Grado GradoId,
               AsignId,
               GrupoMateriaId GrupoMateriaId,
               concat(GrupoMateriaId,':',Curricula_Grado,':',Curricula_Orient,':',Curricula_Opcion) id,
               GrupoMateriaDesc,
               TipoDictadoId,
               TipoDictadoDesc,
               GM.TipoDuracionId,
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
        where GrupoMateriaHorarioFchDesde <= curdate() /* '2019-04-30' */
          and GrupoMateriaHorarioFchHasta >= curdate() /* '2019-04-30' */
          and GrupoMateriaFchDesde >= $2
          and year(GrupoMateriaFchDesde) = year($2)
          and GrupoMateriaFchhasta >= curdate() /* '2019-01-30' */
          and LiceoPlanTurnoHorarioActivo=1
          and (ifnull(HorarioFchDesde,'1000-01-01')='1000-01-01' or HorarioFchDesde <= $2)
          and (ifnull(HorarioFchHasta,'1000-01-01')='1000-01-01' or HorarioFchHasta >= $2)
          and LiceoPlanPlanId = 14
          and LiceoPlanDependId = $1
          and Curricula_Ciclo = 2
        group by 1,2,3,4,5,6,7,8,9,10
      `,[dependId, fechaInicioCurso]);

      if (!result) {
        return undefined;
      }

      try {
        await sails.memcached.Set(memkey, result.rows, sails.config.memcachedTTL);
      } catch (ignore) { }

      return result.rows;
    }
  },

  buscar: async function(dependId,grupoMateriaId,gradoId,orientacionId,opcionId,fechaInicioCurso) {

    const horarios = await this.get(dependId,fechaInicioCurso);

    const id = grupoMateriaId+':'+gradoId+':'+orientacionId+':'+opcionId;
    return horarios.find(h => h.id==id);
  },

};
