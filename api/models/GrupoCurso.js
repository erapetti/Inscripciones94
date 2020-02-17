/**
 * GrupoCurso.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'Estudiantil',
  migrate: 'safe',
  tableName: 'GRUPOCURSO',
  primaryKey: 'id',
  attributes: {
    id: { type:'number', columnName:'GrupoCursoId', required:true },
    GrupoCursoDesc: 'string',
    LiceoPlanDependId: 'number',
    LiceoPlanPlanId: 'number',
    TurnoId: 'string',
    CicloId: 'number',
    GradoId: 'number',
    OrientacionId: 'number',
    OpcionId: 'number',
    GrupoCursoFchDesde: { type:'ref', columnType:'date' },
    GrupoCursoFchHasta: { type:'ref', columnType:'date' },
  },

  buscar: async function(grupoMateriaId) {

    const memkey = sails.config.prefix.grupoCursoMateria+grupoMateriaId;

    try {
      const result = await sails.memcached.Get(memkey);
      if (typeof result === 'undefined') {
        throw 'CACHE MISS';
      }
      return result;

    } catch (e) {

      const result = await this.getDatastore().sendNativeQuery(`
        select GrupoCursoId id
        from GRUPOCURSOMATERIA
        join GRUPOCURSO USING (GrupoCursoId)
        where GrupoMateriaId = $1
          and GrupoCursoMateriaActivo = 1
        order by GrupoCursoFchDesde DESC
      `, [grupoMateriaId]);

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
