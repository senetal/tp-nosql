class Product {
    constructor(dbSqlite, dbNeo4j) {
        this.dbSqlite = dbSqlite;
        this.dbNeo4j = dbNeo4j;
    }

    async createSqLite(id, name) {
        this.dbSqlite.db.run("INSERT INTO PRODUCT (id,name) VALUES(" + id + ", '" + name + "')");
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
            for (let i = 0; i < products.length; i++) {
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
                console.log(j)
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

    async read(id, res, strDb) {
        if (strDb.toUpperCase() == "SQLITE") {
            await this.readSqlLite(id, res);
        } else if (strDb.toUpperCase() == "NEO4J") {
            var r = await this.readNeo4j(id);
            res.send(r);
        } else {
            res.send("db not valid");
        }
    }

    async readSqlLite(id, res) {
        await this.dbSqlite.db.get("SELECT * FROM PRODUCT WHERE id = " + id, (err, row) => {
            res.send(row);
        });
    }

    async readNeo4j(id, res) {
        let session = this.dbNeo4j.driver.session()
        try {
            const result = await session.run(
                'MATCH (a:Product {id: $id}) RETURN a',
                {id: id}
            )

            const singleRecord = result.records[0]
            const node = singleRecord.get(0)
            return node;
        } finally {
            await session.close()
        }
// on application exit:
        await this.dbNeo4j.driver.close()
    }

    updateSqlite(id, name) {
        this.dbSqlite.db.run("UPDATE PRODUCT Set name = '" + name + "' WHERE id = " + id);
    }

    async updateNeo4j(id, name) {
        let session = this.dbNeo4j.driver.session()
        try {
            const result = await session.run(
                'MATCH (a:Product {id: $id}) set a.name = $name RETURN a',
                {
                    id: id,
                    name: name
                }
            )

            const singleRecord = result.records[0]
            const node = singleRecord.get(0)
        } finally {
            await this.dbNeo4j.session.close()
        }
// on application exit:
        await this.dbNeo4j.driver.close()
    }

    async update(id, pseudo, strDb) {
        if (strDb == null || strDb.toUpperCase() == "SQLITE") {
            this.updateSqlite(id, pseudo);
        }
        if (strDb == null || strDb.toUpperCase() == "NEO4J") {
            await this.updateNeo4j(id, pseudo);
        }
    }

    deleteSqlite(id){
        this.dbSqlite.db.run("DELETE FROM PRODUCT WHERE id = "+id);
    }

    async deleteNeo4j(id){

        let session = this.dbNeo4j.driver.session()
        try {
            const result = await session.run(
                'MATCH (a:Product {id: $id}) DELETE a',
                {   id: id}
            )
        } finally {
            await this.dbNeo4j.session.close()
        }
    }

    async delete(id,strDb){
        if (strDb == null || strDb.toUpperCase() == "SQLITE") {
            this.deleteSqlite(id);
        }
        if (strDb == null || strDb.toUpperCase() == "NEO4J") {
            await this.deleteNeo4j(id);
        }
    }

}



module.exports = Product ;