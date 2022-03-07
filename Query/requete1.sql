SELECT BUY.product_id, count(x)
FROM
(WITH RECURSIVE
  cnt(x,n) AS
  (
  VALUES({$idUser},0)  // {$idUser} doit être remplacé par l''id de l''user du niveau 0
  UNION ALL
  SELECT user1_id,  cnt.n +1
  FROM cnt, FOLLOWS
  WHERE cnt.x = FOLLOWS.user2_id
  AND cnt.n < 5 // 5 correspond au niveau ont peut le remplacer par un niveau que l''on veut
  )
SELECT DISTINCT(x) FROM cnt WHERE x != {$idUser} // {$idUser} doit être remplacé par l''id de l''user du niveau 0
)
INNER JOIN BUY
ON(x = user_id)
GROUP BY(product_id);