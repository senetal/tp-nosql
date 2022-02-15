const neo4j = require('neo4j-driver')
const config = require('./config.json');

const driver = neo4j.driver(config.BD_URL, neo4j.auth.basic(config.BD_USER, config.BD_PWD))
const session = driver.session()
const personName = 'Alice'

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

toto();