<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

// Function to add a pinned location
function addPinnedLocation($city, $country, $lat, $lon, $user_id = 1) {
    global $conn;
    
    // Check if location already exists
    $stmt = $conn->prepare("SELECT id FROM pinned_locations WHERE user_id = ? AND city = ? AND country = ?");
    $stmt->bind_param("iss", $user_id, $city, $country);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        return false; // Location already pinned
    }
    
    $stmt = $conn->prepare("INSERT INTO pinned_locations (user_id, city, country, lat, lon) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("issdd", $user_id, $city, $country, $lat, $lon);
    $success = $stmt->execute();
    $stmt->close();
    
    return $success;
}