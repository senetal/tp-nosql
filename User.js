const dao_sqlite = require('./dao_sqlite');
const dao_neo4j = require('./dao_neo4j');
const config = require('./config.json');


class User{
    constructor() {
        this.dbSqlite = new dao_sqlite("./db/bd_sqlite.db");
        this.dbNeo4j = new dao_neo4j();
    }

    async createSqLite(id, pseudo){
        this.dbSqlite.db.run("INSERT INTO USERS (id,pseudo) VALUES("+id+", '"+pseudo+"')");
    }
    async createNeo4j(id,pseudo){
        try {
            const result = await this.dbNeo4j.session.run(
                'CREATE (a:Users {id: $id, pseudo: $pseudo}) RETURN a',
                {   id: id,
                    pseudo: pseudo}
            )

            const singleRecord = result.records[0]
            const node = singleRecord.get(0)

            console.log(node.properties.pseudo)
        } finally {
            await this.dbNeo4j.session.close()
        }
// on application exit:
        await this.dbNeo4j.driver.close()
    }


    async create(id, pseudo, strDb) {
        if(strDb == "SQLITE" || strDb == null){
            await this.createSqLite(id,pseudo);
        }
        if(strDb == "NEO4J" || strDb == null){
            await this.createNeo4j(id,pseudo);
        }
    }

    async read(id,res,strDb){
        if(strDb == "SQLITE"){
            await this.readSqlLite(id,res);
        }
        else if(strDb == "NEO4J"){
            await this.readNeo4j(id);
        }
        else{
            res.send("db not valid");
        }
    }

    async readSqlLite(id,res){
        await this.dbSqlite.db.get("SELECT * FROM USERS WHERE id = "+id,(err,row)=>{
            res.send(row);
        });
    }

    async readNeo4j(id,res){
        let session = this.dbNeo4j.driver.session()
        try {
            const result = await session.run(
                'MATCH (a:Users {id: $id}) RETURN a',
                {   id: id}
            )

            const singleRecord = result.records[0]
            const node = singleRecord.get(0)
            res.send(node);
        } finally {
            await session.close()
        }
// on application exit:
        await this.dbNeo4j.driver.close()
    }

}

module.exports = User ;

