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
        let res ;
        res = this.db.get("select * from USER",(err,res)=>{
            console.log(res);
            return res ;

        });
        console.log(res);
        return res ;

    }
}

module.exports = AppDAO;