var mongoose = require('mongoose');
var categoriaSchema = mongoose.Schema({
  nombre : String
});
var Categoria = mongoose.model("Categoria", categoriaSchema);
module.exports = Categoria;
