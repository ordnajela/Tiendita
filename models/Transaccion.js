var mongoose = require('mongoose');
var transaccionSchema = mongoose.Schema({
  idUsuario : String,
  fecha : Date,
  total : Number
});
var Transaccion = mongoose.model("Transaccion", transaccionSchema);
module.exports = Transaccion;
