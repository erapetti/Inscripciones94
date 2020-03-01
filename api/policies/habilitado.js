/**
 * habilitado
 *
 * @module      :: Policy
 * @description :: Verifica que el programa esté habilitado en la fecha actual
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

 module.exports = async function(req, res, next) {

   const hoy = new Date();

   let viewdata = {
     id:"error",
     onlyError:true,
     title: "Inscripciones para Plan 1994<small> (turno nocturno)</small>",
   };

   if (hoy < sails.config.custom.habilitado.desde) {
     viewdata.mensaje = "Las inscripciones web se habilitan el "+sails.config.custom.habilitado.desde.fecha_toString();
     return res.view("pages/error",viewdata);
   }

   if (hoy > sails.config.custom.habilitado.hasta) {
     viewdata.mensaje = "Ya terminó el período para las inscripciones web.";
     return res.view("pages/error",viewdata);
   }

   return next();
 };
