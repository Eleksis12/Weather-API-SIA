<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

// Function to remove a pinned location
function removePinnedLocation($id, $user_id = 1) {
    global $conn;
    
    $stmt = $conn->prepare("DELETE FROM pinned_locations WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $id, $user_id);
    $success = $stmt->execute();
    $stmt->close();
    
    return $success;
}