<?php
require_once '../includes/functions.php';

header('Content-Type: application/json');

if (isset($_GET['query']) && strlen($_GET['query']) >= 2) {
    $suggestions = getLocationSuggestions($_GET['query']);
    echo json_encode($suggestions);
} else {
    echo json_encode([]);
}
?>