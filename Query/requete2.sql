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