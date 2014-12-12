#!/bin/env node
//  OpenShift Node application
var express = require('express');
var fs      = require('fs');
var path 	= require('path');
var http 	= require('http');
var fs 		= require('fs');
var execF 	= require('child_process');

var users = {
	0: {
		id_ : null,
		nombre : '',
		color : 'r'
	},
	1: {
		id_ : null,
		nombre : '',
		color : 'a'
	}
};

var ganador = ''
var fichas = [];
var turnoUsuario = 0;
var lectura = fs.createReadStream('jugadas.txt');
/**
 *  Define the application.
 */
 var App = function() {

	//  Scope.
	var self = this;

	/*  ================================================================  */
	/*  Helper functions.                                                 */
	/*  ================================================================  */


	/*  ================================================================  */
	/*  App server functions (main app logic here).                       */
	/*  ================================================================  */

	/**
	 *  Create the routing table entries + handlers for the application.
	 */
	 self.createRoutes = function() {

	 	self.routes = { };

	 	self.routes['/'] = function(req, res) {
	 		res.setHeader('Content-Type', 'text/html');
	 		res.render('index', { title: 'Partyfy' });
	 	};

	 };


	/**
	 *  Initialize the server (express) and create the routes and register
	 *  the handlers.
	 */
	 self.initializeServer = function() {
	 	
	 	self.app = express();
	 	self.app.set('port', (process.env.PORT || 5000))
	 	self.app.set('views', path.join(__dirname, 'views'));
	 	self.app.set('view engine', 'jade');
	 	self.app.use(express.logger('dev'));
	 	self.app.use(express.json());
	 	self.app.use(express.urlencoded());
	 	self.app.use(express.methodOverride());
	 	self.app.use(self.app.router);
	 	self.app.use(express.static(path.join(__dirname, 'static')));

	 	//detect OS
	 	self.os = process.platform
	 	if ('development' == self.app.get('env')) {
	 		self.app.use(express.errorHandler());
	 		console.log("env");
	 	}

		//  Add handlers for the app (from the routes)
		self.createRoutes();
		
		for (var r in self.routes) {
			self.app.get(r, self.routes[r]);
		}
	};


	/**
	 *  Initializes the application.
	 */
	 self.initialize = function() {
	 	self.initializeServer();
	 };


	/**
	 *  Start the server (starts up the application).
	 */
	 self.start = function() {
		//  Start the app on the specific interface (and port).
		self.server = http.Server(self.app)
		self.io = require('socket.io')(self.server);
		
		self.server.listen(self.app.get('port'), function() {
			console.log('%s: Node server started on :%d ...', Date(Date.now() ), self.app.get('port'));
		});

	};

	self.startGame = function(){

		fichas[0] = [];
		fichas[1] = [];
		fichas[2] = [];
		fichas[3] = [];
		fichas[4] = [];
		fichas[5] = [];

		turnoUsuario = 0;
	};

	self.runDLV = function(){
		if (self.os == 'linux')
			execF.exec('./dlv.bin win.dlv jugadas.txt -N=6 -nofacts -silent', dlvResult);
		else{
			if (self.os == "win32") 
				execF.exec('dlv.exe win.dlv jugadas.txt -N=6 -nofacts -silent', dlvResult);
		}
		
	};	

	function dlvResult(err, data){
		if (err) {
			console.log(err);
		}

		//ver si ganó
		else{
			ganador = data.trim();
			
			switch(ganador){
				case '{g(a)}':
				self.io.to(users[1].id_).emit('resultado', {resultado : 'Ganaste'});
				self.io.to(users[0].id_).emit('resultado', {resultado : 'Perdiste'});
				break;

				case '{g(r)}':
				self.io.to(users[0].id_).emit('resultado', {resultado : 'Ganaste'});
				self.io.to(users[1].id_).emit('resultado', {resultado : 'Perdiste'});
				break;

				default:
				break;
			}
		}
	}

	self.addSocketIOEvents = function() {


		self.io.on('connection', function(socket){

			// Sorry ;___;
			if (users[0].nombre === '') {
				socket.usuario = 'Usuario 1';
				users[0].nombre = 'Usuario 1';
				users[0].id_ = socket.id;
				socket.emit('hi', {user: 'Usuario 1', play: true, clase: 'user-1'})
			}
			else{
				if (users[1].nombre === '') {
					socket.usuario = 'Usuario 2';
					users[1].nombre = 'Usuario 2';
					users[1].id_ = socket.id;
					socket.emit('hi', {user: 'Usuario 2', play: true, clase: 'user-2'});
				}
			}

			if (users[0].nombre != '' && users[1].nombre != '') {
				self.io.to(users[0].id_).emit('start');
				self.io.emit('clean');
			}

			socket.on('disconnect', function(){
				//console.log('Desconecto ' + socket.usuario);
				if (socket.usuario === 'Usuario 1') {
					users[0].nombre = '';
					self.io.emit('bye', {mensaje: 'Usuario 1 ha salido'});
				}
				else{
					if (socket.usuario === 'Usuario 2'){
						users[1].nombre = '';
						self.io.emit('bye', {mensaje: 'Usuario 2 ha salido'});
					}
				}

			});

			socket.on('start', function(){
				self.startGame();
				//console.log('juego iniciado');
				self.io.to(users[0].id_).emit('tu turno');
				self.io.to(users[1].id_).emit('espera turno');
				//limpiar archivo
				fs.writeFile('jugadas.txt', '' , function(err){
					if(err){
						console.log(err);
					}
				});

			});

			socket.on('movimiento', function(ficha){
				if (socket.id == users[turnoUsuario].id_) {
					//validar movimiento
					var casilla = {};
					var jugada = "";
					//console.log(ficha)
					if (fichas[ficha].length < 6) {
						casilla.col = ficha + 1
						casilla.fila = fichas[ficha].push(1);
						casilla.user = turnoUsuario+1;

						//procesar movimiento
						//console.log(casilla);
						self.io.emit('movimiento', casilla);
						//escribir archivo
						jugada = 'casilla(' + casilla.col + ',' + casilla.fila +',' + users[turnoUsuario].color + ').\n';
						fs.appendFileSync('jugadas.txt',jugada),function(err){
							console.log(err);
							if (err) {
								console.log(err);
							}
						}

						//ejecutar dlv
						self.runDLV();
						//ajustar variables de turno
						self.io.to(users[turnoUsuario].id_).emit('espera turno');
						turnoUsuario = turnoUsuario == 0? 1 : 0;
						self.io.to(users[turnoUsuario].id_).emit('tu turno');
					}
				}

				self.io.emit('pintar',{col: 0, fila: 0, usuario: 0});
			});

});


};


};	/*  Application.  */ 


/**
 *  main():  Main code.
 */
 var conecta4 = new App();
 conecta4.initialize();
 conecta4.start();
 conecta4.addSocketIOEvents();