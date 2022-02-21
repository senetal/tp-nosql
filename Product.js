const dao_sqlite = require('./dao_sqlite');
const dao_neo4j = require('./dao_neo4j');
const config = require('./config.json');


class Product {
    constructor() {
        this.dbSqlite = new dao_sqlite("./db/bd_sqlite.db");
        this.dbNeo4j = new dao_neo4j();
    }

    async createSqLite(id, name) {
        this.dbSqlite.db.run("INSERT INTO PRODUCT (id,name) VALUES(" + id + ", '" + name + "')");
    }

    async createNeo4j(id, name) {
        try {
            const result = await this.dbNeo4j.session.run(
                'CREATE (a:Product {id: $id, name: $name}) RETURN a',
                {
                    id: id,
                    name: name
                }
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
        if (strDb == null || strDb.toUpperCase() == "SQLITE") {
            await this.createSqLite(id, name);
        }
        if (strDb == null || strDb.toUpperCase() == "NEO4J") {
            await this.createNeo4j(id, name);
        }
    }

    async read(id, res, strDb) {
        if (strDb.toUpperCase() == "SQLITE") {
            await this.readSqlLite(id, res);
        } else if (strDb.toUpperCase() == "NEO4J") {
            var r = await this.readNeo4j(id);
            res.send(r);
        } else {
            res.send("db not valid");
        }
    }

    async readSqlLite(id, res) {
        await this.dbSqlite.db.get("SELECT * FROM PRODUCT WHERE id = " + id, (err, row) => {
            res.send(row);
        });
    }

    async readNeo4j(id, res) {
        let session = this.dbNeo4j.driver.session()
        try {
            const result = await session.run(
                'MATCH (a:Product {id: $id}) RETURN a',
                {id: id}
            )

            const singleRecord = result.records[0]
            const node = singleRecord.get(0)
            return node;
        } finally {
            await session.close()
        }
// on application exit:
        await this.dbNeo4j.driver.close()
    }

    updateSqlite(id, name) {
        this.dbSqlite.db.run("UPDATE PRODUCT Set name = '" + name + "' WHERE id = " + id);
    }

    async updateNeo4j(id, name) {
        let session = this.dbNeo4j.driver.session()
        try {
            const result = await session.run(
                'MATCH (a:Product {id: $id}) set a.name = $name RETURN a',
                {
                    id: id,
                    name: name
                }
            )

            const singleRecord = result.records[0]
            const node = singleRecord.get(0)
        } finally {
            await this.dbNeo4j.session.close()
        }
// on application exit:
        await this.dbNeo4j.driver.close()
    }

    async update(id, pseudo, strDb) {
        if (strDb == null || strDb.toUpperCase() == "SQLITE") {
            this.updateSqlite(id, pseudo);
        }
        if (strDb == null || strDb.toUpperCase() == "NEO4J") {
            await this.updateNeo4j(id, pseudo);
        }
    }

}



module.exports = Product ;