const mysql = require('mysql')

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'Root@123'
});

connection.query('USE kraftshala');

module.exports = connection