<?php
// Include fișierul cu conexiunea la baza de date
global $conn;
include('includes/db.php'); // Asigură-te că fișierul db.php este în același director

// Interogare pentru a prelua toți utilizatorii
$sql = "SELECT id, username, email, score FROM users";
$result = $conn->query($sql);

// Verifică dacă există rezultate
if ($result->num_rows > 0) {
    // Afișează rezultatele
    echo "<table border='1'>
            <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Score</th>
            </tr>";
    while($row = $result->fetch_assoc()) {
        echo "<tr>
                <td>" . $row["id"] . "</td>
                <td>" . $row["username"] . "</td>
                <td>" . $row["email"] . "</td>
                <td>" . $row["score"] . "</td>
              </tr>";
    }
    echo "</table>";
} else {
    echo "0 rezultate";
}

$conn->close();
