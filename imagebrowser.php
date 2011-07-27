<?php
require('authorize.php');

require_once('config.inc.php');
require_once('lang/' . $g_config['language'] . '.inc.php');
require_once('misc.inc.php');
?>

<html>
<head>
<meta http-equiv="Content-type" content="text/html; charset=UTF-8" />
<script type="text/javascript" src="<?= $g_config['jQuerySourceURL'] ?>"></script>
<script type="text/javascript" src="lib/webtoolkit.base64.js"></script>
<script type="text/javascript" src="<?= $g_config['siteURL'] ?>extensions/richtext_tinymce/lib/tiny_mce_popup.js"></script>
<script type="text/javascript" src="js/imagebrowser.js"></script>
<script type="text/javascript" src="lib/swfupload/swfupload.js"></script>
<script type="text/javascript" src="lib/jquery.swfupload.js"></script>
<link rel="stylesheet" href="style/style.css" />
<link href="lib/uploadify/uploadify.css" type="text/css" rel="stylesheet" />
<title><?= $g_lang['imageBrowser'] ?></title>
</head>

<body>
<div id="ib-busy"></div>
<div id="ib-path"></div>
<div id="ib-imagepane">
<div id="ib-imageinfo"></div>
<div id="ib-imagebuttons">
<div id="btn-insertimage" class="ib-button"><?= $g_lang['insertFullImage'] ?></div>
<div id="btn-insertthumb" class="ib-button"><?= $g_lang['insertThumbnail'] ?></div>
<div id="btn-deleteimage" class="ib-button"><?= $g_lang['deleteImage'] ?></div>
</div>
</div>
<div id="ib-filelist"></div>

<div id="ib-dirbuttons" class="clear">
<div class="ib-button" id="btn-uploadimages"><?= $g_lang['uploadImages'] ?></div>
<div class="ib-button" id="btn-createdir"><?= $g_lang['createDir'] ?></div>
<div class="ib-button" id="btn-deletedir"><?= $g_lang['deleteCurrentDir'] ?></div>
<div class="clear"></div>
</div>

<div id="ib-dialogs" style="display: none">

<div id="dlg-upload" style="display: none; width: 400px" class="ib-dialog">
<div class="ib-title"><?= $g_lang['uploadImages'] ?></div>
<div id="swfupload"></div>
<div id="ib-uploadstatus"></div>
<div id="ib-cancelupload"></div>
<div id="ib-uploadprogressbar"></div>
<div class="ib-dialogbuttons">
<div class="ib-button ib-okbutton"><?= $g_lang['ok'] ?></div>
<div class="ib-button ib-cancelbutton"><?= $g_lang['cancel'] ?></div>
</div>
</div>

<div id="dlg-createdir" style="display: none; width: 300px" class="ib-dialog">
<div class="ib-title"><?= $g_lang['createDir'] ?></div>
<p>
<span class="ib-label"><?= $g_lang['name'] ?></span><br />
<input type="text" style="width: 100%" />
</p>
<div class="ib-dialogbuttons">
<div class="ib-button ib-okbutton"><?= $g_lang['ok'] ?></div>
<div class="ib-button ib-cancelbutton"><?= $g_lang['cancel'] ?></div>
</div>
</div>

<div id="dlg-insertthumb" style="display: none; width: 300px" class="ib-dialog">
<div class="ib-title"><?= $g_lang['insertThumbnail'] ?></div>
<p>
<input id="dlg-insertthumb-input1" type="radio" name="mode" checked="checked" />
<label for="dlg-insertthumb-input1"><?= $g_lang['resizeByWidth'] ?></label>
<br />
<input id="dlg-insertthumb-input2" type="radio" name="mode" />
<label for="dlg-insertthumb-input2"><?= $g_lang['resizeByHeight'] ?></label>
<br />
<input id="dlg-insertthumb-input3" type="radio" name="mode" />
<label for="dlg-insertthumb-input3"><?= $g_lang['resizeAndCrop'] ?></label>
</p>
<p>
<?= $g_lang['thumbSize'] ?>: <input type="text" size="5" />	x <input type="text" size="5" />
</p>
<p style="font-size: 0.85em">
<?= $g_lang['resultCode'] ?>:
<input style="font-size: 0.85em" type="text" size="30" />
</p>
<div class="ib-dialogbuttons">
<div class="ib-button ib-okbutton"><?= $g_lang['ok'] ?></div>
<div class="ib-button ib-cancelbutton"><?= $g_lang['cancel'] ?></div>
</div>
<script>
	
</script>
</div>		

</div>

</body>
</html>
<script>
ib_lang = <?= arrayToJS($g_lang) ?>;
ib_config = <?= arrayToJS($g_config, array('imagePath', 'sitePath'), true) ?>;
ib_sessionID = '<?= $g_sessionID ?>';

$(document).ready(function()
{
	dir = '';
	
	win = tinyMCEPopup.getWindowArg('window');
	fn = win.document.getElementById(tinyMCEPopup.getWindowArg('input')).value;
	s = fn.substr(0, ib_config['imageURL'].length);
	
	if(s == ib_config['imageURL'])
	  dir = fn.substring(s.length, fn.lastIndexOf('/'));
			
	imageBrowser.init();
	imageBrowser.changeDir(dir);
});
</script>



