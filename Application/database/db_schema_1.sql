Use heroes_db;

CREATE table users(
    id INT AUTO_INCREMENT PRIMARY KEY ,
    username VARCHAR(25),
    email VARCHAR(100),
    password VARCHAR(255),
    score INT DEFAULT 0
);

INSERT INTO users(username, email, password)
VALUES ('user1','user1@email.com','parola');