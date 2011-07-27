<?php
require_once('config.inc.php');
require($g_config['sitePath'] . 'manifest/config.php');


function stopIf($val) 
{ 
	if($val) die('Unauthorized access');
}


$dbs = &$settings['database'];
$conn = new mysqli($dbs['host'], $dbs['user'], $dbs['password'], '', $dbs['port']);

stopIf($conn->connect_error || !$conn->select_db($dbs['db']));

$g_sessionID = isset($_COOKIE['PHPSESSID']) ? $_COOKIE['PHPSESSID'] : 
  (isset($_REQUEST['PHPSESSID']) ? $_REQUEST['PHPSESSID'] : false);

stopIf(!$g_sessionID);

$res = $conn->query('SELECT * FROM `' . $dbs['tbl_prefix'] . 'sessions` WHERE `session` = \''
  . $conn->real_escape_string($g_sessionID) . '\' ORDER BY `session_expires` DESC');

stopIf(!$res);

$session = $res->fetch_assoc();

stopIf(!$session || (time() - $session['session_expires']) > 12 * 60 * 60); // deny access if session is too old

//$data = unserialize(substr($session['session_data'], strpos($session['session_data'], '|') + 1));

// further checks?

$conn->close();




