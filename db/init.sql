CREATE TABLE IF NOT EXISTS "USERS" (
	"id"	INTEGER,
	"pseudo"	VARCHAR(256) NOT NULL UNIQUE,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "PRODUCT" (
	"id"	INTEGER,
	"name"	varchar(256) NOT NULL UNIQUE,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "FOLLOWS" (
	"user1_id"	INTEGER,
	"user2_id"	INTEGER CHECK(user1_id != user2_id),
	FOREIGN KEY("user1_id") REFERENCES "USERS"("id"),
	FOREIGN KEY("user2_id") REFERENCES "USERS"("id"),
	PRIMARY KEY("user1_id","user2_id")
);

CREATE TABLE IF NOT EXISTS "BUY" (
	"user_id"	INTEGER,
	"product_id"	INTEGER,
	FOREIGN KEY("user_id") REFERENCES "USERS"("id"),
	FOREIGN KEY("product_id") REFERENCES "PRODUCT"("id"),
	PRIMARY KEY("user_id","product_id")
);