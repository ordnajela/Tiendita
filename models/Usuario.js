var mongoose = require('mongoose');
var usuarioSchema = mongoose.Schema({
  nickname : String,
  pass : String,
  nombre : String,
  direccion : {ciudad : String, estado : String, pais : String},
  email : String,
  foto : String
});
var Usuario = mongoose.model("Usuario", usuarioSchema);
module.exports = Usuario;
