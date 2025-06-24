# 📚 Game of Superheroes

An educational and interactive web game built with PHP and designed for teenagers. Game of Superheroes combines gamified storytelling with quiz-based learning across grammar, mathematics, and general knowledge.

---

## 📌 General Info

Game of Superheroes is an educational web game developed in **PHP 8.2** (no frameworks), aimed at teenagers. The game guides players through progressively challenging levels using an interactive storyline where answering educational questions allows advancement and the defeat of enemies.

Key features include:

* Progressive difficulty levels
* A scoring system with a dynamic ranking
* Victory and defeat conditions
* Internationalization (EN/RO)
* Accessibility
* A public leaderboard with an RSS feed

---

## 🖼️ Screenshots

> 📷 A screenshot will be added manually from a local file.

---

## 🧑‍💻 Tech Stack

* **Frontend:** HTML, CSS, JavaScript (Vanilla)
* **Backend:** PHP 8.2
* **Database:** MySQL 8
* **Tools:** Docker

---

## 🎯 Features

* **Authentication**: Users can register with a username, email, and password. Login is done via username and password, which generates a JWT stored in local storage.
* **Levels of Difficulty**:

  * **Easy**: 2 answer choices
  * **Medium**: 4 answer choices
  * **Hard**: open-ended question
* **Topics Covered**:

  * Grammar
  * Mathematics
  * General Knowledge
* **Scoring and Ranks**:

  * Players earn points for each correct answer.
  * Accumulated points from multiple games determine a rank:

    * **Rookie** (< 100)
    * **Sidekick** (> 100)
    * **Hero in Training** (> 250)
    * **Vigilante** (> 500)
    * **Superhero** (> 1000)
    * **Legendary** (> 2500)
    * **Mythic** (> 5000)
* **Leaderboard**:

  * Public
  * Also available via RSS feed
* **Internationalization**:

  * English
  * Romanian
* **Accessibility**:

  * Optimized for screen readers and keyboard navigation

---

## 🌐 Internationalization

Supports:

* English
* Romanian

---

## ♿ Accessibility

The game is designed with accessibility in mind, following web standards for usability.

---

## 🗂️ Color Reference

> 🎨 A superhero-themed color palette is applied.

---

## ⚙️ Installation / Run Locally

### Prerequisites

* Docker

### Steps

```bash
# Clone the project
$ git clone https://github.com/your-username/GameOfSuperheroes.git

# Navigate to the project folder
$ cd GameOfSuperheroes

# Run with Docker Compose
$ docker-compose up --build
```

* On first build, an `init.sql` script initializes the database.

---

## 🔐 Environment Variables

Environment configuration is handled via Docker. Common variables used include:

* `DB_HOST`
* `DB_USER`
* `DB_PASSWORD`
* `JWT_SECRET`

---

## ✅ Roadmap

* Add more scenarios and missions
* Expand the question bank
* Introduce new heroes and villains

---

## 👥 Contributors

* **Fabian Lungu** – [fabian\_lungu23@yahoo.com](mailto:fabian_lungu23@yahoo.com)
* **Bianca Milea** – [biancamilea593@yahoo.com](mailto:biancamilea593@yahoo.com)

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

Reach out to the contributors directly:

* **Fabian Lungu** – [fabian\_lungu23@yahoo.com](mailto:fabian_lungu23@yahoo.com)
* **Bianca Milea** – [biancamilea593@yahoo.com](mailto:biancamilea593@yahoo.com)

---

> 🚀 Game of Superheroes – Where learning and heroism go hand in hand!
