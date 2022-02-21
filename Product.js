const fs = require('fs')
class Product {
    constructor(dbSqlite, dbNeo4j) {
        this.dbSqlite = dbSqlite;
        this.dbNeo4j = dbNeo4j;
    }

    async createSqLite(id, name){
        this.dbSqlite.db.run("INSERT INTO PRODUCT (id,name) VALUES("+id+", '"+name+"')");
    }

    async createNeo4j(id,name){
        let session = this.dbNeo4j.driver.session();
        const txc=session.beginTransaction();
        try {
            const result = await txc.run(
                'CREATE (a:Product {id: $id, name: $name}) RETURN a',
                {
                    id: id,
                    name: name
                }
            )

            const singleRecord = result.records[0]
            const node = singleRecord.get(0)
            console.log(node)
            await txc.commit();

        }catch (err){
            console.error(err);
        }
        await session.close();
    }

    async massInsert(products){
        let session = this.dbNeo4j.driver.session();
        // session.run("LOAD CSV WITH HEADERS FROM 'file:///insert.csv' AS row" +
        //     "MERGE (p:Product {id:row.id,name:row.name})");
        let i_limit=10;
        let j_limit=10000/i_limit;
        let txt=""
        for (let i = 0; i < i_limit; i++) {
            let txc=session.beginTransaction();
            for (let j = j_limit*i; j < j_limit*(i+1); j++) {
                await txc.run(
                    'CREATE (a:Product {id: 1})'
                );
                txt+="CREATE (a:Product {id: 1})\n"
                console.log(j)
            }
            fs.writeFileSync("toto.txt",txt,"utf8")
            await txc.commit();
        }
        await session.close();
    }

    async create(id, name, strDb) {
        if(strDb.toUpperCase() == "SQLITE" || strDb == null){
            await this.createSqLite(id,name);
        }
        if(strDb.toUpperCase() == "NEO4J" || strDb == null){
            await this.createNeo4j(id,name);
        }
    }


}

module.exports = Product ;