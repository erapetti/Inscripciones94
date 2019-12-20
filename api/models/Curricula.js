/**
 * Curricula.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'Estudiantil',
  migrate: 'safe',
  tableName: 'CURRICULA',
  attributes: {
          id: { type:'string', columnName:'Curricula_UsrUltAct', required:true }, //dummy
          CurriculaPlanId: 'number',
          Curricula_Ciclo: 'number',
          Curricula_Grado: 'number',
          Curricula_Orient: 'number',
          Curricula_Opcion: 'number',
          CurriculaMateriaId: 'number',
          CurriculaTipoDictadoId: 'number',
          TipoDuracionId: 'number',
          CurricHorasClase: 'number',
  },

  curriculaHorariosLiceo: async function(dependId,desde,hasta) {
    const memkey = sails.config.prefix.curricula+dependId;
    try {

      const result = await sails.memcached.Get(memkey);
      if (typeof result === 'undefined') {
        throw 'CACHE MISS';
      }
      return result;

    } catch (e) {

      const result = await this.getDatastore().sendNativeQuery(`
        select *
        from CURRICULA
        join GRUPOMATERIA ON GrupoMateriaMateriaId=CurriculaMateriaId and GrupoMateriaTipoDictadoId=CurriculaTipoDictadoId
        join GRUPOMATERIA_HORARIOS using (GrupoMateriaId)
        where CurriculaPlanId = 14
          and LiceoPlanDependId = $3
          and (IFNULL(GrupoMateriaHorarioFchDesde,'1000-01-01')='1000-01-01' OR GrupoMateriaHorarioFchDesde <= $1)
          and (IFNULL(GrupoMateriaHorarioFchHasta,'1000-01-01')='1000-01-01' OR GrupoMateriaHorarioFchHasta >= $2)
          and (IFNULL(GrupoMateriaFchDesde,'1000-01-01')='1000-01-01' OR GrupoMateriaFchDesde <= $1)
          and (IFNULL(GrupoMateriaFchHasta,'1000-01-01')='1000-01-01' OR GrupoMateriaFchHasta >= $2)
      `, [desde,hasta,dependId]);

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
