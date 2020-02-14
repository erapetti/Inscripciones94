
module.exports = {

  memcached: [ '127.0.0.1:11211' ],
  memcachedTTL: 24*60*60, //1d
  memcachedmaxKeySize: 250,

  prefix: {
    liceosConHorarios: 'I94::LCH:',
    dependDesc: 'I94::DD:',
    curricula: 'I94::CC:',
    asignaturasPlan: 'I94::AP:',
    horarios: 'I94::H:',
    vacantes: 'I94::V:',
    grupoCursoMateria: 'I94::GCM:',
    grupoMateria: 'I94::GM:',
  },

};
