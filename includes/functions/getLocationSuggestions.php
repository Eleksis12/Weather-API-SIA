<?php
function getLocationSuggestions($query) {
    $apiKey = '5c2f122653c4978e69c79272fa83eb83';
    $url = "https://api.openweathermap.org/geo/1.0/direct?q={$query}&limit=5&appid={$apiKey}";
    
    $response = file_get_contents($url);
    $data = json_decode($response, true);
    
    $suggestions = [];
    if (is_array($data)) {
        foreach ($data as $location) {
            $suggestions[] = [
                'name' => $location['name'],
                'country' => $location['country'],
                'state' => isset($location['state']) ? $location['state'] : '',
                'lat' => $location['lat'],
                'lon' => $location['lon']
            ];
        }
    }
    
    return $suggestions;
}
?>