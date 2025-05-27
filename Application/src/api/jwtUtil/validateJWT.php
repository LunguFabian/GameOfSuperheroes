<?php
function base64UrlEncode($data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function validateJWT($jwt):bool{
    $key='cheie_mega_secreta_123123_wow_ce_tare';

    $parts=explode('.', $jwt);
    if (count($parts) != 3) {
        return false;
    }

    [$header,$payload,$signature]=$parts;

    $expectedSignature = base64UrlEncode(hash_hmac('sha256', $header.'.'.$payload, $key, true));
    if(!hash_equals($signature, $expectedSignature)) {
        return false;
    }

    $decodedPayload=decodeJWT($jwt);

    if(!isset($decodedPayload['exp'])|| $decodedPayload['exp']<time()){
        return false;
    }

    return true;
}