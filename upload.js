(function(o){

	function Uploader(){
		this.version = "1.0";
		this.type = null;
		this.getXhr = function(){
			if( o.XMLHttpRequest ){
				return new XMLHttpRequest();
			}else if(window.ActiveXObject){
				var versions=['Microsoft.XMLHTTP', 'MSXML.XMLHTTP', 'Msxml2.XMLHTTP.7.0','Msxml2.XMLHTTP.6.0','Msxml2.XMLHTTP.5.0', 'Msxml2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP'];
				var xhr = null;
				for(var i=0,len = versions.length; i<len; i++){
					console.log(versions[i]);
                    try{
                       xhr = new ActiveXObject(versions[i]);
                       if( xhr ) return xhr;
                    }catch(e){
                        xhr=null;
                    }
            	}
			}
		};
		this.isIE = function(){ 
			return (!!window.ActiveXObject || "ActiveXObject" in window); 
		};
		this.upload = function(url, form, options){
			var xhr = this.getXhr();
			if( false && typeof FormData == "function" ){
				this.type = "FormData";
				fd = new FormData(form);
				
				xhr.send(fd);
			}else if( false && typeof FileReader == "function" ){
				this.type = "FileReader";
				var file = form.querySelector("input[type=file]").files[0];
				var fd = new FileReader();
				fd.readAsBinaryString(file);
				var data = this.generate_binary({fileName: file.name, binary: fd.result});

				xhr.open("post", url);
				xhr.onreadystatechange = function(){
					if( xhr.readyState==4 && xhr.status == 200 ){
						options['onload']( xhr.responseText );
					}
				};
				xhr.onerror = function(e){
					options['onerror']( e );
				};
				xhr.upload.onprogress = function(pro){
					options['onprogress']( pro.loaded, pro.total );
				};
				xhr.setRequestHeader("Content-type", "multipart/form-data; boundary=" + data.boundary);
				if( xhr.sendAsBinary ){
					xhr.sendAsBinary( data.builder );
					console.log("sendAsBinary");
				}else{
					xhr.send(data.builder);
				}
			}else{
				this.type = "iframe";
				var iframe = o.document.createElement("iframe");
				o.document.body.appendChild(iframe);
				var cw = iframe.contentWindow.document;
				cw.domain = "127.0.0.1";
				if( !this.isIE() ){
					console.log("非IE浏览器");
					cw.body.innerHTML = '<form method="post" action="'+url+'" enctype="multipart/form-data"></form>';
					cw.querySelector("form").appendChild( form.querySelector("input[type=file]") );
					cw.querySelector("form").submit();
				}else{
					console.log("IE浏览器");
					cw.onreadystatechange = function(){
						if( cw.readyState == "complete" ){
							cw.body.innerHTML = '<form method="post" action="'+url+'" enctype="multipart/form-data"></form>';
							cw.querySelector("form").appendChild( form.querySelector("input[type=file]") );
							cw.querySelector("form").submit();
						}
					}
				}
			}
			console.log(this.type);
			console.log(xhr);
		};
		this.generate_binary = function(o){
			var boundary = '-----------------' + (new Date).getTime();
			var dashdash = '--';
			var crlf     = '\r\n';
			var builder = '';
			builder += dashdash+boundary+crlf;        
			builder += 'Content-Disposition: form-data; name="file"; filename="' + encodeURIComponent(o.fileName) + '"'+ crlf;
			builder += 'Content-Type: application/octet-stream'+ crlf + crlf; 
			builder += o.binary + crlf;
			builder += dashdash + boundary + dashdash + crlf;
			return {
				boundary : boundary,
				builder : builder
			};
		}
	}
	o.Uploader = Uploader;

})(window);