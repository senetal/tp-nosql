const neo4j = require('neo4j-driver');
const config = require('./config.json');

class Dao_Neo4j{
    constructor() {
        this.driver = neo4j.driver(config.BD_URL, neo4j.auth.basic(config.BD_USER, config.BD_PWD))
    }

    async createIndexes(){
        let time=Date.now();
        this.session=this.driver.session();
        this.session.run("CREATE INDEX IF NOT EXISTS " +
            "FOR (n:USER) " +
            "ON (n.pseudo)");
        this.session.run("CREATE INDEX IF NOT EXISTS " +
            "FOR (n:PRODUCT) " +
            "ON (n.name)");
        await this.session.close();
        return time;
    }

    async dropIndexes(){
        let time=Date.now();
        this.session=this.driver.session();
        this.session.run("DROP INDEX IF EXISTS ON :USER(pseudo)");
        this.session.run("DROP INDEX IF EXISTS ON :USER(pseudo)");
        await this.session.close();
        return time;
    }
}

module.exports = Dao_Neo4j

async function toto() {

    try {
        const result = await session.run(
            'CREATE (a:Person {name: $name}) RETURN a',
            {name: personName}
        )

        const singleRecord = result.records[0]
        const node = singleRecord.get(0)

        console.log(node.properties.name)
    } finally {
        await session.close()
    }

// on application exit:
    await driver.close()

}