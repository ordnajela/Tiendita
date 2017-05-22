var mongoose = require('mongoose');
var detalleTransaccionSchema = mongoose.Schema({
  idTransaccion : String,
  idProducto : String,
  precio : Number
});
var DetalleTransaccion = mongoose.model("DetalleTransaccion", detalleTransaccionSchema);
module.exports = DetalleTransaccion;
