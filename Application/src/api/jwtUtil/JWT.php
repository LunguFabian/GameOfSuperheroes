<?php
function base64UrlEncode($data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function generateJWT($payload): string
{
    $key='cheie_mega_secreta_123123_wow_ce_tare';
    $header=['alg'=>'HS256','typ'=>'JWT'];
    $headerEncoded = base64UrlEncode(json_encode($header));
    $payloadEncoded = base64UrlEncode(json_encode($payload));

    $signature=base64UrlEncode(hash_hmac('sha256', $headerEncoded.'.'.$payloadEncoded, $key, true));
    return $headerEncoded.'.'.$payloadEncoded.'.'.$signature;
}