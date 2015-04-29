<?php

define('MAX_SIZE', 500 * 1024);

$url = (isset($_GET['url'])) ? $_GET['url'] : false;
if(!$url || filter_var($url, FILTER_VALIDATE_URL) === false){
    header("HTTP/1.1 400 Bad Request");
    header(':', false, 400);
    exit("Invalid URL");
}

$referer = (isset($_SERVER['HTTP_REFERER'])) ? strtolower($_SERVER['HTTP_REFERER']) : false;
$is_allowed = $referer && strpos($referer, strtolower($_SERVER['SERVER_NAME'])) !== false;

if (!$is_allowed){
    header("HTTP/1.1 403 Forbidden");
    header(':', false, 403);
    exit("Forbidden");
}

if(ini_get('allow_url_fopen')){
    $output = utf8_encode(file_get_contents($url, null, null, 0, MAX_SIZE));
} else if (function_exists('curl_version')){
    $output = '';
    function download_callback($ch, $chunk) {
        global $output;
        static $len = 0;
        $len += strlen($chunk);
        if ($len > MAX_SIZE) return -1;
        $output .= $chunk;
        return strlen($chunk);
    }
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_BUFFERSIZE, 50000);
    curl_setopt($ch, CURLOPT_WRITEFUNCTION, 'download_callback');
    curl_exec($ch);
    if ($error = curl_error($ch)){
        header("HTTP/1.1 400 Bad Request");
        header(':', false, 400);
        exit($error);
    }
    curl_close($ch);
    if (!strlen($output)){
        header("HTTP/1.1 400 Bad Request");
        header(':', false, 400);
        exit("Empty answer");
    }
} else {
    header("HTTP/1.1 503 Service Unavailable");
    header(':', false, 503);
    exit("Service Unavailable");
}

header("HTTP/1.1 200 OK");
header(':', false, 200);
exit($output);
