var mongoose = require('mongoose');
var productoSchema = mongoose.Schema({
  nombre : String,
  idPropietario : String,
  descripcion : String,
  vendido : {type : Boolean, default : false},
  etiquetas : String,
  idCategoria : String,
  precio : Number,
  foto : String
});
var Producto = mongoose.model("Producto", productoSchema);
module.exports = Producto;
