<?php

function sanitizePath($path) 
{
	$path = trim($path);
	$path = trim(preg_replace('#[./]+/#', '/', $path), '/');
	
	return $path;
}


function hasHiddenDirs($path)
{
	return (preg_match('#^\\.[^/]#', $path) + preg_match('#/\\.[^/]#', $path)) > 0;
}


function escapeJSString($string)
{
	$string = str_replace('\\', '\\\\', $string);
	$string = str_replace('"', '\\"', $string);
	$string = str_replace('\'', '\\\'', $string);
	return $string;
}


function arrayToJS($array, $keys = null, $exclude = false)
{
	$keys1 = (!$exclude && is_array($keys)) ? $keys : array_keys($array);
	$result = '{ ';
	
	foreach($keys1 as $key)
	{
		if($exclude && in_array($key, $keys)) continue;

		$v =& $array[$key];
		
		if(is_string($v)) $result .= '\'' . $key . '\' : \'' . escapeJSString($v) . '\', ';
		elseif(is_numeric($v)) $result .= '\'' . $key . '\' : ' . $v . ', ';
	}

	$result = trim($result, ', ') . ' }';
	return $result;
}


function testFileExtension($fileName, $list)
{
	foreach($list as $ext)
	{
		$l = strlen($ext) + 1;
		if(mb_strtolower(mb_substr($fileName, -$l)) == '.' . $ext)
 		  return true;
	}
	
	return false;
}

