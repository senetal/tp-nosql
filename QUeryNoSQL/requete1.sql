MATCH (Followed:User) WHERE Followed.id = 7207
MATCH Follower = (Followed)<-[:Follow*1..5]-(u:User)
WITH distinct u as u
MATCH (p)-[:Buy]-(r:Product)
WITH count(r) as nbProduit, r
RETURN r.name as nomProduit, nbProduit as totalNbProduit;