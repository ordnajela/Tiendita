var person = require('./models/Person');
var usuario = require('./models/Usuario');
var transaccion = require('./models/Transaccion');
// var queja = require('./models/Queja');
var producto = require('./models/Producto');
// var precio = require('./models/Precio');
var notificacion = require('./models/Notificacion');
// var envio = require('./models/Envio');
var detalleTransaccion = require('./models/DetalleTransaccion');
var categoria = require('./models/Categoria');

var methods = {
  savePerson: function(req, res, personInfo)
  {
    console.log("savin\' one person");
    if(!personInfo.name || !personInfo.age || !personInfo.nationality){
       res.render('show_message', {message: "Sorry, you provided worng info", type: "error"});
    } else {
       var newPerson = new person({
          name: personInfo.name,
          age: personInfo.age,
          nationality: personInfo.nationality
       });

       newPerson.save(function(err, Person){
          if(err)
          res.render('show_message', {message: err, type: "error"});
          else
          res.render('show_message', {message: "New person added", type: "success", person: personInfo});
       });
    }
  },

  getAllPeople : function(req, res)
  {
    console.log("gettin\' all the people");
    person.find(function(err, response){
       res.json(response);
    });
  },

  findProductos : function(criteria, call)
  {
    var dbResponse;
    producto.find(criteria, function(err, productos) {
      // console.log("productos = "+JSON.stringify(productos));
      if (err) {
        dbResponse = {"error" : true, "message" : err};
        call(dbResponse, null);
      } else if(!productos){
        dbResponse = {"error" : true, "message" : "No hay productos en la BD"};
        call(dbResponse, null);
      } else {
        dbResponse = {"error" : false, "message" : "Productos encontrados"};
        call(dbResponse, productos);
      }
    });
  },

  findCategorias : function(criteria, call)
  {
    var dbResponse;
    categoria.find(criteria, function(err, categorias) {
      // console.log("productos = "+JSON.stringify(productos));
      if (err) {
        dbResponse = {"error" : true, "message" : err};
        call(dbResponse, null);
      } else if(!categorias){
        dbResponse = {"error" : true, "message" : "No hay categorías en la BD"};
        call(dbResponse, null);
      } else {
        dbResponse = {"error" : false, "message" : "Categorías encontradas"};
        call(dbResponse, categorias);
      }
    });
  },

  findUsuarios : function(criteria, call)
  {
    var dbResponse;
    usuario.find(criteria, function(err, usuarios){
      if (err) {
        dbResponse = {"error" : true, "message" : err};
        call(dbResponse, null);
      } else if(usuarios == null){
        dbResponse = {"error" : true, "message" : "Usuario no encontrado"};
        call(dbResponse, null);
      } else {
        dbResponse = {"error" : false, "message" : "Usuario encontrado"};
        call(dbResponse, usuarios);
      }
    });
  },

  findTransacciones : function(criteria, call)
  {
    var dbResponse;
    transaccion.find(criteria, function(err, transacciones){
      if (err) {
        dbResponse = {"error" : true, "message" : err};
        call(dbResponse, null);
      } else if(transacciones == null){
        dbResponse = {"error" : true, "message" : "Transacciones no encontradas"};
        call(dbResponse, null);
      } else {
        dbResponse = {"error" : false, "message" : "Transacciones encontradas"};
        call(dbResponse, transacciones);
      }
    });
  },

  findDetalles : function(criteria, call)
  {
    var dbResponse;
    detalleTransaccion.find(criteria, function(err, detalles){
      if (err) {
        dbResponse = {"error" : true, "message" : err};
        call(dbResponse, null);
      } else if(detalles == null){
        dbResponse = {"error" : true, "message" : "Detalles no encontrados"};
        call(dbResponse, null);
      } else {
        dbResponse = {"error" : false, "message" : "Detalles encontrados"};
        call(dbResponse, detalles);
      }
    });
  },

  findNotificaciones : function(criteria, call) {
    var dbResponse;
    notificacion.find(criteria, function(err, notificaciones){
      if (err) {
        dbResponse = {"error" : true, "message" : err};
        call(dbResponse, null);
      } else if(notificaciones == null){
        dbResponse = {"error" : true, "message" : "Notificaciones no encontradas"};
        call(dbResponse, null);
      } else {
        dbResponse = {"error" : false, "message" : "Notificaciones encontradas"};
        call(dbResponse, notificaciones);
      }
    });
  },

  deleteUsuario : function(criteria, call)
  {
    var dbResponse;
    usuario.find(criteria).remove(function(err){
      if (err) {
        dbResponse = {"error" : true, "message" : err};
        call(dbResponse, null);
      } else {
        dbResponse = {"error" : false, "message" : "Usuario eliminado"};
        call(dbResponse);
      }
    });
  },

  deleteTransaccion : function(criteria, call)
  {
    var dbResponse;
    transaccion.find(criteria).remove(function(err){
      if (err) {
        dbResponse = {"error" : true, "message" : err};
        call(dbResponse, null);
      } else {
        dbResponse = {"error" : false, "message" : "Transaccion eliminada"};
        call(dbResponse);
      }
    });
  },

  insertUsuario : function(usrData, call)
  {
    var dbResponse;
    if( !usrData.nickname || !usrData.pass || !usrData.nombre ){
      dbResponse = {"error" : true, "message" : "Faltan datos obligatorios"};
      call(dbResponse, null);
    }
    var newUsuario = new usuario({
      nickname : usrData.nickname,
      pass : usrData.pass,
      nombre : usrData.nombre
    });
    newUsuario.save(function(err, savedUsr){
      if(err){
        dbResponse = {"error" : true, "message" : err};
        call(dbResponse, null);
      }
      else {
        dbResponse = {"error" : false, "message" : "Guardado con éxito"};
        call(dbResponse, savedUsr);
      }
    });
  },

  updateUsuario : function(criteria, usuarioData, call)
  {
    var dbResponse;
    usuario.update(criteria, usuarioData, function(err, count, status) {
      call(err, count, status);
    });
  },

  insertProducto : function(productoData, call)
  {
    var dbResponse;
    // TODO: agregar validaciones necesarias
    var newProducto = new producto({
      nombre : productoData.nombre,
      descripcion : productoData.descripcion,
      etiquetas : productoData.etiquetas,
      foto : productoData.foto
    });
    newProducto.save(function(err, savedProducto) {
      call(savedProducto);
    });
  },

  insertTransaccion : function(transaccionData, call)
  {
    var dbResponse;
    // TODO: agregar validaciones necesarias
    var newTransaccion = new transaccion({
      idUsuario : transaccionData.idUsuario,
      fecha : Date.now(),
      total : transaccionData.total
    });
    newTransaccion.save(function(err, savedTransaccion) {
      if (err) {
        dbResponse = {"error" : true, "message" : err};
        call(dbResponse, null);
      } else if(savedTransaccion == null){
        dbResponse = {"error" : true, "message" : "Los detalles de la transacción son nulos"};
        call(dbResponse, null);
      } else {
        dbResponse = {"error" : false, "message" : "Detalles insertados"};
        call(dbResponse, savedTransaccion);
      }
    });
  },

  insertDetalles : function(detallesArr, call)
  {
    var dbResponse;
    detalleTransaccion.insertMany(detallesArr, function(err, insertedDetalles) {
      if (err) {
        dbResponse = {"error" : true, "message" : err};
        call(dbResponse, null);
      } else if(insertedDetalles == null){
        dbResponse = {"error" : true, "message" : "Los detalles de la transacción son nulos"};
        call(dbResponse, null);
      } else {
        dbResponse = {"error" : false, "message" : "Detalles insertados"};
        call(dbResponse, insertedDetalles);
      }
    });
  },

  insertNotificaciones : function(notificacionesArr, call) {
    var dbResponse;
    notificacion.insertMany(notificacionesArr, function(err, insertedNotificaciones) {
      if (err) {
        dbResponse = {"error" : true, "message" : err};
        call(dbResponse, null);
      } else if(insertedNotificaciones == null){
        dbResponse = {"error" : true, "message" : "Las notificaciones son nulas"};
        call(dbResponse, null);
      } else {
        dbResponse = {"error" : false, "message" : "Notificaciones insertadas"};
        call(dbResponse, insertedNotificaciones);
      }
    });
  },

  updateProducto : function(criteria, productoData, call)
  {
    var dbResponse;
    producto.update(criteria, productoData, {"multi" : true}, function(err, count, status) {
      call(err, count, status);
    });
  },

  updateNotificacion : function(criteria, notificacionData, call) {
    notificacion.update(criteria, notificacionData, function(err, count, status) {
      call(err, count, status);
    });
  },

  insertCategoria : function(categoriaData, call)
  {
    var dbResponse;
    // TODO: agregar validaciones necesarias
    var newCategoria = new categoria({
      nombre : categoriaData.nombre
    });
    newCategoria.save(function(err, savedCategoria) {
      call(savedCategoria);
    });
  },

  authenticateUser : function(credentials, call)
  {
    var dbResponse;
    if( !credentials.nick || !credentials.pass ){
      dbResponse = {"error" : true, "message" : "Faltan datos obligatorios"};
      call(dbResponse, null);
    } else {
      usuario.findOne({"nickname" : credentials.nick, "pass" : credentials.pass}, function(err, usrFound){
        if (err) {
          dbResponse = {"error" : true, "message" : err};
          call(dbResponse, null);
        } else if(usrFound == null) {
          dbResponse = {"error" : true, "message" : "Usuario no encontrado"};
          call(dbResponse, null);
        } else {
          dbResponse = {"error" : false, "message" : "Usuario encontrado"};
          call(dbResponse, usrFound);
        }
      });
    }
  },

  validateSession : function(sessionId, call)
  {
    var dbResponse;
    if(!sessionId) {
      dbResponse = {"error" : true, "message" : "No se ha enviado sessionId"};
      call(dbResponse, null);
    } else {
      usuario.findOne({"_id" : sessionId}, function(err, usrFound) {
        if (err) {
          dbResponse = {"error" : true, "message" : err};
          call(dbResponse, null);
        } else if(usrFound == null) {
          dbResponse = {"error" : true, "message" : "Sesión no válida"};
          call(dbResponse, null);
        } else {
          dbResponse = {"error" : false, "message" : "Sesión encontrada"};
          call(dbResponse, usrFound);
        }
      });
    }
  }
};
module.exports = methods;
