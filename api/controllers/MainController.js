/**
 * MainController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 *
 * Ascii art: http://www.network-science.de/ascii/ font:'standard', reflection:no, adjustement:center, stretch:no, width:60
 */

const util = require('util');
const Memcached = require('memcached');
sails.memcached = new Memcached(sails.config.memcached);
sails.memcached.Get = util.promisify(sails.memcached.get);
sails.memcached.Set = util.promisify(sails.memcached.set);
sails.memcached.Increment = util.promisify(sails.memcached.increment);
sails.memcached.Add = util.promisify(sails.memcached.add);


module.exports = {

/*                 _       _      _
                  (_)_ __ (_) ___(_) ___
                  | | '_ \| |/ __| |/ _ \
                  | | | | | | (__| | (_) |
                  |_|_| |_|_|\___|_|\___/
*/
  inicio: async function(req,res) {

    let viewdata = {
      title: 'Inscripciones para Plan 1994<small> (turno nocturno)</small>',
      id: 'inicio',
      vencimiento: (await calcFechaVencimiento()).fecha_toString(),
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
      title: 'Inscripciones para Plan 1994<small> (turno nocturno)</small>',
      id: 'paso1',
      mensaje: undefined,
      cedula: cedula,
      persona: {},
      ultimaInscripcion: {},
      liceos: [],
    };

    try {

      viewdata.persona = await Personas.buscar('UY','CI',cedula);

      viewdata.ultimaInscripcion = await Inscripciones.buscar(viewdata.persona.id, 14);
      if (!viewdata.ultimaInscripcion) {
        viewdata.ultimaInscripcion = {};
        throw new Error('No tienes inscripciones previas en el Plan 1994. Debes realizar la inscripción personalmente en un liceo.');
      }

      const fechaHorarios = calcFechaHorarios();
			const listaLiceosConHorarios = await Dependencias.liceosConHorarios(fechaHorarios, fechaHorarios);

			// filtro liceos piloto
			viewdata.liceos = listaLiceosConHorarios.filter(l => (l.DependId == 1003 /* || l.DependId == 1026 */));

			if (viewdata.liceos.length == 0) {
					throw new Error('En este momento no hay liceos habilitados para realizar inscripciones. Reintente luego');
			}

    } catch (e) {
      viewdata.mensaje = e.message;
      sails.log.error(e.message);
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

		const dependId = req.param('dependid','').checkFormat(/\d+/);
		if (!dependId) {
			return res.redirect(sails.config.custom.basePath+'/');
		}

		let viewdata = {
			title: 'Inscripciones para Plan 1994<small> (turno nocturno)</small>',
      id: 'paso2',
      mensaje: undefined,
			cedula: cedula,
			dependId: dependId,
      dependDesc: '',
      asignaturas: [],
      horarios: [],
      vacantes: [],
      misHorarios: [],
      precisanPractico: [],
    };

    const fechaInicioCurso = calcFechaInicioCurso();

    try {
      const persona = await Personas.buscar('UY','CI',cedula);

			viewdata.dependDesc = await Dependencias.dependDesc(dependId);
			viewdata.asignaturas = await Asignaturas.asignaturasPlan(14);
			viewdata.horarios = await Horarios.get(dependId, fechaInicioCurso);
      viewdata.vacantes = await Cupos.vacantes(dependId, fechaInicioCurso, sails.config.custom.cupoPorMateria, sails.config.custom.cupoPorPractico);
      viewdata.misHorarios = await misHorariosActivos(persona.id);
      viewdata.precisanPractico = await Curricula.precisanPractico();

    } catch (e) {
      viewdata.mensaje = e.message;
      sails.log.error(e.message);
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
    const cedula = req.param('cedula','').checkFormat(/[\d.,;-]+/);
    const dependId = req.param('dependid','').checkFormat(/\d+/);
    let gm;
    try {
      gm = JSON.parse( req.param('gm','').checkFormat(/[,\[\]\{\}:"'A-Za-z0-9]+/) );
    } catch(ignore) { }

    if (!cedula || !dependId || !gm) {
      return res.redirect(sails.config.custom.basePath+'/');
    }

    let viewdata = {
      title: 'Inscripciones para Plan 1994<small> (turno nocturno)</small>',
      id: 'paso3',
      mensaje: undefined,
      cedula: cedula,
      dependId: dependId,
      fecha: (new Date()).fechahora_toString(),
      vencimiento: (await calcFechaVencimiento()).fecha_toString(),
      persona: {},
      dependDesc: '',
      asignaturas: [],
      misHorarios: [],
      orientaciones: [ {id:15,OrientacionDesc:'Humanístico'},{id:16,OrientacionDesc:'Biológico'},{id:17,OrientacionDesc:'Científico'} ],
      opciones: [ {id:13,OpcionDesc:'Derecho',OrientacionId:15},{id:14,OpcionDesc:'Economía',OrientacionId:15},{id:15,OpcionDesc:'Agronomía',OrientacionId:16},{id:16,OpcionDesc:'Medicina',OrientacionId:16},{id:17,OpcionDesc:'Arquitectura',OrientacionId:17},{id:18,OpcionDesc:'Ingeniería',OrientacionId:17} ],
      precisanPractico: [],
    };

    const fechaInicioCurso = calcFechaInicioCurso();

    try {
      viewdata.persona = await Personas.buscar('UY','CI',cedula);
      viewdata.precisanPractico = await Curricula.precisanPractico();
      viewdata.vacantes = await Cupos.vacantes(dependId, fechaInicioCurso, sails.config.custom.cupoPorMateria, sails.config.custom.cupoPorPractico);

      const perId = viewdata.persona.id;
      viewdata.misHorarios = await misHorariosActivos(perId);
      const datosUltCurso = await Inscripciones.ultCurso(perId);
      if (!datosUltCurso) {
        throw new Error('No se encuentran datos del último curso');
      }

      // Inicio una transacción para registrar las inscripciones
      await sails.getDatastore('Estudiantil').transaction(async dbh => {

        viewdata.misHorarios = viewdata.misHorarios.concat( await inscribir(dbh,perId,dependId,gm,fechaInicioCurso,datosUltCurso) );

        const errores = validar(viewdata.misHorarios, viewdata.orientaciones, viewdata.opciones, viewdata.precisanPractico, viewdata.vacantes);
        if (errores.length) {
          sails.log.info('Rollback PerId',perId,errores.join('; '));
          throw new Error(errores.join('<br>'));
        }

      });

      viewdata.dependDesc = await Dependencias.dependDesc(dependId);
			viewdata.asignaturas = await Asignaturas.asignaturasPlan(14);

    } catch (e) {
      viewdata.mensaje = e.message;
      sails.log.error(e.message);
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

Date.prototype.fechahora_toString = function() {
  var sprintf = require('sprintf');
  var mes = Array('enero','febrero','marzo','abril','mayo','junio','julio','agosto','setiembre','octubre','noviembre','diciembre');
  return sprintf('%d de %s de %d, %02d:%02d', this.getDate(),mes[this.getMonth()],this.getFullYear(),this.getHours(),this.getMinutes());
};

Date.prototype.fecha_toString = function() {
  var sprintf = require('sprintf');
  var mes = Array('enero','febrero','marzo','abril','mayo','junio','julio','agosto','setiembre','octubre','noviembre','diciembre');
  return sprintf('%d de %s de %d', this.getDate(),mes[this.getMonth()],this.getFullYear());
};

Date.prototype.fecha_ymd_toString = function() {
        var sprintf = require('sprintf');
        return sprintf('%04d-%02d-%02d', this.getFullYear(),this.getMonth()+1,this.getDate());
};

// la fecha en que los horarios tienen que existir:
function calcFechaHorarios() {
	const mesActual = (new Date()).getMonth();
	const anioActual = (new Date()).getFullYear(); //2019
	const fechaHorarios = (mesActual < 4 ? anioActual+'-04-01' :
													mesActual < 6 ? anioActual+'-'+mesActual+'01' :
													 mesActual < 8 ? anioActual+'-08-01' :
														mesActual < 11 ? anioActual+'-'+mesActual+'01' :
															(anioActual+1)+'-04-01'
	);
	return fechaHorarios;
};

function calcFechaInicioCurso() {
  const hoy = new Date(); // new Date('2019-01-30');
  const fechaInicioCurso = (hoy.getMonth() < 5 ? hoy.getFullYear()+'-03-01' : (hoy.getMonth() < 10 ? hoy.getFullYear()+'-07-01' : (hoy.getFullYear()+1)+'-03-01'));
  return fechaInicioCurso;
};

async function calcFechaVencimiento() {
  const hoy = new Date();
  let dias = sails.config.custom.diasVencimiento; // normalmente el vencimiento es dos días después
  if (hoy.getDay()==6) {
    dias++; // los sábados doy un día más por el domingo
  } else if (hoy.getDay()>=4) {
    dias = dias + 2; // los jueves y viernes doy dos días más
  }
  // sumo un día por cada feriado
  const feriados = await Feriados.get(hoy.getFullYear(),null,null);
  for (let dia=1; dia<=dias; dia++) {
    if (feriados.find(f => f.FeriadoFecha == new Date(hoy.getTime() + 24*60*60*1000 * dia).fecha_ymd_toString())) {
      dias++;
    }
  }
  const vencimiento = hoy.getTime() + 24*60*60*1000 * dias;
  return new Date(vencimiento);
};

// tomado de paso2
function validar(misHorarios,orientaciones,opciones,precisanPractico,vacantes) {
  var errores = [];
  var cantHoras = 0;
  var grados = {};
  var orientacionesDiferentes = {};
  var opcionesDiferentes = {};
  var asignaturasDiferentes = {};

  // valido que cada práctico tenga su teórico:
  var materias = { 'Teórico':{}, 'Práctico':{}, 'precisanPractico':{}, };
  misHorarios.forEach(function(m) {
    materias[m.TipoDictadoDesc][m.MateriaNombre] = 1;
    if (precisanPractico.find(function(pt){ return pt.GradoId==m.GradoId && pt.OrientacionId==m.OrientacionId && pt.OpcionId==m.OpcionId && pt.MateriaId==m.MateriaId})) {
      materias['precisanPractico'][m.MateriaNombre] = 1;
    }
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

    const vac = vacantes.find(v => v.GrupoMateriaId == m.GrupoMateriaId);
    if (vac && vac.vacantes <= 0 ) {
      errores.push('No hay lugares disponibles para la inscripción en '+m.MateriaNombre+' de '+m.GradoId+'º BD');
    }
  });

  for (var materia in materias['Práctico']) {
    if (typeof materias['Teórico'][materia] === 'undefined') {
      errores.push('Falta agregar un teórico de '+materia);
    }
  }
  for (var materia in materias['precisanPractico']) {
    if (typeof materias['Práctico'][materia] === 'undefined') {
      errores.push('Falta agregar un práctico de '+materia);
    }
  }

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

async function misHorariosActivos(perId) {
  let misHorarios = [];

  const fechaInicioCurso = calcFechaInicioCurso();

  const inscripciones = await AlumnosGrupoMateria.activas(perId, fechaInicioCurso);
  if (!inscripciones) {
    return misHorarios;
  }

  let horarios = {};

  // junto los horarios de las materias en las cuales está inscripto:
  for (let i=0; i<inscripciones.length; i++) {
    const datosGM = inscripciones[i];
    if (typeof horarios[datosGM.DependId] === 'undefined') {
      horarios[datosGM.DependId] = await Horarios.get(datosGM.DependId, fechaInicioCurso);
    }

    let h = horarios[datosGM.DependId].find(h => h.GrupoMateriaId==datosGM.GrupoMateriaId && h.GradoId==datosGM.GradoId && (datosGM.GradoId==1 || datosGM.GradoId==2 && h.OrientacionId==datosGM.OrientacionId || datosGM.GradoId==3 && h.OpcionId==datosGM.OpcionId));
    h.EstadosInscriId = datosGM.EstadosInscriId;
    h.InscripcionId = datosGM.id;
    misHorarios.push( h );
  }

  return misHorarios;
};

async function inscribir(dbh,perId,dependId,gm,fechaInicioCurso,datosUltCurso) {

  let nuevosHorarios = [];

  let activas = await Inscripciones.activas(perId, fechaInicioCurso);
  if (!activas) {
    throw new Error('No se pudo obtener la lista de tus inscripciones activas');
  }
  // para cada grupoMateria solicitado lo agrego en INSCRIPCIONES si es necesario
  for (let i=0; i<gm.length; i++) {

    gm[i].id = await buscarCrearInscripcion(dbh,dependId,perId,gm[i],fechaInicioCurso,datosUltCurso,activas);
    gm[i].InscripcionId = gm[i].id;
    gm[i].DependId = dependId;
    gm[i].PlanId = 14;
    gm[i].CicloId = 2;

    // preciso información adicional que la puedo sacar de la consulta de horarios:
    let horariosGM = await Horarios.buscar(dependId, gm[i].GrupoMateriaId, gm[i].GradoId, gm[i].OrientacionId, gm[i].OpcionId, fechaInicioCurso);
    gm[i].MateriaId = horariosGM.MateriaId;
    gm[i].TipoDuracionId = horariosGM.TipoDuracionId;

    if (!activas.find(a => a.id == gm[i].id)) {
      // agrego la inscripción a activas para poder reutilizarla en esta sesión
      activas.push( gm[i] );
    }

    const grupoCurso = (await GrupoCurso.buscar(gm[i].GrupoMateriaId))[0];
    if (!grupoCurso) {
      throw new Error('Error de configuración del curso '+gm[i].GrupoMateriaId);
    }
    const grupoCursoId = grupoCurso.id;

    try {
      await InscripcionesMaterias.agrego(dbh, gm[i].InscripcionId, gm[i].MateriaId, gm[i].TipoDuracionId);
      await InscripcionesGrupoCurso.agrego(dbh, gm[i].InscripcionId, grupoCursoId);
      await AlumnosGrupoMateria.agrego(dbh, gm[i].InscripcionId, gm[i].MateriaId, gm[i].GrupoMateriaId, grupoCursoId);

      horariosGM.InscripcionId = gm[i].InscripcionId;
      nuevosHorarios.push( horariosGM );

      sails.log.info('agrego InscripcionId',gm[i].InscripcionId,'PerId',perId,'MateriaId',gm[i].MateriaId,'GrupoCursoId',grupoCursoId,'GrupoMateriaId',gm[i].GrupoMateriaId);
    } catch (e) {
        throw(e);
    }
  } // end for

  return nuevosHorarios;
};

async function buscarCrearInscripcion(dbh,dependId,perId,datosGM,fechaInicioCurso,datosUltCurso,activas) {
  let inscripcionId;

  // busco si tengo una inscripción al mismo PCGOO:
  const parecidas = activas.filter(i => i.PlanId==14 && i.CicloId==2 && i.GradoId==datosGM.GradoId && (i.GradoId==1 || i.GradoId==2 && i.OrientacionId==datosGM.OrientacionId || i.GradoId==3 && i.OpcionId==datosGM.OpcionId));

  if (!parecidas.length) {
    // no hay una inscripción que pueda reutilizar, agrego una nueva
    const grupoMateriaId = datosGM.GrupoMateriaId;
    const recursa = await Inscripciones.recursa(perId,datosGM.PlanId,datosGM.CicloId,datosGM.GradoId,datosGM.OrientacionId,datosGM.OpcionId,fechaInicioCurso);
    const grupoCurso = (await GrupoCurso.buscar(grupoMateriaId))[0];
    if (!grupoCurso) {
      throw new Error('Error de configuración del curso '+grupoMateriaId);
    }
    const grupoCursoId = grupoCurso.id;
    inscripcionId = await Inscripciones.agrego(dbh, dependId, perId, grupoMateriaId, datosGM.GradoId, datosGM.OrientacionId, datosGM.OpcionId, fechaInicioCurso, datosUltCurso.DependId, datosUltCurso.PlanId, datosUltCurso.UltCursoId, recursa);

  } else {
    // tengo una inscripción para reutilizar
    inscripcionId = parecidas[0].id;
  }

  return inscripcionId;
};
