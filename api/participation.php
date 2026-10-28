<?php
// Compatible with the PHP runtime of the existing shared hosting.
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, array('error' => 'method_not_allowed'));
}

$raw = file_get_contents('php://input', false, null, 0, 8193);
if (strlen($raw) > 8192) respond(413, array('error' => 'request_too_large'));
$data = json_decode($raw, true);
if (!is_array($data)) respond(400, array('error' => 'invalid_fields'));

$limits = array('name' => 100, 'email' => 254, 'role' => 20, 'telegram' => 100, 'message' => 2000);
$fields = array();
foreach ($limits as $key => $limit) {
    $value = isset($data[$key]) ? $data[$key] : '';
    if (!is_string($value)) respond(400, array('error' => 'invalid_fields'));
    $fields[$key] = trim($value);
    $length = preg_match_all('/./us', $fields[$key], $unused);
    if ($length === false || $length > $limit) respond(400, array('error' => 'invalid_fields'));
}
if (!empty($data['website']) || !$fields['name'] || preg_match('/[\r\n]/', $fields['name']) ||
    !filter_var($fields['email'], FILTER_VALIDATE_EMAIL) ||
    !in_array($fields['role'], array('tester', 'developer', 'investor', 'ambassador'), true)) {
    respond(400, array('error' => 'invalid_fields'));
}

// This directory is outside public_html and is never included in the site package.
$private = dirname(dirname(__DIR__)) . '/.beresta-private';
$settings = array();
$lines = @file($private . '/telegram.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
if ($lines) foreach ($lines as $line) {
    $pair = explode('=', $line, 2);
    if (count($pair) === 2 && in_array(trim($pair[0]), array('TELEGRAM_BOT_TOKEN', 'TELEGRAM_LEAD_CHAT_ID'), true)) {
        $settings[trim($pair[0])] = trim($pair[1], " \t\r\n\"'");
    }
}
$token = getenv('TELEGRAM_BOT_TOKEN');
$chatId = getenv('TELEGRAM_LEAD_CHAT_ID');
if (!$token && isset($settings['TELEGRAM_BOT_TOKEN'])) $token = $settings['TELEGRAM_BOT_TOKEN'];
if (!$chatId && isset($settings['TELEGRAM_LEAD_CHAT_ID'])) $chatId = $settings['TELEGRAM_LEAD_CHAT_ID'];
if (!$token || !$chatId) respond(503, array('error' => 'delivery_unavailable'));

$rateDirectory = $private . '/rate-limits';
if (!is_dir($rateDirectory) && !@mkdir($rateDirectory, 0700, true) && !is_dir($rateDirectory)) {
    respond(503, array('error' => 'delivery_unavailable'));
}
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
$rateFile = $rateDirectory . '/' . hash('sha256', $ip) . '.json';
$lock = @fopen($rateFile, 'c+');
if (!$lock || !flock($lock, LOCK_EX)) respond(503, array('error' => 'delivery_unavailable'));
$attempts = json_decode(stream_get_contents($lock), true);
if (!is_array($attempts)) $attempts = array();
$now = time();
$attempts = array_values(array_filter($attempts, function ($stamp) use ($now) { return is_int($stamp) && $stamp > $now - 3600; }));
if (count($attempts) >= 5) {
    flock($lock, LOCK_UN);
    fclose($lock);
    header('Retry-After: 3600');
    respond(429, array('error' => 'too_many_requests'));
}
$attempts[] = $now;
ftruncate($lock, 0);
rewind($lock);
fwrite($lock, json_encode($attempts));
fflush($lock);
flock($lock, LOCK_UN);
fclose($lock);

$text = implode("\n", array(
    'Новая заявка — Beresta (beresta.one)',
    'Имя: ' . $fields['name'],
    'Email: ' . $fields['email'],
    'Роль: ' . $fields['role'],
    'Telegram: ' . ($fields['telegram'] ? $fields['telegram'] : '—'),
    "О себе:\n" . ($fields['message'] ? $fields['message'] : '—')
));
$payload = json_encode(array('chat_id' => $chatId, 'text' => $text, 'disable_web_page_preview' => true));
$url = 'https://api.telegram.org/bot' . $token . '/sendMessage';
$result = false;
if (function_exists('curl_init')) {
    $curl = curl_init($url);
    curl_setopt_array($curl, array(
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => array('Content-Type: application/json'),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 10
    ));
    $result = curl_exec($curl);
    curl_close($curl);
} else {
    $context = stream_context_create(array('http' => array(
        'method' => 'POST', 'header' => "Content-Type: application/json\r\n",
        'content' => $payload, 'timeout' => 10, 'ignore_errors' => true
    )));
    $result = @file_get_contents($url, false, $context);
}
$response = $result !== false ? json_decode($result, true) : null;
if (!is_array($response) || empty($response['ok'])) respond(502, array('error' => 'delivery_unavailable'));
respond(200, array('ok' => true));
