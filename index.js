let Postgres = require('postgres');

let defaultConfig = {
	username: process.env.PGUSER,
	password: process.env.PGPASSWORD,
	database: process.env.PGDATABASE,
	host: process.env.PGHOST,
	port: process.env.PGPORT,
	idle_timeout: process.env.PGIDLE_TIMEOUT || 30,
	connection: {
	    application_name: process.env.PGAPPNAME || `postgres.js-${process.pid}`
	},	
};

// console.log({ defaultConfig })

let createPostgresConnection = function createPostgresConnection (customConfig = {}) {

	let finalConfig = Object.assign({}, defaultConfig, customConfig);

	// handle the 'connection' option separately, since it is an object; 
	// we are doing a manually controlled "deep merge"

	finalConfig.connection = Object.assign({}, defaultConfig.connection, customConfig.connection);

	let configOptionsToCheck = [
		'username',
		'password',
		'database',
	];

	for (let option of configOptionsToCheck) {
		let optionIsMissing = (finalConfig[option] == null || finalConfig[option] === '');

		if (optionIsMissing) {
			//console.log(`[postgres-connection] missing configuration option: ${option}`);
			return;
		}
	}

	let sql = Postgres(finalConfig);
	return sql;
}

function getConnectionString(sqlObject) {

	if (sqlObject == null) {
		sqlObject = module.exports.sql;
	}

	// https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING

	let host = sqlObject.options.host[0];
	let port = sqlObject.options.port[0];
	let { user, pass, database } = sqlObject.options;

	let connectionString = `postgresql://${user}:${pass}@${host}:${port}/${database}`;
	let paramspec = ''

	if (sqlObject.options.connection && sqlObject.options.connection['application_name']) {
		paramspec = paramspec + `application_name=${sqlObject.options.connection['application_name']}&`;
	}

	// TODO: add other connection options to the connectionString

	connectionString = connectionString + '?' + paramspec;

	if (connectionString.endsWith('&')) {
		connectionString = connectionString.slice(0, -1);
	}

	return connectionString;
}

module.exports.sql = createPostgresConnection();
module.exports.createPostgresConnection = createPostgresConnection;
module.exports.createConnection = createPostgresConnection;
module.exports.getConnectionString = getConnectionString;

