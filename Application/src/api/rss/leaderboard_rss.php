<?php
global $conn;
header("Content-Type: application/rss+xml; charset=UTF-8");

include_once('../../includes/db.php');

$stmt = $conn->prepare("
    SELECT username, score, userRank
    FROM users
    ORDER BY score DESC
    LIMIT 10
");
$stmt->execute();
$result = $stmt->get_result();

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<rss version="2.0">
    <channel>
        <title>Top Players - The Game of SuperHeroes</title>
        <link>http://localhost:8082/home</link>
        <description>The leaderboard of the top 10 players</description>
        <language>en-en</language>
        <pubDate><?php echo date(DATE_RSS); ?></pubDate>

        <?php
        while ($row = $result->fetch_assoc()):
            $title = htmlspecialchars($row['username'] . " (" . $row['userRank'] . ") - " . $row['score'] . " points");
            $description = htmlspecialchars("Player " . $row['username'] . " has rank " . $row['userRank'] . " and " . $row['score'] . " points.");
            $guid = md5($row['username'] . $row['score'] . $row['userRank']);
            ?>
            <item>
                <title><?= $title ?></title>
                <description><?= $description ?></description>
                <guid isPermaLink="false"><?= $guid ?></guid>
            </item>
        <?php endwhile; ?>
    </channel>
</rss>

<?php exit; ?>
