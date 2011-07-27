<?php
require('authorize.php');

require_once('config.inc.php');
require_once('misc.inc.php');

$path = isset($_GET['dir']) ? sanitizePath(base64_decode($_GET['dir'])) : '';
$fullPath = $g_config['imagePath'] . $path;
$f =& $_FILES['Filedata'];

if(!is_dir($fullPath) || hasHiddenDirs($path))
  die('0');

if(is_file($fullPath . '/' . $f['name']))
  die('0');

move_uploaded_file($f['tmp_name'], $fullPath . '/' . $f['name']);

echo '1';
