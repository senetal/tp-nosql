const sqlite = require('sqlite3');

class AppDAO {
    constructor(dbFilePath) {
        this.db = new sqlite.Database(dbFilePath, (err) => {
            if (err) {
                console.log('Could not connect to database', err);
            } else {
                console.log('Connected to database');
            }
        })


    }

    test(){
        this.db.get("select * from USER",(err,res)=>{
            console.log(res);
        });

    }
}

module.exports = AppDAO;