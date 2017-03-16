/*
posiciones de jugadores en array
entrenador 0 (pos camara)
lanzador 1
receptor 2
1a base  3
2a base  4
3a base  5
SS		  6	
left field   7
center field   8
right field   9
*/
var data = { 	idSource:   "",	idDestiny: "",	message: "", posicion: "",	type: "",	avatar: "",	color: ""	};
var myUser =  { 	id: "",			avatar:   "",	surname: "",	numPosicion: "" , posicion: ""			 };

var room_name = "Hood";
var timer = null;
var users_active=[];
var cams=[];
var miPosicion;
var miEsfera;
var activo= false;

function appendImage(tag,src){
	var img = document.createElement("img");
	img.src = src;
	var src = document.getElementById(tag);
	src.appendChild(img);
}
function findUser(id){
	for (var i = 0, j = users_active.length; i < j; i++) {
        if (users_active[i].id === id)
            return users_active[i];
    }
}
function userExists(id){
	for (var i = 0, j = users_active.length; i < j; i++){
        if (users_active[i].id === id){
            return true;
		}
    }
	return false;
}
function usernotExists(id){
	var aux=0;		
	for (var i = 0, j = users_active.length; i < j; i++){
        if (users_active[i].id === id){
			aux =1;  
		}
    }
	if (aux!=1) {
		return true;
	}return false;
}

//connect to the server
var server = new SillyClient();
server.connect("84.89.136.194:9000", room_name);

//this method is called when the user gets connected to the server
server.on_ready = function( id ){
	//user connected to server
	myUser.id = id;
};

//this methods receives messages from other users (author_id its an unique identifier)
server.on_message = function( author_id, msg ){
	//message received
	var data = JSON.parse(msg);
	
	//filtrar mensajes por tipo
	if (data.type == "login" ){
		// SI no existe, pinta el usuario como conectado
		if ((usernotExists(data.idSource))){
			var user_mensaje= { idSource:   "",	idDestiny: "",	message: "", posicion: "",	type:"",	avatar: "",	color: ""};
			user_mensaje.id = data.idSource;
			user_mensaje.surname = data.message;
			user_mensaje.avatar = data.avatar;
			user_mensaje.posicion = data.posicion;
			users_active.push(user_mensaje);
			// creamos html para el chat de user
			$(".container-users").append( 
				"<div class= \"container-user\" id = \"" + user_mensaje.id + "\">" +
					"<div class= \"user_avatar\">"+ "<img src= \"" + user_mensaje.avatar + "\">"+
					"</div>"+
					"<div class= \"user_surname\"><h4>"+ user_mensaje.surname + " - jugando de "+ user_mensaje.posicion +  " </h4>"+
					"</div>"+
				"</div>");
		}
	}
	if (data.type == "chat-BC" ){
		var user_chat= { idSource:   "",	idDestiny: "",	message: "",	type: "",	avatar: "",	color: ""};
		user_chat = findUser(data.idSource);
		$("#chat-BC").append("<p class='msg'>" + user_chat.surname.bold() + " said: ".bold()  + data.message +"</p>");
	}
	// movimientos
	if (data.type == "pos" ){
		// SI no soy yo, modificamos el jugador
		if ((usernotExists(data.idSource))){
			// modificando el jugador del user
			// data = Object {id: "12743", type: "pos", objName: 1, posicion: Object}
			jugadores[data.objName].position.copy(data.posicion );
		}
	}
	if (data.type == "rota" ){
			objRotate(data.objName,data.posicion);
	}
	//comandos
	if (data.type == "reset" ){
			resetJugadores();
			if(jugadoresProfe.length >1) {
				for(var i = 0 ; i < posicionesIniciales.length ; i++)		scene.remove(jugadoresProfe[i]);
			}
	}
	if (data.type == "focos" ){
			manejoFocos(data.isOn);
	}
	if (data.type == "jugada" ){
			modoControl = "jugada";	
			if(jugadoresProfe.length >1) {
				for(var i = 0 ; i < posicionesIniciales.length ; i++)		scene.remove(jugadoresProfe[i]);
			}
	}
	if (data.type == "hot" ){
			modoControl = "hot";	
			if(jugadoresProfe.length >1) {
				for(var i = 0 ; i < posicionesIniciales.length ; i++)		scene.remove(jugadoresProfe[i]);
			}
	}
	if (data.type == "stop" ){
		cargarJugadoresProfe(data.posiciones);
	}
};

//this methods is called when a new user is connected
server.on_user_connected = function(msg){
	//new user!
	sendhimInfo(msg); 
};
server.on_user_disconnected = function(msg){
	erase(msg);
};
server.on_close = function(){
	//this methods is called when the server gets closed (its shutdown) 
};


// ON CLICKS
$('.popup-enter').on("click", function(){
	sendlogin();
});
$('.chat-btn').on("click", function(){
	sendmsg();	
});
$('.container-user').on("dblclick", function(){
	createConversation();	
});

// BOTONERA
$('.mover').on("click", function(){
	modoJ = "mover";
});
$('.rotar').on("click", function(){
	modoJ = "rotar";
});
$('.info').on("click", function(){
	 $( '.container-info1' ).fadeIn();
});

//BOTONERA ENTRENADOR
$('.luz').on("click", function(){
	bombilla = !bombilla;
	sendFocos(bombilla);
	manejoFocos(bombilla);
});
$('.reset').on("click", function(){
	resetJugadores();	
	sendReset();
});
$('.play').on("click", function(){
	modoControl = "jugada";	
	resetJugadores();
	sendReset();
	sendModoJugada();
	$('.play').hide();
	$('.stop').show();
	
	$('.hot2').hide();
	$('.hot').show();
});
$('.stop').on("click", function(){
	sendStop();
	$('.stop').hide();
	$('.play').show();
});
$('.hot').on("click", function(){
	resetJugadores();
	sendReset();
	sendHot();
	$('.hot').hide();
	$('.hot2').show(); 
});
$('.info-ent').on("click", function(){
	 $('.container-info2').fadeIn();
});

// BOTONES POPUPS
$('.infobutton1').on("click",function(){
	$('.container-info1').fadeOut();
});

$('.infobutton2').on("click",function(){
	$('.container-info2').fadeOut();
});

//HOVERS - INTERFAZ
$(".container-myUser").hover(function(){
	activo = !activo;
});
$(".container-popup").hover(function(){
	activo = !activo;
});
$(".container-right").hover(function(){
	activo = !activo;
});
$( "#bc-texto" ).focus(function() {
	foco="BC";
});
$("#bc-texto" )
  .focusout(function() {
    foco="";
});

// SENDS
function sendmsg(){
    var message = document.getElementById("bc-texto").value;
    document.getElementById("bc-texto").value ="";
    if(message != ''){
		var datamsg = data;
		datamsg.idSource = myUser.id;
		datamsg.idDestiny = "all";
		datamsg.message = message;
		datamsg.posicion = myUser.posicion;
		datamsg.type = "chat-BC";
		//mensaje en BC(local)
		$(".chat-BC").append("<p class='msg'>" + "Me (".bold() + myUser.id.bold() + "): "  + message +"</p>");
		users_active.push();
		//enviamos mensaje
		var jason = JSON.stringify(datamsg);
		server.sendMessage(jason);
    }	
}

function sendlogin(){
	//generar datos persona local
	myUser.surname = document.getElementById("surname").value;
	document.getElementById("surname").value ="";
	myUser.avatar = document.getElementById("avatar").value;
	if(myUser.avatar.length < 2) myUser.avatar = "images/panda.png"; 
	document.getElementById("avatar").value ="";
	var e = document.getElementById("posicion");
	myUser.posicion = e.options[e.selectedIndex].text;
	myUser.numPosicion = e.options[e.selectedIndex].value;
	// enviar mensaje de nuevo_usuario
	var data_login= data;
		data_login.idSource = myUser.id;
		data_login.idDestiny = "all";
		data_login.message = myUser.surname;
		data_login.type = "login";
		data_login.posicion = myUser.posicion;
		data_login.avatar= myUser.avatar;
		$("#myUser_surname").append("<p class='myInfo'>" + "Hi ".bold() + myUser.surname.bold() + "</p>");
		appendImage("myUser_avatar",data.avatar);
		//enviamos mensaje
		var jason = JSON.stringify(data_login);
		server.sendMessage(jason);
			
	//crear el usuario cogiendo los datos que toquen y previamente validar que estan correctos
	$('.container-popup').hide();
	if (myUser.numPosicion  != 0)	$('.container-ent').hide();
}

function sendhimInfo(id){
	if(myUser.surname != null){
		// enviamos nuestros datos como si fuera un nuevo login
		var data_login= data;
		data_login.idSource = myUser.id;
		data_login.idDestiny = id;
		data_login.message = myUser.surname;
		data_login.type = "login";
		if(myUser.avatar.length < 2) myUser.avatar = "images/panda.png"; 
		data_login.avatar= myUser.avatar;
		data_login.posicion = myUser.posicion;
		
		var jason = JSON.stringify(data_login);
		server.sendMessage(jason);
	}
}

function sendMove(name, pos){
		var data = { id : myUser.id, type : "pos",  objName : name, posicion : pos};
		var jason = JSON.stringify(data);
		server.sendMessage(jason);
}

function sendRotate(name, pos){
		var data = { id : myUser.id, type : "rota",  objName : name, posicion : pos};
		var jason = JSON.stringify(data);
		server.sendMessage(jason);
}

function sendReset(){
		var data = { idSource : myUser.id, type : "reset"};
		var jason = JSON.stringify(data);
		server.sendMessage(jason);
}

function sendFocos(){
		var data = { idSource : myUser.id, type : "focos", isOn: bombilla};
		var jason = JSON.stringify(data);
		server.sendMessage(jason);
}

function sendModoJugada(){
		var data = { idSource : myUser.id, type : "jugada"};
		var jason = JSON.stringify(data);
		server.sendMessage(jason);
}

function sendStop(){
	var pos = [];
	pos.push(0);
	for (var j = 1; j < jugadores.length; j++)	{
		pos.push(jugadores[j].position );
	}
	var data = { idSource : myUser.id, type : "stop", posiciones: pos  };
	var jason = JSON.stringify(data);
	server.sendMessage(jason);
}

function sendHot(){
	modoControl = "hot";
	var data = { idSource : myUser.id, type : "hot"};
	var jason = JSON.stringify(data);
	server.sendMessage(jason);
}

function erase(id){
	var panda = document.getElementById(id);
	panda.parentNode.removeChild(panda);
}


// VARIABLES GLOBALES ESCENA
// standard global variables
var container, scene, renderer, controls, stats,dae,objectControls;
var clock = new THREE.Clock();
var geo ;
var mat ;
var matRed = new THREE.MeshBasicMaterial({color: 0xaa0624});
var matGreen = new THREE.MeshBasicMaterial({color: 0x86f442});
var intersectionPlane;
// custom global variables
var MovingCube;
var topCamera;
var cube;
var tag= "#container-left";
var bombilla=true;
var light;
var Focos=[];
var axes = new THREE.AxisHelper(100);
// jugadores local
var jugadores=[];
var posicionesIniciales=[];
var rotacionesIniciales=[];
// jugadores recibidos
var jugadoresProfe=[];
var posicionesProfe=[];
var rotacionesProfe=[];

var spriteRotar;
var spriteMover;
var modoJ = "mover";
var modoControl = "hot";//  hot = movimiento on time ;   jugada = movimiento en local 

function render() {
	renderer.render( scene, camera );	
}

function randomInt(min,max){
	return Math.floor(Math.random() * (max - min)) + min;
}

// Coloca object en posicion pasada
function position(object,x,y,z){
	// set position of YOUR_OBJECT
	object.position.x = x;
	object.position.y = y;
	object.position.z = z;
}

// GEOMETRIAS
function createCubePos(posicion){
	var geometry = new THREE.BoxGeometry( 1,1,1);
	var material = new THREE.MeshBasicMaterial( { color: 0x00ffff } );
	cube = new THREE.Mesh( geometry, material );
	cube.rotation.x = 20;
	position(cube, posicion.x, posicion.y, posicion.z);
	scene.add( cube );
	render();
}

//camara
function addCamera(){
	 camera = new THREE.PerspectiveCamera( 90, 1, 0.1, 20000 );
	camera.up = new THREE.Vector3(0,1,0);
	camera.lookAt(new THREE.Vector3(0,0,0));
	 position(camera,-3.8779600637210665,0.03267881032517003,-3.9622633308039403);
	 	// camara
	 controls = new THREE.OrbitControls( camera, renderer.domElement );
	 controls.enableZoom = true;
	 controls.enabled= true;
	 controls.maxDistance = 100;
	 controls.maxPolarAngle = Math.PI/2;  
	  // drag
	 var params = {recursive:true};
	objectControls = new ObjectControls( camera,params );
}

// Skydome
function skyDome(){	
	 var skyGeo = new THREE.SphereGeometry(600,60,60);
	 //var skyTexture= THREE.ImageUtils.loadTexture( "images/night2.jpg" ); 
	//var skyTexture= THREE.ImageUtils.loadTexture( "images/day2.jpeg" ); 
	 var skyTexture= THREE.ImageUtils.loadTexture( "images/sky6.jpg" ); 
	 // var skyTexture= THREE.ImageUtils.loadTexture( "images/sky_7.jpg" ); 
	 var material = new THREE.MeshPhongMaterial({ 
         map: skyTexture,
	 });
	 var sky = new THREE.Mesh(skyGeo, material);
     sky.material.side = THREE.BackSide;
     scene.add(sky);
}

// LIGHTS
function setLights(){
	// LUZ AMBIENTE
	var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );   
   // FOCOS 
     //campo
     foco = new THREE.PointLight(0x404040, 0.8, 100, 0.2);
     position(foco,22,12,-3);
     scene.add(foco);
	 Focos.push(foco);
   
    foco = new THREE.PointLight(0x404040, 0.8, 100, 0.2);
    position(foco,75,54,45);
    scene.add(foco);
	Focos.push(foco);
  
    foco = new THREE.PointLight(0x404040, 0.8, 100, 0.2);
    position(foco,42,38,113);
    scene.add(foco);
	Focos.push(foco);
  
    foco = new THREE.PointLight(0x404040, 0.8, 100, 0.2);
    position(foco,192,41,27);
    scene.add(foco);
	Focos.push(foco);
  
     foco = new THREE.PointLight(0x404040, 0.8, 100, 0.2);
     position(foco,28,48,99);
     scene.add(foco);
	 Focos.push(foco);
  
    foco = new THREE.PointLight(0x404040, 0.8, 100, 0.2);
    position(foco,24,31,113);
    scene.add(foco);
	Focos.push(foco);
	
	foco = new THREE.PointLight(0x404040, 0.8, 100, 0.2);
    position(foco,14,40,105);
    scene.add(foco);
	Focos.push(foco);
	
	foco = new THREE.PointLight(0x404040, 0.8, 100, 0.2);
    position(foco,0,10,0);
    scene.add(foco);
	Focos.push(foco);
	
	 // linterna
	 // faul left
     foco = new THREE.PointLight(0x404040, 100, 7, 0.2);
     position(foco,21,54,-53);
     scene.add(foco);
	 Focos.push(foco);
   
    foco = new THREE.PointLight(0x404040, 100, 5, 0.2);
    position(foco,7,54,-55);
    scene.add(foco);
	Focos.push(foco);
  
    foco = new THREE.PointLight(0x404040, 100, 5, 0.2);
    position(foco,33,54,-52);
    scene.add(foco);
	Focos.push(foco);
  
    foco = new THREE.PointLight(0x404040, 100, 9, 0.2);
    position(foco,46,54,-44);
    scene.add(foco);
	Focos.push(foco);
  
     foco = new THREE.PointLight(0x404040, 100, 8, 0.2);
     position(foco,58,54,-44);
     scene.add(foco);
	 Focos.push(foco);
	
	foco = new THREE.PointLight(0x404040, 100, 9, 0.2);
    position(foco,75,57,-44);
    scene.add(foco);
	Focos.push(foco);
	
	foco = new THREE.PointLight(0x404040, 100, 9, 0.2);
    position(foco,14,54,105);
    scene.add(foco);
	Focos.push(foco);
	// left corner
	foco = new THREE.PointLight(0x404040, 100, 10, 0.2);
    position(foco,125,45,0);
    scene.add(foco);
	Focos.push(foco);
	
	foco = new THREE.PointLight(0x404040, 100, 10, 0.2);
    position(foco,125,45,16);
    scene.add(foco);
	Focos.push(foco);
	
	foco = new THREE.PointLight(0x404040, 200, 10, 0.2);
    position(foco,117,4,27);
    scene.add(foco);
	Focos.push(foco);
	
	foco = new THREE.PointLight(0x404040, 200, 20, 0.2);
    position(foco,55,53,19);
    scene.add(foco);
	Focos.push(foco);
	
	//foco cartel
	foco = new THREE.PointLight(0x4f4fff, 0.8, 100, 0.2);
    position(foco,68,20,90);
    scene.add(foco);
	Focos.push(foco);
}

function addLights(){
	for(var i = 0 ; i < Focos.length ; i++){
		scene.add(Focos[i]);
	}
}

function removeLights(){
	for(var i = 0 ; i < Focos.length ; i++){
		scene.remove(Focos[i]);
	}
}

function floor(){
	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/road.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 1, 1 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -7.5;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
}

function planoMovimiento(){
	// plano para mover el objeto
	geo = new THREE.PlaneGeometry( 100000 , 100000 );
	mat = new THREE.MeshNormalMaterial({
		 side: THREE.DoubleSide,
		 transparent:true,
		 opacity:0.02
	});	
	intersectionPlane = new THREE.Mesh( geo , mat );
	intersectionPlane.rotateX(Math.PI / 2);	
	 scene.add(intersectionPlane);
}

function cargarSprites(){
	//move
	var spriteMoverMap = new THREE.TextureLoader().load( "images/amove.png" );
	var spriteMoverMaterial = new THREE.SpriteMaterial( { map: spriteMoverMap, color: 0xffffff } );
	spriteMover = new THREE.Sprite( spriteMoverMaterial );
	scene.add( spriteMover );
	spriteMover.visible =false;
	//rotate
	spriteRotarMap = new THREE.TextureLoader().load( "images/rotate.png" );
	spriteRotarMaterial = new THREE.SpriteMaterial( { map: spriteRotarMap, color: 0xffffff } );
	spriteRotar = new THREE.Sprite( spriteRotarMaterial );
	scene.add( spriteRotar );
	spriteRotar.visible =false;	
}

function manejoFocos(bombilla){
	if(bombilla){
		addLights();
		$('.luz').opacity = 0.5;
	}else{
		removeLights();
		$('.luz').opacity = 1;
	}
}

// JUGADORES
function cargarPosicionesIniciales(){
	posicionesIniciales.push(0); // posicion entrenador
	posicionesIniciales.push( new THREE.Vector3(13.86,-4.3,13.8) );// lanzador
	posicionesIniciales.push( new THREE.Vector3(-2.34,-4.3,-2.28) );// catcher
	posicionesIniciales.push( new THREE.Vector3(4.6,-4.3,30.32) );// 1a
	posicionesIniciales.push( new THREE.Vector3(22,-4.3,40.54) );// 2a
	posicionesIniciales.push( new THREE.Vector3(27,-4.3,3) );// 3a
	posicionesIniciales.push( new THREE.Vector3(39.34,-4.3,17.68) );// SS
	posicionesIniciales.push( new THREE.Vector3(59,-4.3,15) );// left
	posicionesIniciales.push( new THREE.Vector3(55,-4.3,52) );// center
	posicionesIniciales.push( new THREE.Vector3(18,-4.3,57) );// right
}

function cargarRotacionesIniciales(){
	rotacionesIniciales.push(0); // posicion entrenador	
	rotacionesIniciales.push( 2.4* Math.PI / 2 );
	rotacionesIniciales.push(  Math.PI / 4 );
	rotacionesIniciales.push( 2* Math.PI / 2 );
	rotacionesIniciales.push( 2.3* Math.PI / 2 );
	rotacionesIniciales.push( 2.95* Math.PI / 2 );		
	rotacionesIniciales.push( 2.7* Math.PI / 2 );		
	rotacionesIniciales.push( 2.7* Math.PI / 2 );
	rotacionesIniciales.push( 2.6* Math.PI / 2 );		
	rotacionesIniciales.push( 2.2 *Math.PI / 2 );
}

function cargarJugadores(){
	// cargamos los 9 jugadores 
   var loader = new THREE.ColladaLoader(); 
   loader.load('models/p3.dae', function (result) {
		jugadores.push(0);// añadimos al entrenador (inexistente xD)
		for(var i = 1 ; i < posicionesIniciales.length ; i++){
			var jugadorCollada  = result.scene.children[0];
			var jugador= new THREE.Object3D();
			for (var j = 0; j < jugadorCollada.children.length; j++) jugador.add(new THREE.Mesh(jugadorCollada.children[j].geometry, jugadorCollada.children[j].material)); // todas las meshes que componen el jugador
			// Re-escalamos
			jugador.scale.set(0.05,0.05,0.05);
			// Creamos caja para definir el centro
			var box = new THREE.Box3().setFromObject( jugador );
			box.center( jugador.position ); // this re-sets the mesh position
			jugador.position.multiplyScalar( - 1 );		
			// Usaremos la caja en la escena para pivotar el jugador
			var pivot = new THREE.Group();
			position(pivot,posicionesIniciales[i].x,posicionesIniciales[i].y,posicionesIniciales[i].z);
			pivot.add( jugador );
			// Rotamos
			pivot.rotateX(- Math.PI / 2 );
			pivot.rotateZ(rotacionesIniciales[i] );
			pivot.name = i;
			// añadimos al array
			jugadores.push(pivot);
			objHover(pivot); // manejadores
			scene.add( pivot );
		}
	}); 
}

// recibe  un objeto tipo Profe = [posiciones,rotaciones]; TODO
// recibe  un objeto tipo Profe = posiciones; 
function cargarJugadoresProfe(Profe){
	console.log(Profe);
	// cargamos los 9 jugadores 
   var loader = new THREE.ColladaLoader(); 
   loader.load('models/p3.dae', function (result) {
		jugadoresProfe.push(0);// añadimos al entrenador (inexistente xD)
		for(var i = 1 ; i < Profe.length ; i++){
			var jugadorCollada  = result.scene.children[0];
			var jugador= new THREE.Object3D();
			// Cambio de color segun la distancia del jugador sdel profe y el local
			var d = Math.sqrt(
				Math.pow(Profe[i].x-jugadores[i].position.x,2) + Math.pow(Profe[i].z-jugadores[i].position.z,2)
			);
			// meshes hijas
			for (var j = 0; j < jugadorCollada.children.length; j++)	{
				if( d > 6 ) {
					jugador.add(new THREE.Mesh(jugadorCollada.children[j].geometry,matRed)); // todas las meshes que componen el jugador
				}
				else{
					jugador.add(new THREE.Mesh(jugadorCollada.children[j].geometry, matGreen)); // todas las meshes que componen el jugador
				}
			}
			// Re-escalamos
			jugador.scale.set(0.05,0.05,0.05);		
			// Creamos caja para definir el centro
			var box = new THREE.Box3().setFromObject( jugador );
			box.center( jugador.position ); // this re-sets the mesh position
			jugador.position.multiplyScalar( - 1 );			
			// Usaremos la caja en la escena para pivotar el jugador
			var pivot = new THREE.Group();
			position(pivot,Profe[i].x,Profe[i].y,Profe[i].z);
			pivot.add( jugador );			
			// Rotamos
			pivot.rotateX(- Math.PI / 2 );
			pivot.rotateZ(rotacionesIniciales[i] );			
			// añadimos al array
			jugadoresProfe.push(pivot);
			//objHover(pivot); // manejadores
			
			scene.add( pivot );
		}
	}); 
}

function finJugada(Profe){
	cargarJugadoresProfe(Profe);
}

function resetJugadores(){
	for(var i = 0 ; i < posicionesIniciales.length ; i++)		scene.remove(jugadores[i]);
	for(var i = 0 ; i < posicionesIniciales.length ; i++)		objectControls.remove(jugadores[i]);
	jugadores = [];
	cargarJugadores();
}

function init(){
	$('.stop').hide();
	$('.hot').hide();
	$('.hot2').show();
	$('.container-info1').hide();
	$('.container-info2').hide();
	//inicial data
	renderer = new THREE.WebGLRenderer();
	 renderer.setSize( window.innerWidth, window.innerHeight );
	 $(tag).append(renderer.domElement);
	 // ESCENA
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );
	skyDome();
	addCamera();
	setLights(); 
	floor();// suelo exterior
	planoMovimiento(); // Plano manejador movimiento
	// COLLADA LOADER
	//campo 
	var loader = new THREE.ColladaLoader(); // o campo 3
	loader.load('models/campo_8.dae', function (result) {
		dae = result.scene;
		dae.rotateX( -Math.PI / 2 );
		dae.rotateZ(2* Math.PI / 2 );
		//dae.translateZ(-10);
		scene.add(dae);
	  //scene.add(result.scene);
	});
	//jugadores 
	cargarPosicionesIniciales();
	cargarRotacionesIniciales();
	cargarJugadores();
	render();	
	//scene.add( axes );
	cargarSprites();// sprites de control de jugador
} 

function animate() {
    requestAnimationFrame( animate );
	render();		
	update();
	objectControls.update();
}

function update() {// manejador teclado TODO
	
	// var delta = clock.getDelta(); // seconds.
	// var moveDistance = 200 * delta; // 200 pixels per second
	// var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second
	
	// local coordinates

	// local transformations

	// move forwards/backwards/left/right
	/*if ( keyboard.pressed("W") )
		
		alert("W pressed")
	if ( keyboard.pressed("S") )
		alert("S pressed")
	if ( keyboard.pressed("D") )
		alert("D pressed")
	if ( keyboard.pressed("A") )
		alert("A pressed")
*/
	// // rotate left/right/up/down
	// var rotation_matrix = new THREE.Matrix4().identity();
	// if ( keyboard.pressed("A") )
		// MovingCube.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
	// if ( keyboard.pressed("D") )
		// MovingCube.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
	// if ( keyboard.pressed("R") )
		// MovingCube.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
	// if ( keyboard.pressed("F") )
		// MovingCube.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);
	
	// if ( keyboard.pressed("Z") )
	// {
		// MovingCube.position.set(0,25.1,0);
		// MovingCube.rotation.set(0,0,0);
	// }
		
	// // global coordinates
	// if ( keyboard.pressed("left") )
		// MovingCube.position.x -= moveDistance;
	// if ( keyboard.pressed("right") )
		// MovingCube.position.x += moveDistance;
	// if ( keyboard.pressed("up") )
		// MovingCube.position.z -= moveDistance;
	// if ( keyboard.pressed("down") )
		// MovingCube.position.z += moveDistance;
		
	// controls.update();
	// stats.update();
}

init();

animate();

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function spriteFocus(posicion,isOn){
	// Re-escalamos segun la distancia del jugador seleccionado y la camara
	var d = (posicion.distanceTo(camera.position))/20;	
	switch(modoJ){
			case "mover":
				 spriteMover.visible = isOn; 
				 position(spriteMover, posicion.x, posicion.y+3, posicion.z);
				 spriteMover.scale.set(d,d);
				break;
			case "rotar":
				 spriteRotar.visible = isOn; 
				 position(spriteRotar, posicion.x, posicion.y+3, posicion.z);
				 spriteRotar.scale.set(d,d);
				break;
		}	 
}

function objRotate(numJugador,pos){
	var d = (pos.x  - jugadores[numJugador].position.x);
	if (d-6>0) jugadores[numJugador].rotateZ((Math.PI/32));
	else jugadores[numJugador].rotateZ(-(Math.PI/32));
}

function objHover(obj){
	// plano para concretar el hover
	intersectionPlane.visible = true;
	objectControls.add(obj);
	obj.selected = false;
	
	obj.hoverOver = function(){
		//console.log("Panda esta en Hover");
		spriteFocus(this.position,true); 
		controls.enabled = false;
		switch(modoJ){
			case "mover":
				intersectionPlane.position.copy( this.position );
				break;
			case "rotar":
				
		}
    }.bind( obj );

	obj.hoverOut = function(){
		//console.log("Panda esta en out");
		spriteFocus(this.position,false);
		controls.enabled = true;
		switch(modoJ){
			case "mover":
				intersectionPlane.position.copy( this.position );
				break;
			case "rotar":
		}	
		if( this.selected ){
		}else{
		}
    }.bind( obj );

    obj.select = function(){
		//console.log("Panda esta en selected");
	  intersectionPlane.position.copy( this.position );
    }.bind( obj );

    obj.deselect = function(){
		//console.log("Panda esta en deselected");
          this.selected = false;
        }.bind( obj );
		
    obj.update = function(){
		//console.log("Panda esta en update");
          var raycaster = objectControls.raycaster;
          var i = raycaster.intersectObject( intersectionPlane );
		  
          if( !i[0] ){ 
            //console.log( 'something is terribly wrong' );
          }else{
				switch(modoJ){
					case "mover":
						this.position.copy( i[0].point );
						if(modoControl == "hot")sendMove(this.name, i[0].point);
						spriteFocus(this.position,true); 
						break;
					case "rotar":
						objRotate(this.name,i[0].point);
						if(modoControl == "hot")sendRotate(this.name, i[0].point);
				}	 
          }

     }.bind( obj );
	
}
