
var _timer = {};
function delay_execute(fn) {
	if (_timer[fn]) {
		return false
	}

	_timer[fn] = window.setTimeout(function() {
		fn();
		window.setTimeout(function(){
			window.clearTimeout(_timer[fn]);
			delete _timer[fn];
		}, 1000);
	}, 300);

	return false;
}
Number.prototype.zeroPad = Number.prototype.zeroPad ||
	function(base){
		var nr = this, len = (String(base).length - String(nr).length)+1;
		return len > 0? new Array(len).join('0')+nr : nr;
	};

function toFixed2(data)
{
	var v = parseFloat(data);
	return v.toFixed(2);
}

function toLowerCase(data)
{
	return data.toLowerCase();
}

function format_time(seconds)
{
	var hours = parseInt(seconds / 3600);
	var mins = parseInt((seconds % 3600) / 60);
	var secs = seconds % 60;
	var days = parseInt(hours / 24);

	var message = hours.toString() + ":" + mins.zeroPad(10) + ":" + secs.zeroPad(10);
	if (days > 0) {
		hours = hours % 24;
		message = days.toString() + ":" + hours.zeroPad(10) + ":" + mins.zeroPad(10) + ":" + secs.zeroPad(10);
	}
	return message;
}

function sha256(ascii)
{
	function rightRotate(value, amount) {
		return (value >>> amount) | (value << (32 - amount));
	};

	var mathPow = Math.pow;
	var maxWord = mathPow(2, 32);
	var lengthProperty = 'length'
	var i, j;
	var result = ''

	var words = [];
	var asciiBitLength = ascii[lengthProperty] * 8;

	var hash = sha256.h = sha256.h || [];
	var k = sha256.k = sha256.k || [];
	var primeCounter = k[lengthProperty];

	var isComposite = {};
	for (var candidate = 2; primeCounter < 64; candidate++) {
		if (!isComposite[candidate]) {
			for (i = 0; i < 313; i += candidate) {
				isComposite[i] = candidate;
			}
			hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
			k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
		}
	}

	ascii += '\x80'
	while (ascii[lengthProperty] % 64 - 56) ascii += '\x00'
	for (i = 0; i < ascii[lengthProperty]; i++) {
		j = ascii.charCodeAt(i);
		if (j >> 8) return;
		words[i >> 2] |= j << ((3 - i) % 4) * 8;
	}
	words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
	words[words[lengthProperty]] = (asciiBitLength)

	for (j = 0; j < words[lengthProperty];) {
		var w = words.slice(j, j += 16);
		var oldHash = hash;
		hash = hash.slice(0, 8);

		for (i = 0; i < 64; i++) {
			var i2 = i + j;
			var w15 = w[i - 15], w2 = w[i - 2];

			var a = hash[0], e = hash[4];
			var temp1 = hash[7]
				+ (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
				+ ((e & hash[5]) ^ ((~e) & hash[6]))
				+ k[i]
				+ (w[i] = (i < 16) ? w[i] : (
						w[i - 16]
						+ (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
						+ w[i - 7]
						+ (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
					) | 0
				);
			var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
				+ ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

			hash = [(temp1 + temp2) | 0].concat(hash);
			hash[4] = (hash[4] + temp1) | 0;
		}

		for (i = 0; i < 8; i++) {
			hash[i] = (hash[i] + oldHash[i]) | 0;
		}
	}

	for (i = 0; i < 8; i++) {
		for (j = 3; j + 1; j--) {
			var b = (hash[i] >> (j * 8)) & 255;
			result += ((b < 16) ? 0 : '') + b.toString(16);
		}
	}
	return result;
}

function is_locked()
{
	return ($('#page_lock').css('display') != 'none');
}


function toast(message, level)
{
	var toast_level = (typeof(level) == 'undefined' ? 'info' : level);
	var timeout = 5000;
	var extendedTimeOut = 1000;

	if (toast_level == 'warning') {
		timeout = 30000;
		extendedTimeOut = 10000;
	}

	toastr.options = {
		"closeButton": true,
		"debug": false,
		"newestOnTop": true,
		"progressBar": false,
		"positionClass": "toast-top-right",
		"preventDuplicates": false,
		"showDuration": "300",
		"hideDuration": "1000",
		"timeOut": timeout,
		"extendedTimeOut": extendedTimeOut,
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "fadeIn",
		"hideMethod": "fadeOut",
		"tapToDismiss": true
	};
	toastr[toast_level](message);
}

function htmlToText(html)
{
	const div = document.createElement('div');
	div.textContent = html; // 自动转义 HTML 标签
	return div.innerHTML; // 返回转义后的文本
}

function countdown_stop()
{
	if (theCountDownIntervalId != null) {
		clearInterval(theCountDownIntervalId);
		theCountDownIntervalId = null;
	}
}


function countdown_start()
{
	if(theSettings.license_using_billing == 0)
		return false;

	if (!is_logined())
		return false;

	countdown_stop();
	theCountDownIntervalId = setInterval(countdown, 1000);

	return true;
}

function unlock_all()
{
	CallFunction("UNLOCK 65535");
	CallFunction("DISABLEBSOD");
}

function minimize()
{
	CallFunction("SETWINDOWSIZE -2*-2");
	theLastWindowSize = "-2*-2";
	CallFunction("HIDEWINDOW");
}

function checkout_click() {
	if (thePCStatus.member_group_id != MEMBER_GROUP_POSTPAID)
		$('.myModalConfirmCheckout').modal('show');
}

var theLastAssistSent = 0;
function send_assist()
{
	if (new Date() - theLastAssistSent >= 1000 * 300)
	{
		theLastAssistSent = new Date();
		var cmd = {
			action: 'remind',
			version: 2,
			type: 'request',
			from: 'client',
			target: 'web',
			data: {
				pc: thePCInfo.pc_name,
				level: 'error',
				timeout: 0,
				message: 'assist'
			}
		};

		CallFunction('WSSSEND ' + JSON.stringify(cmd));
	}

	toast(translate_string("Your assist request has been sent"));
}

function open_url(url)
{
	CallFunction('RUN ' + url);
	console.log('open url ' + url);
}

function localTime(fmt, date) {
	var date = new Date();
	var options = {
		hour: 'numeric',
		minute: 'numeric',
		hour12: false,
	};
	return date.toLocaleString('en-US', options).replace("24:", "00:");;
}

function setDropdownMenu() {
	setTimeout(function () {
		$('.dropdown').mouseenter(function() {
			$(this).find('.dropdown-menu').show();
		});

		$('.dropdown').mouseleave(function() {
			$(this).find('.dropdown-menu').hide();
		});
	}, 100);
}


// -- CLIENT start --
// 1. client wss connected
// 2. client send login package to server
// 2. server send login + settings package to client (assign to theSettings)
// 3. server send client_status package to client (assign to thePCStatus)

// -- CLIENT login --
// 1. client send member_login package to server
// 2. server send client_status package to client

// -- TIME over --
// 1. client send auto_checkout package to server (countdown())
// 2. server send client_status package to client

// -- click CHECKOUT --
// 1. client send request_checkout package to server
// 2. server send client_status package to client

// -- session start/checkout, add time, add offer, topup member, add order using balance on CP --
// 1. server send client_status package to client
function process_wss_package(packet)
{
	if(typeof(packet.action) == 'undefined' || typeof(packet.version) == 'undefined' || typeof(packet.type) == 'undefined' || typeof(packet.data) == 'undefined' || typeof(packet.from) == 'undefined' || typeof(packet.target) == 'undefined')
		return;
	
	if(packet.version != 2 || packet.target != 'client')
		return;

	if (theGameList.process_wss_package(packet))
		return;

	if (theConvertToMember.process_wss_package(packet))
		return;
	
	if (packet.action == 'member_register')
	{
		if(theSettings.license_using_billing == 0)
			return;
		$('#spinner').hide();
		$('#form-register-member button[type="submit"]').prop('disabled', false);

		if (packet.status == 'error') {
			sweetAlert("", translate_string(packet.data.message), "error");
			return;
		}

		sweetAlert("", translate_string("Succeed"), "success");

		$('.myModalRegisterMember').modal('hide');
		return;
	}

	data = packet.data;
	
	// response message
	if(packet.type == 'response'){
		
		if (packet.status == 'error') {
			$('#spinner').hide();
			if (packet.action == 'member_login') {
				show_login_page('login');
				sweetAlert("", translate_string(data.message), "error");
				return;
			}

			sweetAlert("", translate_string(data.message), "error");
			return;
		}
		
		if (packet.action == 'member_change_password') {
			sweetAlert(translate_string("Succeed"), translate_string("The password was changed successfully."), "success");
			$('.myModalChangePassword').modal('hide');
			return;
		}

		if (packet.action == 'login') {
			// after first wss connected
			if (typeof(theSettings.login_count) == 'undefined')
				theSettings.login_count = 0;

			if (theSettings.login_count == 0) {
				$('.currency').html(typeof(theSettings.currency) == 'undefined' ? '$' : theSettings.currency)

				$('#offers_div').hide();
				if (theSettings.license_using_billing == 0) {
					vueGlobal.menuButton.logout = false;
					vueGlobal.menuButton.feedback = false;
					vueGlobal.menuButton.assist = false;
					vueGlobal.menuButton.changepassword = false;
				}
				if (theSettings.license_using_billing == 1) {
					vueGlobal.menuButton.logout = true;
					vueGlobal.menuButton.feedback = true;
					vueGlobal.menuButton.assist = true;
				}
				if (!theIsHomeVersion && theSettings.license_using_billing == 1)
					$('#offers_div').show();

				// first connect, set timeout for idle shutdown (don't move below codes to any where)
				if(!theIsHomeVersion && !is_logined() && theSettings.client_idle_mins > 0)
				{
					if (theIdleMonitorTimerId != null) {
						clearTimeout(theIdleMonitorTimerId);
						theIdleMonitorTimerId = null;
					}
					theIdleMonitorTimerId = setTimeout(function () {
						if (theSettings.client_idle_action.toLowerCase() == 'run') {
							console.log('RUN run.bat');
							CallFunction('RUN run.bat');
						}

						if (theSettings.client_idle_action.toLowerCase() == 'shutdown') {
							unlock_all();
							CallFunction("SHUTDOWN ONLY");
						}
					}, theSettings.client_idle_mins * 1000 * 60);
				}
			}

			theSettings.login_count ++;
			return;
		}

		if (packet.action == 'submit_order') {
			toast(translate_string('Your order submitted'));
			if (data.pay_method == 3) {
				theShop.gift_cart_clear();
				return;
			}
			theShop.cart_clear();
		}

		return; // return other response message
	}

	// reply the request message
	// 此处是向wss-server处返回响应
	// CallFunction('WSSSEND ' + JSON.stringify({ action: packet.action, version: 2, type: 'response', from: 'client', target: 'wss-server', status: 'success', data: {} }));
	// already has session, auto start session
	// checkout command only from CP!!
	// request message
	if(packet.action == 'admin_message'){
		toastr.options.tapToDismiss = true;
		toastr.options.timeOut = 0;
		toastr.options.extendedTimeOut = 0;
		toastr.info(htmlToText(data.message),translate_string('Message from ') + data.from ,{
			toastClass: "custom-transparent-toast"
		});
		var license_lang = theSettings.license_lang ?? '';
		var supportedLangs = ['ar', 'es', 'mn', 'ru', 'tr_TR'];
		license_lang = supportedLangs.includes(license_lang) ? (license_lang+"/"):'';
		CallFunction("PLAYSOUND customized/admin-message.wav "+license_lang+"admin-message.wav");
		return;
	}

	if (packet.action == 'client_status') {
		$('#spinner').hide();
		// if disable billing, auto login
		if (theSettings.license_using_billing == 0 && !theClientStatusInitialized) {
			theClientStatusInitialized = true;
			guest_login();
			return;
		}

		var last_login_status = is_logined();
		var member_loan = 0;
		if (last_login_status && thePCStatus.member_loan > 0)
			member_loan = thePCStatus.member_loan;

		countdown_stop();
		thePCStatus = data.client_status;

		console.log("Current state is " + (is_logined() ? 'logined' : 'logout'));
		console.log("Previous state is " + (last_login_status ? 'logined' : 'logout'));

		var d = new Date();
		thePCStatus.login_time = parseInt((d.getTime() + d.getTimezoneOffset()*60*1000)/1000);  // UTC time
		if(thePCStatus.member_group_name == null)
		{
			if(thePCStatus.member_group_id == MEMBER_GROUP_DEFAULT)
			{
				thePCStatus.member_group_desc = thePCStatus.member_group_name = translate_string('Default');
			}

			if(thePCStatus.member_group_id == MEMBER_GROUP_GUEST)
			{
				thePCStatus.member_group_desc = thePCStatus.member_group_name = translate_string('Guest');
			}

			if(thePCStatus.member_group_id == MEMBER_GROUP_PREPAID)
			{
				thePCStatus.member_group_desc = thePCStatus.member_group_name = translate_string('Prepaid');
			}

			if(thePCStatus.member_group_id == MEMBER_GROUP_POSTPAID)
			{
				thePCStatus.member_group_desc = thePCStatus.member_group_name = translate_string('Postpaid');
			}

			if(thePCStatus.member_group_id == MEMBER_GROUP_FREE)
			{
				thePCStatus.member_group_desc = thePCStatus.member_group_name = translate_string('Free');
			}

			if(thePCStatus.member_group_id == MEMBER_GROUP_OFFER)
			{
				thePCStatus.member_group_desc = thePCStatus.member_group_name = translate_string('Offer');
			}
		}

		if(thePCStatus.status_connect_time_left && thePCStatus.status_connect_time_left.length > 0)
		{
			// if time left < 00:00:00
			if (thePCStatus.status_connect_time_left.charAt(0) == '-')
			{
				thePCStatus.status_connect_time_left = -1;
			}
			else
			{
				var items = thePCStatus.status_connect_time_left.split(':');
				if(items.length == 0)
					thePCStatus.status_connect_time_left = 0;
				// parseInt("08") and parseInt("09") in wke return 0, must use parseInt("08", 10)
				if(items.length == 1)
					thePCStatus.status_connect_time_left = parseInt(items[0], 10);
				if(items.length == 2)
					thePCStatus.status_connect_time_left = parseInt(items[0], 10) * 60 + parseInt(items[1], 10);
				if(items.length == 3)
					thePCStatus.status_connect_time_left = parseInt(items[0], 10) * 60 * 60 + parseInt(items[1], 10) * 60 + parseInt(items[2], 10);
			}
		}

		// postpaid show time used
		if(thePCStatus.status_connect_time_duration && thePCStatus.status_connect_time_duration.length > 0)
		{
			// if time left < 00:00:00
			var items = thePCStatus.status_connect_time_duration.split(':');
			if(items.length == 0)
				thePCStatus.status_connect_time_duration = 0;
			// parseInt("08") and parseInt("09") in wke return 0, must use parseInt("08", 10)
			if(items.length == 1)
				thePCStatus.status_connect_time_duration = parseInt(items[0], 10);
			if(items.length == 2)
				thePCStatus.status_connect_time_duration = parseInt(items[0], 10) * 60 + parseInt(items[1], 10);
			if(items.length == 3)
				thePCStatus.status_connect_time_duration = parseInt(items[0], 10) * 60 * 60 + parseInt(items[1], 10) * 60 + parseInt(items[2], 10);
		}

		// in login page
		if (!is_logined())
		{
			stop_game_timers();
			
			if(last_login_status) // after checkout
			{
				CallFunction('RUN logout.bat');
				
				// game api
				// game_tracker();

				show_login_page('login');
				theEvents.reset();

				if(theIsHomeVersion)
					return;

				// switch to icafemenu
				CallFunction("RUNGAME_SWITCH_TO 0");

				if (member_loan > 0) {
					sweetAlert("", translate_string('Your unpaid bill is {0} {1}. Please pay it at the front desk.').replace('{0}', member_loan).replace('{1}', theSettings.currency), "info");
				}

				var client_idle_mins = (typeof(theSettings.client_idle_mins) != 'undefined' ? theSettings.client_idle_mins : 0);
				if (client_idle_mins > 0)
				{
					// action after idle time
					if (theIdleMonitorTimerId != null) {
						clearTimeout(theIdleMonitorTimerId);
						theIdleMonitorTimerId = null;
					}
					console.log('Will ' + theSettings.client_idle_action + ' after idle ' + client_idle_mins + ' minutes');
					theIdleMonitorTimerId = setTimeout(function () {

						if (theSettings.client_idle_action.toLowerCase() == 'run_checkout') {
							console.log('RUN run.bat');
							CallFunction('RUN run.bat');
						}

						if (theSettings.client_idle_action.toLowerCase() == 'shutdown_checkout') {
							unlock_all();
							console.log('Shutdown');
							CallFunction("SHUTDOWN ONLY");
						}

						if (theSettings.client_idle_action.toLowerCase() == 'reboot') {
							unlock_all();
							console.log('Reboot');
							CallFunction("SHUTDOWN REBOOT");
						}

						if (theSettings.client_idle_action.toLowerCase() == 'logoff') {
							unlock_all();
							console.log('Logoff');
							CallFunction("SHUTDOWN LOGOFF");
						}

						if (theSettings.client_idle_action.toLowerCase() == 'close all apps') {
							// kill all apps
							console.log('Close all apps');
							CallFunction("RUNGAME_TERMINATE 0");
						}

					}, client_idle_mins * 1000 * 60);
				}

				var pc_mining_enabled = (typeof(thePCStatus.pc_mining_enabled) != 'undefined' ? thePCStatus.pc_mining_enabled : 0);
				if (pc_mining_enabled === 1)
				{
					var client_mining_idle_mins = typeof(theSettings.client_mining_idle_mins) != 'undefined' ? theSettings.client_mining_idle_mins : 5;
					console.log("Will start miner after " + client_mining_idle_mins + " minutes");
					theIdleMiningTimerId = setTimeout(function () {
						var pc_mining_tool = (typeof(thePCStatus.pc_mining_tool) != 'undefined' ? thePCStatus.pc_mining_tool : 'nicehash');
						var pc_mining_options = (typeof(thePCStatus.pc_mining_options) != 'undefined' ? thePCStatus.pc_mining_options : '');
						CallFunction("MINER_START " + pc_mining_tool + " " + pc_mining_options);
					}, client_mining_idle_mins * 1000 * 60);
				}

				return;
			}
			
			if (theIsHomeVersion) // home version don't mining in login page
				return;

			// normal login page
			
			// show booking info
			if (typeof(thePCStatus.recent_booking) != 'undefined' && thePCStatus.recent_booking != null)
			{
				toast(translate_string("Recent booking") + ": " + thePCStatus.recent_booking, 'warning');
			}
			
			var pc_mining_enabled = (typeof (thePCStatus.pc_mining_enabled) != 'undefined' ? thePCStatus.pc_mining_enabled : 0);
			if (pc_mining_enabled == 1 && theIdleMiningTimerId == null) {
				var client_mining_idle_mins = typeof (theSettings.client_mining_idle_mins) != 'undefined' ? theSettings.client_mining_idle_mins : 5;
				console.log("Will start miner after " + client_mining_idle_mins + " minutes");
				theIdleMiningTimerId = setTimeout(function () {
					var pc_mining_tool = (typeof (thePCStatus.pc_mining_tool) != 'undefined' ? thePCStatus.pc_mining_tool : 'nicehash');
					var pc_mining_options = (typeof (thePCStatus.pc_mining_options) != 'undefined' ? thePCStatus.pc_mining_options : '');
					CallFunction("MINER_START " + pc_mining_tool + " " + pc_mining_options);
				}, client_mining_idle_mins * 1000 * 60);
			}
			return;
		}
		// end login page
		
		// already logined
		theConvertToMember.init();
		
		// 切换服务器了
		if(typeof(thePCStatus.license_server_code) != 'undefined' && vueGlobal.license_server_code != thePCStatus.license_server_code)
		{
			if(vueGlobal.license_server_code != '') {
				// 将token置为空,好让即使本次失败, 后续还是有机会继续获取token
				var clientMemberInfo = JSON.parse(localStorage.getItem('clientMemberInfo'));
				clientMemberInfo.token = '';
				localStorage.setItem('clientMemberInfo', JSON.stringify(clientMemberInfo));

				requestApiToken();
			}
			vueGlobal.license_server_code = thePCStatus.license_server_code;
		}

		// login in & previous state is checkout & not locked
		if(!last_login_status) // from login to logined
		{
			// 如果是能获取到当前status_pc_token的用户, 则通过status_pc_token来进行登录
			if(!theIsHomeVersion)
			{
				if (theSettings.license_show_client_mode == 'full screen') {
					CallFunction("SETWINDOWSIZE -3*-3"); // no topmost
					theLastWindowSize = "-3*-3";
					CallFunction("SETWINDOWTOPMOST 0");
				}

				if (typeof(theSettings.license_show_client_mode) == 'undefined' || theSettings.license_show_client_mode == 'maximized') {
					CallFunction("SETWINDOWSIZE -2*-2");
					theLastWindowSize = "-2*-2";
				}

				if (theSettings.license_show_client_mode == 'minimized') {
					CallFunction("SETWINDOWSIZE -2*-2");
					theLastWindowSize = "-2*-2";
					CallFunction("HIDEWINDOW");
				}
				
				/*
					TASKMGR  = 0x01,	// disable task manager (Ctrl+Alt+Del)
					TASKKEYS = 0x02,	// disable task keys (Alt-TAB, etc)
					TASKBAR  = 0x04,	// disable task bar
					LOGOFF   = 0x08,	// disable task bar
					WINKEYS	 = 0x10,	// disable windows keys
				*/
				
				CallFunction("UNLOCK 3"); // unlock alt+tab after login, user want to switch in game
				if(theSettings.license_show_client_mode != 'full screen')
					CallFunction("UNLOCK 4"); // only enable taskbar
			}
			
			CallFunction('RUN cmd /c "set ICAFEMENU_MEMBER='+(thePCStatus.member_account ?? '')+' && login.bat"');
			getToken().then(token => {
				if (!token) {
					return;
				}
				$.ajax({
					url: getCafeApiUrl('memberMessage'),
					method: 'get',
					dataType: 'json',
					data: {
						member_account: thePCStatus.member_account
					},
					headers: {
						'Authorization': 'Bearer ' + token
					},
					success: (result)=> {
						if(result.code == 200) {
							toastr.options.tapToDismiss = true;
							toastr.options.timeOut = 0;
							toastr.options.extendedTimeOut = 0;
							for (var i=0; i<result.data.log_list.length; i++)
							{
								toastr.info(htmlToText(result.data.log_list[i].log_details), translate_string('Message from ') + result.data.log_list[i].log_staff_name,{
									toastClass: "custom-transparent-toast"
								});
							}
						}
						return;
					},
					error(result) {
						console.log(JSON.stringify(result));
						return;
					}
				});
			});
			
			if(theSettings.license_start_game_tracker ?? 0)
				$.ajax({
					url: getCafeApiUrl('gameRankData'),
					method: 'get',
					dataType: 'json',
					data: {
						pc_name: thePCInfo.pc_name
					},
					success: (result)=> {
						console.log(JSON.stringify(result));
						if(result.code == 200) {
							vueHome.leaderboardItems = JSON.parse(JSON.stringify(result.data.rank));
							return;
						} else {
							sweetAlert("", translate_string(result.message), 'error');
							return;
						}
					},
					error(result) {
						sweetAlert("", JSON.stringify(result), "error");
						console.log(JSON.stringify(result));
						return;
					}
				});

			theHome.show();
			if(theSettings.show_game_page_as_default)
				theGameList.show();

			stop_login_timers();
			
			if (theIsHomeVersion) 
			{
				theEvents.show();
			}
			else 
			{
				if (theSettings.license_save_enable)
				{
					if(is_member_logined())
						CallFunction("INIT_GAME_SAVING " + thePCStatus.member_account);
					else
						CallFunction("INIT_GAME_SAVING guest_" + thePCInfo.pc_name);
				}
			}

			// start monitoring game track for fornite/lol
			if (theGameTrackerInterval != null)
			{
				clearInterval(theGameTrackerInterval);
				theGameTrackerInterval = null;
			}
			// stop game api tracker currently
			// theGameTrackerInterval = setInterval(game_tracker, 1000 * 60 * 5);
		}
		// end from login to logined

		// already logined but wss reconnect, or topup update left time
		
		if (typeof(thePCStatus.recent_booking) != 'undefined' && thePCStatus.recent_booking != null) 
		{
			toast(translate_string("Recent booking") + ": " + thePCStatus.recent_booking, 'warning');
		}

		// now state is login in (from logined to logined)

		// don't show checkout button if not member login
		vueGlobal.menuButton.logout = false;
		if (thePCStatus.member_group_id != MEMBER_GROUP_POSTPAID && thePCStatus.member_group_id != MEMBER_GROUP_PREPAID && thePCStatus.member_group_id != MEMBER_GROUP_OFFER)
			vueGlobal.menuButton.logout = true;
		if (theSettings.allow_prepaid_checkout == 1 && thePCStatus.member_group_id != MEMBER_GROUP_POSTPAID)
			vueGlobal.menuButton.logout = true;

		// show member info
		memberInfo.member_info_name = thePCStatus.member_account.toUpperCase() + " / " + thePCStatus.member_group_name.toUpperCase();
		memberInfo.member_name = thePCStatus.member_account.toUpperCase();
		memberInfo.canChangePassword = (() => {
			// 1. client settings 没有开启社交登录的(social_login)
			// 2. member setttings 开启了(allow_password_login_always)
			// 3. 会员没有绑定社交帐号的
			if (theSettings.social_login != 1) {
				return true;
			}
			//TODO get allow_password_login_always
			if (theSettings.allow_password_login_always == 1) {
				return true;
			}
			//TODO get member_oauth_platform
			if ((thePCStatus.member_oauth_platform ?? 'account') == 'account') {
				return true;
			}
			return false;
		})()
		PetiteVue.nextTick(() => {
			ui_init();
			$('[data-toggle="tooltip"]').tooltip();
		});
		
		$('.cafe_info_member_logo').attr('src', 'icons/mg-' + (thePCStatus.member_group_id > MEMBER_GROUP_DEFAULT ? thePCStatus.member_group_id.toString() : '0') + '.png');
	
		if (theSettings.license_using_billing == 1)
		{
			theAvailableOffers = [];
			var id = 1;
			for (var i=0; i<thePCStatus.available_offers.length; i++)
			{
				var in_using = (thePCStatus.available_offers[i].product_name == thePCStatus.offer_in_using && i == 0);
				theAvailableOffers.push({
					id: id++,
					in_using: in_using,
					time_type: 'offer',
					name: thePCStatus.available_offers[i].product_name.toUpperCase(),
					total_secs: thePCStatus.available_offers[i].product_seconds,
					left_secs: (in_using ? thePCStatus.status_connect_time_left : thePCStatus.available_offers[i].member_offer_left_seconds),
					last_notify_mins: 1000,
					active: ''
				});
			}

			if (thePCStatus.member_balance_bonus_left_seconds > 0)
			{
				var in_using = (thePCStatus.offer_in_using == null || thePCStatus.offer_in_using.length == 0);
				var name = translate_string('BALANCE');
				var left_secs = in_using ? thePCStatus.status_connect_time_left : thePCStatus.member_balance_bonus_left_seconds;
				if (thePCStatus.member_group_id == MEMBER_GROUP_POSTPAID || thePCStatus.member_group_id == MEMBER_GROUP_FREE) {
					left_secs = thePCStatus.status_connect_time_left;
				}

				theAvailableOffers.push({
					id: id++,
					in_using: in_using,
					time_type: 'balance',
					name: name,
					total_secs: thePCStatus.member_balance_bonus_left_seconds,
					left_secs: left_secs,
					last_notify_mins: 1000,
					active: ''
				});
			}

			// add total
			if (theAvailableOffers.length > 0)
			{
				var total_secs = 0;
				var left_secs = 0;
				theAvailableOffers.forEach(function(obj) {
					total_secs += obj.total_secs;
					left_secs += obj.left_secs;
				});

				theAvailableOffers.splice(0, 0, {
					id: id++,
					in_using: false,
					time_type: 'total',
					name: translate_string('TOTAL'),
					total_secs: total_secs,
					left_secs: left_secs,
					last_notify_mins: 1000,
					active: ''
				});
			}

			if (theAvailableOffers.length > 0)
			{
				theAvailableOffers[0].in_using = true;
				theAvailableOffers[0].active = 'active';
			}

			vueAvailableOffers.items = JSON.parse(JSON.stringify(theAvailableOffers));
			PetiteVue.nextTick(() => {
				ui_init();
				$('[data-toggle="tooltip"]').tooltip();
			});
			
			$('#carousel_main').carousel({ interval: false });
		}

		countdown_start();
		if (!theIsHomeVersion) {
			if (theQueryRunGameIdsIntervalId != null) {
				clearInterval(theQueryRunGameIdsIntervalId);
				theQueryRunGameIdsIntervalId = null;
			}
			query_rungame_ids();
			theQueryRunGameIdsIntervalId = setInterval(query_rungame_ids, 3000);
		}

		// show left money and bonus
		$('.member_balance_realtime').removeClass('d-flex d-none').addClass(thePCStatus.member_group_id != MEMBER_GROUP_POSTPAID && thePCStatus.member_group_id != MEMBER_GROUP_FREE ? 'd-flex' : 'd-none');
		$('.member_balance_bonus_realtime').removeClass('d-flex d-none').addClass(thePCStatus.member_group_id != MEMBER_GROUP_POSTPAID && thePCStatus.member_group_id != MEMBER_GROUP_FREE && thePCStatus.member_group_id != MEMBER_GROUP_PREPAID ? 'd-flex' : 'd-none');
		$('.member_coin_balance').removeClass('d-flex d-none').addClass(thePCStatus.member_group_id != MEMBER_GROUP_POSTPAID && thePCStatus.member_group_id != MEMBER_GROUP_FREE && thePCStatus.member_group_id != MEMBER_GROUP_PREPAID ? 'd-flex' : 'd-none');
		$('.postpaid_pc_name').removeClass('d-flex d-none').addClass(thePCStatus.member_group_id == MEMBER_GROUP_POSTPAID || thePCStatus.member_group_id == MEMBER_GROUP_FREE ? 'd-flex' : 'd-none');

		if (theSettings.license_using_billing == 1 && thePCStatus.member_group_id != MEMBER_GROUP_POSTPAID && thePCStatus.member_group_id != MEMBER_GROUP_FREE) {
			var member_balance_realtime = formatNumber(parseFloat(thePCStatus.member_balance_realtime));
			if (thePCStatus.member_balance_realtime > 1000000)
				member_balance_realtime = formatNumber(parseFloat(thePCStatus.member_balance_realtime / 1000000.0)) + "M";
			memberInfo.member_balance_realtime = member_balance_realtime;

			var member_balance_bonus_realtime = formatNumber(parseFloat(thePCStatus.member_balance_bonus_realtime));
			if (thePCStatus.member_balance_bonus_realtime > 1000000)
				member_balance_bonus_realtime = formatNumber(parseFloat(thePCStatus.member_balance_bonus_realtime / 1000000.0)) + "M";
			memberInfo.member_balance_bonus_realtime = member_balance_bonus_realtime;

			var member_coin_balance = formatNumber(parseFloat(thePCStatus.member_coin_balance));
			if (thePCStatus.member_coin_balance > 1000000)
				member_coin_balance = formatNumber(parseFloat(thePCStatus.member_coin_balance / 1000000.0)) + "M";
			memberInfo.member_coin_balance = member_coin_balance;
			
			PetiteVue.nextTick(() => {
				ui_init();
				$('[data-toggle="tooltip"]').tooltip();
			});
		}
		// end now state is login in
		return;
	}
	// end client_status

	if (packet.action == 'quit' || packet.action == 'exit') {
		unlock_all();
		CallFunction("EXIT");
		return;
	}

	if (packet.action == 'shutdown' && !theIsHomeVersion) {
		unlock_all();
		CallFunction("SHUTDOWN ONLY");
		return;
	}

	if (packet.action == 'reboot' && !theIsHomeVersion) {
		unlock_all();
		CallFunction("SHUTDOWN REBOOT");
		return;
	}

	if (packet.action == 'logoff' && !theIsHomeVersion) {
		unlock_all();
		CallFunction("SHUTDOWN LOGOFF");
		return;
	}
	
	if (packet.action == 'payment_qr') {
		sweetAlert("", translate_string(data.message), "info");
		if(data.member_group_id == MEMBER_GROUP_PREPAID){
			$('.myModalTopupLogin').modal('hide');
		} else {
			$('.myModalTopup').modal('hide');
		}
		return;
	}
	
}

function OnCommand(strCmd, strParam)
{
	strParam = strParam.replace(/____@@@____/g, '\\')
	strParam = strParam.replace(/____@@____/g, '"')
	strParam = strParam.replace(/____@____/g, '\'')
	strParam = strParam.replace(/___@@@@___/g, '\r')
	strParam = strParam.replace(/___@@@@@___/g, '\n')

	if (strCmd == "CallExeDone") {
		var cols = strParam.split(' ');
		if (typeof(cols) == 'undefined')
			return;
		if (cols.length == 0)
			return;
		var action = cols[0];

		if (action == 'INIT_GAME_SAVING') {
			setTimeout(function () {
				$('input[name=search]').css({background: '#ffffff'});

				setTimeout(function () {
					$('input[name=search]').css({background: 'transparent'});
				}, 500);

			}, 500);
		}

		return;
	}

	if (strCmd == "SHOWMSG") {
		sweetAlert("", translate_string(strParam), "info");
		return;
	}

	if (strCmd == 'TOAST') {
		toast(translate_string(strParam));
		return;
	}
	
	// if wss_timeout, lock the client
	if (strCmd == 'WSS_TIMEOUT') {
		// direct to login page, allow player work when cloud server down
		// process_wss_package({ action: 'client_status', version: 2, type: 'request', from: 'wss-server', target: 'client', status: 'success', data: {client_status: { member_account: '' }}});
		return;
	}

	if (strCmd == 'WSS_LOGIN') {
		theWssLogined = true;

		/*
		$('#loginForm input[name=username]').prop('disabled', !theWssLogined);
		$('#loginForm input[name=password]').prop('disabled', !theWssLogined);
		$('#loginForm button').css({opacity: 1.0});
		$('#loginForm input[name=username]').focus();
		*/
		return;
	}

	if (strCmd == 'WSS_LOGIN_FAILED') {
		//if (!theIsHomeVersion)
		//	return;
		$('#spinner').hide();
		show_login_page('login');
		sweetAlert("", strParam.length ? translate_string(strParam) : translate_string('Login failed'), 'error');
		return;
	}

	if (strCmd == 'WSS_DISCONNECTED') {
		theWssLogined = false;

		if (theIsHomeVersion)
			return;
		/*
		$('#loginForm input[name=username]').prop('disabled', !theWssLogined);
		$('#loginForm input[name=password]').prop('disabled', !theWssLogined);
		$('#loginForm button').css({opacity: 0.5});
		*/
		return;
	}

	if (strCmd == 'WM_DISPLAYCHANGE') {
		if (theLastWindowSize.length > 0)
			CallFunction("SETWINDOWSIZE " + theLastWindowSize);

		return;
	}

	if (strCmd == 'WSS_COMMAND') {
		var data = JSON.parse(strParam);
		process_wss_package(data);

		return;
	}

	if (strCmd == 'COVERSHOW') {
		$('#spinner').show();
		return;
	}

	if (strCmd == 'COVERHIDE') {
		$('#spinner').hide();
		return;
	}

	if (strCmd == "RUNGAME_IDS") {
		var ids = strParam.split(',');
		var html = '';
		for (var i=0; i<ids.length; i++) {

			theGames.forEach(function(obj) {
				if (obj.pkg_id == ids[i]) {
					html += ('<a class="run-game-icon" href="javascript:rungame_show_dialog(' + obj.pkg_id + ')" data-toggle="tooltip" data-placement="bottom" title="' + obj.pkg_name + '"><img src="icons/' + obj.pkg_id + '.png" onerror="this.src=\'images/default-icon.png\'"></a>');
				}
			});

		}
		$('#bottom-run-games').html(html);
		$('#bottom-run-games [data-toggle="tooltip"]').tooltip();
		return;
	}

	if (strCmd == "APIResponse") {
		var pos = strParam.indexOf(' ');
		var api_action = strParam.substr(0, pos);
		strParam = strParam.substr(pos+1);
		if(strParam.length == 0)
			return;
		var data = JSON.parse(strParam);

		if (api_action.indexOf('type=event-') >= 0) {
			theEvents.onAPIResponse(api_action, data);
			return;
		}

		if (api_action.indexOf('type=game-rank-data') >= 0) {
			if (data.result == 0) {
				sweetAlert("", translate_string(data.message), 'error');
				return;
			}
			vueHome.leaderboardItems = JSON.parse(JSON.stringify(data.rank));
			return;
		}

		return;
	}
	
	if (strCmd == "PCInfo") {
		thePCInfo = JSON.parse(strParam);
		if(!$('#page_login').is(":visible"))
			return;
		if(typeof(theSettings.client_pc_name_size) == 'undefined')
		{
			theSettings.client_pc_name_size = 40;
		}
		set_monitor_turn_off_timeout(thePCInfo.pc_turn_off_monitor_seconds);
		if (theIsHomeVersion)
			$('#loginForm input[name=username]').val(thePCInfo.pc_name);
		else
			$('#page_login .pc_name').html(thePCInfo.pc_name);
		if (theIsHomeVersion)
			$('#loginForm input[name=username]').css('font-size', theSettings.client_pc_name_size+'px').val(thePCInfo.pc_name);
		else
			$('#page_login .pc_name').css('font-size', theSettings.client_pc_name_size+'px').html(thePCInfo.pc_name);
		
		$('#version_date').html("v. " + thePCInfo.version_date);
		
		return;
	}

	if (strCmd == 'GameStats') {
		// 这里的参数与clientapi.php里面的fortnite-match-stats返回的data是一致的
		// strParam 示例: '{"type":"fortnite-match-stats", "win_coins":100}';
		var data = JSON.parse(strParam);
		var game_stats_type = data.type;
		var win_coins = data.win_coins;
		var gameName = getGameName(game_stats_type);
		var message = "You earned "+win_coins+" coins in the "+gameName+"!"

		// win_coins 是否大于0
		if (win_coins > 0) {
			sweetAlert("", translate_string(message), "success");
		}
		return;
	}

	if (strCmd == "VOLUME") {
		const value = parseInt(strParam);
		theAudioSettings.setVolume(value)
		return;
	}

	if (strCmd == "MOUSE_DOUBLE_CLICK_SPEED") {
		const value = parseInt(strParam)
		theMouseSettings.setDoubleClickSpeed(value)
		return
	}

	if (strCmd == "MOUSE_MOVE_SPEED") {
		const value = parseInt(strParam)
		theMouseSettings.setMoveSpeed(value)
		return
	}	

	if (strCmd == "MOUSE_SMOOTHNESS") {
		const value = parseInt(strParam)
		theMouseSettings.setMouseSmoothness(value === 1)
		return
	}
}

function getGameName(game_stats_type) {
	const gameMapping = {
		'fortnite-match-stats': 'Fortnite',
		'lol-match-stats': 'League of Legends',
		'valorant-match-stats': 'Valorant',
		'dota2-match-stats': 'Dota 2',
		'csgo-match-stats': 'CS:GO',
		'apex-match-stats': 'Apex Legends',
		"pubg-match-stats": "PUBG"
	};

	return gameMapping[game_stats_type] || '';
}

function setBodyStyle()
{
	return;
	let standardRatio = 1920.0 / 1080;
	let pageRatio = window.innerWidth / window.innerHeight;

	let containerWidth;
	let containerHeight;
	let zoom = 1;
	let margin;
	if(standardRatio > pageRatio) {
		containerWidth = window.innerWidth;
		containerHeight = 1080 * window.innerWidth / 1920;
		zoom = containerHeight / 1080;
		margin = (window.innerHeight - containerHeight) / 2 + "px 0";
	} else {
		containerWidth = 1920 * window.innerHeight / 1080;
		containerHeight = window.innerHeight
		zoom = containerWidth / 1920;
		margin = "0 0 0 " + (window.innerWidth - containerWidth) / 2 + "px";
	}

	let bodyStyle = {
		width: "1920px",
		height: "1080px",
		'background-color': "#000000",
		//transform: "scale("+zoom+")",
		//'transform-origin': "top left",
		margin: margin,
		//'background-image': "none"
	}

	vueGlobal.bodyStyle = JSON.parse(JSON.stringify(bodyStyle));
}

function countdown()
{
	if (thePCStatus.status_connect_time_left < 0)
	{
		// The end of the countdown does not mean the customer time is all used up, because the customer may have offers and balance.
		// send auto_checkout package to wss server, the wss server will send client_status package to me after switch to another offer or balance.
		var cmd = {action: 'auto_checkout', version: 2,	type: 'request', from: 'client', target: 'wss-server',	data: {}};
		console.log(JSON.stringify(cmd));
		CallFunction('WSSSEND ' + JSON.stringify(cmd));
		clearInterval(theCountDownIntervalId);
		theCountDownIntervalId = null;
		return;
	}
	
	if (thePCStatus.member_group_id == MEMBER_GROUP_POSTPAID || thePCStatus.member_group_id == MEMBER_GROUP_FREE) {
		memberInfo.postpaid_pc_name = thePCStatus.pc_name;
		PetiteVue.nextTick(() => {
			ui_init();
			$('[data-toggle="tooltip"]').tooltip();
		});

		thePCStatus.status_connect_time_duration += 1;  // if postpaid, show time used
		if(theAvailableOffers.length > 0)
			theAvailableOffers[0].left_secs = thePCStatus.status_connect_time_duration;
	}

	for (var i=0; i<theAvailableOffers.length; i++) {
		var percent = 0;
		if (theAvailableOffers[i].total_secs > 0)
			percent = Math.min(parseInt((theAvailableOffers[i].left_secs / theAvailableOffers[i].total_secs) * 100.0), 100);

		$('#available-' + theAvailableOffers[i].id + ' .progress-bar').css('width', percent + '%');
		$('#available-' + theAvailableOffers[i].id + ' .remaining').html(format_time(theAvailableOffers[i].left_secs));
	}

	if(((theSettings.alert_for_last_offer ?? 0) == 1 && theAvailableOffers.length == 3 && theAvailableOffers[1].in_using) || theAvailableOffers.length == 2) // total, last offer, balance
	{
		var hour = parseInt(theAvailableOffers[1].left_secs / 3600);
		var min = parseInt((theAvailableOffers[1].left_secs % 3600) / 60);
		for (var m=1; m<=5; m++)
		{
			if(hour > 0)
				break;
			if(theAvailableOffers[1].last_notify_mins <= m)
				break;
			if (min < m) 
			{
				if(theAvailableOffers.length == 3)
					toast(translate_string('{0} offer will be expired in {1} minutes, auto switch to balance mode').replace('{0}', theAvailableOffers[1].name).replace('{1}', m), 'warning');
				else
					toast(translate_string("Your remaining time is less than {0} minutes").replace('{0}', m), 'warning');
				var license_lang = theSettings.license_lang ?? '';
				var supportedLangs = ['ar', 'es', 'mn', 'ru', 'tr_TR'];
				license_lang = supportedLangs.includes(license_lang) ? (license_lang+"/"):'';
				CallFunction("PLAYSOUND customized/" + m + "min_left.wav "  + license_lang + m + "min_left.wav");
				theAvailableOffers[1].last_notify_mins = m;
				break;
			}
		}
	}

	thePCStatus.status_connect_time_left -= 1;

	for (i=0; i<theAvailableOffers.length; i++) {
		if (theAvailableOffers[i].time_type === 'total' || theAvailableOffers[i].in_using) {
			theAvailableOffers[i].left_secs -= 1;
		}
	}
}

function SmsClass()
{
	// 获取手机验证码
	this.sendCode = function () {
		var timer = $('#sms_timer_code');
		var phone = $("#form-register-member input[name=phone]").val();
		if (phone == '' || phone == null) {
			sweetAlert("", translate_string("Please enter your mobile phone number!"), "error");
			return false;
		}
		timer.prop('disabled', true);
		const smsIcafeId = theCafe.id ?? false;

		// let api = "https://" + theSettings.license_info.license_server_code + ".icafecloud.com/api/v2/auth/smsCode";
		const api = getCafeApiUrl('smsCode', 'auth');
		
		$.ajax({
			url: api,
			method: 'get',
			dataType: 'json',
			data: {
				cafe_id: smsIcafeId,
				phone_number: phone
			},
			success: (data)=> {
				console.log(JSON.stringify(data));
				if(data.code == 200) {
					this.smsCountDown();
				} else {
					data.message ? sweetAlert('', translate_string(data.message), 'error'): sweetAlert('', translate_string('Fail in send!'), 'error');
					timer.prop('disabled', false);	
				}
			},
			error(data) {
				console.log(JSON.stringify(data));
				data.message ? sweetAlert('', translate_string(data.message), 'error'): sweetAlert('', translate_string('Fail in send!'), 'error');
				timer.prop('disabled', false);
			}
		});
	}

	// 验证短信验证码是否匹配
	this.verifySmscode = function (callback) {
		var phone = $("#form-register-member input[name=phone]").val();
		var member_sms_code = $("#form-register-member input[name=member_sms_code]").val();
		// let api = "https://" + theSettings.license_info.license_server_code + ".icafecloud.com/api/v2/auth/checkSmsCode";
		let api = getCafeApiUrl('checkSmsCode', 'auth');
		$.ajax({
			url: api,
			method: "get",
			data: { type: 'check_sms_code', phone_number: phone, member_sms_code: member_sms_code, cafe_id:theCafe.id },
			dataType: "json",
			success: (data) => {
				console.log(JSON.stringify(data));
				if (data.code == 200) {
					callback(data);
				}
				else {
					callback(data);
				}
			},
			error: (data) => {
				console.log(JSON.stringify(data));
				sweetAlert("", translate_string('SMS verification code mismatch'), "error");
				return;
			}
		});
	}

	// 短信倒计时
	this.smsCountDown = function () {
		var seconds = 60,
			$timer = $('#sms_timer_code');

		$timer.text(seconds);
		var timer = setInterval(function () {
			seconds--;
			$timer.text(seconds);
			if (seconds <= 0) {
				clearInterval(timer);
				$timer.text('Again');
				$timer.prop('disabled', false);
			}
		}, 1000);
	}
}

function Video()
{
	var that = this;
	
	this.stop = function()
	{
		$('#url-video').attr('src', '');
		$('.url-video').load();
		$('#youtube-video').attr('src', '');
		$('.youtube-video').load();
		return;
	}
	
	this.hide = function()
	{
		$('.url-video').hide();
		$('.youtube-video').hide();
	}
	
	this.play = function(source){
		this.stop();
		this.hide();
		if(source.indexOf('youtube') != -1)
		{
			const urlParams = new URL(source);
			if(urlParams.searchParams)
			{
				if(urlParams.searchParams.has('v'))
				{
					$('#youtube-video').attr('src', "https://www.youtube.com/embed/"+urlParams.searchParams.get('v')+
						"?mute=1&modestbranding=1&autohide=1&showinfo=0&controls=0&autoplay=1&loop=1&playlist="+urlParams.searchParams.get('v')+"&version=3");
					$('.youtube-video').show();
					return;
				}
			}
		}
		
		$('#url-video').attr('src', source);
		$('.url-video').load();
		$('.url-video').show();
	}
}

function ui_init(translate = true)
{
	if(translate)
		translate_obj($('body'));
	$('label').bind('mouseenter', function(e){
		var target = e.target;
		if(target.offsetWidth < target.scrollWidth && !$(target).attr('title') && !$(target).attr('data-original-title'))
		{
			$(target).attr('title', $(target).text());
			$(target).attr('data-toggle', 'tooltip');
			$(target).attr('data-placement', 'bottom');
			$('[data-toggle="tooltip"]').tooltip();
		}
	});
}

function run_protect(protection_settings)
{
	if(protection_settings == null)
	{
		CallFunction('RUNSCRIPT "{tools}\\protection\\cmd\\allow.bat"');
		CallFunction('RUNSCRIPT "{tools}\\protection\\control_panel\\allow.bat"');
		CallFunction('RUNSCRIPT "{tools}\\protection\\download_file\\allow.bat"');
		CallFunction('RUNSCRIPT "{tools}\\protection\\power_button\\allow.bat"');
		//CallFunction('RUNSCRIPT "{tools}\\protection\\regedit\\allow.bat"');
		CallFunction('RUNSCRIPT "{tools}\\protection\\usb\\allow.bat"');
		CallFunction('RUNSCRIPT "{tools}\\protection\\task_manager\\allow.bat"');
		return;
	}
	
	protection = JSON.parse(protection_settings);
	
	CallFunction('RUNSCRIPT "{tools}\\protection\\cmd\\' + (protection.cmd ? 'deny.bat"' : 'allow.bat"'));
	CallFunction('RUNSCRIPT "{tools}\\protection\\control_panel\\' + (protection.control_panel ? 'deny.bat"' : 'allow.bat"'));
	CallFunction('RUNSCRIPT "{tools}\\protection\\download_file\\' + (protection.download_file ? 'deny.bat"' : 'allow.bat"'));
	CallFunction('RUNSCRIPT "{tools}\\protection\\power_button\\' + (protection.power_button ? 'deny.bat"' : 'allow.bat"'));
	//CallFunction('RUNSCRIPT "{tools}\\protection\\regedit\\' + (protection.regedit ? 'deny.bat"' : 'allow.bat"'));
	CallFunction('RUNSCRIPT "{tools}\\protection\\usb\\' + (protection.usb ? 'deny.bat"' : 'allow.bat"'));
	CallFunction('RUNSCRIPT "{tools}\\protection\\task_manager\\' + (protection.task_manager ? 'deny.bat"' : 'allow.bat"'));
}

function shutdown_click()
{
	$(".myModalConfirmShutdown").modal(true);
}

function reboot_click()
{
	$(".myModalConfirmReboot").modal(true);
}

function confirm_shutdown_submit()
{
	CallFunction('SHUTDOWN ONLY');
}

function confirm_reboot_submit()
{
	CallFunction('SHUTDOWN REBOOT');
}

function format_datetime(s)
{
	var date = new Date(s);
	if (isNaN(date))
		return '';

	var d = date.getDate();
	var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
	var y = date.getFullYear().toString().substr(2);

	var h = date.getHours();
	if (h < 10)
		h = '0' + h;
	var min = date.getMinutes();
	if (min < 10)
		min = '0' + min;

	return d + ' ' + m + ' ' + y + ' ' + h + ':' + min;
}

function copyToClipboard(id)
{
	var clipboard = new ClipboardJS(id);
	clipboard.on('success', function (e) {
		sweetAlert({
			title: translate_string('Succeed'),
			text: translate_string('Copied'),
			type: 'success'
		});
		e.clearSelection();
	});
}

function format_balance(balance)
{
	var balance_realtime = formatNumber(parseFloat(balance));
	if (balance > 1000000)
		balance_realtime = formatNumber(parseFloat(balance / 1000000.0)) + "M";

	return balance_realtime;
}
// 获取接口地址:/cafe/xxxx/uri
function getCafeApiUrl(uri, type='cafe')
{
	// 优先thePCStatus，因为有可能切换服务器
	console.log('api ' + uri);
	var license_server_code = thePCStatus.license_server_code ?? theSettings.license_info.license_server_code;
	if (type == 'auth') {
		return "https://" + license_server_code + ".icafecloud.com/api/v2/auth/" + uri;
	} else {
		return "https://" + license_server_code + ".icafecloud.com/api/v2/cafe/" + theCafe.id + "/" + uri;
	}
}

function requestApiToken()
{
	return new Promise(resolve => {
	if(typeof(thePCStatus.status_pc_token) == 'undefined')
	{
		resolve();
		return;
	}
	
	// const memberLoginUrl = "https://" + theSettings.license_info.license_server_code + ".icafecloud.com/api/v2/auth/memberLogin";
	const memberLoginUrl = getCafeApiUrl('memberLogin', 'auth');
	// 相当于后台获取一次api token，所以出错的时候不应该有交互窗口
	$.ajax({
		url: memberLoginUrl,
		method: "post",
		data: {
			member_account: thePCStatus.member_account,
			status_pc_token: thePCStatus.status_pc_token,
			license_name: theCafe.license_name,
			pc_name: thePCInfo.pc_name,
			is_client: 1,
		},
		dataType: "json",
		success: (result) => {
			if(result.code!=200){
				console.log(JSON.stringify(result));
				resolve();
				return;
			}
			localStorage.setItem('clientMemberInfo', JSON.stringify(result.data));
			if (JSON.parse(localStorage.getItem('clientMemberInfo'))?.token) {
				vueGlobal.showOrderList = true;
			}
			delete result.data;
			console.log(JSON.stringify(result));
			resolve();
		},
		error: (result) => {
			console.log(JSON.stringify(result));
			resolve();
			return;
		}
	});
	});
}

function unlock_pc()
{
	if(is_logined())
	{
		if (theSettings.license_show_client_mode == 'full screen') {
			CallFunction("SETWINDOWSIZE -3*-3"); // no topmost
			theLastWindowSize = "-3*-3";
			CallFunction("SETWINDOWTOPMOST 0");
		}

		if (typeof(theSettings.license_show_client_mode) == 'undefined' || theSettings.license_show_client_mode == 'maximized') {
			CallFunction("SETWINDOWSIZE -2*-2");
			theLastWindowSize = "-2*-2";
		}

		if (theSettings.license_show_client_mode == 'minimized') {
			CallFunction("SETWINDOWSIZE -2*-2");
			theLastWindowSize = "-2*-2";
			CallFunction("HIDEWINDOW");
		}

		/*
			TASKMGR  = 0x01,	// disable task manager (Ctrl+Alt+Del)
			TASKKEYS = 0x02,	// disable task keys (Alt-TAB, etc)
			TASKBAR  = 0x04,	// disable task bar
			LOGOFF   = 0x08,	// disable task bar
			WINKEYS	 = 0x10,	// disable windows keys
		*/

		CallFunction("UNLOCK 3"); // unlock alt+tab after login, user want to switch in game
		if(theSettings.license_show_client_mode != 'full screen')
			CallFunction("UNLOCK 4"); // only enable taskbar
	}

	$('#page_lock').hide();
	$('#unlockForm button[type="submit"]').prop('disabled', false);
}

/**
 * 获取所有支持的游戏配置
 * 返回数组，每个元素包含 key, name, matchStatsType, rankOptionKey
 */
function getSupportedGames() {
	return [
		{ key: 'fortnite', name: 'Fortnite', matchStatsType: 'fortnite-match-stats', rankOptionKey: 'game_rank_options_fortnite' },
		{ key: 'pubg', name: 'PUBG', matchStatsType: 'pubg-match-stats', rankOptionKey: 'game_rank_options_pubg' },
		{ key: 'dota2', name: 'Dota 2', matchStatsType: 'dota2-match-stats', rankOptionKey: 'game_rank_options_dota2' },
		{ key: 'csgo', name: 'CS:GO', matchStatsType: 'csgo-match-stats', rankOptionKey: 'game_rank_options_csgo' },
		{ key: 'valorant', name: 'Valorant', matchStatsType: 'valorant-match-stats', rankOptionKey: 'game_rank_options_valorant' },
		{ key: 'lol', name: 'League of Legends', matchStatsType: 'lol-match-stats', rankOptionKey: 'game_rank_options_lol' },
		{ key: 'apex', name: 'Apex Legends', matchStatsType: 'apex-match-stats', rankOptionKey: 'game_rank_options_apex' },
		{ key: 'custom', name: 'Custom', matchStatsType: 'custom-match-stats', rankOptionKey: 'game_rank_options_custom' }
	];
}

/**
 * 获取已启用的游戏（根据theSettings中的game_rank_options_xx）
 */
function getEnabledGames() {
	return getSupportedGames().filter(game => {
        // 如果 theSettings[game.rankOptionKey] 明确为 0，则过滤掉，否则视为启用
        return theSettings[game.rankOptionKey] !== 0;
    });
}

/**
 * 根据 matchStatsType 获取游戏名
 */
function getGameNameByMatchStatsType(type) {
	const game = getSupportedGames().find(g => g.matchStatsType === type);
	return game ? game.name : '';
}

/**
 * 获取 gamecode2names 数组（用于 events）
 */
function getGameCode2Names() {
	// 所有的支持游戏
	const arr = getSupportedGames().map(g => ({ code: g.key, name: g.name }));
	// 只包含已启用的游戏
	const enabledGames = getEnabledGames();
	arr.push({ code: 'all', name: enabledGames.map(g => g.name).join(', ') });
	return arr;
}

function getMemberInfo()
{
	const clientMemberInfo = JSON.parse(localStorage.getItem('clientMemberInfo'));
	if (!clientMemberInfo) {
		// show_login_by_no_token();

		return {};
	}

	return clientMemberInfo;
}

function formatNumber(number) {
	if(typeof(number) == 'undefined')
		return '';
	const showDecimalConfig = theSettings.shop_show_decimal ?? 1;
	const showDecimal = showDecimalConfig == '1';
	const fractionDigits = showDecimal ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { minimumFractionDigits: 0, maximumFractionDigits: 0 };
	// en-US	1,234,567.89
	// de-DE	1.234.567,89
	// fr-FR	1 234 567,89
	// ru-RU	1 234 567,89
	var supportedLangs = {'en': 'en-US', 'ar': 'ar-AR', 'es': 'es-ES', 'mn': 'mn-MN', 'ru': 'ru-RU', 'tr_TR': 'tr-TR', 'fr': 'fr-FR'};
	const language = supportedLangs[theSettings.license_lang ?? 'en'] ?? 'en-US';
	return Number(number).toLocaleString(language, fractionDigits);
}