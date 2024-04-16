CREATE TABLE news_articles (
    id SERIAL PRIMARY KEY,
    source varchar(30) NOT NULL,
    featureImage varchar(350) NOT NULL,
    body text NOT NULL,
    postedOn TIMESTAMP NOT NULL
);

ALTER TABLE news_articles ALTER COLUMN postedOn TIMESTAMP;

INSERT INTO news_articles (source, featureImage, body, postedOn) VALUES (

    'dfdd',
    'defzfd', 
    'sdzd',
    '2024-03-03T23:00:00.000Z'
);

DROP TABLE news_articles;

ALTER table news_articles RENAME COLUMN featureimage to feature_image;

SELECT * FROM news_articles;

DELETE FROM news_articles WHERE (title IS NULL);