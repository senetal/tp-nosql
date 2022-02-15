const dao_sqlite = require('./dao_sqlite');
const dao_neo4j = require('./dao_neo4j');
const config = require('./config.json');


class Product {
    constructor() {
        this.dbSqlite = new dao_sqlite("./db/bd_sqlite.db");
        this.dbNeo4j = new dao_neo4j();
    }

    async createSqLite(id, name){
        this.dbSqlite.db.run("INSERT INTO PRODUCT (id,name) VALUES("+id+", '"+name+"')");
    }

    async createNeo4j(id,name){
        try {
            const result = await this.dbNeo4j.session.run(
                'CREATE (a:Product {id: $id, name: $name}) RETURN a',
                {   id: id,
                    name: name}
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

    async create(id, name, strDb) {
        if(strDb == "SQLITE" || strDb == null){
            await this.createSqLite(id,name);
        }
        if(strDb == "NEO4J" || strDb == null){
            await this.createNeo4j(id,name);
        }
    }


}

module.exports = Product ;