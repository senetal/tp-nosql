const express = require('express');
const neo4j = require('neo4j-driver');
const dao_sqlite = require('./dao_sqlite.js');
const config = require('./config.json');
const user = require('./User');
const app = express()
const port = 3000

db= new dao_sqlite("./db/bd_sqlite.db");

User = new user();

app.get('/', (req, res) => {
    res.send('Hello World!')
    db.test();
})

app.get('/createUser/:id/:name', async (req, res) => {
    await User.create(req.params.id, req.params.name,req.query.db);
    res.send('Utilisateur créé');
    console.log(req.query.db);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})