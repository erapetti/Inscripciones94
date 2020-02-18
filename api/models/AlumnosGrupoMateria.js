/**
 * AlumnosGrupoMateria.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'Estudiantil',
  migrate: 'safe',
  tableName: 'ALUMNOS_GRUPOMATERIA',
  primaryKey: 'id',
  attributes: {
    id: { type:'number', columnName:'InscripcionId', required:true },
    MateriaId: 'number',
    GrupoMateriaId: 'number',
    GrupoCursoId: 'number',
    AlumnoGrupoMateriaActivo: 'number',
  },

  agrego: async function(dbh, inscripcionId, materiaId, grupoMateriaId, grupoCursoId) {
    let alumnoGrupoMateria = {
      id: inscripcionId,
      MateriaId: materiaId,
      GrupoMateriaId: grupoMateriaId,
      GrupoCursoId: grupoCursoId,
      AlumnoGrupoMateriaActivo: 1,
    };
    await this.findOrCreate({id:inscripcionId,MateriaId:materiaId,GrupoMateriaId:grupoMateriaId,GrupoCursoId:grupoCursoId},alumnoGrupoMateria).usingConnection(dbh);
    return;
  },

  activas: async function(perId, fechaInicioCurso) {
    const result = await this.getDatastore().sendNativeQuery(`
      select InscripcionId id, DependId, PlanId, CicloId, GradoId, OrientacionId, OpcionId, Semestre, EstadosInscriId, UsuarioInscriId, GrupoMateriaId
      from INSCRIPCIONES
      join ALUMNOS_GRUPOMATERIA using (InscripcionId)
      where PerId = $1
        and FechaInicioCurso = $2
        and EstadosInscriId < 5
        and AlumnoGrupoMateriaActivo = 1
    `,[perId, fechaInicioCurso]);

    if (!result || !result.rows) {
      return undefined;
    }
    return result.rows;
  },
};
