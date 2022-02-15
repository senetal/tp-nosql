const express = require('express');
const dao_sqlite = require('./dao_sqlite.js');
const config = require('./config.json');
const user = require('./User');
const product = require('./Product');
const dao_neo4j = require('./dao_neo4j.js');
const app = express()
const port = 3000

const crypto = require('crypto');
db= new dao_sqlite("./db/bd_sqlite.db");

User = new user();
Product = new product();

app.get('/', (req, res) => {
    res.send('Hello World!')
    db.test();
})

app.get('/createUser/:id/:pseudo', async (req, res) => {
    await User.create(req.params.id, req.params.pseudo,req.query.db);
    res.send('Utilisateur créé');
    console.log(req.query.db);
})

app.get('/createProduct/:id/:name', async (req, res) => {
    await Product.create(req.params.id, req.params.name,req.query.db);
    res.send('Produit créé');
    console.log(req.query.db);
})

app.get('/User/:id', async (req, res) => {
    let result = await User.read(req.params.id,res,req.query.db);
})

app.get('/insertMass',(req,res)=>{
    insertMassData(req,res);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

function timeToSec(time){
    return time.toFixed(3)/1000;
}

function insertMassData(req,res){
    let users = [];
    let products = [];
    let follows = [];
    let buy = [];

    for (let i = 0; i < 1000000; i++) {
        users.push(crypto.randomBytes(20).toString('hex'));
    }

    for (let i = 0; i < 10000; i++) {
        products.push(crypto.randomBytes(10).toString('hex'));
    }

    for (let i = 0; i < users.length; i++) {
        let followers = Math.floor(Math.random()*21);
        for (let j = 0; j < followers; j++) {
            let userid = Math.floor(Math.random()*1000000);
            if (userid==i)userid=0;
            follows.push({user1_id:i,user2_id:userid});
        }
        let bought = Math.floor(Math.random()*6);
        for (let j = 0; j < bought; j++) {
            let productid = Math.floor(Math.random()*10000);
            buy.push({userid:i,productid:productid});
        }
    }

    let start = Date.now()
    let insertSQLtime = Date.now()-start;
    start = Date.now();
    let insertNoSQLtime = Date.now()-start;

    let time={sqlite:timeToSec(insertSQLtime),neo4j:timeToSec(insertNoSQLtime)};

    res.send(time);
}