/**
 * Cupos.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'Estudiantil',
  migrate: 'safe',
  tableName: 'INSCRIPCIONES',
  attributes: {
          id: { type:'number', columnName:'InscripcionId', required:true }, //dummy
  },

  vacantes: async function(dependId,fechaInicioCurso,cupoPorMateria,cupoPorPractico) {
    const memkey = sails.config.prefix.vacantes+fechaInicioCurso+':'+dependId+':'+cupoPorMateria;
    try {
      const result = await sails.memcached.Get(memkey);
      if (typeof result === 'undefined') {
        throw 'CACHE MISS';
      }
      return result;

    } catch(e) {

      const result = await this.getDatastore().sendNativeQuery(`
        select GrupoMateriaId, GrupoMateriaTipoDictadoId TipoDictadoId, if(GrupoMateriaTipoDictadoId=2,$4,$3)-count(*) vacantes
        from INSCRIPCIONES
        join ALUMNOS_GRUPOMATERIA using (InscripcionId)
        join GRUPOMATERIA using (GrupoMateriaId)
        where EstadosInscriId < 5
          and AlumnoGrupoMateriaActivo = 1
          and PlanId = 14
          and FechaInicioCurso = $1
          and DependId = $2
        group by 1,2
        `,[fechaInicioCurso, dependId, cupoPorMateria, cupoPorPractico]);

        if (!result) {
          return undefined;
        }

        try {
          await sails.memcached.Set(memkey, result.rows, 5*60);
        } catch (ignore) { }

        return result.rows;
    }
  },
};
