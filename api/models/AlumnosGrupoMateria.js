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
    };

    await this.create(alumnoGrupoMateria).usingConnection(dbh);
    return;
  },
};
