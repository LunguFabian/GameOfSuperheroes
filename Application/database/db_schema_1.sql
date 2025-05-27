Use heroes_db;

CREATE table users
(
    id       INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(25),
    email    VARCHAR(100),
    password VARCHAR(255),
    score    INT DEFAULT 0
);

ALTER TABLE users
ADD COLUMN userRank VARCHAR(50);

CREATE TABLE heroes
(
    id        INT AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(50),
    image_url VARCHAR(255)
);

CREATE TABLE villains
(
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE nemesis
(
    id         INT AUTO_INCREMENT,
    hero_id    INT NOT NULL,
    villain_id INT NOT NULL,
    FOREIGN KEY (hero_id) REFERENCES heroes (id),
    FOREIGN KEY (villain_id) REFERENCES villains (id),
    UNIQUE (hero_id, villain_id)
);

CREATE TABLE games
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT                             NOT NULL,
    hero_id    INT                             NOT NULL,
    difficulty ENUM ('easy', 'medium', 'hard') NOT NULL,
    score      INT       DEFAULT -1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (hero_id) REFERENCES heroes (id)
);

CREATE TABLE scenarios
(
    id    INT AUTO_INCREMENT PRIMARY KEY,
    part1 TEXT NOT NULL,
    part2 TEXT NOT NULL,
    part3 TEXT NOT NULL,
    part4 TEXT NOT NULL
);

CREATE TABLE questions
(
    id             INT PRIMARY KEY AUTO_INCREMENT,
    question_text  TEXT                            NOT NULL,
    option1        VARCHAR(255),
    option2        VARCHAR(255),
    option3        VARCHAR(255),
    option4        VARCHAR(255),
    correct_option TINYINT                         NOT NULL,
    difficulty     ENUM ('easy', 'medium', 'hard') NOT NULL,
    score          INT DEFAULT 10
);

CREATE TABLE game_info
(
    id           INT PRIMARY KEY AUTO_INCREMENT,
    game_id      INT,
    scenario_id  INT,
    question1_id INT,
    question2_id INT,
    question3_id INT,

    FOREIGN KEY (game_id) REFERENCES games (id) ON DELETE CASCADE,
    FOREIGN KEY (scenario_id) REFERENCES scenarios (id) ON DELETE SET NULL,
    FOREIGN KEY (question1_id) REFERENCES questions (id),
    FOREIGN KEY (question2_id) REFERENCES questions (id),
    FOREIGN KEY (question3_id) REFERENCES questions (id)
);

DELIMITER //

CREATE TRIGGER after_game_insert
    AFTER INSERT
    ON games
    FOR EACH ROW
BEGIN
    DECLARE scen_id INT;
    DECLARE q1_id INT;
    DECLARE q2_id INT;
    DECLARE q3_id INT;

    -- Selectează un scenariu aleator
    SELECT id
    INTO scen_id
    FROM scenarios
    ORDER BY RAND()
    LIMIT 1;

    -- Selectează 3 întrebări random cu dificultatea jocului
    SELECT id
    INTO q1_id
    FROM questions
    WHERE difficulty = NEW.difficulty
    ORDER BY RAND()
    LIMIT 1;

    SELECT id
    INTO q2_id
    FROM questions
    WHERE difficulty = NEW.difficulty
      AND id != q1_id
    ORDER BY RAND()
    LIMIT 1;

    SELECT id
    INTO q3_id
    FROM questions
    WHERE difficulty = NEW.difficulty
      AND id NOT IN (q1_id, q2_id)
    ORDER BY RAND()
    LIMIT 1;

    -- Inserează în game_info
    INSERT INTO game_info (game_id, scenario_id, question1_id, question2_id, question3_id)
    VALUES (NEW.id, scen_id, q1_id, q2_id, q3_id);
END;
//

DELIMITER ;

ALTER TABLE users
ADD COLUMN hero_id INT DEFAULT NULL,
ADD CONSTRAINT fk_user_hero FOREIGN KEY (hero_id) REFERENCES heroes(id);