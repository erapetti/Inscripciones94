/**
 * Feriados.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'Direcciones',
  migrate: 'safe',
  tableName: 'FERIADOS',
  attributes: {
    id: { type:'number', columnName:'FeriadoId', required:true },
    FeriadoFecha: { type:'ref', columnType:'date' },
    DepartamentoId: 'number',
    DependId: 'number',
    FeriadoDesc: 'string',
  },

  get: async function(year,deptoId,dependId) {
    const memkey = sails.config.prefix.feriados+':'+year+':'+deptoId+':'+dependId;

    try {

      const result = await sails.memcached.Get(memkey);
      if (typeof result === 'undefined') {
        throw 'CACHE MISS';
      }
      return result;

    } catch (e) {

      const result = await this.getDatastore().sendNativeQuery(`
        select FeriadoId id, date_format(FeriadoFecha,"%Y-%m-%d")FeriadoFecha, FeriadoDesc
        from FERIADOS
        where year(FeriadoFecha) = $1
          and ($2 is null or DepartamentoId = $2)
          and ($3 is null or DependId = $3)
      `,[year,deptoId,dependId]);

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
