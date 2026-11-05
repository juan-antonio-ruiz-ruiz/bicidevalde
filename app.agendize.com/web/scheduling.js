var AZ_HEIGHT = 500;
var AZ_WIDTH = 750;
var AZ3_HEIGHT = 600;
var AZ3_WIDTH = 900;
var AZ_PROPERTIES = ["lang", "service", "staff", "resource", "button", "css", "bgColor", "firstname", "lastname", "email", "phone"];

function openScheduling(companyId, options){

	if (typeof scheduling == 'undefined') {
		scheduling = options;
	} else {
		if (options)
			for (var key in options) scheduling[key] = options[key];
	}

	scheduling.company = companyId;
	controlVersion();

	scheduling.server = scheduling.server.replace("www.agendize", "app.agendize");


	var url = (document.location.protocol == 'http:' ? "http://" : "https://") + scheduling.server ;
	if (scheduling.version === "v2")
		url += '/book/iframe/' + scheduling.company + '?box=false';
	else
		url += '/web/widget/?c=' + scheduling.company;

	if (scheduling.gaTrackingId)
		url += '&gid=' + scheduling.gaTrackingId;

	for (var key in scheduling) {
		if (key != 'server')
			url += '&' + key + '=' + scheduling[key];
	}

	var windowWidth = window.screen.width < window.outerWidth ? window.screen.width : window.outerWidth;

	//supprime le dernier character du refererUrl si celui ci termine par '?', evite un blocage par le WAF
	var refererURL = window.location.href
	if(refererURL.endsWith('?'))
		refererURL = refererURL.slice(0, -1);


	if (windowWidth < 500)
		window.location.href = url + '&r=' + encodeURIComponent(refererURL);
	else
		scheduling_show(url);
}

function scheduling_show(url) {
	var	width, height;

	if (typeof scheduling === 'undefined') {
		scheduling = {}
	}

	if(scheduling.version === "v3") {
		height = AZ3_HEIGHT;
		width = AZ3_WIDTH;
	} else {
		height = AZ_HEIGHT;
		width = AZ_WIDTH;
	}
	scheduling_show_with_size(url, width, height)
}

function scheduling_show_with_size(url, width, height) {
	if (typeof scheduling === 'undefined') {
		scheduling = {}
	}

	controlVersion(url);

	var s = '.az-modal{ background-color: #313131; border: solid 1px #313131;	border-radius: 5px;	display: block;	position: absolute;	padding: 1px; z-index: 10000}';
	s += '.az-fading{ background-color: #000;	z-index: 1001;	position: absolute;	top: 0;	left: 0; opacity:0.7; filter:alpha(opacity=70); }';
	s += '.az-modal-iframe { border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; position: relative; -webkit-box-shadow: 0px 5px 50px 0px rgba(0,0,0,0.6); -moz-box-shadow: 0px 5px 50px 0px rgba(0,0,0,0.6); box-shadow: 0px 5px 50px 0px rgba(0,0,0,0.6);}';
	s += '.az-close { font-size: 16px; color: white; float: right; margin-right:5px; cursor: pointer; font-family: arial; font-weight:bold; padding:4px;} ';

	_addStyle(s);

	var elm = document.createElement('div');
	if (width === undefined) {
		width = AZ_WIDTH;
	}
	if (height === undefined) {
		height = AZ_HEIGHT;
	}
	elm.style.width = width + 'px';
	elm.style.height = height + 'px';
	elm.id = 'az-scheduling-modal';
	az_addClass(elm, 'az-modal');

	var dialog = document.createElement('div');
	dialog.style.height = height + 'px';
	dialog.id = 'az-scheduling-modal';

	var iframe = document.createElement('iframe');

	iframe.style.width = '100%';
	iframe.style.height = '100%';
	iframe.name = 'iframe';
	iframe.frameBorder = 0;

	iframe.src = url;
	az_addClass(iframe, 'az-modal-iframe');

	elm.appendChild(iframe);

	var b = document.createElement('div');
	az_addClass(b, 'az-fading');
	b.id = 'fading';

	_addClickListener(b, function(){
		closeIframe(b);
	});

	if (window.addEventListener) {
		window.addEventListener("keydown", function (e) {
			if (e.keyCode == '27') {
				var box = scheid('#az-scheduling-modal');
				var fading = scheid('#fading');

				box.parentNode.removeChild(box);
				fading.parentNode.removeChild(fading);
			}
		}, false);
	}

	var close =  document.createElement('div');
	az_addClass(close, 'az-close');
	close.id = 'az-close';
	close.innerHTML = 'X';

	if(scheduling.version === "v3") {
		close.onclick = function () {
			closeIframe(b);
		};
		elm.prepend(close);
	}


	b.style.width = getWindowWidth() + 'px';
	b.style.height = getWindowHeight() + 'px';

	document.getElementsByTagName("body")[0].appendChild(b);

	document.getElementsByTagName("body")[0].appendChild(elm);

	__centerThis(elm, width, height);

	var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
	var eventer = window[eventMethod];
	var messageEvent = eventMethod == 'attachEvent' ? 'onmessage' : 'message';

	eventer(messageEvent, function(e) {

		if (e.data == 'close-scheduling') {
			var box = scheid('#az-scheduling-modal');
			var fading = scheid('#fading');

			box.parentNode.removeChild(box);
			fading.parentNode.removeChild(fading);
		}

	},false);
}

function closeIframe(element){
	element.parentNode.removeChild(element);
	var box = document.getElementById('az-scheduling-modal');

	box.parentNode.removeChild(box);
}

function az_addClass(element, className){

	element.className = element.className.replace(className,""); // first remove the class name if that already exists
	element.className = element.className + className; // adding new class name
}

function getWindowWidth(){
	return Math.max(document.documentElement["clientWidth"], document.body["scrollWidth"], document.documentElement["scrollWidth"], document.body["offsetWidth"], document.documentElement["offsetWidth"]);
}

function getWindowHeight(){
	return Math.max(document.documentElement["clientHeight"], document.body["scrollHeight"], document.documentElement["scrollHeight"], document.body["offsetHeight"], document.documentElement["offsetHeight"]);
}

function __centerThis(element, width, height) {



	element.style.top = ((_viewport().height - height) / 2) + getScrollTop() + 'px';
	element.style.left = ((_viewport().width - width) / 2) + 'px';
}

function _addStyle(css){

	var ss1 = document.createElement('style');

	ss1.setAttribute("type", "text/css");
	var hh1 = document.getElementsByTagName('head')[0];
	hh1.appendChild(ss1);
	if (ss1.styleSheet) {
		ss1.styleSheet.cssText = css;
	} else {
		var tt1 = document.createTextNode(css);
		ss1.appendChild(tt1);
	}
}

function _addClickListener(element, func) {
	if (window.addEventListener) {
		element.addEventListener("click", func, false);
	} else if (element.attachEvent) {
		element.attachEvent("onclick", func);
	} else if (typeof element.onclick != "function") {
		element.onload = func;
	} else {
		var oldonload = element.onclick;
		element.onclick = function() {
			oldonclick();
			func();
		};
	}
}

// event.type must be keypress
function _getChar(event) {
	if (event.which == null) {
		return String.fromCharCode(event.keyCode) // IE
	} else if (event.which!=0 && event.charCode!=0) {
		return String.fromCharCode(event.which)   // the rest
	} else {
		return null // special key
	}
}

function _viewport() {
	var e = window, a = 'inner';
	if (!('innerWidth' in window )) {
		a = 'client';
		e = document.documentElement || document.body;
	}
	return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
}

function getScrollTop(){
	return document.body.scrollTop || document.documentElement.scrollTop;
}

function scheid(ref){
	return document.getElementById(ref.substring(1));
}

function az_interface(id){}

function az_fireEvent(type, id){
	if (typeof agendize_box != 'undefined') {
		agendize_box.event(type, id);
	}
}

// fonction cherchant à vérifier la version du widget à utilisé
// widgetUrl pertmet d'essayer determiner le server si non renseigné
function controlVersion(widgetUrl) {

	if( widgetUrl !== undefined && (widgetUrl.includes("?b=") || widgetUrl.includes("&b=") ) ) {
		scheduling.version = "v2";
		return;
	}

	// si v3 pas de check ou si déjà control
	if( scheduling.version === "v3" || scheduling.controled) {
		return;
	}
	scheduling.version = "v2";
	scheduling.controled = true;

	if(!scheduling.company) {
		schedulingCompany(widgetUrl);
		if(!scheduling.company) {
			return;
		}
	}

	if(!scheduling.server) {
		schedulingServer(widgetUrl);
	}

	var request;
	if (window.XMLHttpRequest) { // Mozilla, Safari, IE7+...
		request = new XMLHttpRequest();
	} else if (window.ActiveXObject) { // IE 6 et antérieurs
		request = new ActiveXObject("Microsoft.XMLHTTP");
	}

	if (!request) {
		return;
	}

	var url = (scheduling.server === undefined ? "" : "https://"+scheduling.server)   +"/widget/api/1.0/version?id="+scheduling.company;
	request.open('GET', url, false);
	request.send();

	if (request.status === 200 && request.responseText) {
		var response = JSON.parse(request.responseText);
		if(response && response.version) {
			scheduling.version = response.version;
		}
		if( response && response.companyId ) {
			scheduling.company = response.companyId;
		}
	}
}

function schedulingServer(widgetUrl) {
	if(!widgetUrl || widgetUrl.indexOf("://") === -1) {
		return;
	}
	var start = widgetUrl.indexOf("://") + 3
	var end = widgetUrl.indexOf("/", start+1);
	if(end === - 1) {
		end = widgetUrl.length
	}
	scheduling.server = widgetUrl.substring(start, end);
}

function schedulingCompany(widgetUrl) {
	if(!widgetUrl) {
		return;
	}
	var start = widgetUrl.indexOf("https://static-cdn.website-editor.net/book/iframe/") + 13
	if(start === 12) { // -1 +13
		return;
	}
	var end = widgetUrl.indexOf("?", start+1);
	if(end === - 1) {
		end = widgetUrl.length
	}
	scheduling.company = widgetUrl.substring(start, end);
}