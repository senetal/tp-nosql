class Product {
    constructor(dbSqlite, dbNeo4j) {
        this.dbSqlite = dbSqlite;
        this.dbNeo4j = dbNeo4j;
    }

    async createSqlite(id, name){
        this.dbSqlite.db.run("INSERT INTO PRODUCT (id,name) VALUES("+id+", '"+name+"')");
    }

    async createNeo4j(id,name){
        let session = this.dbNeo4j.driver.session();
        const txc=session.beginTransaction();
        try {
            await txc.run(
                'CREATE (a:Product {id: $id, name: $name}) RETURN a',
                {
                    id: id,
                    name: name
                }
            )
            await txc.commit();

        }catch (err){
            console.error(err);
        }
        await session.close();
    }

    async massInsertSqlite(products){
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < products; i++) {
                await this.dbSqlite.db.run("INSERT INTO PRODUCT (id,name) VALUES("+i+", '"+products[i]+"')");
            }
            resolve();
        })
    }

    async massInsertNeo4j(products){
        let session = this.dbNeo4j.driver.session();
        let nb_batchs=10;
        let nb_transactions=10000/nb_batchs;
        for (let i = 0; i < nb_batchs; i++) {
            let txc=session.beginTransaction();
            for (let j = nb_transactions*i; j < nb_transactions*(i+1); j++) {
                await txc.run(
                    'CREATE (p:Product {id: $id, name: $name})',{
                        id: j,
                        name:products[j]
                    }
                );
            }
            await txc.commit();
        }
        await session.close();
    }

    async create(id, name, strDb) {
        if(strDb.toUpperCase() == "SQLITE" || strDb == null){
            await this.createSqlite(id,name);
        }
        if(strDb.toUpperCase() == "NEO4J" || strDb == null){
            await this.createNeo4j(id,name);
        }
    }


}

module.exports = Product ;