const express = require('express');
const dao_sqlite = require('./dao_sqlite.js');
const config = require('./config.json');
const user = require('./User');
const product = require('./Product');
const dao_neo4j = require('./dao_neo4j.js');
const app = express()
const port = 3000

const crypto = require('crypto');

const db_sqlite = new dao_sqlite("./db/bd_sqlite.db");
const db_neo4j = new dao_neo4j();

User = new user();
Product = new product();

app.get('/', (req, res) => {
    res.status(200).sendFile(__dirname+"/index.html",err => {
        if (err){
            console.error(err);
        }
    })
});

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

app.get('/Product/:id', async (req, res) => {
    let result = await Product.read(req.params.id,res,req.query.db);
})

app.get('/UpdateUser/:id/:pseudo', async (req, res) => {
    let result = await User.update(req.params.id,req.params.pseudo,req.query.db);
    res.send("modification effectuée");
})

app.get('/insertMass',(req,res)=>{
    try{
        insertMassData(req,res);
    }catch(err){
        res.send("Unknown error.")
    }

});

app.get('/createindex',(req, res) => {
    try{
        let start;
        if (req.query.db=="sqlite"){
            start = db_sqlite.createIndexes();
        }else if (req.query.db=="neo4j"){
            start = db_neo4j.createIndexes();
        }else{
            res.send("Veuillez préciser la db (sqlite/neo4j)")
        }
        let end=Date.now();
        res.send(""+timeToSec(end-start));
    }catch(err){
        console.error(err);
        res.send("Unknown error.");
    }
});

app.get('/dropindex',(req, res) => {
    try{
        let start;
        if (req.query.db=="sqlite"){
            start = db_sqlite.dropIndexes();
        }else if (req.query.db=="neo4j"){
            start = db_neo4j.dropIndexes();
        }else{
            res.send("Veuillez préciser la db (sqlite/neo4j)")
        }
        let end=Date.now();
        res.send(""+timeToSec(end-start));
    }catch(err){
        console.error(err);
        res.send("Unknown error.");
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});

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