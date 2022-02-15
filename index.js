const express = require('express');
const neo4j = require('neo4j-driver');
const dao_sqlite = require('./dao_sqlite.js');
const config = require('./config.json');
const app = express()
const port = 3000

db= new dao_sqlite("./bd_sqlite.db");

app.get('/', (req, res) => {
    res.send('Hello World!')
    db.test();
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

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