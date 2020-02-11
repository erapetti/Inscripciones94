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
      title: "Inscripciones para Plan 1994<small> (turno nocturno)</small>",
      id: "inicio",
      vencimiento: calcFechaVencimiento().fecha_toString(),
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
      title: "Inscripciones para Plan 1994<small> (turno nocturno)</small>",
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
			title: "Inscripciones para Plan 1994<small> (turno nocturno)</small>",
      id: "paso2",
			cedula: cedula,
			dependId: dependId,
      dependDesc: '',
      asignaturas: [],
      horarios: [],
      vacantes: [],
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
    let gm;
    try {
      gm = JSON.parse((req.param('gm') || '').checkFormat(/[,\[\]\{\}:"'A-Za-z0-9]+/));
    } catch(ignore) { }

    if (!cedula || !dependId || !gm) {
      return res.redirect(sails.config.custom.basePath+'/');
    }

    let viewdata = {
      title: "Inscripciones para Plan 1994<small> (turno nocturno)</small>",
      id: "paso3",
      cedula: cedula,
      dependId: dependId,
      fecha: (new Date()).fechahora_toString(),
      vencimiento: calcFechaVencimiento().fecha_toString(),
      inscripcionesId: '',
      persona: {},
      dependDesc: '',
      asignaturas: [],
      misHorarios: [],
      orientaciones: [ {id:15,OrientacionDesc:'Humanístico'},{id:16,OrientacionDesc:'Biológico'},{id:17,OrientacionDesc:'Científico'} ],
      opciones: [ {id:13,OpcionDesc:'Derecho',OrientacionId:15},{id:14,OpcionDesc:'Economía',OrientacionId:15},{id:15,OpcionDesc:'Agronomía',OrientacionId:16},{id:16,OpcionDesc:'Medicina',OrientacionId:16},{id:17,OpcionDesc:'Arquitectura',OrientacionId:17},{id:18,OpcionDesc:'Ingeniería',OrientacionId:17} ],
    };

    const fechaInicioCurso = calcFechaInicioCurso();

    try {
      const persona = await Personas.findOne({PaisCod:'UY',DocCod:'CI',PerDocId:cedula});
      if (!persona) {
        throw new Error('No se encuentran datos asociados al número de cédula');
      }

      const horarios = await Horarios.get(dependId, fechaInicioCurso);

      const datosUltCurso = await Inscripciones.ultCurso(persona.id);
      if (!datosUltCurso) {
        throw new Error('No se encuentran datos del último curso');
      }

      let misHorarios = gm.map(gmi => horarios.find(h => h.GrupoMateriaId==gmi.GrupoMateriaId));

      const activas = await Inscripciones.activas(persona.id, fechaInicioCurso);
      let cursosActivos;
      if (activas && activas.length>0) {
        cursosActivos = await Inscripciones.GMactivas(activas.map(a => a.id));
        for (let c=0; c<cursosActivos.length; c++) {
          if (horarios.find(h => h.GrupoMateriaId==cursosActivos[c].GrupoMateriaId)) {
            misHorarios.push( horarios.find(h => h.GrupoMateriaId==cursosActivos[c].GrupoMateriaId) );
          } else {
            // no encontré el horario pero igual lo agrego para tenerlo en cuenta al validar
            misHorarios.push( cursosActivos[c] );
          }
        }
      }

      const errores = validar(misHorarios, viewdata.orientaciones, viewdata.opciones);
      if (errores.length) {
        throw new Error(errores.join('<br>'));
      }

      let inscripciones = [];

      // Inicio una transacción para registrar las inscripciones
      await sails.getDatastore('Estudiantil').transaction(async dbh => {

        // para cada grupoMateria solicitado lo inscribo si es necesario
        for (let i=0; i<gm.length; i++) {
          const datosGM = gm[i];
          const grupoMateriaId = datosGM.GrupoMateriaId;
          const recursa = datosUltCurso.UltCursoId === '142 '+datosGM.GradoId+('  '+datosGM.OrientacionId).substr(0,2)+('  '+datosGM.OpcionId).substr(0,2);
          const curso = datosGM.GradoId+'º BD'+(datosGM.GradoId==2 ? ' '+viewdata.orientaciones.find(o=>o.id==datosGM.OrientacionId).OrientacionDesc : (datosGM.GradoId==3 ? ' '+viewdata.opciones.find(o=>o.id==datosGM.OpcionId).OpcionDesc : ''));

          const parecidas = activas.filter(i => i.PlanId==14 && i.CicloId==2 && i.GradoId==datosGM.GradoId && (i.GradoId==1 || i.GradoId==2 && i.OrientacionId==datosGM.OrientacionId || i.GradoId==3 && i.OpcionId==datosGM.OpcionId));

          let id;
          if (!parecidas.length) {
            // no hay una inscripción que pueda reutilizar, agrego una nueva
            id = await Inscripciones.agregoInscripcionCurso(dbh, dependId, persona.id, grupoMateriaId, datosGM.GradoId, datosGM.OrientacionId, datosGM.OpcionId, fechaInicioCurso, datosUltCurso.DependId, datosUltCurso.PlanId, datosUltCurso.UltCursoId, recursa);
          } else {
            if (parecidas.find(i => i.UsuarioInscriId !== 'web')) {
              throw new Error('Tienes una inscripción activa en '+datosGM.GradoId+'º BD que no se inició vía web, no puedes agregarle materias usando este formulario');
            }

            // tengo una inscripción para reutilizar
            id = parecidas[0].id;
          }

          inscripciones.push( id );
          horariosGM = horarios.find(h => h.GrupoMateriaId==grupoMateriaId && h.GradoId==datosGM.GradoId && (datosGM.GradoId==1 || datosGM.GradoId==2 && h.OrientacionId==datosGM.OrientacionId || datosGM.GradoId==3 && h.OpcionId==datosGM.OpcionId));
          viewdata.misHorarios.push( horariosGM );

          sails.log(id, horariosGM.MateriaId, horariosGM.TipoDuracionDesc, horariosGM.TipoDuracionId);
          await InscripcionesMaterias.agrego(dbh, id, horariosGM.MateriaId, horariosGM.TipoDuracionId);
        }

        sails.log("termina");

      });

      viewdata.inscripcionesId = inscripciones.join(',');
      viewdata.persona = await Personas.findOne({PaisCod:'UY',DocCod:'CI',PerDocId:cedula});
      viewdata.dependDesc = await Dependencias.dependDesc(dependId);
			viewdata.asignaturas = await Asignaturas.asignaturasPlan(14);

    } catch (e) {
      viewdata.mensaje = e.message;
    }

    return res.view(viewdata);
  },

/*                               _
                __ _ _ __  _   _| | __ _ _ __
               / _` | '_ \| | | | |/ _` | '__|
              | (_| | | | | |_| | | (_| | |
               \__,_|_| |_|\__,_|_|\__,_|_|
*/
  anular: async function(req,res) {
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

Date.prototype.fechahora_toString = function() {
  var sprintf = require("sprintf");
  var mes = Array('enero','febrero','marzo','abril','mayo','junio','julio','agosto','setiembre','octubre','noviembre','diciembre');
  return sprintf("%d de %s de %d, %02d:%02d", this.getDate(),mes[this.getMonth()],this.getFullYear(),this.getHours(),this.getMinutes());
};

Date.prototype.fecha_toString = function() {
  var sprintf = require("sprintf");
  var mes = Array('enero','febrero','marzo','abril','mayo','junio','julio','agosto','setiembre','octubre','noviembre','diciembre');
  return sprintf("%d de %s de %d", this.getDate(),mes[this.getMonth()],this.getFullYear());
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

function calcFechaVencimiento() {
  const hoy = new Date();
  return new Date(hoy.getTime() + 24*60*60*1000 * (hoy.getDay()==6 ? 3 : hoy.getDay()>=4 ? 4 : 2));
};

// tomado de paso2
function validar(misHorarios,orientaciones,opciones) {
  var errores = [];
  var cantHoras = 0;
  var grados = {};
  var orientacionesDiferentes = {};
  var opcionesDiferentes = {};
  var asignaturasDiferentes = {};

  // valido que cada práctico tenga su teórico:
  var materias = { 'Teórico':{}, 'Práctico':{} };
  misHorarios.forEach(function(m) {
//    materias[m.TipoDictadoDesc][m.MateriaNombre] = 1;
    cantHoras += m.Horarios ? m.Horarios.split(/,/).length : 0;
    grados[m.GradoId] = 1;
    if (m.GradoId==2 && m.OrientacionId && m.OrientacionId != 1) {
      orientacionesDiferentes[orientaciones.find(function(o){return o.id==m.OrientacionId}).OrientacionDesc] = 1
    }
    if (m.GradoId==3 && m.OpcionId && m.OpcionId != 1) {
      opcionesDiferentes[opciones.find(function(o){return o.id==m.OpcionId}).OpcionDesc] = 1
    }
    if (m.TipoDictadoDesc != 'Práctico') {
      asignaturasDiferentes[m.AsignId] = (asignaturasDiferentes[m.AsignId]+1) || 1;
    }
  });
/*
  for (var materia in materias['Práctico']) {
    if (typeof materias['Teórico'][materia] === 'undefined') {
      errores.push('Falta agregar un teórico de '+materia);
    }
  }
*/
  // valido la cantidad total de horas
  if (cantHoras > 38) {
    errores.push('Has superado el tope de 38 horas de clase');
  }
  // valido la cantidad de grados
  if (Object.keys(grados).length > 2) {
    errores.push('El Plan de estudios no permite inscripciones en más de dos grados o niveles (Art. 4)');
  }
  // valido la cantidad de orientaciones
  if (Object.keys(orientacionesDiferentes).length > 2) {
    errores.push('El Plan de estudios no permite inscripciones en más de dos orientaciones (Art. 4): '+Object.keys(orientacionesDiferentes).join(', '));
  }
  // valido la cantidad de opciones
  if (Object.keys(opcionesDiferentes).length > 2) {
    errores.push('El Plan de estudios no permite inscripciones en más de dos opciones (Art. 4): '+Object.keys(opcionesDiferentes).join(', '));
  }
  // valido materias correlativas
  if (Object.values(asignaturasDiferentes).reduce(function(v,m){ return v || m>1 }, false)) {
    errores.push('No se permiten inscripciones a materias correlativas en el formulario web (Art. 8)');
  }

  return errores;
};
