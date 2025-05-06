Use heroes_db;

CREATE table users(
    id INT AUTO_INCREMENT PRIMARY KEY ,
    username VARCHAR(25),
    email VARCHAR(100),
    password VARCHAR(255),
    score INT DEFAULT 0
);

-- added this for rank
ALTER TABLE users ADD COLUMN userRank VARCHAR(50);
