const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Création du serveur Express

var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db2 = require('./models');



passport.use(new Strategy(
  function(username, password, cb) {
    db2.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));



passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db2.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


const app = express();


app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


app.get("/level", require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
  res.render("level", { model: {} });
});

// POST /create
app.post("/level", (req, res) => {
  const sql = "INSERT INTO level (name, phone, eduson_id, TestType, Level, Date, score) VALUES (?,?,?,?,?,?,?)";
  const book = [req.body.name, req.body.phone,req.body.eduson_id, req.body.TestType, req.body.Level, req.body.Date, req.body.score ];
  db.run(sql, book, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/level");
  });
});

app.get("/result", require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
  const sql = "SELECT * FROM level ORDER BY id DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("result", { model: rows });
  });
});

app.get('/login',
  function(req, res){
    res.render('login');
  });
  
  app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    if (req.user.username == '1'){
      console.log(req.user.username)
      res.redirect('result');

      
    }else{
      res.redirect('level');
    }
    
  });
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });



// Configuration du serveur
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

// Connexion à la base de donnée SQlite
const db_name = path.join(__dirname, "data", "apptest.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("연결합니다 'apptest.db'");
});



// Démarrage du serveur
app.listen(8080, () => {
    console.log("Serveur démarré ( http://localhost:8080/ ) !");
});


app.get("/", function (req, res) {
  res.redirect("login");
 });

