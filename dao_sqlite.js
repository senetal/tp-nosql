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
        })

        fs.readFile('./db/init.sql','utf8',async (err, data) => {
            if (err){
                console.log(err);
                return;
            }else{
                try {
                    let dataArr = data.split(";");
                    dataArr.pop();
                        for (const d of dataArr) {
                            await new Promise((resolve, reject) => {
                                this.db.run(d,(err)=>{
                                    if (err)console.error(err);
                                });
                                resolve();
                            })
                        }
                }catch(err){
                    console.error(err);
                }
            }
        })

    }

}

module.exports = AppDAO;