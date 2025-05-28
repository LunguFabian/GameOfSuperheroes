Use
    heroes_db;

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
    id         INT AUTO_INCREMENT PRIMARY KEY,
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

DELIMITER
//

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
    ADD CONSTRAINT fk_user_hero FOREIGN KEY (hero_id) REFERENCES heroes (id);

INSERT INTO heroes(name, image_url)
VALUES ('Iron Man', 'https://example.com/images/ironman.png'),
       ('Spider-Man', 'https://example.com/images/spiderman.png'),
       ('Captain Marvel', 'https://example.com/images/captainmarvel.png');


INSERT INTO villains(name)
VALUES ('Thanos'),
       ('Green Goblin'),
       ('Ronan the Accuser'),
       ('Ultron');

INSERT INTO nemesis(hero_id, villain_id)
VALUES (1, 1),
       (1, 4),
       (2, 1),
       (2, 2),
       (3, 1),
       (3, 3);

INSERT INTO questions (question_text, option1, option2, option3, option4, correct_option, difficulty, score)
VALUES ('Care este capitala Franței?', 'Paris', 'Londra', NULL, NULL, 1, 'easy', 10),
       ('Cine a scris "Romeo și Julieta"?', 'William Shakespeare', 'Mark Twain', NULL, NULL, 1, 'easy', 12),
       ('Ce planetă este cunoscută ca „Planeta Roșie”?', 'Venus', 'Marte', NULL, NULL, 2, 'easy', 10),
       ('Care este simbolul chimic pentru aur?', 'Au', 'Ag', NULL, NULL, 1, 'easy', 5),
       ('În ce an a ajuns omul pentru prima dată pe Lună?', '1965', '1969', NULL, NULL, 2, 'easy', 5),
       ('Ce limbă se vorbește în Brazilia?', 'Spaniolă', 'Portugheză', NULL, NULL, 2, 'easy', 5);

INSERT INTO scenarios (part1, part2, part3, part4)
VALUES ('Într-o noapte haotică, un portal interdimensional se deschide în mijlocul orașului. O versiune distorsionată a lumii tale apare prin el. Din oglindă te privește un oraș rupt, inversat… și condus de [ENEMY_NAME].',
        'Traversezi portalul. În această lume, eroii sunt venerați ca zei, iar cetățenii trăiesc în frică. În această lume, tu ești o legendă… dar și un dictator. [ENEMY_NAME] a deturnat imaginea ta și a construit o întreagă societate în jurul fricii.',
        'Ajungi în centrul capitalei. Totul e tăcut. Roboții de patrulare te confundă cu „varianta ta malefică” și te conduc direct în palatul central. Acolo, [ENEMY_NAME] te așteaptă, cu un zâmbet rece: „Acum înțelegi cât de ușor e să controlezi lumea…”',
        'Într-o confruntare de voințe, distrugi mecanismul care menținea deschis portalul și eliberezi populația din hipnoză. În haosul prăbușirii dimensiunii oglindă, te întorci în lumea ta. În urma ta, oglinda se sparge în mii de cioburi. Răul a fost închis. Pentru acum.'),
       ('O alertă de grad zero vine direct de la o rețea satelitară de securitate. Cineva a declanșat „Codul Apocalipsei” — un set de protocoale de distrugere globală scrise în caz de invazie extraterestră. Dar nu a fost nicio invazie. Doar [ENEMY_NAME].',
        'Ajungi într-un buncăr subteran vechi de decenii. Acolo, calculatoare masive, tuburi catodice, și un terminal aprins. Ecranul afișează un countdown. Lipsesc exact 9 minute până la declanșarea autodistrugerii a 3 continente.',
        'Reușești să pătrunzi în sistem. Dar ai de rezolvat o serie de ecuații și coduri logice rămase din vremea Războiului Rece. [ENEMY_NAME] ți-a lăsat capcane. Greșești? Se accelerează timer-ul. Te concentrezi.',
        'Cu 7 secunde rămase, tastezi ultimele caractere. Sirena se oprește. Ecranul devine negru. Aerul devine din nou respirabil. Pe camera de supraveghere, [ENEMY_NAME] îți face o reverență sarcastică. „Ai câștigat azi. Dar mâine… voi rescrie Codul.”');


update users set hero_id = 1 where id=1;
