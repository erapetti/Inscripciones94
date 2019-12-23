/**
 * MainController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 *
 * Ascii art: http://www.network-science.de/ascii/ font:"standard", reflection:no, adjustement:center, stretch:no, width:60
 */

const util = require('util');
const Memcached = require('memcached');
sails.memcached = new Memcached(sails.config.memcached);
sails.memcached.Get = util.promisify(sails.memcached.get);
sails.memcached.Set = util.promisify(sails.memcached.set);


module.exports = {

/*                 _       _      _
                  (_)_ __ (_) ___(_) ___
                  | | '_ \| |/ __| |/ _ \
                  | | | | | | (__| | (_) |
                  |_|_| |_|_|\___|_|\___/
*/
  inicio: async function(req,res) {

    let viewdata = {
      title: "Inscripciones Plan 1994",
    };
    return res.view(viewdata);
  },

/*                                      _
                  _ __   __ _ ___  ___ / |
                 | '_ \ / _` / __|/ _ \| |
                 | |_) | (_| \__ \ (_) | |
                 | .__/ \__,_|___/\___/|_|
                 |_|
*/
  paso1: async function(req,res) {

    let cedula = req.param('cedula','').checkFormat(/[\d.,;-]+/);
    if (!cedula) {
      return res.redirect('/');
    }
    cedula = cedula.replace(/[.,;-]/g,'');

		const fechaHorarios = calcFechaHorarios();

    let viewdata = {
      title: "Inscripciones Plan 1994",
      cedula: cedula,
    };
    try {

      viewdata.persona = await Personas.findOne({PaisCod:'UY',DocCod:'CI',PerDocId:cedula});
      if (typeof viewdata.persona === "undefined") {
        throw new Error("El número de cédula ingresado no se encuentra registrado en nuestra base de datos. Verifique que lo escribió correctamente.")
      }

      inscripciones = await Inscripciones.find({PerId:viewdata.persona.id, PlanId:14, EstadosInscriId:{'<':5}}).sort('FechaInicioCurso DESC').limit(1).populate('DependId').populate('PlanId').populate('CicloId').populate('GradoId').populate('OrientacionId').populate('OpcionId');
      if (typeof inscripciones === "undefined" || typeof inscripciones[0] === "undefined") {
        throw new Error("No tienes inscripciones previas en el Plan 1994. Debes realizar la inscripción personalmente en un liceo.");
      }

      viewdata.ultimaInscripcion = inscripciones[0];

			const listaLiceosConHorarios = await Dependencias.liceosConHorarios(fechaHorarios, fechaHorarios);

			// filtro liceos piloto
			viewdata.liceos = listaLiceosConHorarios.filter(l => (l.DependId == 1003 || l.DependId == 1026));

			if (viewdata.liceos.length == 0) {
					throw new Error("En este momento no hay liceos habilitados para realizar inscripciones. Reintente luego");
			}

    } catch (e) {
      viewdata.mensaje = e.message;
      viewdata.persona = {};
      viewdata.ultimaInscripcion = {};
			viewdata.liceos = [];
    }

    return res.view(viewdata);
  },

/*                                    ____
                 _ __   __ _ ___  ___|___ \
                | '_ \ / _` / __|/ _ \ __) |
                | |_) | (_| \__ \ (_) / __/
                | .__/ \__,_|___/\___/_____|
                |_|
*/
	paso2: async function(req,res) {
		let cedula = req.param('cedula','').checkFormat(/[\d.,;-]+/);
		if (!cedula) {
			return res.redirect(sails.config.custom.basePath+'/');
		}
		cedula = cedula.replace(/[.,;-]/g,'');

		const dependId = req.param('dependid').checkFormat(/\d+/);
		if (!dependId) {
			return res.redirect(sails.config.custom.basePath+'/');
		}

		const fechaHorarios = calcFechaHorarios();

		let viewdata = {
			title: "Inscripciones Plan 1994",
			cedula: cedula,
			dependId: dependId,
			dependDesc: await Dependencias.dependDesc(dependId),
			asignaturas: await Asignaturas.asignaturasPlan(14),
			horarios: await Horarios.get(dependId,fechaHorarios)
		};

		return res.view(viewdata);
	},
};

/*                            _
                    _ __ ___ (_)___  ___
                   | '_ ` _ \| / __|/ __|
                   | | | | | | \__ \ (__
                   |_| |_| |_|_|___/\___|
*/

String.prototype.checkFormat = function(regexp) {
  if (typeof this === 'undefined') {
    return undefined;
  }
  if (typeof regexp === 'string') {
    regexp = new RegExp('^'+regexp+'$');
  } else {
    regexp = new RegExp('^'+regexp.source+'$');
  }
  return (this.match(regexp) ? this.toString() : undefined);
};

// la fecha en que los horarios tienen que existir:
function calcFechaHorarios() {
	const mesActual = (new Date()).getMonth();
	const anioActual = 2018; // (new Date()).getFullYear();
	const fechaHorarios = (mesActual < 4 ? anioActual+'-04-01' :
													mesActual < 6 ? anioActual+'-'+mesActual+'01' :
													 mesActual < 8 ? anioActual+'-08-01' :
														mesActual < 11 ? anioActual+'-'+mesActual+'01' :
															(anioActual+1)+'-04-01'
	);
	return fechaHorarios;
}
