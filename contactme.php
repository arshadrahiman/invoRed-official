<?php   
    require("./mailing/mailfunction.php");

    $name = isset($_POST["name"]) ? trim($_POST["name"]) : '';
    $phone = isset($_POST["phone"]) ? trim($_POST["phone"]) : '';
    $email = isset($_POST["email"]) ? trim($_POST["email"]) : '';
    $need = isset($_POST["need"]) ? trim($_POST["need"]) : 'General inquiry';
    $company = isset($_POST["company"]) ? trim($_POST["company"]) : '';
    $message = isset($_POST["message"]) ? trim($_POST["message"]) : '';

    $body = "<h3>New InvoRed Project Brief</h3>" .
            "<ul>" .
            "<li><strong>Name:</strong> " . htmlspecialchars($name) . "</li>" .
            "<li><strong>Email:</strong> " . htmlspecialchars($email) . "</li>" .
            "<li><strong>Phone:</strong> " . htmlspecialchars($phone) . "</li>" .
            "<li><strong>Service Needed:</strong> " . htmlspecialchars($need) . "</li>" .
            "<li><strong>Company:</strong> " . htmlspecialchars($company) . "</li>" .
            "<li><strong>Message / Scope:</strong> " . nl2br(htmlspecialchars($message)) . "</li>" .
            "</ul>";

    $status = mailfunction("", "Company", $body);

    $isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') || 
              (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);

    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => $status ? true : false,
            'message' => $status ? 'Thanks! We have received your brief and will contact you within 24 hours.' : 'Error sending message. Please try again or email us directly at info@invored.com.'
        ]);
        exit;
    }

    if ($status) {
        echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Thank You | InvoRed</title><style>body{background:#07080A;color:#F0F2EE;font-family:-apple-system,sans-serif;display:grid;place-items:center;height:100vh;margin:0;}a{color:#00F2FE;text-decoration:none;font-weight:600;margin-top:20px;display:inline-block;}</style></head><body><div style="text-align:center;"><h1>Thank you, ' . htmlspecialchars($name) . '!</h1><p>Your brief has been received. Our engineering team will review it and reach out shortly.</p><a href="index.html">← Return to InvoRed</a></div></body></html>';
    } else {
        echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Submission Error | InvoRed</title><style>body{background:#07080A;color:#F0F2EE;font-family:-apple-system,sans-serif;display:grid;place-items:center;height:100vh;margin:0;}a{color:#FF334B;text-decoration:none;font-weight:600;margin-top:20px;display:inline-block;}</style></head><body><div style="text-align:center;"><h1>Something went wrong</h1><p>Could not deliver the message. Please contact us directly at <a href="mailto:info@invored.com">info@invored.com</a>.</p><a href="index.html">← Return to InvoRed</a></div></body></html>';
    }
?>
