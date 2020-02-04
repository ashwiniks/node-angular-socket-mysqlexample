const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
var cors = require('cors')
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
const http = require('http');
const server = http.createServer(app);
const io = require('./socket');
const socket = require('./socket').init(server);
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root@123',
  database: 'testapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
const conn = pool.promise();

app.post('/add-user', async (req, res, next) => {
  console.log("+++++++++++++", req.body.fname);
  const fname = req.body.fname;
  const lname = req.body.lname;
  const [row] = await conn.execute('insert into user (fname,lname) values(?,?)', [fname, lname]);
  conn.query('select * from user').then(([rows, fields]) => {
    console.log("----------", rows);
    io.getIo().emit('userdata', { data: rows });

  });

});

app.get('/', (req, res, next) => {
  conn.query('select * from user').then(([rows, fields]) => {
    console.log("----------", rows);
    io.getIo().emit('userdata', { data: rows });

  });
})
/*
io.on('connection',  function(socket) {
  console.log('a user connected');
   conn.query('select * from user').then( ([rows, fields])=>{
     console.log("----------",rows);
    socket.emit('userdata',{data:rows} );

  });
}); */






server.listen(3001, function () {
  console.log('listening on *:3001');
});