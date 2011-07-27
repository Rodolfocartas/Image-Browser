<?php

$g_config = array(
	
	// language file to use (lang/##.inc.php)
	'language' => 'en',
	
	// absolute physical path to the images directory
	'imagePath' => '/home/www/symphony/workspace/uploads/images/',
	
	// URL or WWW path of the images directory
	'imageURL' => '/symphony/workspace/uploads/images/',
	
	// path that should prefix images in JIT URLs
	'jitImagePath' => 'uploads/images/',
	
	// site URL or WWW path
	'siteURL' => '/symphony',
	
	// physical path to Symphony installation
	'sitePath' => '/home/www/symphony',
	
	// where to load jQuery from
	'jQuerySourceURL' => 'lib/jquery-1.6.2.min.js',
	
	// allowed file extensions (separate them with single spaces!)
	'allowedExtensions' => 'jpg jpeg png gif',
	
	// dimensions of the upload button
	'uploadButtonWidth' => 120,
	'uploadButtonHeight' => 30,
	
	// sprite for the upload button (URL relative to script location)
	'uploadButtonImage' => 'style/choose-files-en.png',
	
	// default dimensions of inserted thumbnails
	'defaultThumbWidth' => 160,
	'defaultThumbHeight' => 120
	
);

// === end of config ===========================================================

foreach(array('imagePath', 'imageURL', 'siteURL', 'jitImagePath') as $k)
{
	$s = &$g_config[$k];
	$l = strlen($s);
	
	if($l > 1 && $s[$l - 1] != '/')
	  $s .= '/';
}

$g_config['scriptURL'] = dirname($_SERVER['PHP_SELF']) . '/';
$g_config['extensionsArray'] = explode(' ', $g_config['allowedExtensions']);

