/**
 * Asignaturas.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

	datastore: 'Estudiantil',
	migrate: 'safe',
	tableName: 'ASIGNATURAS',
	attributes: {
		id: { type:'string', columnName:'AsignId', required:true },
		AsignDesc: 'string',
	},

  asignaturasPlan: async function(planId) {
		const memkey = sails.config.prefix.asignaturasPlan+planId;
		try {

			const result = await sails.memcached.Get(memkey);
			if (typeof result === 'undefined') {
				throw 'CACHE MISS';
			}
			return result;

		} catch (e) {

			const result = await this.getDatastore().sendNativeQuery(`
				select AsignId id,AsignDesc,Curricula_Ciclo cicloId,Curricula_Grado gradoId,Curricula_Orient orientacionId,Curricula_Opcion opcionId
				from CURRICULA
				join ASIGNATURAS_MATERIAS on MateriaId=CurriculaMateriaId
				join ASIGNATURAS using (AsignId)
				where CurriculaPlanId = $1
				group by 1,2,3,4,5,6
			`,[planId]);

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
