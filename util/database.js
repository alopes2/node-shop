const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const keys = require('./config/keys');

let _db;

const mongoConnect = callback => {
	MongoClient.connect(keys.database)
		.then(client => {
			console.log('connected');
			_db = client.db();
			callback();
		})
		.catch(error => {
			console.log(error);
			throw error;
		});
};

const getDb = () => {
	if (_db) {
		return _db;
	}

	throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
