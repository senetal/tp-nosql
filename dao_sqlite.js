const sqlite = require('sqlite3');
const fs = require('fs');

class AppDAO {
    constructor(dbFilePath) {
        this.db = new sqlite.Database(dbFilePath, (err) => {
            if (err) {
                console.log('Could not connect to database', err);
            } else {
                console.log('Connected to database');
            }
        });

        fs.readFile('./db/init.sql','utf8', (err, data) => {
            if (err){
                console.log(err);
                return;
            }else{
                try {
                    let dataArr = data.split(";");
                    dataArr.pop();
                    for (const d of dataArr) {
                        this.db.run(d,(err)=>{
                            if (err)console.error(err);
                        });
                    }
                }catch(err){
                    console.error(err);
                }
            }
        });
    }

    async createIndexes(){
        let data=fs.readFileSync('./db/create_index.sql','utf8')
        let time=Date.now();
        try {
            let dataArr = data.split(";");
            dataArr.pop();
            for (const d of dataArr) {
                this.db.run(d,(err)=>{
                    if (err)console.error(err);
                });
            }
        }catch(err){
            console.error(err);
            return null;
        }
        return time;
    }

    async dropIndexes(){
        let data=fs.readFileSync('./db/drop_index.sql','utf8')
        let time=Date.now();
        try {
            let dataArr = data.split(";");
            dataArr.pop();
            for (const d of dataArr) {
                this.db.run(d,(err)=>{
                    if (err)console.error(err);
                });
            }
        }catch(err){
            console.error(err);
            return null;
        }
        return time;
    }
}

module.exports = AppDAO;