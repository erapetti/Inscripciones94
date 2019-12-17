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
          DependNom: 'string',
          StatusId: 'number',
  },

  direccion: function(DependId, callback) {
    return this.query(`
      SELECT DependId,DeptoId,DeptoNombre,LugarId,LugarDesc,LocId,LocNombre,concat(DirViaNom,if(DirNroPuerta is null,'',concat(' ',DirNroPuerta)),if(DirKm is null,'',concat(' Km. ',DirKm)),if(DirViaNom1 is null,'',if(DirViaNom2 is null,concat(' esq. ',DirViaNom1),concat(' entre ',DirViaNom1,if(DirViaNom2 like 'i%' or DirViaNom2 like 'hi%',' e ',' y '),DirViaNom2)))) LugarDireccion
      FROM DEPENDENCIAS d
      JOIN DEPENDLUGAR USING (DependId)
      JOIN LUGARES l USING (LugarId)
      JOIN DEPARTAMENTO USING (DeptoId)
      JOIN LOCALIDAD USING (DeptoId,LocId)
      JOIN Direcciones.DIRECCIONES
      ON LugarDirId=DirId
      WHERE DependId = ?
      AND d.StatusId=1
      AND l.StatusId=1
      AND DependLugarStatusId=1
      LIMIT 1
    `,
    [DependId],
    function(err,result){
      if (err) {
        return callback(err, undefined);
      }
      if (result===null) {
        return new Error("No se encuentra la dependencia",undefined);
      }
      return callback(undefined, (result===null ? undefined : result[0]));
    });
  },

  liceos: function(DeptoId, LocId, callback) {
    return this.query(`
      SELECT DependId,DependDesc,DependNom,DeptoId,DeptoNombre,LugarId,LugarDesc,LocId,LocNombre,concat(DirViaNom,if(DirNroPuerta is null,'',concat(' ',DirNroPuerta)),if(DirViaNom1 is null,'',if(DirViaNom2 is null,concat(' esq. ',DirViaNom1),concat(' entre ',DirViaNom1,if(DirViaNom2 like 'i%' or DirViaNom2 like 'hi%',' e ',' y '),DirViaNom2)))) LugarDireccion
      FROM DEPENDENCIAS d
      JOIN DEPENDLUGAR USING (DependId)
      JOIN LUGARES l USING (LugarId)
      JOIN DEPARTAMENTO USING (DeptoId)
      JOIN LOCALIDAD USING (DeptoId,LocId)
      JOIN Direcciones.DIRECCIONES
      ON LugarDirId=DirId
      WHERE DeptoId = ?
      AND LocId = ?
      AND DependTipId=2
      AND DependSubTipId=1
      AND d.StatusId=1
      AND l.StatusId=1
      AND DependLugarStatusId=1
      AND DependId=LugarId
      ORDER by DependId
    `,
    [DeptoId,LocId],
    function(err,result){
      if (err) {
        return callback(err, undefined);
      }
      if (result===null) {
        return new Error("No se encuentran liceos en el departamento "+DeptoId,undefined);
      }
      return callback(undefined, (result===null ? undefined : result));
    });
  },
};
