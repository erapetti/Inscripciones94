/**
 * Dependencias.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'Direcciones',
  migrate: 'safe',
  tableName: 'DEPENDENCIAS',
  attributes: {
          id: { type:'number', columnName:'DependId', required:true },
          DependDesc: 'string',
          DependNom: { type:'string', allowNull:true },
          StatusId: 'number',
  },

  dependDesc: async function(dependId) {
    const memkey = sails.config.prefix.dependDesc+dependId;
    try {

      const dependDesc = await sails.memcached.Get(memkey);
      if (typeof dependDesc === 'undefined') {
        throw 'CACHE MISS';
      }
      return dependDesc;

    } catch (e) {

      const result = await this.findOne({id:dependId, StatusId:1});
      const dependDesc = result ? result.DependDesc : undefined;
      try {
        await sails.memcached.Set(memkey, dependDesc, sails.config.memcachedTTL);
      } catch (ignore) { }
      return dependDesc;

    }
  },

  liceosConHorarios: async function(desde,hasta) {
    const memkey = sails.config.prefix.liceosConHorarios+desde+hasta;
    try {

      const result = await sails.memcached.Get(memkey);
      if (typeof result === 'undefined') {
        throw 'CACHE MISS';
      }
      return result;

    } catch (e) {

      const result = await this.getDatastore().sendNativeQuery(`
        select DependId,DependDesc,DeptoId,DeptoNombre,group_concat(distinct TurnoId) Turnos
        from Estudiantil.GRUPOMATERIA_HORARIOS
        join DEPENDENCIAS D on DependId=LiceoPlanDependId
        join LUGARES L on LugarId=DependId
        join DEPARTAMENTO using (DeptoId)
        where LiceoPlanPlanId = 14
        and D.StatusId=1
        and L.StatusId=1
        and (IFNULL(GrupoMateriaHorarioFchDesde,'1000-01-01')='1000-01-01' OR GrupoMateriaHorarioFchDesde <= $1)
        and (IFNULL(GrupoMateriaHorarioFchHasta,'1000-01-01')='1000-01-01' OR GrupoMateriaHorarioFchHasta >= $2)
        group by 1,2,3,4
        order by 4,2
        `, [desde, hasta]);

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
