const express = require('express');
const dao_sqlite = require('./dao_sqlite.js');
const config = require('./config.json');
const user = require('./User');
const product = require('./Product');
const dao_neo4j = require('./dao_neo4j.js');
const fs = require('fs');
const crypto = require('crypto');
const buy = require("./Buy");
const follow=require("./Follow");
const {flatten} = require("express/lib/utils");
const Console = require("console");
const app = express()
const port = 3000

const db_sqlite = new dao_sqlite("./db/bd_sqlite.db");
const db_neo4j = new dao_neo4j();

let isInserting = false;
let minId=0;

let User = new user(db_sqlite,db_neo4j);
let Product = new product(db_sqlite,db_neo4j);
let Buy = new buy(db_sqlite,db_neo4j);
let Follow = new follow(db_sqlite,db_neo4j);

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

app.get('/insertMass',(req,res)=>{
    try{
        if(!isInserting) insertMassData(req,res);
    }catch(err){
        res.send("Unknown error.")
    }

});

app.get('/createindex', async (req, res) => {
    try{
        let start;
        if (req.query.db.toLowerCase()=="sqlite"){
            start = await db_sqlite.createIndexes();
        }else if (req.query.db.toLowerCase()=="neo4j"){
            start = await db_neo4j.createIndexes();
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

app.get('/dropindex',async (req, res) => {
    try{
        let start;
        if (req.query.db.toLowerCase()=="sqlite"){
            start = await db_sqlite.dropIndexes();
        }else if (req.query.db.toLowerCase()=="neo4j"){
            start = await db_neo4j.dropIndexes();
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

async function insertMassData(req,res){
    isInserting=true;
    console.log("Start data generation");
    let start = Date.now()
    let users = [];
    let products = [];

    for (let i = minId; i < minId+10000; i++) {
        products.push(crypto.randomBytes(10).toString('hex'));
    }

    for (let i = minId; i < minId+1000000; i++) {
        users.push({pseudo:crypto.randomBytes(20).toString('hex'),buys:[],follows:[]});
        //followers
        if (i>1000){
            let followers = Math.min(Math.floor(Math.random()*21),users.length);
            for (let j = 0; j < followers; j++) {
                let userid = Math.floor(Math.random()*users.length);
                while (users[i].follows.includes(userid) || userid==i)userid=Math.floor(Math.random()*users.length);;
                users[i].follows.push(userid);
            }
        }
        //buys
        let bought = Math.floor(Math.random()*6);
        for (let j = 0; j < bought; j++) {
            let productid = Math.floor(Math.random()*products.length);
            users[i].buys.push(productid);
        }
    }

    let genTime=Date.now()-start

    console.log("Start SQL insert")
    //sqlite
    start = Date.now()
    console.log("product")
    await Product.massInsertSqlite(products);
    console.log("user")
    await User.massInsertSqlite(users);
    console.log("buy")
    await Buy.massInsertSqlite(users);
    console.log("follow")
    await Follow.massInsertSqlite(users);
    let insertSQLtime = Date.now()-start;
    console.log(insertSQLtime.toFixed(3)/1000)
    console.log("Start NoSQL insert")
    //neo4j
    start = Date.now();
    await Product.massInsertNeo4j(products)
    await User.massInsertNeo4j(users)
    let insertNoSQLtime = Date.now()-start;
    console.log("Sending times")
    let time={gen:timeToSec(genTime),sqlite:timeToSec(insertSQLtime),neo4j:timeToSec(insertNoSQLtime)};
    res.send(time);
    minId+=1000000;
    isInserting=false;
}