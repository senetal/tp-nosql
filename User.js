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

    read(){

    }
}

module.exports = User ;

