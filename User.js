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
        if(strDb == null || strDb.toUpperCase() == "SQLITE"){
            await this.createSqLite(id,pseudo);
        }
        if(strDb == null  || strDb.toUpperCase() == "NEO4J" ){
            await this.createNeo4j(id,pseudo);
        }
    }

    async read(id,res,strDb){
        if(strDb != null) {
            if (strDb.toUpperCase() == "SQLITE") {
                await this.readSqlLite(id, res);
            } else if (strDb.toUpperCase() == "NEO4J") {
                var r = await this.readNeo4j(id);
                res.send(r);
            }
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
            return node ;
        } finally {
            await session.close()
        }
// on application exit:
        await this.dbNeo4j.driver.close()
    }

    updateSqlite(id,name){
        this.dbSqlite.db.run("UPDATE USERS Set pseudo = '"+name+"' WHERE id = "+id);
    }

    async updateNeo4j(id,pseudo){
        let session = this.dbNeo4j.driver.session()
        try {
            const result = await session.run(
                'MATCH (a:Users {id: $id}) set a.pseudo = $pseudo RETURN a',
                {   id: id,
                            pseudo: pseudo}
            )

            const singleRecord = result.records[0]
            const node = singleRecord.get(0)
        } finally {
            await this.dbNeo4j.session.close()
        }
// on application exit:
        await this.dbNeo4j.driver.close()
    }

    async update(id,pseudo,strDb){
            if (strDb == null || strDb.toUpperCase() == "SQLITE") {
                this.updateSqlite(id, pseudo);
            }
            if (strDb == null || strDb.toUpperCase() == "NEO4J") {
                await this.updateNeo4j(id,pseudo);
            }
    }

    deleteSqlite(id){
        this.dbSqlite.db.run("DELETE FROM USERS WHERE id = "+id);
    }

    async deleteNeo4j(id){

        let session = this.dbNeo4j.driver.session()
        try {
            const result = await session.run(
                'MATCH (a:Users {id: $id}) DELETE a',
                {   id: id}
            )
        } finally {
            await this.dbNeo4j.session.close()
        }
    }

    async delete(id,strDb){
        if (strDb == null || strDb.toUpperCase() == "SQLITE") {
            this.deleteSqlite(id);
        }
        if (strDb == null || strDb.toUpperCase() == "NEO4J") {
            await this.deleteNeo4j(id);
        }
    }



}

module.exports = User ;

