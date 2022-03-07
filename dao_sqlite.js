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

    async listProductButByFollowers(idUser, res){
        await this.db.get("SELECT BUY.product_id, sum(quantity) \n" +
            "FROM\n" +
            "(WITH RECURSIVE\n" +
            "  cnt(x,n) AS \n" +
            "  (\n" +
            "  VALUES(1,0)\n" +
            "  UNION ALL\n" +
            "  SELECT user1_id,  cnt.n +1\n" +
            "  FROM cnt, FOLLOWS \n" +
            "  WHERE cnt.x = FOLLOWS.user2_id\n" +
            "  AND cnt.n < 5\n" +
            "  )\n" +
            "SELECT DISTINCT(x) FROM cnt WHERE x != 1\n" +
            ")\n" +
            "INNER JOIN BUY\n" +
            "ON(x = user_id) \n" +
            "GROUP BY(product_id);",(err,row)=>{
            res.send(row);
        });
    }
}

module.exports = AppDAO;