const express = require('express');
const dao_sqlite = require('./dao_sqlite.js');
const config = require('./config.json');
const user = require('./User');
const product = require('./Product');
const dao_neo4j = require('./dao_neo4j.js');
const fs = require('fs');
const app = express()
const port = 3000

const crypto = require('crypto');

const db_sqlite = new dao_sqlite("./db/bd_sqlite.db");
const db_neo4j = new dao_neo4j();

User = new user(db_sqlite,db_neo4j);
Product = new product(db_sqlite,db_neo4j);

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
        insertMassData(req,res);
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

    console.log("start")
    //sqlite
    let start = Date.now()
    // for (let i = 0; i < users.length; i++) {
    //     await User.create(i,users[i],"sqlite");
    // }
    for (let i = 0; i < products.length; i++) {
        await Product.create(i,products[i],"sqlite");
    }
    let insertSQLtime = Date.now()-start;
    console.log("on change")
    //neo4j
    start = Date.now();
    // for (let i = 0; i < users.length; i++) {
    //     await User.create(i,users[i],"neo4j");
    // }
    /*let txt="Id,Name"
    for (let i = 0; i < products.length; i++) {
        txt+="\n"+i+","+products[i];
    }
    fs.writeFileSync("import/insert.csv",txt,'utf8');*/
    await Product.massInsert(products)
    /*for (let i = 0; i < products.length; i++) {
        await Product.create(i,products[i],"neo4j");
        console.log(i)
    }*/
    let insertNoSQLtime = Date.now()-start;

    let time={sqlite:timeToSec(insertSQLtime),neo4j:timeToSec(insertNoSQLtime)};
    console.log(time)
    res.send(time);
}