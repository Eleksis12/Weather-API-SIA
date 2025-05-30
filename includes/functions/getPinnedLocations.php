<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

/// Function to get pinned locations from database
function getPinnedLocations($user_id = 1) {
    global $conn;
    
    $stmt = $conn->prepare("SELECT * FROM pinned_locations WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $locations = [];
    while ($row = $result->fetch_assoc()) {
        $locations[] = $row;
    }
    
    $stmt->close();
    return $locations;
}
