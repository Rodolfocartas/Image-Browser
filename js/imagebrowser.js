var imageBrowser = 
{
	_path : '',
	_dirs : [],
	_files : [],
	_selIndex : -1,
	_activeDialog : null,
	_previewSize : 0,
	_swfUpload : null,
	_lockEnabled : false,
	
	
	_setBusy : function($val) 
	{ 
		if(!this._lockEnabled && ($val == null || $val == true))
		{
			this._lockEnabled = true;
			$('#ib-path').addClass('ib-narrow');
			$('#ib-busy').show();
		}
		else if(this._lockEnabled && $val == false)
		{
			this._lockEnabled = false;
			$('#ib-busy').hide();
			$('#ib-path').removeClass('ib-narrow');
		}
	},
	
		
	_updateListing : function()
	{
		html = '';
		
		if(this._path != '')
		{
			html += '<div class="ib-item ib-parentdir"><span class="ib-icon"></span>'
			  + '<span class="ib-name">..</span></div>';
		}
	
		html += '<div>';
		for(i = 0; i < this._dirs.length; ++i)
		  html += '<div class="ib-item ib-dir"><span class="ib-icon"></span>'
		    + '<span class="ib-name">' + this._dirs[i] + '</span></div>';
		  
		html += '</div><div>';
		for(i = 0; i < this._files.length; ++i)
		  html += '<div class="ib-item ib-imagefile"><span class="ib-icon"></span>'
		    + '<span class="ib-name">' + this._files[i] + '</span></div>';
		    
		html += '</div>';
		  
		$('#ib-filelist').html(html);
		$('#ib-filelist .ib-dir').click(function(event) { imageBrowser._onClickDir(event); });
		$('#ib-filelist .ib-imagefile').click(function(event) { imageBrowser._onClickFile(event); });
		$('#ib-filelist .ib-parentdir').click(function(event) { imageBrowser._onClickParentDir(event); });
	},

	
	_updatePath : function()
	{
		html = '<span title="" class="ib-pathelement ib-icon ib-homedir"></span>/';
		if(this._path != '')
		{
			a = this._path.split('/');
			p = '';
			for(i = 0; i < a.length; ++i)
			{
				p += (i ? '/' : '') + a[i];
				html += '<span title="' + p + '" class="ib-pathelement">' + a[i] + '</span>/';
			}
		}
				
		$('#ib-path').html(html);
		$('#ib-path .ib-pathelement').click(function(event)
		{
			imageBrowser.changeDir($(event.currentTarget).attr('title'));
		});
	},
	
	
	_updateImagePane : function()
	{
		if(this._selIndex < 0 || this.isBusy()) return;
		
		f = function($data, $status, $xhr)
		{
			try { response = eval($data); }
			catch(error)
			{
				imageBrowser._setBusy(false);
				alert(ib_lang['ajaxResponseError']);
				return; 
			}
			
			if(!response.error)
			{
				with(imageBrowser)
				{
					fn = _files[_selIndex];
					
					popupJS = 'tinyMCE.activeEditor.windowManager.open({ width : 600, height : 600, '
					  + 'title : \'' + fn + '\', file : \'' + ib_config['imageURL']
					  + _path + '/' + fn + '\', scrollbars : true });';
					
					html = '<img src="' + ib_config['siteURL'] + 'image/2/' + _previewSize 
					  + '/' + _previewSize + '/5/0/' + ib_config['jitImagePath'] + _path + '/' + fn 
					  + '" height="' + _previewSize + '" width="' + _previewSize 
					  + '" onclick="' + popupJS + '" title="' + ib_lang['clickToView'] + '" />';
					  
					html += '<p><strong>' + fn + '</strong></p><p>' + response.width
					  + 'x' + response.height + '<br />(' + response.prettySize + ' b)</p>';
						
					$('#ib-imageinfo').html(html);
				}
			}
			else
			{
				with(imageBrowser)
				{
					s = _previewSize;
					html = '<div style="overflow: hidden; width: ' + s + 'px; height: ' + s
					  + 'px;"><div style="text-align: center; font-size: 2.0em; color: red; '
					  + 'visibility: hidden">' + ib_lang['invalidImage'] + '</div></div>';
					  
					$('#ib-imageinfo').html(html);
					div = $('#ib-imageinfo div div');
					div.css({ 'visibility' : 'visible', 'margin-top' : 
					  '' + Math.floor((s - div.height()) / 2) + 'px' });
				}
			}
			
			imageBrowser._setBusy(false);
		};
		
		this._setBusy();
		$.get('ajax.php?cmd=imgsize&file=' + Base64.encode(this._path + '/' 
		  + this._files[this._selIndex]), '', f);
	},
	
	
	_selectFile : function($index)
	{
		if(this.isBusy()) return;
		
		e = $('#ib-filelist .ib-selected');
		e.removeClass('ib-selected');
		$('#ib-imagepane').css('visibility', 'hidden');
		
		if($index >= 0 && $index < this._files.length)
		{
			this._selIndex = $index;
			$('#ib-filelist .ib-imagefile').eq($index).addClass('ib-selected');

			this._updateImagePane();
			$('#ib-imagepane').css('visibility', 'visible');
		}
		else this._selIndex = -1;
	},
	
	
	_onClickDir : function(event)
	{
		e = $(event.currentTarget);
		this.changeDir(this._path + '/' + e.children('.ib-name').html());
	},
	
	
	_onClickParentDir : function(event)
	{
		var path = this._path.substr(0, this._path.lastIndexOf('/'));
		this.changeDir(path);
	},
	
	
	_onClickFile : function(event)
	{
		index = $(event.currentTarget).index();
		this._selectFile(this._selIndex == index ? -1 : index);
	},
	
	
	_createDir : function()
	{
		if(this.isBusy()) return;
		
		f = function($data, $status, $xhr)
		{
			imageBrowser._setBusy(false);
			
			try { response = eval($data); }
			catch(error)
			{
				alert(ib_lang['ajaxResponseError']);
				return; 
			}
			
			if(response.error) alert(response.message);
			else imageBrowser.changeDir(imageBrowser._path + '/' 
			  + $('#dlg-createdir input').eq(0).val());
		};
		
		this._setBusy();
		name = $('#dlg-createdir input').eq(0).val();
		$.get('ajax.php?cmd=mkdir&dir=' + Base64.encode(this._path + '/' + name), '', f);
	},
	
	
	_deleteCurrentDir : function()
	{
		if(this.isBusy()) return;
		
		f = function($data, $status, $xhr)
		{
			with(imageBrowser)
			{
				_setBusy(false);
				
				try { response = eval($data); }
				catch(error)
				{
					alert(ib_lang['ajaxResponseError']);
					return; 
				}
			
				if(response.error) alert(response.message);
				else changeDir(_path.substr(0, _path.lastIndexOf('/')));
			}
		};
		
		this._setBusy();
		$.get('ajax.php?cmd=rmdir&dir=' + Base64.encode(this._path), '', f);
	},
	
	
	_deleteImage : function()
	{
		if(this._selIndex < 0 || this.isBusy()) return;
		
		f = function($data, $status, $xhr)
		{
			imageBrowser._setBusy(false);
			
			try { response = eval($data); }
			catch(error)
			{
				alert(ib_lang['ajaxResponseError']);
				return; 
			}
			
			if(response.error) alert(response.message);
			else imageBrowser.reloadDir();
		};
		
		if(confirm(ib_lang['deleteImageQ']))
		{
			this._setBusy();
			$.get('ajax.php?cmd=rm&file=' + Base64.encode(this._path + '/' 
			  + this._files[this._selIndex]), '', f);
		}
	},
	
	
	_showDialog : function($id, $data)
	{
		if(this.isBusy()) return;
		
		this._initDialog($id, $data);
		d = $('#ib-dialogs #' + $id);
		x = Math.floor(($(window).width() - d.width()) / 2);
		y = $(window).height();
		d.css({'left' : '' + x + 'px', 'top' : '' + y + 'px'});
		$('#ib-dialogs').fadeIn(300);
		d.show();
		this._activeDialog = d;
		y = Math.floor(($(window).height() - d.height()) / 2);
		d.animate({ 'top' : y }, 300, null, function()
		{
			$('#' + $id + ' input').eq(0).focus();
		});
	},
	
	
	_hideDialog : function($callback)
	{
		if(this._activeDialog == null) return;
		this._onHideDialog(this._activeDialog.attr('id'));
		
		$('#ib-dialogs').fadeOut(150);
		this._activeDialog.delay(150).hide();
		this._activeDialog = null;
		
		if($callback != null) setTimeout($callback, 150);
	},
	
	
	_initDialog : function($id, $data)
	{
		if($id == 'dlg-createdir')
		{
			if($data == null) $data = { name : '' };
			$('#dlg-createdir input').eq(0).val($data.name);
		}
		else if($id == 'dlg-upload')
		{
			$('#ib-cancelupload').hide();
			$('#ib-uploadprogressbar').stop().css('width', '0px');
			$('#ib-uploadstatus').html('').data({ 'numOfFiles' : 0, 'fileID' : '', 'allCancelled' : 0 });
		}
		else if($id == 'dlg-insertthumb')
		{
			inputs = $('#dlg-insertthumb input');
			
			if(isNaN(parseInt(inputs.eq(3).val())))
			  inputs.eq(3).val(ib_config['defaultThumbWidth']);
			  
			if(isNaN(parseInt(inputs.eq(4).val())))
			  inputs.eq(4).val(ib_config['defaultThumbHeight']);
			  
			this._updateThumbString();
		}
	},
	
	
	_onHideDialog : function($id)
	{
		if($id == 'dlg-upload')
		{
			stats = this._swfUpload.getStats();
			
			if(stats.files_queued > 0)
			{
				$('#ib-uploadstatus').data('allCancelled', 1);
				
				for(i = 0; i < stats.files_queued; ++i)
				  this._swfUpload.cancelUpload();
			}
		}
	},
	
	
	_insertImage : function($insertThumb)
	{
		if(this._selIndex < 0) return;
		
		win = tinyMCEPopup.getWindowArg('window');
		input = tinyMCEPopup.getWindowArg('input');
		if($insertThumb)
		{
			value = ib_config['siteURL'] + 'image/' + $('#dlg-insertthumb input').eq(5).val()
			  +	'/' + ib_config['jitImagePath'] + this._path + '/' + this._files[this._selIndex];
		}
		else
		{
			value = ib_config['imageURL'] + ((this._path != '') ? (this._path + '/') : '') 
			  + this._files[this._selIndex];
		}
		
		win.document.getElementById(input).value = value;
		
		if(typeof(win.ImageDialog) != 'undefined')
		{
			if(win.ImageDialog.getImageData)
			  win.ImageDialog.getImageData();
			
			if(win.ImageDialog.showPreviewImage)
			  win.ImageDialog.showPreviewImage(value);
		}
		
		tinyMCEPopup.close();
	},
	
	
	_updateThumbString : function()
	{
		inputs = $('#dlg-insertthumb input');
		result = '';
		
		if(inputs.eq(0).attr('checked') == 'checked')
		{
			w = parseInt(inputs.eq(3).val());
			if(isNaN(w) || w < 1) w = ib_config['defaultThumbWidth'];
			
			result = '1/' + w + '/0/0';
			inputs.eq(3).removeAttr('disabled');
			inputs.eq(4).attr('disabled', 'disabled');
		}
		else if(inputs.eq(1).attr('checked') == 'checked')
		{
			h = parseInt(inputs.eq(4).val());
			if(isNaN(h) || h < 1) h = ib_config['defaultThumbHeight'];
			
			result = '1/0/' + h + '/0';
			inputs.eq(3).attr('disabled', 'disabled');
			inputs.eq(4).removeAttr('disabled');
		}
		else if(inputs.eq(2).attr('checked') == 'checked')
		{
			w = parseInt(inputs.eq(3).val());
			if(isNaN(w) || w < 1) w = ib_config['defaultThumbWidth'];
			
			h = parseInt(inputs.eq(4).val());
			if(isNaN(h) || h < 1) h = ib_config['defaultThumbHeight'];
			
			result = '2/' + w + '/' + h + '/5/0';
			inputs.eq(3).removeAttr('disabled');
			inputs.eq(4).removeAttr('disabled');
		}
			  
		inputs.eq(5).val(result);
	},
	
	
	init : function()
	{
		$('#btn-uploadimages').click(function() { imageBrowser._showDialog('dlg-upload'); });
		$('#btn-createdir').click(function() { imageBrowser._showDialog('dlg-createdir'); });
		$('#btn-deletedir').click(function() { imageBrowser._deleteCurrentDir(); });
		$('#btn-deleteimage').click(function() { imageBrowser._deleteImage(); });
		$('#btn-insertthumb').click(function() { imageBrowser._showDialog('dlg-insertthumb'); });
		
		$('#btn-insertimage').click(function()
		{
			if(!imageBrowser.isBusy()) imageBrowser._insertImage(false);
		});
		
		$('#ib-dialogs').click(function(event) 
		{
			if(event.target == event.currentTarget)
			  imageBrowser._hideDialog();
		});
		
		$('#ib-dialogs .ib-cancelbutton').click(function() { imageBrowser._hideDialog(); });
		
		$('#dlg-createdir .ib-okbutton').click(function()
		{
			imageBrowser._hideDialog('imageBrowser._createDir()');
		});
		
		$('#dlg-upload .ib-okbutton').click(function()
		{
			imageBrowser._swfUpload.startUpload();
		});
		
		$('#dlg-insertthumb .ib-okbutton').click(function()
		{
			imageBrowser._insertImage(true);
		});
		
		ii = $('#ib-imageinfo');
		this._previewSize = ii.innerWidth() - parseInt(ii.css('padding-left')) 
		  - parseInt(ii.css('padding-right'));
			
		ft = '*.' + (ib_config['allowedExtensions'].split(' ').join(';*.'));
		ft = ft.toLowerCase() + ';' + ft.toUpperCase();
		
		this._swfUpload = new SWFUpload(
		{
			upload_url : ib_config['scriptURL'] + 'upload.php',
			flash_url : ib_config['scriptURL'] + 'lib/swfupload/swfupload.swf',
			button_placeholder_id : 'swfupload',
			button_width : ib_config['uploadButtonWidth'],
			button_height : ib_config['uploadButtonHeight'],
			button_image_url : ib_config['scriptURL'] + ib_config['uploadButtonImage'],
			button_text : '',
			post_params : { 'dir' : '1', 'PHPSESSID' : '' },
			use_query_string : true,
			file_types : ft,
			file_types_description : ib_lang['imageFiles'],
			
			file_dialog_complete_handler : function($n1, $n2, $n3)
			{
				// function args may contain invalid values! (SWFUpload bug?)
				
				stats = imageBrowser._swfUpload.getStats();
				e = $('#ib-uploadstatus');
				e.html(ib_lang['numOfFilesToUpload'] + ': ' + stats.files_queued);
				e.data({ 'numOfFiles' : stats.files_queued });
			},
			
			upload_complete_handler : function($file) 
			{ 
				if($('#ib-uploadstatus').data('allCancelled'))
				  return;
				  
				stats = imageBrowser._swfUpload.getStats();
				if(stats.files_queued > 0)
				  imageBrowser._swfUpload.startUpload(); 
				else
				{
					if(stats.upload_errors > 0)
					  alert(ib_lang['someFilesNotUploaded'] + ' (' + stats.upload_errors + ')');
					
					imageBrowser._hideDialog();
					imageBrowser.reloadDir();
				}
			},
			
			upload_start_handler : function($file)
			{
				$('#ib-uploadprogressbar').stop().css('width', '0px');
				stats = imageBrowser._swfUpload.getStats();
				e = $('#ib-uploadstatus');
				e.data('fileID', $file.id);
				n = e.data('numOfFiles');
				current = n - stats.files_queued + 1;
				html = ib_lang['uploadingFile'] + ' ' + current + '/' + n + ' (' + $file.name + ')'
				e.html(html);
				$('#ib-cancelupload').show();
			},
			
			swfupload_loaded_handler : function() 
			{ 
				imageBrowser._swfUpload.setPostParams({ 
				  'dir' : Base64.encode(imageBrowser._path), 
				  'PHPSESSID' : ib_sessionID
				  });
				
				stats = imageBrowser._swfUpload.getStats();
				$('#ib-uploadstatus').html(ib_lang['numOfFilesToUpload'] + ': ' + stats.files_queued);
			},
			
			upload_progress_handler : function($file, $sent, $total)
			{
				progr = $sent / $total;
				w = Math.floor(progr * ($('#ib-uploadstatus').innerWidth() - 24));
				$('#ib-uploadprogressbar').css('width', '' + w + 'px');
			},
			
			file_queued_handler : function($file)
			{
				with(imageBrowser)
				{
					exists = false;
					for(i = 0; i < _files.length; ++i)
					{
						if(_files[i] == $file.name)	{ exists = true; break;	}
					}
					
					if(!exists)
					{
						for(i = 0; i < _dirs.length; ++i)
						{
							if(_dirs[i] == $file.name) { exists = true; break;	}
						}
					}
					
					if(exists)
					{
						alert(ib_lang['fileExists'] + ': ' + $file.name);
						_swfUpload.cancelUpload($file.id);
					}
				}
			}
		});
		
		$('#ib-cancelupload').eq(0).click(function()
		{
			stats = imageBrowser._swfUpload.getStats();
			if(stats.in_progress == 1)
			  imageBrowser._swfUpload.cancelUpload($('#ib-uploadstatus').data('fileID'));
		});
		
		$('#dlg-insertthumb input').slice(0, 6).change(function() { imageBrowser._updateThumbString(); });
	},
	

	changeDir : function($path)
	{
		if(this.isBusy()) return;
		
		f = function($data, $status, $xhr)
		{
			try { response = eval($data); }
			catch(error)
			{
				imageBrowser._setBusy(false);
				alert(ib_lang['ajaxResponseError']);
				return; 
			}
			
			with(imageBrowser)
			{
				_path = response.path;
				_dirs = [];
				_files = [];

				for(i = 0; i < response.dirs.length; ++i)
				  _dirs.push(response.dirs[i]);
				  
				for(i = 0; i < response.files.length; ++i)
				  _files.push(response.files[i]);
				
				_updatePath();
				_updateListing();
				
				if(_dirs.length + _files.length > 0) $('#btn-deletedir').hide();
				else $('#btn-deletedir').show();
				
				_setBusy(false);
				_selectFile(-1);
			}
		};

		this._setBusy();
		$.get('ajax.php?cmd=ls&dir=' + Base64.encode($path), '', f);
	},
	
	
	reloadDir : function()
	{
		this.changeDir(this._path);
	},
	
	
	isBusy : function() 
	{ 
		return this._lockEnabled; 
	}
};





