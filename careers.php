<?php   
    require("./mailing/mailfunction.php");

    $name = isset($_POST["name"]) ? trim($_POST["name"]) : '';
    $phone = isset($_POST["phone"]) ? trim($_POST["phone"]) : '';
    $email = isset($_POST["email"]) ? trim($_POST["email"]) : '';
    $applyfor = isset($_POST["status"]) ? trim($_POST["status"]) : 'Open Application';
    $experience = isset($_POST["experience"]) ? trim($_POST["experience"]) : '0';
    $otherdetails = isset($_POST["details"]) ? trim($_POST["details"]) : '';

    $filename = isset($_FILES["fileToUpload"]["name"]) ? $_FILES["fileToUpload"]["name"] : '';
    $tempfile = isset($_FILES["fileToUpload"]["tmp_name"]) ? $_FILES["fileToUpload"]["tmp_name"] : '';
    $filenameWithDirectory = $filename ? "uploads_" . time() . "_" . preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $filename) : '';

    $body = "<h3>New InvoRed Career Application</h3>" .
            "<ul>" .
            "<li><strong>Name:</strong> " . htmlspecialchars($name) . "</li>" .
            "<li><strong>Phone:</strong> " . htmlspecialchars($phone) . "</li>" .
            "<li><strong>Email:</strong> " . htmlspecialchars($email) . "</li>" .
            "<li><strong>Applying For:</strong> " . htmlspecialchars($applyfor) . "</li>" .
            "<li><strong>Experience:</strong> " . htmlspecialchars($experience) . " Years</li>" .
            "<li><strong>Details / Cover Note:</strong> " . nl2br(htmlspecialchars($otherdetails)) . "</li>" .
            "</ul>";

    $status = false;

    if (!empty($tempfile) && move_uploaded_file($tempfile, $filenameWithDirectory)) {
        $status = mailfunction("", "Company", $body, $filenameWithDirectory);
        if (file_exists($filenameWithDirectory)) {
            @unlink($filenameWithDirectory);
        }
    } else {
        $status = mailfunction("", "Company", $body);
    }

    $isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') || 
              (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);

    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => $status ? true : false,
            'message' => $status ? 'Thanks! We have received your application and will review it promptly.' : 'Error sending application. Please try again or email your CV to info@invored.com.'
        ]);
        exit;
    }

    if ($status) {
        echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Application Received | InvoRed</title><style>body{background:#07080A;color:#F0F2EE;font-family:-apple-system,sans-serif;display:grid;place-items:center;height:100vh;margin:0;}a{color:#00F2FE;text-decoration:none;font-weight:600;margin-top:20px;display:inline-block;}</style></head><body><div style="text-align:center;"><h1>Application Received!</h1><p>Thanks ' . htmlspecialchars($name) . ', our engineering recruitment team will review your profile.</p><a href="careers.html">← Back to Careers</a></div></body></html>';
    } else {
        echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Error | InvoRed</title><style>body{background:#07080A;color:#F0F2EE;font-family:-apple-system,sans-serif;display:grid;place-items:center;height:100vh;margin:0;}a{color:#FF334B;text-decoration:none;font-weight:600;margin-top:20px;display:inline-block;}</style></head><body><div style="text-align:center;"><h1>Error Submitting Application</h1><p>Please try again or send your resume directly to <a href="mailto:info@invored.com">info@invored.com</a>.</p><a href="careers.html">← Back to Careers</a></div></body></html>';
    }
?>
