
class Follow{
    constructor(dbSqlite, dbNeo4j) {
        this.dbSqlite = dbSqlite;
        this.dbNeo4j = dbNeo4j;
    }

    /*async createSqLite(userid,productid){
        this.dbSqlite.db.run("INSERT INTO BUY (user_id,product_id) VALUES("+userid+", "+productid+")");
    }

    async createNeo4j(userid,productid){
        let session = this.dbNeo4j.driver.session();
        const txc=session.beginTransaction();
        try {
                await txc.run(
                    'MATCH (u:User {id: $userid})\n' +
                    'WITH u\n' +
                    'MATCH (p:Product {id: $productid})\n' +
                    'WITH u,p\n' +
                    'CREATE (u)-[:Buy]->(p)\n',
                    {
                        userid: userid,
                        productid: productid
                    }
                )

            await txc.commit();

        }catch (err){
            console.error(err);
        }
        await session.close();
    }*/

    async massInsertSqlite(users){
        let query="INSERT INTO FOLLOWS (user1_id,user2_id) VALUES"
        for (let j=0;j<users.length;j++) {
            let follow=users[j].follows

            for (let i = 0; i < follow.length; i++) {
                query+="("+follow[i]+", "+j+"),";
            }

        }
        query=query.slice(0,-1);
        console.log("coucou")
        await this.dbSqlite.db.run(query);
    }

    async create(userid,productid, strDb) {
        if(strDb.toUpperCase() == "SQLITE" || strDb == null){
            await this.createSqLite(id,pseudo);
        }
        if(strDb.toUpperCase() == "NEO4J" || strDb == null){
            await this.createNeo4j(id,pseudo);
        }
    }
}

module.exports = Follow;

