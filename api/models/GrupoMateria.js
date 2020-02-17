/**
 * GrupoMateria.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'Estudiantil',
  migrate: 'safe',
  tableName: 'GRUPOMATERIA',
  primaryKey: 'id',
  attributes: {
    id: { type:'number', columnName:'GrupoMateriaId', required:true },
    GrupoMateriaDesc: 'string',
    GrupoMateriaFchDesde: { type:'ref', columnType:'date' },
    GrupoMateriaFchHasta: { type:'ref', columnType:'date' },
    GrupoMateriaMateriaId: 'number',
    GrupoMateriaTipoDictadoId: 'number',
    TipoDuracionId: 'number',
  },

  buscar: async function(grupoMateriaId) {

    const memkey = sails.config.prefix.grupoMateria+grupoMateriaId;

    try {
      const result = await sails.memcached.Get(memkey);
      if (typeof result === 'undefined') {
        throw 'CACHE MISS';
      }
      return result;

    } catch (e) {

      const result = await this.getDatastore().sendNativeQuery(`
        select GrupoMateriaId id,
               GrupoMateriaDesc,
               GrupoMateriaMateriaId MateriaId,
               GrupoMateriaTipoDictadoId TipoDictadoId,
               TipoDuracionId ,
               GrupoMateriaFchDesde,
               GrupoMateriaFchHasta,
               GrupoCursoId,
               GrupoCursoDesc,
               LiceoPlanDependId DependId,
               LiceoPlanPlanId PlanId,
               TurnoId,
               CicloId,
               GradoId,
               OrientacionId,
               OpcionId,
               GrupoCursoFchDesde,
               GrupoCursoFchHasta
        from GRUPOMATERIA
        join GRUPOCURSOMATERIA using (GrupoMateriaId)
        join GRUPOCURSO using (GrupoCursoId)
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
