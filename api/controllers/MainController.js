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
      id: "inicio",
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


    let viewdata = {
      title: "Inscripciones Plan 1994",
      id: "paso1",
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

      const fechaHorarios = calcFechaHorarios();
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

		let viewdata = {
			title: "Inscripciones Plan 1994",
      id: "paso2",
			cedula: cedula,
			dependId: dependId,
      dependDesc: '',
      asignaturas: [],
      horarios: [],
    };

    const fechaInicioCurso = calcFechaInicioCurso();

    try {
			viewdata.dependDesc = await Dependencias.dependDesc(dependId);
			viewdata.asignaturas = await Asignaturas.asignaturasPlan(14);
			viewdata.horarios = await Horarios.get(dependId, fechaInicioCurso);
      viewdata.vacantes = await Cupos.vacantes(dependId, fechaInicioCurso, sails.config.custom.cupoPorMateria);

    } catch (e) {
      viewdata.mensaje = e.message;
    }

		return res.view(viewdata);
	},

/*                                    _____
                 _ __   __ _ ___  ___|___ /
                | '_ \ / _` / __|/ _ \ |_ \
                | |_) | (_| \__ \ (_) |__) |
                | .__/ \__,_|___/\___/____/
                |_|
*/
  paso3: async function(req,res) {
    const cedula = (req.param('cedula','') || '').checkFormat(/[\d.,;-]+/);
    const dependId = (req.param('dependid') || '').checkFormat(/\d+/);
    const gm = (req.param('gm') || '').checkFormat(/[\d,]+/);
    if (!cedula || !dependId || !gm) {
      return res.redirect(sails.config.custom.basePath+'/');
    }

    let viewdata = {
      title: "Inscripciones Plan 1994",
      id: "paso3",
      cedula: cedula,
      dependId: dependId,
      fecha: (new Date()).fecha_toString(),
      inscripcionId: '',
      persona: {},
      dependDesc: '',
      asignaturas: [],
      misHorarios: [],
      orientaciones: [ {id:15,OrientacionDesc:'Humanístico'},{id:16,OrientacionDesc:'Biológico'},{id:17,OrientacionDesc:'Científico'} ],
      opciones: [ {id:13,OpcionDesc:'Derecho',OrientacionId:15},{id:14,OpcionDesc:'Economía',OrientacionId:15},{id:15,OpcionDesc:'Agronomía',OrientacionId:16},{id:16,OpcionDesc:'Medicina',OrientacionId:16},{id:17,OpcionDesc:'Arquitectura',OrientacionId:17},{id:18,OpcionDesc:'Ingeniería',OrientacionId:17} ],
    };

    const fechaInicioCurso = calcFechaInicioCurso();

    try {
      viewdata.persona = await Personas.findOne({PaisCod:'UY',DocCod:'CI',PerDocId:cedula});
      viewdata.dependDesc = await Dependencias.dependDesc(dependId);
			viewdata.asignaturas = await Asignaturas.asignaturasPlan(14);
			const horarios = await Horarios.get(dependId, fechaInicioCurso);
      viewdata.misHorarios = gm.split(/,/).map(grupoMateriaId => horarios.find(h => h.id==grupoMateriaId));
    } catch (e) {
      viewdata.mensaje = e.message;
    }

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
  if (typeof regexp === 'string') {
    regexp = new RegExp('^'+regexp+'$');
  } else {
    regexp = new RegExp('^'+regexp.source+'$');
  }
  return (this.match(regexp) ? this.toString() : undefined);
};

Date.prototype.fecha_toString = function() {
  var sprintf = require("sprintf");
  var mes = Array('enero','febrero','marzo','abril','mayo','junio','julio','agosto','setiembre','octubre','noviembre','diciembre');
  return sprintf("%d de %s de %d, %02d:%02d", this.getDate(),mes[this.getMonth()],this.getFullYear(),this.getHours(),this.getMinutes());
};

// la fecha en que los horarios tienen que existir:
function calcFechaHorarios() {
	const mesActual = (new Date()).getMonth();
	const anioActual = 2019; // (new Date()).getFullYear();
	const fechaHorarios = (mesActual < 4 ? anioActual+'-04-01' :
													mesActual < 6 ? anioActual+'-'+mesActual+'01' :
													 mesActual < 8 ? anioActual+'-08-01' :
														mesActual < 11 ? anioActual+'-'+mesActual+'01' :
															(anioActual+1)+'-04-01'
	);
	return fechaHorarios;
};

function calcFechaInicioCurso() {
  const hoy = new Date('2019-01-30'); // new Date();
  const fechaInicioCurso = (hoy.getMonth() < 5 ? hoy.getFullYear()+'-03-01' : (hoy.getMonth() < 10 ? hoy.getFullYear()+'-07-01' : (hoy.getFullYear()+1)+'-03-01'));
  return fechaInicioCurso;
};
