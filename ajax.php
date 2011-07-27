<?php
require('authorize.php');

require_once('config.inc.php');
require_once('misc.inc.php');
require_once('lang/' . $g_config['language'] . '.inc.php');

isset($_GET['cmd']) or die();

switch($_GET['cmd'])
{
case 'ls':
	$path = isset($_GET['dir']) ? sanitizePath(base64_decode($_GET['dir'])) : '';
	$fullPath = $g_config['imagePath'] . $path;
	if(!is_dir($fullPath) || hasHiddenDirs($path))
	{
		$fullPath = $g_config['imagePath'];
		$path = '';
	}

	$contents = getDirContents($fullPath);
	echo json_directoryListing($path, $contents);
	break;
	
case 'mkdir':
	$ok = false;
	$msg = '';
	
	$path = isset($_GET['dir']) ? sanitizePath(base64_decode($_GET['dir'])) : '';
	$fullPath = $g_config['imagePath'] . $path;
	
	if(is_dir($fullPath))
	  $msg = $g_lang['dirExists'];
	elseif(hasHiddenDirs($path))
	  $msg = $g_lang['invalidPath'];
	else
	{
		$ok = mkdir($fullPath);

		if(!$ok) $msg = $g_lang['dirNotCreated'];
	}
	
	echo json_status($ok, $msg);
	break;
	
case 'rmdir':
	$path = isset($_GET['dir']) ? sanitizePath(base64_decode($_GET['dir'])) : '';
	$fullPath = $g_config['imagePath'] . $path;
	
	if($path != '' && rmdir($fullPath)) echo json_status(true);
	else echo json_status(false, $g_lang['cannotDeleteDir']);

	break;
	
case 'imgsize':
	$file = isset($_GET['file']) ? sanitizePath(base64_decode($_GET['file'])) : '';
	$fullPath = $g_config['imagePath'] . $file;
	$info = getImageInfo($fullPath);
	echo json_imageInfo($info);
	break;
	
case 'rm':
	$file = isset($_GET['file']) ? sanitizePath(base64_decode($_GET['file'])) : '';
	$fullPath = $g_config['imagePath'] . $file;
	
	if(hasHiddenDirs($path) || !isFileNameAllowed($fullPath) || !is_file($fullPath) 
	  || !unlink($fullPath))
	  echo json_status(false, $g_lang['cannotDeleteFile']);
	else echo json_status(true);
	
	break;
/*	
case 'test':
	$path = isset($_GET['path']) ? sanitizePath(base64_decode($_GET['path'])) : '';
	$fullPath = $g_config['imagePath'] . $path;
	
	if(hasHiddenDirs($path))
	  echo json_status(false);
	else if(is_dir($fullPath))
	  echo json_status(true, 'dir');
	else if(is_file($fullPath))
	  echo json_status(true, 'file');
	else echo json_status(true);
	  
	break;
*/	
default:
	die();
}

// === JSON ========================================================================================

function json_directoryListing($path, $contents)
{
	$output = '({path:"' . escapeJSString($path) . '",';
	
	$output .= 'dirs:[';
	$c = count($contents['dirs']);
	foreach($contents['dirs'] as $dir)
	{
		$output .= '"' . escapeJSString($dir) . '"';
		if(--$c > 0) $output .= ',';
	}
	
	$output .= '],files:[';
	$c = count($contents['files']);
	foreach($contents['files'] as $fn)
	{
		$output .= '"' . escapeJSString($fn) . '"';
		if(--$c > 0) $output .= ',';
	}
	
	$output .= ']})';
	
	return $output;
}


function json_status($ok, $message = '')
{
	return '({error:' . ($ok ? 'false' : 'true') . ',message:"' . 
	  escapeJSString($message) . '"})';
}


function json_imageInfo($imageInfo)
{
	if(!$imageInfo) return '({error:true})';
	else return '({error:false,width:' . $imageInfo['width'] . ',height:'
	  . $imageInfo['height'] . ',size:' . $imageInfo['size'] . ',prettySize:\''
	  . number_format($imageInfo['size'], 0, '', ',') . '\',mime:\'' 
	  . $imageInfo['mime'] . '\'})';
}


// === helper functions ============================================================================

function isFileNameAllowed($fileName)
{
	global $g_config;
	return $fileName[0] != '.' && testFileExtension($fileName, $g_config['extensionsArray']);
}


function getDirContents($path, $filter = true)
{
	$dirs = array();
	$files = array();
	$list = scandir($path);
	
	if($list)
	{
		foreach($list as $item)
		{
			if($item[0] == '.') continue;
			
			if(is_dir($path . '/' . $item)) 
			  $dirs[] = $item;
			elseif(is_file($path . '/' . $item) && (!$filter || isFileNameAllowed($item)))
			  $files[] = $item;
		}
	}
	
	return array('dirs' => $dirs, 'files' => $files);
}


function getImageInfo($imageFile)
{
	$size = filesize($imageFile);
	if(!is_int($size))
	  return false;
	  
	$imageSize = getimagesize($imageFile);
	if(!is_array($imageSize))
	  return false;
	  
	$info = array();
	$info['size'] = $size;
	$info['width'] = $imageSize[0];
	$info['height'] = $imageSize[1];
	$info['mime'] = $imageSize['mime'];
	return $info;
}


