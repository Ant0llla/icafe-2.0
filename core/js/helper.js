
var _timer = {};
function delay_execute(fn) {
	if (_timer[fn]) {
		return false
	}

	_timer[fn] = window.setTimeout(function () {
		fn();
		window.setTimeout(function () {
			window.clearTimeout(_timer[fn]);
			delete _timer[fn];
		}, 1000);
	}, 300);

	return false;
}
Number.prototype.zeroPad = Number.prototype.zeroPad ||
	function (base) {
		var nr = this, len = (String(base).length - String(nr).length) + 1;
		return len > 0 ? new Array(len).join('0') + nr : nr;
	};

function toFixed2(data) {
	var v = parseFloat(data);
	return v.toFixed(2);
}

function toLowerCase(data) {
	return data.toLowerCase();
}

function format_time(seconds) {
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

function sha256(ascii) {
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

function is_locked() {
	return ($('#page_lock').css('display') != 'none');
}


function toast(message, level) {
	var toast_level = (typeof (level) == 'undefined' ? 'info' : level);
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

function htmlToText(html) {
	const div = document.createElement('div');
	div.textContent = html; // 自动转义 HTML 标签
	return div.innerHTML; // 返回转义后的文本
}

function countdown_stop() {
	if (theCountDownIntervalId != null) {
		clearInterval(theCountDownIntervalId);
		theCountDownIntervalId = null;
	}
}


function countdown_start() {
	if (theSettings.license_using_billing == 0)
		return false;

	if (!is_logined())
		return false;

	countdown_stop();
	theCountDownIntervalId = setInterval(countdown, 1000);

	return true;
}

function unlock_all() {
	ICAFEMENU_CORE.callFun("UNLOCK 65535");
	ICAFEMENU_CORE.callFun("DISABLEBSOD");
}

function minimize() {
	ICAFEMENU_CORE.callFun("SETWINDOWSIZE -2*-2");
	theLastWindowSize = "-2*-2";
	ICAFEMENU_CORE.callFun("HIDEWINDOW");
}

function checkout_click() {
	if (thePCStatus.member_group_id != MEMBER_GROUP_POSTPAID)
		$('.myModalConfirmCheckout').modal('show');
}

var theLastAssistSent = 0;
function send_assist() {
	let mins = 5 - Math.floor((new Date() - theLastAssistSent )/60_000);
	if (mins <= 0) {
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

		ICAFEMENU_CORE.callFun('WSSSEND ' + JSON.stringify(cmd));
		toast(translate_string("Your assist request has been sent"));
	} else {
		toast(translate_string("Your request for assistance has been received. Please try again in "+ `${mins} minutes`));
	}
}

function open_url(url) {
	ICAFEMENU_CORE.callFun('RUN ' + url);
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
		$('.dropdown').mouseenter(function () {
			$(this).find('.dropdown-menu').show();
		});

		$('.dropdown').mouseleave(function () {
			$(this).find('.dropdown-menu').hide();
		});
	}, 100);
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

function setBodyStyle() {
}

function countdown() {
	if (thePCStatus.status_connect_time_left < 0) {
		// The end of the countdown does not mean the customer time is all used up, because the customer may have offers and balance.
		// send auto_checkout package to wss server, the wss server will send client_status package to me after switch to another offer or balance.
		var cmd = { action: 'auto_checkout', version: 2, type: 'request', from: 'client', target: 'wss-server', data: {} };
		console.log(JSON.stringify(cmd));
		ICAFEMENU_CORE.callFun('WSSSEND ' + JSON.stringify(cmd));
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
		if (theAvailableOffers.length > 0)
			theAvailableOffers[0].left_secs = thePCStatus.status_connect_time_duration;
	}

	for (var i = 0; i < theAvailableOffers.length; i++) {
		var percent = 0;
		if (theAvailableOffers[i].total_secs > 0)
			percent = Math.min(parseInt((theAvailableOffers[i].left_secs / theAvailableOffers[i].total_secs) * 100.0), 100);

		$('#available-' + theAvailableOffers[i].id + ' .progress-bar').css('width', percent + '%');
		$('#available-' + theAvailableOffers[i].id + ' .remaining').html(format_time(theAvailableOffers[i].left_secs));
	}

	if (((theSettings.alert_for_last_offer ?? 0) == 1 && theAvailableOffers.length == 3 && theAvailableOffers[1].in_using) || theAvailableOffers.length == 2) // total, last offer, balance
	{
		var hour = parseInt(theAvailableOffers[1].left_secs / 3600);
		var min = parseInt((theAvailableOffers[1].left_secs % 3600) / 60);
		for (var m = 1; m <= 5; m++) {
			if (hour > 0)
				break;
			if (theAvailableOffers[1].last_notify_mins <= m)
				break;
			if (min < m) {
				if (theAvailableOffers.length == 3)
					toast(translate_string('{0} offer will be expired in {1} minutes, auto switch to balance mode').replace('{0}', theAvailableOffers[1].name).replace('{1}', m), 'warning');
				else
					toast(translate_string("Your remaining time is less than {0} minutes").replace('{0}', m), 'warning');
				var license_lang = theSettings.license_lang ?? '';
				var supportedLangs = ['ar', 'es', 'mn', 'ru', 'tr_TR'];
				license_lang = supportedLangs.includes(license_lang) ? (license_lang + "/") : '';
				ICAFEMENU_CORE.callFun("PLAYSOUND customized/" + m + "min_left.wav " + license_lang + m + "min_left.wav");
				theAvailableOffers[1].last_notify_mins = m;
				break;
			}
		}
	}

	thePCStatus.status_connect_time_left -= 1;

	for (i = 0; i < theAvailableOffers.length; i++) {
		if (theAvailableOffers[i].time_type === 'total' || theAvailableOffers[i].in_using) {
			theAvailableOffers[i].left_secs -= 1;
		}
	}
}

function SmsClass() {
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
			success: (data) => {
				console.log(JSON.stringify(data));
				if (data.code == 200) {
					this.smsCountDown();
				} else {
					data.message ? sweetAlert('', translate_string(data.message), 'error') : sweetAlert('', translate_string('Fail in send!'), 'error');
					timer.prop('disabled', false);
				}
			},
			error(data) {
				console.log(JSON.stringify(data));
				data.message ? sweetAlert('', translate_string(data.message), 'error') : sweetAlert('', translate_string('Fail in send!'), 'error');
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
			data: { type: 'check_sms_code', phone_number: phone, member_sms_code: member_sms_code, cafe_id: theCafe.id },
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

function Video() {
	var that = this;

	this.stop = function () {
		$('#url-video').attr('src', '');
		$('.url-video').load();
		$('#youtube-video').attr('src', '');
		$('.youtube-video').load();
		return;
	}

	this.hide = function () {
		$('.url-video').hide();
		$('.youtube-video').hide();
	}

	this.play = function (source) {
		this.stop();
		this.hide();
		if (source.indexOf('youtube') != -1) {
			const urlParams = new URL(source);
			if (urlParams.searchParams) {
				if (urlParams.searchParams.has('v')) {
					$('#youtube-video').attr('src', "https://www.youtube.com/embed/" + urlParams.searchParams.get('v') +
						"?mute=1&modestbranding=1&autohide=1&showinfo=0&controls=0&autoplay=1&loop=1&playlist=" + urlParams.searchParams.get('v') + "&version=3");
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

function ui_init(translate = true) {
	if (translate)
		ICAFEMENU_CORE.translate_obj($('body'));
	$('label').bind('mouseenter', function (e) {
		var target = e.target;
		if (target.offsetWidth < target.scrollWidth && !$(target).attr('title') && !$(target).attr('data-original-title')) {
			$(target).attr('title', $(target).text());
			$(target).attr('data-toggle', 'tooltip');
			$(target).attr('data-placement', 'bottom');
			$('[data-toggle="tooltip"]').tooltip();
		}
	});
}

function run_protect(protection_settings) {
	if (protection_settings == null) {
		ICAFEMENU_CORE.callFun('RUNSCRIPT "{tools}\\protection\\cmd\\allow.bat"');
		ICAFEMENU_CORE.callFun('RUNSCRIPT "{tools}\\protection\\control_panel\\allow.bat"');
		ICAFEMENU_CORE.callFun('RUNSCRIPT "{tools}\\protection\\download_file\\allow.bat"');
		ICAFEMENU_CORE.callFun('RUNSCRIPT "{tools}\\protection\\power_button\\allow.bat"');
		//ICAFEMENU_CORE.callFun('RUNSCRIPT "{tools}\\protection\\regedit\\allow.bat"');
		ICAFEMENU_CORE.callFun('RUNSCRIPT "{tools}\\protection\\usb\\allow.bat"');
		ICAFEMENU_CORE.callFun('RUNSCRIPT "{tools}\\protection\\task_manager\\allow.bat"');
		return;
	}

	protection = JSON.parse(protection_settings);

	ICAFEMENU_CORE.callFun('RUNSCRIPT "{tools}\\protection\\cmd\\' + (protection.cmd ? 'deny.bat"' : 'allow.bat"'));
	ICAFEMENU_CORE.callFun('RUNSCRIPT "{tools}\\protection\\control_panel\\' + (protection.control_panel ? 'deny.bat"' : 'allow.bat"'));
	ICAFEMENU_CORE.callFun('RUNSCRIPT "{tools}\\protection\\download_file\\' + (protection.download_file ? 'deny.bat"' : 'allow.bat"'));
	ICAFEMENU_CORE.callFun('RUNSCRIPT "{tools}\\protection\\power_button\\' + (protection.power_button ? 'deny.bat"' : 'allow.bat"'));
	//ICAFEMENU_CORE.callFun('RUNSCRIPT "{tools}\\protection\\regedit\\' + (protection.regedit ? 'deny.bat"' : 'allow.bat"'));
	ICAFEMENU_CORE.callFun('RUNSCRIPT "{tools}\\protection\\usb\\' + (protection.usb ? 'deny.bat"' : 'allow.bat"'));
	ICAFEMENU_CORE.callFun('RUNSCRIPT "{tools}\\protection\\task_manager\\' + (protection.task_manager ? 'deny.bat"' : 'allow.bat"'));
}

function shutdown_click() {
	$(".myModalConfirmShutdown").modal(true);
}

function reboot_click() {
	$(".myModalConfirmReboot").modal(true);
}

function confirm_shutdown_submit() {
	ICAFEMENU_CORE.callFun('SHUTDOWN ONLY');
}

function confirm_reboot_submit() {
	ICAFEMENU_CORE.callFun('SHUTDOWN REBOOT');
}

function format_datetime(s) {
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

function copyToClipboard(id) {
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

function format_balance(balance) {
	var balance_realtime = formatNumber(parseFloat(balance));
	if (balance > 1000000)
		balance_realtime = formatNumber(parseFloat(balance / 1000000.0)) + "M";

	return balance_realtime;
}
// 获取接口地址:/cafe/xxxx/uri
function getCafeApiUrl(uri, type = 'cafe') {
	// 优先thePCStatus，因为有可能切换服务器
	console.log('api ' + uri);
	var license_server_code = thePCStatus.license_server_code ?? theSettings.license_info.license_server_code;
	if (type == 'auth') {
		return "https://" + license_server_code + ".icafecloud.com/api/v2/auth/" + uri;
	} else {
		return "https://" + license_server_code + ".icafecloud.com/api/v2/cafe/" + theCafe.id + "/" + uri;
	}
}

function unlock_pc() {
	if (is_logined()) {
		if (theSettings.license_show_client_mode == 'full screen') {
			ICAFEMENU_CORE.callFun("SETWINDOWSIZE -3*-3"); // no topmost
			theLastWindowSize = "-3*-3";
			ICAFEMENU_CORE.callFun("SETWINDOWTOPMOST 0");
		}

		if (typeof (theSettings.license_show_client_mode) == 'undefined' || theSettings.license_show_client_mode == 'maximized') {
			ICAFEMENU_CORE.callFun("SETWINDOWSIZE -2*-2");
			theLastWindowSize = "-2*-2";
		}

		if (theSettings.license_show_client_mode == 'minimized') {
			ICAFEMENU_CORE.callFun("SETWINDOWSIZE -2*-2");
			theLastWindowSize = "-2*-2";
			ICAFEMENU_CORE.callFun("HIDEWINDOW");
		}

		/*
			TASKMGR  = 0x01,	// disable task manager (Ctrl+Alt+Del)
			TASKKEYS = 0x02,	// disable task keys (Alt-TAB, etc)
			TASKBAR  = 0x04,	// disable task bar
			LOGOFF   = 0x08,	// disable task bar
			WINKEYS	 = 0x10,	// disable windows keys
		*/

		ICAFEMENU_CORE.callFun("UNLOCK 3"); // unlock alt+tab after login, user want to switch in game
		if (theSettings.license_show_client_mode != 'full screen')
			ICAFEMENU_CORE.callFun("UNLOCK 4"); // only enable taskbar
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

function getMemberInfo() {
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

function translate_string(eng)
{
	return ICAFEMENU_CORE.translate_string(eng)
}
