const sqlite3 = require('sqlite3').verbose();

let _db;

module.exports = {
    connect: function (callback) {
        _db = new sqlite3.Database('database/db.sqlite', (err) => {
            if (!err) {
                console.log('Connected to the database.');
            }
            return callback(err);
        });
    },


    getDb: function () {
        if (!_db) {
            throw new Error('Database connection has not been established.');
        }
        return _db;
    }
};
