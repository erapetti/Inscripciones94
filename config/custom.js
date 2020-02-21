/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

module.exports.custom = {

  cupoPorMateria: 40, // máx. cantidad de alumnos por materia
  cupoPorPractico: 20, // máx. cantidad de alumnos en los prácticos
  maximoDiario: 400, // max. inscripciones diarias
  minInscripcionId: 11000000,  // rango de InscripcionId
  maxInscripcionId: 11999999,  // rango de InscripcionId
  horarioLiceo: '19:30 a 23:00', // horario que se muestra en la página
  diasVencimiento: 2,  // cantidad de días hasta el vencimiento de la inscripción

};
