<?php
// filepath: api/pinned.php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions/getPinnedLocations.php';

header('Content-Type: application/json');
session_start();
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 1; // Use session or default

$pinnedLocations = getPinnedLocations($user_id);

echo json_encode($pinnedLocations);
