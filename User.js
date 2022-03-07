class User{
    constructor(dbSqlite, dbNeo4j) {
        this.dbSqlite = dbSqlite;
        this.dbNeo4j = dbNeo4j;
    }

    async createSqLite(id, pseudo){
        this.dbSqlite.db.run("INSERT INTO USERS (id,pseudo) VALUES("+id+", '"+pseudo+"')");
    }

    async createNeo4j(id, pseudo){
        let session = this.dbNeo4j.driver.session();
        const txc=session.beginTransaction();
        try {
            await txc.run(
                'CREATE (a:User {id: $id, pseudo: $pseudo}) RETURN a',
                {
                    id: id,
                    pseudo: pseudo
                }
            )
            await txc.commit();

        }catch (err){
            console.error(err);
        }
        await session.close();
    }

    async massInsertSqlite(users){
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < users.length; i++) {
                console.log(users[i].pseudo);
                await this.dbSqlite.db.run("INSERT INTO users (id,pseudo) VALUES("+i+", '"+users[i].pseudo+"')");
            }
            resolve();
        })
    }

    async massInsertNeo4j(users){
        let time=Date.now()
        let session = this.dbNeo4j.driver.session();
        let size_batch=1000;
        let nb_batchs=1000000/size_batch;
        console.log("0 - 0s")
        for (let i = 0; i < nb_batchs; i++) {
            let txc=session.beginTransaction();
            for (let j = size_batch*i; j < size_batch*(i+1); j++) {
                let query="CREATE (u:User {id: "+j+", pseudo: '"+users[j].pseudo+"'})";
                for (const follow of users[j].follows) {
                    query+="\nWITH u" +
                        "\nMATCH (f:User {id: "+follow+"})" +
                        "\nCREATE (f)-[:Follow]->(u)"
                }
                for (const buy of users[j].buys) {
                    query+="\nWITH u" +
                        "\nMATCH (p:Product {id: "+buy+"})" +
                        "\nCREATE (u)-[:Buy]->(p)"
                }
                await txc.run(query);
            }
            console.log(size_batch*(i+1)+" - "+(Date.now()-time).toFixed(3)/1000+"s")
            time=Date.now();
            await txc.commit();
        }
        await session.close();
    }

    async create(id, pseudo, strDb) {
        if(strDb.toUpperCase() == "SQLITE" || strDb == null){
            await this.createSqLite(id,pseudo);
        }
        if(strDb.toUpperCase() == "NEO4J" || strDb == null){
            await this.createNeo4j(id,pseudo);
        }
    }
}

module.exports = User ;

