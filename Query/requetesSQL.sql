---------------------------------------------------------------------------------------------
======================================== REQUETE 1 ==========================================
---------------------------------------------------------------------------------------------
SELECT BUY.product_id, count(x)
FROM
(WITH RECURSIVE
  cnt(x,n) AS
  (
  VALUES({$idUser},0)
  UNION ALL
  SELECT user1_id,  cnt.n +1
  FROM cnt, FOLLOWS
  WHERE cnt.x = FOLLOWS.user2_id
  AND cnt.n < 5
  )
SELECT DISTINCT(x) FROM cnt WHERE x != {$idUser}
)
INNER JOIN BUY
ON(x = user_id)
GROUP BY(product_id);
---------------------------------------------------------------------------------------------
======================================== REQUETE 2 ==========================================
---------------------------------------------------------------------------------------------

SELECT BUY.product_id, count(x) as nbAchat
FROM
(WITH RECURSIVE
  cnt(x,n) AS
  (
  VALUES({$idUser},0)
  UNION ALL
  SELECT user1_id,  cnt.n +1
  FROM cnt, FOLLOWS
  WHERE cnt.x = FOLLOWS.user2_id
  AND cnt.n < 5
  )
SELECT DISTINCT(x) FROM cnt WHERE x != {$idUser}
)
INNER JOIN BUY
ON(x = user_id)
WHERE product_id = {$idProduct}
GROUP BY(product_id);
---------------------------------------------------------------------------------------------
======================================== REQUETE 3 ==========================================
---------------------------------------------------------------------------------------------
SELECT n as niveau, count(x) as nbAchat
FROM
(WITH RECURSIVE
  cnt(x,n,parent) AS
  (
  SELECT user_id, 0, '' FROM BUY WHERE BUY.product_id = {$idProduit}
  UNION ALL
  SELECT user1_id,  cnt.n +1, x
  FROM cnt, FOLLOWS, BUY
  WHERE cnt.x = FOLLOWS.user2_id
  AND BUY.product_id = {$idProduit}
  AND BUY.user_id = user1_id
  AND user_id != parent
  AND user2_id != parent
  AND cnt.n < 5
  )
  select DISTINCT x, n from cnt)
  group by niveau