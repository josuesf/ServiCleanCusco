var express = require('express');
var session = require('express-session');
var http = require('http')
var mongojs = require('mongojs');


ObjectID = mongojs.ObjectID; //mongodb://<dbuser>:<dbpassword>@ds157653.mlab.com:57653/gn8db
var db = mongojs(process.env.MONGO_RUEDA_URL);
var app = express();
var server = http.createServer(app);
var port = process.env.PORT || 8080;
server.listen(port, () => console.log('listening on ' + port));
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(session({
  secret: '_secret_', cookie: { maxAge: 60 * 60 * 1000 },
  saveUninitialized: false, resave: false
}));

app.use(express.static('public'));
//--------- home --------------------
app.get('/', function (req, res) {
  res.render('index.ejs');
});
app.get('/sis', function (req, res) {
  res.render('sistema/index.ejs');
});
app.post('/login', function (req, res) {
  var inputs = req.body;
  db.collection('users').find({
    username: inputs.usuario,
    password: inputs.password
  }, function (err, user) {
    if (err || user.length == 0) return res.redirect('/');

    req.session.authenticated = true;
    req.session.username = user[0].username
    return res.redirect('/home');
  });
});

app.get('/logout', function (req, res) {
  delete req.session.authenticated;
  res.redirect('/');
});


app.get('/home', function (req, res) {

  if (!req.session || !req.session.authenticated) {
    res.redirect('/sis');
  } else {
    res.render('sistema/home.ejs', {
      tipo: 0,
      usuario: req.session.user
    });
  }
});

app.post('/registrarAnuncio', function (req, res) {

  if (!req.session || !req.session.authenticated) {
    res.redirect('/');
  } else {

    var inputs = req.body;

    var anuncioData = {
      user_register: req.session.username,
      categoria: inputs.selectCategoria,
      titulo: inputs.inputTitulo,
      descripcion: inputs.inputDescripcion.trim(),
      telefonos: inputs.inputTelefono,
      tipo: "anuncio",
      createdAt: new Date()
    }

    db.collection('anuncios').insert(anuncioData, (err, anuncio) => {
      if (err)
        return res.render('sistema/home.ejs', { mensaje: 'Error en el registro', tipo: 1 });
      //return res.json({ res: 'error', detail: err });
      return res.render('sistema/home.ejs', { mensaje: 'Registro exitoso', tipo: 2, anuncio });
      //return res.json({ res: 'ok', user: user });
    });
  }
});
app.get('/publicidad', function (req, res) {
  if (!req.session || !req.session.authenticated) {
    res.redirect('/');
  } else
    return res.render('sistema/publicidad.ejs', {
      tipo: 0,
      usuario: req.session.user,
      usuarios: Usuarios_Conectados.length

    })
})


