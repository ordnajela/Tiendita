var express = require('express');
var router = express.Router();
var dbHandler = require('./DataBaseHandler');

/* DRAFT */
function checkSession(req, res, next) {
	var originalPath = req.path.substring(1);
	var sessionId = req.session.tiendita_sid;
	var call = function(dbResponse, usr) {
		if(dbResponse.error){
			res.redirect('/login?redirectedFrom=' + originalPath);
		} else {
			next();
		}
	};
	dbHandler.validateSession(sessionId, call);
};
/* DRAFT */


router.get('/', function(req, res){
	res.redirect('/home');
});
router.get('/login', function(req, res){
	var redirectedFrom = req.query.redirectedFrom != null ? req.query.redirectedFrom : "";
	res.render('login', {"redirectedFrom" : redirectedFrom});
});
router.post('/login', function(req, res){
	var redirectedFrom = req.query.redirectedFrom;
	// console.log("redirectedFrom = " + redirectedFrom);
	// console.log("query = " + JSON.stringify(req.query));
	var credentials = req.body;
	var call = function(dbResponse, usr) {
		if(dbResponse.error){
			res.send(dbResponse.message);
		} else{
			req.session.tiendita_sid = usr["_id"];
			if (redirectedFrom != null) {
				res.redirect('/' + redirectedFrom);
			} else {
				res.redirect('/home');
			}
		}
	};
	dbHandler.authenticateUser(credentials, call);
});
router.get('/home', checkSession, function(req, res) {
	var sessionId = req.session.tiendita_sid;
	var call = function(dbResponse, usuarios) {
		usr = usuarios ? usuarios[0] : null;
		if(dbResponse.error){
			res.send(dbResponse.message);
		} else{
			if (usr) {
				// TODO: hacer query de productos relevantes
				var productosCall = function(prodDbresp, productos) {
					res.render('home', {"usuario" : usr, "productos" : productos});
				};
				dbHandler.findProductos({"idPropietario" : {"$ne" : usr["_id"]}, "vendido" : false}, productosCall);
			} else {
				res.redirect('/login');
			}
		}
	};
	dbHandler.findUsuarios({"_id" : sessionId}, call);
});
router.get('/perfil/:nickname', checkSession, function(req, res) {
	var nickname = req.params.nickname;
	var call = function(dbResponse, usuarios) {
		var usuario = usuarios ? usuarios[0] : null;
		if(dbResponse.error){
			res.send(dbResponse.message);
		} else if(!usuario){
			res.send('Error, usuario no encontrado');
		} else {
			var callProductos = function(prodDbresp, productos) {
				if(prodDbresp.error) {
					res.send(prodDbresp.message);
				} else {
					var callTrans = function(transDbresp, transacciones) {
						if (transDbresp.error) {
							res.send(transDbresp.message);
						} else {
							res.render('perfil', {"usuario" : usuario, "productos" : productos, "transacciones" : transacciones});
						}
					};
					dbHandler.findTransacciones({"idUsuario" : usuario._id}, callTrans);
				}
			};
			dbHandler.findProductos({"idPropietario" : usuario["_id"]}, callProductos);
		}
	};
	dbHandler.findUsuarios({"nickname" : nickname}, call);
});
router.get('/detalle/producto/:id', checkSession, function(req, res) {
	var usuarioId = req.session.tiendita_sid;
	var productoId = req.params.id;
	var call = function(dbResponse, productos) {
		var producto = productos ? productos[0] : null;
		if (dbResponse.error) {
			res.send(dbResponse.message);
		} else if(!producto){
			res.send("Producto no encontrado");
		} else {
			if (req.query.visto) {
				var notificacionId = req.query.visto;
				var callNotificacion = function() {
					res.render("detalle_producto", {"producto" : producto, "usuarioId" : usuarioId});
				};
				dbHandler.updateNotificacion({"_id" : notificacionId}, {"visto" : true}, callNotificacion);
			} else {
				res.render("detalle_producto", {"producto" : producto, "usuarioId" : usuarioId});
			}
		}
	};
	dbHandler.findProductos({"_id" : productoId}, call);
});
router.post('/agregarcarrito',checkSession, function(req, res) {
	var carrito = [];
	var productoId = req.body.id;
	if (req.cookies.carrito) {
		carrito = JSON.parse(req.cookies.carrito);
	}
	var duplicado = false;
	for (let pId of carrito) {
		if(pId == productoId) {
			duplicado = true;
			break;
		}
	}
	if (!duplicado) {
		carrito.push(productoId);
	}
	res.cookie('carrito', JSON.stringify(carrito));
	res.redirect('/carrito');
});
router.post('/elimnarcarrito',checkSession, function(req, res) {
	var productoId = req.body.id;
	var carrito = [];
	if(req.cookies.carrito) {
		carrito = JSON.parse(req.cookies.carrito);
	}
	for (let i = carrito.length-1; i >= 0; i--) {
		if(carrito[i] == productoId) {
			carrito.splice(i, 1);
			break;
		}
	}
	res.cookie('carrito', JSON.stringify(carrito));
	res.redirect('/carrito');
});
router.post('/comprarcarrito',checkSession, function(req, res) {
	var productos = JSON.parse(req.body.productosStr);
	var productosIds = [];
	var usuarioId = req.session.tiendita_sid;
	var total = 0;
	for (let producto of productos) {
		total += producto.precio;
		productosIds.push(producto._id);
	}
	console.log("productosIds = " + productosIds);
	var transaccionData = {"idUsuario" : usuarioId, "fecha" : Date.now(), "total" : total};
	var call = function(dbResponse, transaccion) {
		if (dbResponse.error) {
			res.send(dbResponse.message);
		} else {
			var detalles = [];
			var notificaciones = [];
			for (let producto of productos) {
				var detalle = {};
				detalle.idTransaccion = transaccion._id;
				detalle.idProducto = producto._id;
				detalle.precio = producto.precio;
				detalles.push(detalle);
				var notificacion = {};
				notificacion.idUsuario = producto.idPropietario;
				notificacion.idProducto = producto._id;
				notificacion.idTransaccion = transaccion._id;
				notificacion.mensaje = "Su producto ha sido vendido";
				notificacion.visto = false;
				notificaciones.push(notificacion);
			}
			var callDetalles = function(detDbresp, detallesArr) {
				if (detDbresp.error) {
					res.send(detDbresp.message);
				} else {
					var callNotificaciones = function(notDbresp, notificacionesArr) {
						var callProductos = function(err, count, status) {
							console.log("COUNT = " + JSON.stringify(count));
							res.cookie('carrito', JSON.stringify([]));
							res.redirect('/carrito');
						};
						dbHandler.updateProducto({"_id" : {"$in" : productosIds}}, {"vendido" : true}, callProductos);
					};
					dbHandler.insertNotificaciones(notificaciones, callNotificaciones);
				}
			};
			dbHandler.insertDetalles(detalles, callDetalles);
		}
	};
	dbHandler.insertTransaccion(transaccionData, call);
});
router.get('/carrito', checkSession, function(req, res) {
	var call = function(dbResponse, productos) {
		if (dbResponse.error) {
			res.send(dbResponse.message);
		} else {
			var total = 0;
			for (let producto of productos) {
				total += producto.precio;
			}
			res.render('carrito', {"productos" : productos, "productosStr" : JSON.stringify(productos), "total" : total});
		}
	};
	var ids = [];
	if(req.cookies.carrito) {
		ids = JSON.parse(req.cookies.carrito);
		dbHandler.findProductos({"_id" : {"$in" : ids}}, call);
	} else {
		call({"error" : false, "message" : ""}, []);
	}
});
router.get('/transaccion/:id', checkSession, function(req, res) {
	var transaccionId = req.params.id;
	var usuarioId = req.session.tiendita_sid;
	var call = function(dbResponse, transacciones) {
		if (dbResponse.error) {
			res.send(dbResponse.message);
		} else {
			var transaccion = transacciones[0];
			var callDetalles = function(detDbresp, detalles) {
				if (detDbresp.error) {
					res.send(detDbresp.message);
				} else {
					var prodIds = [];
					for (let i = 0; i < detalles.length; i++)
						prodIds.push(detalles[i].idProducto);
					var callProductos = function(prodDbresp, productos) {
						if (detDbresp.error) {
							res.send(detDbresp.message);
						} else {
							var prodNameById = {};
							for (let producto of productos){
								prodNameById[producto._id] = producto.nombre;
							}
							for (let i = 0; i < detalles.length; i++) {
								detalles[i]["nombre"] = prodNameById[detalles[i].idProducto];
							}
							var callUsuario = function(usrDbresp, usuarios) {
								if (usrDbresp.error) {
									res.send(usrDbresp.message);
								} else {
									var usuario = usuarios[0];
									res.render('transaccion', {"transaccion" : transaccion, "detalles" : detalles, "usuario" : usuario});
								}
							};
							dbHandler.findUsuarios({"_id" : usuarioId}, callUsuario);
						}
					};
					dbHandler.findProductos({"_id" : {"$in" : prodIds}}, callProductos);
				}
			};
			dbHandler.findDetalles({"idTransaccion" : transaccion._id}, callDetalles);
		}
	};
	dbHandler.findTransacciones({"_id" : transaccionId}, call);
});
router.get('/notificaciones', checkSession, function(req, res) {
	var usuarioId = req.session.tiendita_sid;
	var call = function(dbResponse, usuarios) {
		var usuario = usuarios ? usuarios[0] : null;
		if(dbResponse.error){
			res.send(dbResponse.message);
		} else{
			var call =function (dbResponse, notificaciones) {
				if (dbResponse.error) {
					res.send(dbResponse.message);
				} else {
					res.render("notificaciones", {"usuario" : usuario, "notificaciones" : notificaciones});
				}
			};
			dbHandler.findNotificaciones({"idUsuario" : usuarioId, "visto" : false}, call);
		}
	};
	dbHandler.findUsuarios({"_id" : usuarioId}, call);
});
router.get('/manage/productos', function(req, res) {
	var call = function(dbResponse, productos) {
		// console.log("productos = " + JSON.stringify(productos));
		var callCategorias = function(catResponse, categorias) {
			var callPropietarios = function(porpResponse, propietarios) {
				res.render('manage_productos', {"productos" : productos, "categorias" : categorias, "propietarios" : propietarios});
			};
			dbHandler.findUsuarios({}, callPropietarios);
		};
		dbHandler.findCategorias({}, callCategorias);
	};
	dbHandler.findProductos({}, call);
});
router.post('/insert/producto', function(req, res) {
	var productoData = req.body;
	if (req.query.propietario) {
		productoData.idPropietario = req.session.tiendita_sid;
	}
	productoData.vendido = req.body.vendido != null;
	console.log("productoData = " + JSON.stringify(productoData));
	var call = function(producto) {
		res.send(producto);
	};
	dbHandler.insertProducto(productoData, call);
});
router.post('/update/producto/:id', function(req, res) {
	var productoId = req.params.id;
	var productoData = req.body;
	productoData.vendido = req.body.vendido != null;
	console.log("productoData = " + JSON.stringify(productoData));
	var call = function(err, count, status) {
		res.send(status);
	};
	dbHandler.updateProducto({"_id" : productoId}, productoData, call);
});
router.post('/insert/categoria', function(req, res) {
	var categoriaData = req.body;
	var call = function(categoria) {
		res.send(categoria);
	};
	dbHandler.insertCategoria(categoriaData, call);
});

router.get('/manage/usuarios', function(req, res) {
	var call = function(dbResponse, usuarios) {
		res.render('manage_usuarios', {"usuarios" : usuarios});
	};
	dbHandler.findUsuarios({}, call);
});
router.post('/insert/usuario', function(req, res) {
	var usuarioData = req.body;
	var call = function(usuario) {
		res.send(usuario);
	};
	dbHandler.insertUsuario(usuarioData, call);
});
router.post('/update/usuario/:id', function(req, res) {
	var usuarioId = req.params.id;
	var usuarioData = req.body;
	var call = function(err, count, status) {
		res.send(status);
	};
	dbHandler.updateUsuario({"_id" : usuarioId}, usuarioData, call);
});
router.post('/delete/usuario', function(req, res) {
	var usuarioId = req.body.id;
	var call = function(dbResponse) {
		res.send("borrado");
	};
	dbHandler.deleteUsuario({"_id" : usuarioId}, call);
});
router.get('/nuevoproducto', checkSession, function(req, res) {
	var callCategorias = function(catResponse, categorias) {
		res.render('nuevoproducto', {"categorias" : categorias});
	};
	dbHandler.findCategorias({}, callCategorias);
});
router.post('/delete/transaccion', function(req, res) {
	var transaccionId = req.body.id;
	var call = function(dbResponse) {
		res.redirect('/manage/transacciones');
	};
	dbHandler.deleteTransaccion({"_id" : transaccionId}, call);
});
router.get('/manage/transacciones', function(req, res) {
	var call = function(dbResponse, transacciones) {
		res.render('manage_transacciones', {"transacciones" : transacciones});
	};
	dbHandler.findTransacciones({}, call);
});
router.get('/logout', function(req, res) {
	req.session.destroy();
	res.redirect('/login');
});

// 4 0 4
router.get('*', checkSession,function(req, res) {
	res.render('error404');
});

//export this router to use in our index.js
module.exports = router;
