const Pool = require('pg').Pool;

const pool = new Pool({
    user : "postgres",
    host : "localhost",
    database : "STOREDATA",
    password : " ",
    port : 5432
});

module.exports = pool;