// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: 'password'
// });

// module.exports = pool.promise();
const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'password', {
	dialect: 'mysql',
	host: 'localhost'
});

module.exports = sequelize;