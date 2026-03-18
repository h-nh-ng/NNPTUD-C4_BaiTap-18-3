var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const sql = require('mssql');

var indexRouter = require('./routes/index');

var app = express();

/* =========================
   SQL SERVER CONNECTION
========================= */

const config = {
  user: 'Nhanchimto',
  password: '123456', // password SQL Server
  server: 'localhost',
  database: 'NNPTUD-C4',
  port: 1433, // dùng port mặc định SQL Server
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

sql.connect(config)
  .then(() => {
    console.log("SQL Server connected on port 1433");
  })
  .catch(err => {
    console.error("Database connection failed:", err);
  });

/* =========================
   VIEW ENGINE
========================= */

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/* =========================
   MIDDLEWARE
========================= */

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* =========================
   ROUTES
========================= */

app.use('/', indexRouter);

app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/roles', require('./routes/role'));
app.use('/api/v1/products', require('./routes/products'));
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/auth', require('./routes/auth'));

/* =========================
   404 HANDLER
========================= */

app.use(function (req, res, next) {
  next(createError(404));
});

/* =========================
   ERROR HANDLER
========================= */

app.use(function (err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);

  res.json({
    message: err.message,
    error: err
  });

});

module.exports = app;