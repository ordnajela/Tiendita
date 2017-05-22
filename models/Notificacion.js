var mongoose = require('mongoose');
var notificacionSchema = mongoose.Schema({
  idUsuario : String,
  idProducto : String,
  idTransaccion : String,
  mensaje : String,
  visto : {type : Boolean, default : false}
});
var Notificacion = mongoose.model("Notificacion", notificacionSchema);
module.exports = Notificacion;
