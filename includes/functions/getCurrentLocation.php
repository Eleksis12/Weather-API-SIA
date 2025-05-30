<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

function getCurrentLocation() {
    return [
        'success' => true,
        'message' => 'Location data retrieved successfully',
        'data' => [
            'latitude' => null,
            'longitude' => null
        ]
    ];
}
?>