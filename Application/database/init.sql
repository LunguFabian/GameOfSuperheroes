Use
heroes_db;

CREATE table users
(
    id       INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(25),
    email    VARCHAR(100),
    password VARCHAR(255),
    userRank VARCHAR(50) DEFAULT 'Unranked',
    score    INT     DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE
);

ALTER TABLE users
    ADD COLUMN hero_id INT DEFAULT NULL,
    ADD CONSTRAINT fk_user_hero FOREIGN KEY (hero_id) REFERENCES heroes (id);

CREATE TABLE heroes
(
    id        INT AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(50),
    image_url VARCHAR(255)
);

CREATE TABLE villains
(
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    image_url VARCHAR(255)
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
    language VARCHAR(10) DEFAULT 'ro',
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (hero_id) REFERENCES heroes (id)
);

ALTER TABLE games
    ADD CONSTRAINT fk_games_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

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

ALTER TABLE scenarios
    ADD COLUMN language VARCHAR(10) DEFAULT 'ro';
ALTER TABLE questions
    ADD COLUMN language VARCHAR(10) DEFAULT 'ro';

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

    SELECT id
    INTO scen_id
    FROM scenarios
    WHERE language = NEW.language
    ORDER BY RAND()
        LIMIT 1;

    SELECT id
    INTO q1_id
    FROM questions
    WHERE difficulty = NEW.difficulty AND language = NEW.language
    ORDER BY RAND()
        LIMIT 1;

    SELECT id
    INTO q2_id
    FROM questions
    WHERE difficulty = NEW.difficulty AND language = NEW.language
      AND id != q1_id
    ORDER BY RAND()
        LIMIT 1;

    SELECT id
    INTO q3_id
    FROM questions
    WHERE difficulty = NEW.difficulty AND language = NEW.language
      AND id NOT IN (q1_id, q2_id)
    ORDER BY RAND()
        LIMIT 1;

    INSERT INTO game_info (game_id, scenario_id, question1_id, question2_id, question3_id)
    VALUES (NEW.id, scen_id, q1_id, q2_id, q3_id);
END;
//


DELIMITER ;


INSERT INTO heroes(name, image_url)
VALUES ('Iron Man', 'front/images/iron-man.png'),
       ('Spider-Man', 'front/images/spider-man.png'),
       ('Captain Marvel', 'front/images/captain-marvel.png');


INSERT INTO villains(name,image_url)
VALUES ('Thanos','front/images/thanos.png'),
       ('Green Goblin','front/images/green-goblin.png'),
       ('Ronan the Accuser','front/images/ronan.png'),
       ('Ultron','front/images/ultron.png');

INSERT INTO nemesis(hero_id, villain_id)
VALUES (1, 1),
       (1, 4),
       (2, 1),
       (2, 2),
       (3, 1),
       (3, 3);

INSERT INTO questions (question_text, option1, option2, option3, option4, correct_option, difficulty, score)
VALUES ('Care este capitala Franței?', 'Paris', 'Londra', NULL, NULL, 1, 'easy', 10),
       ('Cine a scris "Romeo si Julieta"?', 'William Shakespeare', 'Mark Twain', NULL, NULL, 1, 'easy', 12),
       ('Ce planetă este cunoscută ca „Planeta Rosie”?', 'Venus', 'Marte', NULL, NULL, 2, 'easy', 10),
       ('Care este simbolul chimic pentru aur?', 'Au', 'Ag', NULL, NULL, 1, 'easy', 5),
       ('În ce an a ajuns omul pentru prima dată pe Lună?', '1965', '1969', NULL, NULL, 2, 'easy', 5),
       ('Ce limbă se vorbeste în Brazilia?', 'Spaniolă', 'Portugheză', NULL, NULL, 2, 'easy', 5);

INSERT INTO questions (question_text, option1, option2, option3, option4, correct_option, difficulty, score)
VALUES ('Care este cea mai lungă râu din lume?', 'Amazon', 'Nil', 'Yangtze', 'Mississippi', 2, 'medium', 15),
       ('Cine a pictat „Cina cea de Taină”?', 'Michelangelo', 'Leonardo da Vinci', 'Rafael', 'Donatello', 2, 'medium',
        15),
       ('Ce element chimic are simbolul „Na”?', 'Sodiu', 'Azot', 'Neon', 'Argint', 1, 'medium', 15),
       ('Câte planete sunt în sistemul solar?', '8', '9', '7', '10', 1, 'medium', 15),
       ('Cine a descoperit penicilina?', 'Alexander Fleming', 'Louis Pasteur', 'Marie Curie', 'Isaac Newton', 1,
        'medium', 15),
       ('Ce țară are cel mai mare număr de locutori?', 'SUA', 'China', 'India', 'Indonezia', 2, 'medium', 15);

INSERT INTO questions (question_text, option1, option2, option3, option4, correct_option, difficulty, score)
VALUES ('Cine a fost primul om care a păsit pe Lună?', 'Neil Armstrong', NULL, NULL, NULL, 1, 'hard', 25),
       ('Ce imperiu a construit Colosseumul din Roma?', 'Imperiul Roman', NULL, NULL, NULL, 1, 'hard', 25),
       ('Ce țară are cea mai veche monarhie din lume?', 'Japonia', NULL, NULL, NULL, 1, 'hard', 25),
       ('Care este limba oficială în Elveția care nu este vorbită în alte țări?', 'Retoromana', NULL, NULL, NULL, 1,
        'hard', 25),
       ('Câte continente există pe glob?', '7', NULL, NULL, NULL, 1, 'hard', 25),
       ('Ce savant român a inventat stiloul?', 'Petrache Poenaru', NULL, NULL, NULL, 1, 'hard', 25);


INSERT INTO scenarios (part1, part2, part3, part4)
VALUES ('Într-o noapte haotică, un portal interdimensional se deschide în mijlocul orasului. O versiune distorsionată a lumii tale apare prin el. Din oglindă te priveste un oraș rupt, inversat… și condus de [ENEMY_NAME].',
        'Traversezi portalul. În această lume, eroii sunt venerați ca zei, iar cetățenii trăiesc în frică. În această lume, tu ești o legendă… dar și un dictator. [ENEMY_NAME] a deturnat imaginea ta și a construit o întreagă societate în jurul fricii.',
        'Ajungi în centrul capitalei. Totul e tăcut. Roboții de patrulare te confundă cu „varianta ta malefică” și te conduc direct în palatul central. Acolo, [ENEMY_NAME] te așteaptă, cu un zâmbet rece: „Acum înțelegi cât de ușor e să controlezi lumea…”',
        'Într-o confruntare de voințe, distrugi mecanismul care menținea deschis portalul și eliberezi populația din hipnoză. În haosul prăbușirii dimensiunii oglindă, te întorci în lumea ta. În urma ta, oglinda se sparge în mii de cioburi. Răul a fost închis. Pentru acum.'),
       ('O alertă de grad zero vine direct de la o rețea satelitară de securitate. Cineva a declanșat „Codul Apocalipsei” — un set de protocoale de distrugere globală scrise în caz de invazie extraterestră. Dar nu a fost nicio invazie. Doar [ENEMY_NAME].',
        'Ajungi într-un buncăr subteran vechi de decenii. Acolo, calculatoare masive, tuburi catodice, și un terminal aprins. Ecranul afișează un countdown. Lipsesc exact 9 minute până la declanșarea autodistrugerii a 3 continente.',
        'Reușești să pătrunzi în sistem. Dar ai de rezolvat o serie de ecuații și coduri logice rămase din vremea Războiului Rece. [ENEMY_NAME] ți-a lăsat capcane. Greșești? Se accelerează timer-ul. Te concentrezi.',
        'Cu 7 secunde rămase, tastezi ultimele caractere. Sirena se oprește. Ecranul devine negru. Aerul devine din nou respirabil. Pe camera de supraveghere, [ENEMY_NAME] îți face o reverență sarcastică. „Ai câștigat azi. Dar mâine… voi rescrie Codul.”');

INSERT INTO scenarios (part1, part2, part3, part4)
VALUES ('Un nor ciudat acoperă orașul peste noapte. Dimineața, oamenii descoperă că toate sursele de energie electrică au dispărut. În mijlocul pieței, un generator uriaș pulsând cu energie necunoscută, purtând semnătura lui [ENEMY_NAME].',
        'Investigând generatorul, găsești dispozitive de control atașate la fiecare stâlp de iluminat. [ENEMY_NAME] apare pe toate ecranele din oraș: „Fără lumină, fără speranță! Vreau să văd cine se descurcă în întuneric.”',
        'Reușești să dezactivezi o parte din dispozitive, dar generatorul începe să acumuleze energie periculos de repede. Ai la dispoziție doar câteva minute să dezamorsezi sistemul.',
        'La limită, reușești să inversezi fluxul de energie și să restabilești curentul. [ENEMY_NAME] dispare din nou, lăsând în urmă promisiunea unui nou joc de umbre.'),
       ('Un val de frig extrem lovește orașul în plină vară. Toate râurile și lacurile îngheață instantaneu. Pe un bloc de gheață uriaș, stă [ENEMY_NAME], scufundând orașul într-o iarnă veșnică.',
        'Te aventurezi spre centrul fenomenului, unde descoperi un dispozitiv climatic controlat de [ENEMY_NAME]. Străzile sunt pustii, iar pericolele se ascund sub zăpadă.',
        'Ajungi la laboratorul improvizat al lui [ENEMY_NAME], unde trebuie să rezolvi o serie de puzzle-uri pentru a dezactiva sistemul de răcire înainte ca orașul să fie îngropat sub un nou strat de gheață.',
        'Reușești să oprești dispozitivul, iar temperaturile revin la normal. Oamenii ies din case, iar [ENEMY_NAME] te provoacă la „runda a doua” printr-un mesaj criptic.'),
       ('O ceață violetă acoperă orașul. Oricine o inhalează începe să uite cine este. În centrul orașului, [ENEMY_NAME] orchestrează haosul dintr-un turn radio abandonat.',
        'Încerci să navighezi printre locuitorii amnezici, evitând capcanele plasate de [ENEMY_NAME]. Găsești jurnalul unui om de știință care documentează antidotul pentru ceață.',
        'Ajungi la turnul radio și descoperi că doar o frecvență anume poate dispersa ceața. Trebuie să setezi corect echipamentul înainte ca memoria tuturor să fie pierdută definitiv.',
        'Activezi frecvența potrivită, ceața dispare, iar oamenii își recapătă amintirile. [ENEMY_NAME] jură să revină cu o toxină și mai puternică.'),
       ('Zgomote ciudate se aud noaptea din subteranul orașului. O rețea de tunele vechi devine scena unor dispariții misterioase. [ENEMY_NAME] construiește acolo o armată de roboți.',
        'Cobori în subteran și găsești planurile armatei. Roboții sunt programați să atace la miezul nopții. Timpul este scurt.',
        'Trebuie să dezactivezi nucleul de control central înainte ca roboții să fie activați. Capcane mecanice și ghicitori blochează drumul către cameră de comandă.',
        'Cu un efort supraomenesc, dezactivezi sistemul principal și salvezi orașul. Armata lui [ENEMY_NAME] rămâne inertă, dar amenințarea nu a dispărut definitiv.');

INSERT INTO questions (question_text, option1, option2, option3, option4, correct_option, difficulty, score)
VALUES ('Ce culoare are cerul într-o zi senină?', 'Albastru', 'Galben', NULL, NULL, 1, 'easy', 5),
       ('Care este cel mai mic număr par?', '0', '2', NULL, NULL, 1, 'easy', 5),
       ('Câte zile are o săptămână?', '5', '7', NULL, NULL, 2, 'easy', 5),
       ('Cum se numește planeta noastră?', 'Luna', 'Pământ', NULL, NULL, 2, 'easy', 5),
       ('Ce animal face „miau”?', 'Pisica', 'Câinele', NULL, NULL, 1, 'easy', 5),
       ('Care este anotimpul când ninge cel mai des?', 'Vară', 'Iarnă', NULL, NULL, 2, 'easy', 5),
       ('Ce fruct este galben și acru?', 'Lămâie', 'Banana', NULL, NULL, 1, 'easy', 5),
       ('Cum se spune la „good morning” în română?', 'Bună seara', 'Bună dimineața', NULL, NULL, 2, 'easy', 5),
       ('Ce folosești ca să scrii pe hârtie?', 'Pix', 'Furculiță', NULL, NULL, 1, 'easy', 5),
       ('Ce culoare are iarba?', 'Roșie', 'Verde', NULL, NULL, 2, 'easy', 5);

INSERT INTO questions (question_text, option1, option2, option3, option4, correct_option, difficulty, score)
VALUES ('Care este cel mai mare mamifer din lume?', 'Elefant', 'Balena albastră', 'Gorilă', 'Urs polar', 2, 'medium',
        15),
       ('Câți ani are un secol?', '10', '50', '100', '1000', 3, 'medium', 15),
       ('Cine a pictat „Mona Lisa”?', 'Picasso', 'Leonardo da Vinci', 'Van Gogh', 'Rembrandt', 2, 'medium', 15),
       ('Ce țară este faimoasă pentru piramide?', 'Mexic', 'China', 'Egipt', 'Grecia', 3, 'medium', 15),
       ('Cum se numește cel mai lung fluviu din Europa?', 'Dunărea', 'Volga', 'Rinul', 'Loara', 2, 'medium', 15),
       ('Ce gaz respirăm pentru a trăi?', 'Azot', 'Oxigen', 'Dioxid de carbon', 'Heliu', 2, 'medium', 15),
       ('Ce animal este simbolul Australiei?', 'Cangur', 'Leu', 'Tigru', 'Zebra', 1, 'medium', 15),
       ('Care este cel mai rapid animal terestru?', 'Ghepard', 'Leopard', 'Iepure', 'Cal', 1, 'medium', 15),
       ('Ce continent are cei mai mulți locuitori?', 'Africa', 'America de Sud', 'Asia', 'Europa', 3, 'medium', 15),
       ('Cine a inventat becul electric?', 'Edison', 'Tesla', 'Galilei', 'Newton', 1, 'medium', 15);

INSERT INTO questions (question_text, option1, option2, option3, option4, correct_option, difficulty, score)
VALUES ('Care este formula chimică a apei?', 'H2O', NULL, NULL, NULL, 1, 'hard', 25),
       ('Cum se numește cel mai înalt vârf montan din lume?', 'Everest', NULL, NULL, NULL, 1, 'hard', 25),
       ('Cine a scris romanul „Ion”?', 'Liviu Rebreanu', NULL, NULL, NULL, 1, 'hard', 25),
       ('Ce organ al corpului uman produce insulina?', 'Pancreasul', NULL, NULL, NULL, 1, 'hard', 25),
       ('Cine a compus muzica imnului național al României?', 'Anton Pann', NULL, NULL, NULL, 1, 'hard', 25),
       ('Ce planetă are cea mai mare gravitație din sistemul solar?', 'Jupiter', NULL, NULL, NULL, 1, 'hard', 25),
       ('În ce an a avut loc Revoluția Franceză?', '1789', NULL, NULL, NULL, 1, 'hard', 25),
       ('Care este capitala Finlandei?', 'Helsinki', NULL, NULL, NULL, 1, 'hard', 25),
       ('Ce element chimic are simbolul „Fe”?', 'Fier', NULL, NULL, NULL, 1, 'hard', 25),
       ('Cine a fost primul președinte al României după 1989?', 'Ion Iliescu', NULL, NULL, NULL, 1, 'hard', 25);

INSERT INTO heroes(name, image_url)
VALUES ('Thor', 'front/images/thor.png'),
       ('Black Widow', 'front/images/black-widow.png'),
       ('Hulk', 'front/images/hulk.png');

INSERT INTO villains(name, image_url)
VALUES ('Loki', 'front/images/loki.png'),
       ('Red Skull', 'front/images/red-skull.png'),
       ('Abomination', 'front/images/abomination.png');

INSERT INTO nemesis(hero_id, villain_id)
VALUES ((SELECT id FROM heroes WHERE name = 'Thor'), (SELECT id FROM villains WHERE name = 'Loki')),
       ((SELECT id FROM heroes WHERE name = 'Black Widow'), (SELECT id FROM villains WHERE name = 'Red Skull')),
       ((SELECT id FROM heroes WHERE name = 'Hulk'), (SELECT id FROM villains WHERE name = 'Abomination')),
       ((SELECT id FROM heroes WHERE name = 'Thor'), 1),
       ((SELECT id FROM heroes WHERE name = 'Hulk'), 1);

INSERT INTO scenarios (part1, part2, part3, part4, language)
VALUES
-- Scenario 1
('On a chaotic night, an interdimensional portal opens in the middle of the city. A distorted version of your world appears through it. In the mirror, a broken, inverted city stares back... ruled by [ENEMY_NAME].',
 'You cross the portal. In this world, heroes are worshiped as gods, and citizens live in fear. Here, you are a legend... but also a dictator. [ENEMY_NAME] hijacked your image and built an entire society around fear.',
 'You reach the capital''s center. Everything is silent. Patrol robots mistake you for your "evil twin" and escort you directly to the central palace. There, [ENEMY_NAME] awaits, with a cold smile: "Now you see how easy it is to control the world..."',
 'In a clash of wills, you destroy the device keeping the portal open and free the population from hypnosis. As the mirror dimension collapses into chaos, you return to your world. Behind you, the mirror shatters into a thousand pieces. Evil is sealed. For now.',
 'en'),

-- Scenario 2
('A zero-level alert comes directly from a satellite security network. Someone triggered the "Apocalypse Code" — global destruction protocols written in case of alien invasion. But there was no invasion. Only [ENEMY_NAME].',
 'You arrive in a decades-old underground bunker. Massive computers, cathode tubes, and a glowing terminal. The screen displays a countdown. Exactly 9 minutes left until the self-destruction of 3 continents.',
 'You manage to access the system. But you must solve a series of equations and logic codes from the Cold War era. [ENEMY_NAME] left traps. Make a mistake? The timer accelerates. You focus.',
 'With 7 seconds left, you type the final characters. The siren stops. The screen goes black. The air is breathable again. On the surveillance camera, [ENEMY_NAME] bows sarcastically. "You won today. But tomorrow... I will rewrite the Code."',
 'en'),

-- Scenario 3
('A strange cloud covers the city overnight. In the morning, people discover all sources of electricity have vanished. In the city square, a huge generator pulsing with unknown energy, bearing [ENEMY_NAME]’s signature.',
 'Investigating the generator, you find control devices attached to every streetlight. [ENEMY_NAME] appears on every screen in the city: "No light, no hope! Let’s see who can survive in the dark."',
 'You manage to disable some devices, but the generator begins to overload dangerously fast. You have only a few minutes to disarm the system.',
 'At the last moment, you reverse the energy flow and restore the power. [ENEMY_NAME] vanishes again, promising a new game of shadows.',
 'en'),

-- Scenario 4
('A wave of extreme cold hits the city in mid-summer. All rivers and lakes freeze instantly. On a huge block of ice stands [ENEMY_NAME], plunging the city into an eternal winter.',
 'You venture to the center of the phenomenon, where you discover a climate device controlled by [ENEMY_NAME]. The streets are empty, and dangers lurk beneath the snow.',
 'You reach [ENEMY_NAME]’s improvised laboratory, where you must solve a series of puzzles to deactivate the cooling system before the city is buried under another layer of ice.',
 'You stop the device, and temperatures return to normal. People come out of their homes, and [ENEMY_NAME] challenges you to "round two" via a cryptic message.',
 'en'),

-- Scenario 5
('A violet fog covers the city. Anyone who inhales it begins to forget who they are. In the city center, [ENEMY_NAME] orchestrates chaos from an abandoned radio tower.',
 'You try to move among the amnesiac inhabitants, avoiding traps set by [ENEMY_NAME]. You find a scientist’s journal documenting the antidote for the fog.',
 'You reach the radio tower and discover that only a specific frequency can disperse the fog. You must set the equipment correctly before everyone’s memory is lost forever.',
 'You activate the right frequency, the fog disappears, and people regain their memories. [ENEMY_NAME] vows to return with an even stronger toxin.',
 'en'),

-- Scenario 6
('Strange noises are heard at night from the city''s underground. An old network of tunnels becomes the scene of mysterious disappearances. [ENEMY_NAME] is building a robot army down there.',
 'You descend underground and find the army''s plans. The robots are programmed to attack at midnight. Time is running out.',
 'You must deactivate the central control core before the robots are activated. Mechanical traps and riddles block your way to the command room.',
 'With superhuman effort, you deactivate the main system and save the city. [ENEMY_NAME]’s army remains inert, but the threat has not disappeared for good.',
 'en');

INSERT INTO questions (question_text, option1, option2, option3, option4, correct_option, difficulty, score, language)
VALUES ('What color is the sky on a clear day?', 'Blue', 'Yellow', NULL, NULL, 1, 'easy', 5, 'en'),
       ('How many days are in a week?', '5', '7', NULL, NULL, 2, 'easy', 5, 'en'),
       ('What is the capital of France?', 'Paris', 'London', NULL, NULL, 1, 'easy', 5, 'en'),
       ('Which animal says "meow"?', 'Cat', 'Dog', NULL, NULL, 1, 'easy', 5, 'en'),
       ('What do you use to write on paper?', 'Pen', 'Fork', NULL, NULL, 1, 'easy', 5, 'en'),
       ('Which season is the coldest?', 'Winter', 'Summer', NULL, NULL, 1, 'easy', 5, 'en'),
       ('What is 2 + 2?', '3', '4', NULL, NULL, 2, 'easy', 5, 'en'),
       ('What is the opposite of "yes"?', 'No', 'Maybe', NULL, NULL, 1, 'easy', 5, 'en'),
       ('Which planet do we live on?', 'Earth', 'Mars', NULL, NULL, 1, 'easy', 5, 'en'),
       ('How many legs does a spider have?', '6', '8', NULL, NULL, 2, 'easy', 5, 'en'),
       ('What is the first month of the year?', 'January', 'December', NULL, NULL, 1, 'easy', 5, 'en'),
       ('What color are bananas?', 'Yellow', 'Red', NULL, NULL, 1, 'easy', 5, 'en'),
       ('Which animal is known as man''s best friend?', 'Dog', 'Cat', NULL, NULL, 1, 'easy', 5, 'en'),
       ('What is the capital of Italy?', 'Rome', 'Milan', NULL, NULL, 1, 'easy', 5, 'en'),
       ('How many hours are in a day?', '24', '12', NULL, NULL, 1, 'easy', 5, 'en'),
       ('What is the main ingredient in bread?', 'Flour', 'Butter', NULL, NULL, 1, 'easy', 5, 'en'),
       ('What is the largest ocean?', 'Atlantic', 'Pacific', NULL, NULL, 2, 'easy', 5, 'en'),
       ('Which shape has three sides?', 'Triangle', 'Square', NULL, NULL, 1, 'easy', 5, 'en');

INSERT INTO questions (question_text, option1, option2, option3, option4, correct_option, difficulty, score, language)
VALUES ('Who painted the Mona Lisa?', 'Picasso', 'Leonardo da Vinci', 'Rembrandt', 'Dali', 2, 'medium', 10, 'en'),
       ('Which country is famous for the pyramids?', 'Greece', 'Egypt', 'India', 'Italy', 2, 'medium', 10, 'en'),
       ('What gas do we breathe to live?', 'Oxygen', 'Carbon Dioxide', 'Hydrogen', 'Nitrogen', 1, 'medium', 10, 'en'),
       ('Which animal is a symbol of Australia?', 'Kangaroo', 'Lion', 'Panda', 'Tiger', 1, 'medium', 10, 'en'),
       ('What is the largest planet in our solar system?', 'Earth', 'Mars', 'Jupiter', 'Saturn', 3, 'medium', 10, 'en'),
       ('How many continents are there?', '5', '6', '7', '8', 3, 'medium', 10, 'en'),
       ('Who discovered penicillin?', 'Newton', 'Fleming', 'Pasteur', 'Curie', 2, 'medium', 10, 'en'),
       ('What is the boiling point of water (°C)?', '90', '100', '120', '80', 2, 'medium', 10, 'en'),
       ('What is the largest mammal?', 'Elephant', 'Blue Whale', 'Giraffe', 'Hippo', 2, 'medium', 10, 'en'),
       ('Which planet is called the Red Planet?', 'Venus', 'Mars', 'Mercury', 'Jupiter', 2, 'medium', 10, 'en'),
       ('How many bones are in the adult human body?', '206', '208', '210', '196', 1, 'medium', 10, 'en'),
       ('Who wrote "Hamlet"?', 'Charles Dickens', 'Shakespeare', 'Tolstoy', 'Hemingway', 2, 'medium', 10, 'en'),
       ('Which is the smallest prime number?', '1', '2', '3', '5', 2, 'medium', 10, 'en'),
       ('Who was the first president of the USA?', 'Lincoln', 'Washington', 'Jefferson', 'Adams', 2, 'medium', 10,
        'en'),
       ('Which ocean is between Africa and Australia?', 'Atlantic', 'Indian', 'Pacific', 'Arctic', 2, 'medium', 10,
        'en'),
       ('What is the hardest natural substance?', 'Gold', 'Diamond', 'Iron', 'Silver', 2, 'medium', 10, 'en'),
       ('What is the capital of Japan?', 'Beijing', 'Seoul', 'Tokyo', 'Bangkok', 3, 'medium', 10, 'en'),
       ('Who invented the telephone?', 'Edison', 'Bell', 'Tesla', 'Jobs', 2, 'medium', 10, 'en');

INSERT INTO questions (question_text, option1, option2, option3, option4, correct_option, difficulty, score, language)
VALUES ('What is the chemical formula for water?', 'H2O', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('Who wrote "1984"?', 'George Orwell', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('What is the capital city of Canada?', 'Ottawa', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('Who discovered gravity?', 'Isaac Newton', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('What is the largest desert in the world?', 'Sahara', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('Who was the first person on the Moon?', 'Neil Armstrong', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('Which element has the symbol "Fe"?', 'Iron', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('What is the currency of Japan?', 'Yen', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('Who painted the ceiling of the Sistine Chapel?', 'Michelangelo', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('What is the square root of 144?', '12', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('Where is the Taj Mahal located?', 'India', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('Who developed the theory of relativity?', 'Albert Einstein', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('What is the largest country by area?', 'Russia', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('What is the process by which plants make food?', 'Photosynthesis', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('Who was the Greek god of war?', 'Ares', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('What is the freezing point of water (°C)?', '0', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('Who is known as the "Father of Computers"?', 'Charles Babbage', NULL, NULL, NULL, 1, 'hard', 25, 'en'),
       ('Which scientist proposed the three laws of motion?', 'Isaac Newton', NULL, NULL, NULL, 1, 'hard', 25, 'en');