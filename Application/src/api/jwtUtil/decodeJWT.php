<?php

function decodeJWT($jwt):?array{
    $parts = explode('.', $jwt);
    if (count($parts) != 3) {
        return null;
    }
    $payloadEncoded = $parts[1];

    return json_decode(base64_decode($payloadEncoded), true);
}