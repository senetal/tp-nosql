
class User{
    constructor(dbSqlite, dbNeo4j) {
        this.dbSqlite = dbSqlite;
        this.dbNeo4j = dbNeo4j;
    }

    async createSqLite(id, pseudo){
        this.dbSqlite.db.run("INSERT INTO USERS (id,pseudo) VALUES("+id+", '"+pseudo+"')");
    }
    async createNeo4j(id,pseudo){
        let session = this.dbNeo4j.driver.session();
        try {
            const result = await session.run(
                'CREATE (a:Users {id: $id, pseudo: $pseudo}) RETURN a',
                {   id: id,
                    pseudo: pseudo}
            )

            const singleRecord = result.records[0]
            const node = singleRecord.get(0)

            console.log(node.properties.pseudo)
        } finally {
            await session.close()
        }
// on application exit:
        await this.dbNeo4j.driver.close()
    }


    async create(id, pseudo, strDb) {
        if(strDb.toUpperCase() == "SQLITE" || strDb == null){
            await this.createSqLite(id,pseudo);
        }
        if(strDb.toUpperCase() == "NEO4J" || strDb == null){
            await this.createNeo4j(id,pseudo);
        }
    }

    read(){

    }
}

module.exports = User ;

