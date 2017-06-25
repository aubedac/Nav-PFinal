var mymap;

$('document').ready(function() {
  mymap = L.map('map').fitWorld();
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mymap);
  mymap.locate({setView: true, maxZoom: 13});

  $('#principal .container > *').css('opacity', '0.2');
  $('#principal .row > *').css('opacity', '0.2');
  $('.navbar-inverse .container-fluid .nav .colecciones').css('cursor', 'not-allowed');
  $('.navbar-inverse .container-fluid .nav .instalaciones').css('cursor', 'not-allowed');
  $('.navbar-inverse .container-fluid .nav #guardaColsGH').css('cursor', 'not-allowed');
  $('.navbar-inverse .container-fluid .nav #cargaColsGH').css('cursor', 'not-allowed');
  $('#myModalGuardar button').click(writeRepo);
  $('#myModalCargar button').click(loadRepo);
  $('.navbar-inverse .container-fluid .nav #todosAparca').click(cargarParkings);
  $('#instalaciones .row #usuarios-google button').click(cargarUsuariosGoogle);
  $('#instalaciones').hide();
  $('#colecciones').hide();
  $('#colecciones .row #creaCol button').click(creaColeccion);
});

var aparcamientos;
var aparcamiento;
var aparcamientoGoogle = [];
var aparcamientoSeleccionados = [];

function cargarParkings() {
  $('.navbar-inverse .container-fluid .nav #todosAparca').css('visibility', 'hidden');
  $('.navbar-inverse .container-fluid .nav .instalaciones').click(function() {
    $('#principal').hide();
    $('#instalaciones').show();
    $('#colecciones').hide();
  });
  $('.navbar-inverse .container-fluid .nav .principal').click(function() {
    $('#principal').show();
    $('#instalaciones').hide();
    $('#colecciones').hide();
  });
  $('.navbar-inverse .container-fluid .nav .colecciones').click(function() {
    $('#principal').hide();
    $('#colecciones').show();
    $('#instalaciones').hide();
  });
  $('#principal .container > *').css('opacity', '1');
  $('#principal .row > *').css('opacity', '1');
  $('.navbar-inverse .container-fluid .nav .colecciones').css('cursor', 'default');
  $('.navbar-inverse .container-fluid .nav .instalaciones').css('cursor', 'default');
  $('.navbar-inverse .container-fluid .nav #guardaColsGH').css('cursor', 'default');
  $('.navbar-inverse .container-fluid .nav #cargaColsGH').css('cursor', 'default');
  $('.navbar-inverse .container-fluid .nav #guardaColsGH').click(function() {
    $('#myModalGuardar').modal('toggle');
  });
  $('.navbar-inverse .container-fluid .nav #cargaColsGH').click(function() {
    $('#myModalCargar').modal('toggle');
  });

  $.getJSON('aparcamientos.json', {
    format: 'json',
    dataType: 'jsonp'
  }).done(function(data) {
    aparcamientos = data['@graph'];
    var lista = "<ul>";
    var listaColecciones = '<ul>';
    for(i = 0; i < aparcamientos.length; i++){
      lista = lista + '<li no=' + i + ' id="'+ aparcamientos[i].title +'">' +  "<b>" + aparcamientos[i].title + "</b>" + '</li>';
      listaColecciones = listaColecciones + '<li class="list-group-item draggable" data-id='+ aparcamientos[i] +'>'+ '<b>' + aparcamientos[i].title + '</b></li>';
    }
    lista = lista + '</ul>';
    listaColecciones = listaColecciones + '</ul>';
    $('#principal .row #primero #cargarParkings #lista').html(lista);
    $('#colecciones .row #listado #lista').html(listaColecciones);
    $('#principal .row #primero #cargarParkings #lista li').click(muestraAparcamiento);
    $(function() {
      $("#colecciones .row #listado #lista li.list-group-item.draggable").draggable({
          helper: "clone",
          revert: true,
          appendTo: "body",
          cursor: 'move',
      });
    });
    $('#colecciones .row #colCreadas').droppable({
      drop: function(event, ui) {
        $(this).append(ui.draggable.clone());
        $('#principal .row #colActual #listaColActual #listaActual ul').append('<li>' + ui.draggable.context.innerText + '</li>');
        aparcamientoSeleccionados.push(ui.draggable.context.innerText);
      }
    });
  });
}

function muestraAparcamiento() {
  $('#principal .row #tercero #seleccionado #info .row #sitio-info').empty();
  $('#instalaciones .row #seleccionado #info .row #sitio-info').empty();
  $('#instalaciones .row #seleccionado #info .row #descripcion-sitio').empty();
  $('#principal .row #tercero #seleccionado #info .row #carousel #myCarousel .carousel-inner').empty();
  $(this).css('color', 'blue');
  aparcamiento = aparcamientos[$(this).attr('no')];
  var titulo = '<h4><b>' + aparcamiento.title + '</b><h4>';
  var direccion = '<b>Dirección:</b> ' + aparcamiento.address['street-address'] + '<br>';
  var descripcion = '<b>Descripción:</b> ' + aparcamiento.organization['organization-desc'] + '<br>';
  var accesibilidad = '<b>Accesibilidad:</b> ' + aparcamiento.organization['accesibility'];
  $('#principal .row #tercero #seleccionado #info .row #sitio-info').append(titulo).append(direccion).append(descripcion).append(accesibilidad);
  $('#instalaciones .row #seleccionado #info .row #sitio-info').append(titulo).append(direccion);
  $('#instalaciones .row #seleccionado #info .row #descripcion-sitio').append(descripcion).append(accesibilidad);
  $('#principal .row #colActual #listaColActual #listaActual ul').append('<li>' + aparcamiento.title + '</li>');
  aparcamientoSeleccionados.push(aparcamiento);
  $('#instalaciones .row #usuarios-asignados').empty();
  if (aparcamiento.location['latitude'] == undefined || aparcamiento.location['longitude'] == undefined){
    alert("No disponible");
  } else {
    var latitud = aparcamiento.location['latitude'];
    var longitud = aparcamiento.location['longitude'];
    imagenesCarousel(latitud, longitud);
    mymap.setView([latitud, longitud], 15);
    L.marker([latitud, longitud]).addTo(mymap)
  	 .bindPopup(aparcamiento.title)
  	  .on("popupopen", function() {
  		    var marker = this;
  				$(".leaflet-popup-close-button:visible").click(function() {
  				mymap.removeLayer(marker);
  				   });
  				 })
  		.on("click", function(){
  	//aparcamiento = document.getElementById(aparcamiento.title);
    }).openPopup();
  }
}

function imagenesCarousel(latitud, longitud) {
  var url = 'https://commons.wikimedia.org/w/api.php?format=json&action=query&generator=geosearch&ggsprimary=all&ggsnamespace=6&ggsradius=500&ggscoord='
            + latitud + '|' + longitud + '&ggslimit=15&prop=imageinfo&iilimit=1&iiprop=url&iiurlwidth=200&iiurlheight=200&callback=?';
  $.getJSON(url, {
    format: 'json',
    dataType: 'jsonp'
  }).done(function(data) {
    var pages = data.query.pages;
    var index = 0;
    for(k in pages) {
      var imgUrl = data.query.pages[k].imageinfo[0].thumburl;
      if(imgUrl != undefined) {
        var item = document.createElement('div')
        if(index == 0) {
          item.setAttribute('class', 'item active');
          index++;
        } else {
          item.setAttribute('class', 'item');
        }
        var img = document.createElement('img');
        img.src = imgUrl;
        item.append(img);
        $('#principal .row #tercero #seleccionado #info .row #carousel #myCarousel .carousel-inner').append(item);
      }
    }
  });
}

var gh;
var repo;
var repoDir;
var token;

function getRepo() {
  var user = 'aubedac';
  repoDir = document.getElementsByName('repo')[0].value;
  token = document.getElementsByName('tokenGH')[0].value;
  gh = new Github({
   token : token,
   auth : "oauth"
  });
  repo = gh.getRepo(user, repoDir);
}

function writeRepo() {
  getRepo();
  var fich = document.getElementsByName('nombreCol')[0].value;
  aparcamientoSeleccionados.push(aparcamientoGoogle);
  var coleccionAct = {fich : aparcamientoSeleccionados};
  var coleccionJSON = JSON.stringify(coleccionAct);
  repo.write('master', fich , coleccionJSON, "Guardando v1.0", function(e) {
    console.log(e);
  });
}

function showRepo(error, repo) {
  if (error) {
    console.log("<p>Error code: " + error.error + "</p>");
  } else {
    console.log(repo);
  }
}

function loadRepo() {
  $('#principal .row #colActual #listaColActual #listaActual').empty();
  var user = 'aubedac';
  repoDir = document.getElementsByName('repoC')[0].value;
  token = document.getElementsByName('tokenGHC')[0].value;
  gh = new Github({
   token : token,
   auth : "oauth"
  });
  repo = gh.getRepo(user, repoDir);
  var fich = document.getElementsByName('nombreColC')[0].value;
  $('#principal .row #colActual #listaColActual #listaActual h3').html("Nombre Colección: " + fich);
  console.log(repo.show(showRepo));
  repo.read('master', fich, function(e, data) {
    console.log (e, data);
    var data = JSON.parse(data);
    var lista = '<ul>'
    for( i = 0; i < data.length; i++){
      console.log(data[i].title);
      lista = lista + '<li>' + data[i].title + '</li>';
    }
    lista = lista + '</ul>';
    $('#principal .row #colActual #listaColActual #listaActual').append(lista);
  });
}

var apiKey = 'AIzaSyClbe_7WLJyb0gKNxydiKg4AaGNbtAb4Uk';

function cargarUsuariosGoogle() {
  $('#instalaciones .row #usuarios-asignados').droppable({
    drop: function(event, ui) {
      if(aparcamiento != undefined) {
        $(this).append(ui.draggable.clone());
        aparcamientoGoogle.push([aparcamiento.title, ui.draggable.context.innerText]);
      } else {
        alert('No hay aparcamiento seleccionado.');
      }
    }
  });
  $(this).hide();
  var host = 'ws://localhost:1235';
  var s = new WebSocket(host);
  var arrayUsers = [];

  s.onmessage = function(e) {
    var flag = arrayUsers.includes(e.data);
    if(flag == false){
      handleClientLoad(e.data);
      arrayUsers.push(e.data);
    }else{
      console.log('usuario repetido');
    }
  }
}

function handleClientLoad(userId) {
  gapi.client.setApiKey(apiKey);
  makeApiCall(userId);
}

function makeApiCall(userId) {
  gapi.client.load('plus', 'v1', function() {
    var request = gapi.client.plus.people.get({
      'userId': userId,
    })
    request.execute(function(resp){
      var usuario = '<li class="list-group-item draggable" data-id='+ userId +'>'+ '<b>' + resp['displayName'] + '</b>' + '<img src=' + resp['image'].url + '></li>';
      $('#instalaciones .row #usuarios-google').append(usuario);
      $(function() {
        $("li.list-group-item.draggable").draggable({
	        	helper: "clone",
	        	revert: true,
	        	appendTo: "body",
            cursor: 'move',
        });
      });
    });
  });
}

var flag = false;

function creaColeccion() {
  var nombreNuevaCol = document.getElementsByName('nuevaCol')[0].value;
  $('#principal .row #colActual #listaColActual #listaActual ul').empty();
  $('#colecciones .row #creaCol #listaColCreadas ul').append('<li class="nombreNuevaCol">' + nombreNuevaCol + '</li>');
  $('#colecciones .row #creaCol #listaColCreadas ul li.nombreNuevaCol').click(function() {
    if(flag == false) {
      $(this).css('color', 'green');
      flag = true;
      $('#principal .row #colActual #listaColActual #listaActual h3').html("Nombre Colección: " + nombreNuevaCol);
    } else {
      $(this).css('color', '#333333');
      $('#principal .row #colActual #listaColActual #listaActual h3').empty();
      flag = false;
    }
  });
}
