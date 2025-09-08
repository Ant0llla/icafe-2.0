

theSettings.allow_prepaid_checkout ??= 0;
theSettings.mini_qr_payment ??= 0;
theSettings.join_us ??= '';
theSettings.social_login ??= 0;
theSettings.allow_password_login_always ??= 0;
theSettings.game_rank_options_fortnite ??= 1;
theSettings.game_rank_options_pubg ??= 1
theSettings.game_rank_options_lol ??= 1;
theSettings.game_rank_options_dota2 ??= 1;
theSettings.game_rank_options_valorant ??= 1;
theSettings.game_rank_options_csgo ??= 1;
theSettings.game_rank_options_apex ??= 1;
theSettings.bonus_buy_offer ??= 0;
theSettings.use_bonus_first ??= 1;
theSettings.max_bonus_percentage ??= 100;

var thePCStatus = { member_account: ''};
var theLockScreenPassword = '';
var theWssLogined = false;
var theClientStatusInitialized = false; // when first wss connected, received client_status package from idc.
var theLastWindowSize = '';
var theMonitorTurnOffStartTime = 0;
var theIsHomeVersion = false;

// times
var theIdleMonitorTimerId = null;
var theIdleMiningTimerId = null;
var theCountDownIntervalId = null;
var theQueryRunGameIdsIntervalId = null;
var theMonitorTurnOffIntervalId = null;
var theAvailableOffers = [];
var theGameTrackerInterval = null;

var	theHome = new Home();
var	theTax = new Tax();
var	theShop = new Shop();
var	theGameList = new GameList();
var	theEvents = new Events();
var	theRank = new Rank();
var	theTopupLogin = new TopupLogin();
var	theMemberLogin = new MemberLogin();
var	theMemberRegister = new MemberRegister();
var	theForgotPassword = new ForgotPassword();
var	theAudioSettings = new AudioSettings();
var	theMouseSettings = new MouseSettings();

// avoid multiple submit


///////////////////////////////////// share functions  ////////////////////////////////////////////

///////////////////////////////////// form submit ////////////////////////////////////////////

///////////////////////////////////// element click events ////////////////////////////////////////////

///////////////////////////////////// message process ////////////////////////////////////////////
///////////////////////////////////// UI ////////////////////////////////////////////

// <lang> No permission </lang>
// <lang> Account not exists </lang>
// <lang> Wrong password </lang>
// <lang> Operation failure </lang>
// <lang> Invalid parameter </lang>
// <lang> The password was changed successfully. </lang>
// <lang> Invalid client </lang>
// <lang> Invalid parameter </lang>
// <lang> Update client information failed </lang>
// <lang> Invalid license </lang>
// <lang> Account already exists </lang>
// <lang> Free to play </lang>
// <lang> All Games </lang>
// <lang> Favorite </lang>
// <lang> Drink </lang>
// <lang> Food </lang>
var vueGlobal = PetiteVue.reactive({
	pageType: 'Home',
	showBottom: true,
	bodyStyle: [],
	menuButton: {
		logout: true,
		feedback: true,
		assist: true,
		changepassword: false,
		convertToMember: true,
	},
	showOrderList: false,
	license_server_code: '',
});

var vueOrderList = PetiteVue.reactive({
	items: [],
	paging_info: []
})

var order_filter_params = PetiteVue.reactive({
	search_text: '',
	sort_name: 'order_create_time',
	sort: 'desc',
	paging_info: {
		total_records: 0,
		pages: 1,
		page: 1,
		page_prev: 1,
		page_next: 1,
		page_start: 1,
		page_end: 1,
	}
})

var vueHome = PetiteVue.reactive({
	promotedItems: [],
	promotedActive: 0,
	leaderboardItems: null,
	leaderboardActive: 0,
	memberGroup: [],
	memberCurrentGroup: 0,
	memberPointValue: ""
});
var vueClasses = PetiteVue.reactive({
	items: []
});
var vueGames = PetiteVue.reactive({
	items:[],
	topFiveItems: [],
	type: 'all',
	active_class: '',
	status_pc_token: ''
});
var vueEventBanner = PetiteVue.reactive({
	event:[]
});
var vueEventsMy = PetiteVue.reactive({
	events:[]
});
var vueEventsActive = PetiteVue.reactive({
		events:[]
});
var vueEventsDetail = PetiteVue.reactive({
	events:[]
});
var vueEventButtons = PetiteVue.reactive({
	event:[]
});
var vueEventDetail = PetiteVue.reactive({
	event:[],
	members: []
});
var vueProductGroupList = PetiteVue.reactive({
	items:[],
	dropdownProductGroupList: [],
	current_group_id: -3,
});
var vueProducts = PetiteVue.reactive({
	items:[]
});
var vueOrderItems = PetiteVue.reactive({
	items:[],
	total_cost: 0,
	total_tax: 0,
	total_discount: 0,
	total_amount: 0,
	max_bonuses: 0,
	payable_balance: 0,
	product_count: 0,
	payment_method: -1,
	member_group_discount_rate: 0,
	member_group_discount_offer: 0,
	member_group_id: 0
});
var vueGiftOrders = PetiteVue.reactive({
	items:[],
	total_amount: 0
});
var vueAvailableOffers = PetiteVue.reactive({
	items:[]
});
var vueCafeNews = PetiteVue.reactive({
	items:[]
});
var memberInfo = PetiteVue.reactive({
	member_name: '',
	member_info_name: '',
	member_balance_realtime: '',
	member_balance: 0,
	member_balance_bonus_realtime: '',
	member_balance_bonus: 0,
	member_coin_balance: '',
	postpaid_pc_name: '',
	price_per_hour: '',
	canChangePassword: true,
});

var vueRank = PetiteVue.reactive({
	items: {},
	active_game: "",
});
getEnabledGames().forEach(game => {
	// 跳过custom游戏
	if (game.key == 'custom') {
		return;
	} 
	vueRank.items[game.key] = [];
});

var vueBalanceHistory = PetiteVue.reactive({
	items: [],
	paging_info: [],
	summary: {
		topup: 0,
		spend: 0
	},
})

var balanceHistoryFilterParams = PetiteVue.reactive({
	paging_info: {
		total_records: 0,
		pages: 1,
		page: 1,
		page_prev: 1,
		page_next: 1,
		page_start: 1,
		page_end: 1,
	}
})

$(document).ready(main);

function main()
{
	if(typeof(theSettings.client_themes_front_color) != 'undefined')
	{
		document.documentElement.style.setProperty('--client_themes_front_color', theSettings.client_themes_front_color);
		document.documentElement.style.setProperty('--client_themes_front_color_90', theSettings.client_themes_front_color + 'e6');
		document.documentElement.style.setProperty('--client_themes_front_color_75', theSettings.client_themes_front_color + 'c0');
		document.documentElement.style.setProperty('--client_themes_back_color', theSettings.client_themes_back_color);
		document.documentElement.style.setProperty('--client_themes_back_color_90', theSettings.client_themes_back_color + 'e6');
		document.documentElement.style.setProperty('--client_themes_back_color_75', theSettings.client_themes_back_color + 'c0');
	}
	
	// setting the required prop for each required field
	if(typeof(theSettings.member_settings) != 'undefined')
	{
		var member_settings = JSON.parse(theSettings.member_settings);

		$('#form-convert-member input[name=account], #form-register-member input[name=account]').prop('required', member_settings.member_account == 1);
		$('#form-convert-member input[name=first_name], #form-register-member input[name=first_name]').prop('required', member_settings.member_first_name == 1);
		$('#form-convert-member input[name=last_name], #form-register-member input[name=last_name]').prop('required', member_settings.member_last_name == 1);
		$('#form-convert-member input[name=password], #form-register-member input[name=password]').prop('required', member_settings.member_password == 1);
		$('#form-convert-member input[name=confirm_password], #form-register-member input[name=confirm_password]').prop('required', member_settings.member_password == 1);
		$('#form-convert-member input[name=member_expire_time_local], #form-register-member input[name=member_expire_time_local]').prop('required', member_settings.member_expire_time_local == 1);
		$('#form-convert-member input[name=birthday], #form-register-member input[name=birthday]').prop('required', member_settings.member_birthday == 1);
		$('#form-convert-member input[name=phone], #form-register-member input[name=phone]').prop('required', member_settings.member_phone == 1);
		$('#form-convert-member input[name=email], #form-register-member input[name=email]').prop('required', member_settings.member_email == 1);

		$('#form-convert-member, #form-register-member').find('input').each(function () {
			if($(this).prop('required')){
				$(this).parents().children('label').addClass('required');
			}
		});
	}

	$('#localTime').html(localTime());
	setInterval(function() {
		$('#localTime').html(localTime());
	},1000*60);

	PetiteVue.createApp({
		mounted() {
			theSettings.allow_topup_at_client ??= 0;
			ICAFEMENU_CORE.translate_obj($('body'));
			$('[data-toggle="tooltip"]').tooltip();
			/*// Initialising the canvas
			$('#page_games').css({'background-image': 'none'});
			var canvas = document.querySelector('canvas'),
			ctx = canvas.getContext('2d');

			// Setting the width and height of the canvas
			canvas.width = width = window.innerWidth;
			canvas.height = height = window.innerHeight;

			// Setting up the letters
			var letters = 'ABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZ';
			letters = letters.split('');

			// Setting up the columns
			var fontSize = 10,
				columns = width / fontSize;

			// Setting up the drops
			var drops = [];
			for (var i = 0; i < columns; i++) {
			  drops[i] = 1;
			}

			// Setting up the draw function
			function draw() {
			  ctx.fillStyle = 'rgba(0, 0, 0, .1)';
			  ctx.fillRect(0, 0, width, height);
			  for (var i = 0; i < drops.length; i++) {
				var text = letters[Math.floor(Math.random() * letters.length)];
				ctx.fillStyle = '#0f0';
				ctx.fillText(text, i * fontSize, drops[i] * fontSize);
				drops[i]++;
				if (drops[i] * fontSize > height && Math.random() > .95) {
				  drops[i] = 0;
				}
			  }
			}

			// Loop the animation
			setInterval(draw, 100);*/
		}
	}).mount('body')

	// debug for tooltip
	//$('body').tooltip({selector: "[data-toggle='tooltip']", trigger: "click"});

	theIsHomeVersion = ((theSettings.enable_icafesports ?? 0) == 1);
	if (!theIsHomeVersion) {
		$('.home-only').hide();
		$('.normal-only').show();
	}
	if (theIsHomeVersion) {
		$('.normal-only').hide();
		$('.home-only').show();

		if (typeof(theCafe) == 'undefined' || typeof(theSettings) == 'undefined') {
			$('#page_login .formDiv').hide();
			$('#page_login .homecafeidDiv').show();
			$('#page_games').removeClass('d-flex').hide();
			$('#page_login').removeClass('d-none').show();
			return;
		}
	}

	try
	{
		run_protect(theSettings.protection_settings ?? null);
		CallFunction("NOOP");
	}
	catch(e)
	{
		// for dev debug in chrome
		CallFunction = function(cmd)
		{
		}

		show_login_page('login');

		thePCStatus = {'member_account': 'test', 'member_group_id': 9,'member_balance_realtime': 888, member_balance_bonus_realtime: 777, 
			member_coin_balance: 666, 'member_group_name': 'testGroup', 'available_offers': [{product_name: 'testOffer', product_seconds: 1000, 
			member_offer_left_seconds: 1000}], 'member_balance_bonus_left_seconds': 1000, 'member_points': 201, 'member_oauth_platform': 'account'};
		memberInfo.member_info_name = thePCStatus.member_account.toUpperCase() + " / " + thePCStatus.member_group_name.toUpperCase();
		memberInfo.member_name = thePCStatus.member_account.toUpperCase();
		thePCInfo.pc_name = 'Test';

		theHome.show();

		$('.cafe_info_member_logo').attr('src', ICAFEMENU_CORE.icons_path('mg-'+(thePCStatus.member_group_id > MEMBER_GROUP_DEFAULT ? thePCStatus.member_group_id.toString() : '0') + '.png'));
	
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
		
		$('#carousel_main').carousel({ interval: false });

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
		}
		
		vueHome.leaderboardItems = JSON.parse(JSON.stringify(
			{
				"last_month": [{
					"track_member_id": 4342284,
					"track_member_account": "aliitawi",
					"track_game_coins": "5723",
					"track_wins": "57",
					"rank": 1,
					"previous_rank": 1
				}, {
					"track_member_id": 312065975726,
					"track_member_account": "hael",
					"track_game_coins": "4516.6",
					"track_wins": "38",
					"rank": 2,
					"previous_rank": 2
				}, {
					"track_member_id": 4342324,
					"track_member_account": "ramitaiba",
					"track_game_coins": "1118",
					"track_wins": "13",
					"rank": 3,
					"previous_rank": 5
				}, {
					"track_member_id": 312067632456,
					"track_member_account": "nabil558",
					"track_game_coins": "1093",
					"track_wins": "1",
					"rank": 4,
					"previous_rank": 0
				}, {
					"track_member_id": 3408164,
					"track_member_account": "karimkayal",
					"track_game_coins": "821",
					"track_wins": "11",
					"rank": 5,
					"previous_rank": 3
				}, {
					"track_member_id": 3063546152,
					"track_member_account": "hoblos",
					"track_game_coins": "648.5",
					"track_wins": "8",
					"rank": 6,
					"previous_rank": 0
				}],
				"current_month": [{
					"track_member_id": 312065975726,
					"track_member_account": "haelxxxxxxxxxxxxxxxxxxxx",
					"track_game_coins": "530",
					"track_wins": "4",
					"rank": 1,
					"previous_rank": 2
				}, {
					"track_member_id": 312067632966,
					"track_member_account": "ME",
					"track_game_coins": "132.5",
					"track_wins": "1",
					"rank": 2,
					"previous_rank": 0
				}, {
					"track_member_id": 312066792082,
					"track_member_account": "najib1",
					"track_game_coins": "88.5",
					"track_wins": "1",
					"rank": 3,
					"previous_rank": 0
				}, {
					"track_member_id": 312067632968,
					"track_member_account": "os88",
					"track_game_coins": "80.5",
					"track_wins": "1",
					"rank": 4,
					"previous_rank": 0
				}, {
					"track_member_id": 5154524,
					"track_member_account": "rakana",
					"track_game_coins": "54",
					"track_wins": "1",
					"rank": 5,
					"previous_rank": 0
				}, {
					"track_member_id": 312061500211,
					"track_member_account": "fouad1234",
					"track_game_coins": "42.5",
					"track_wins": "0",
					"rank": 6,
					"previous_rank": 0
				}]
			}
		));
		
		// promoted products
		theShop.change_group(-4);
		
		//event-list
		theEvents.events = 
			[{
				"event_id": "d94eddf1-765c-11ed-aaf5-f23c93e24cac",
				"event_icafe_id": 18875,
				"event_name": "AAA",
				"event_description": "How to join?\r\nClick the join icon, enter your email address and Telegram username, and then click the Join button. In the pop-up browser, follow the prompts to join our Telegram group (name: iCafeCloud Events). If you have already joined, you can skip this step.\r\n\r\nWhy do I have to join the Telegram group?\r\nYou may encounter the following question: Why don\u2019t I have points when I play the game? How are points calculated? What is the daily ranking change? What's new event? When does it begin? How to collect bonus? Can I organize a competition by myself? You can talk to us directly in the Telegram group.\r\n\r\nWhich games does this Event support?\r\nFortnite\r\nLeague of Legends\r\nDota 2\r\nValorant\r\nAfter you join, you can play any game during the one-month competition period. Each game of yours will be counted as points. The more you play, the higher the points, and there are no restrictions.\r\n\r\nHow to calculate points?\r\nFortnite\u2019s integral calculation formula is:\r\nKills x 3\r\nTop 1 = +9 points\r\n\r\nThe formula for calculating League of Legends points is:\r\nWins x 3\r\nKills x 2\r\nAssists x 1.5\r\nDeaths x -0.5\r\nLOL mode x 1.5\r\nTFT mode x 1.25\r\nKills from 11 to 999 = +2 points\r\nAssists from 11 to 9999 = +2 points\r\n\r\nDota2\u2019s integral calculation formula is:\r\nKills x 2\r\nAssists x 1.5\r\nDeaths x -0.5\r\nLastHits x 0.01\r\nKills from 11 to 999 = +10 points\r\nAssists from 11 to 999 = +10 points\r\n\r\nValorant's integral calculation formula is:\r\nAssists x 0.5\r\nKills x 2\r\nWin = +20 points\r\n\r\nBecause each game has a different difficulty in obtaining points, for the sake of fairness, according to big data analysis, the points of each game should be multiplied by the weight value to calculate the total score, specifically: Fornite weight value is 1, League of Legends is 0.06 , Dota2 is 0.065, Valorant is 0.177.\r\n\r\nHow to win the game?\r\nPlay as many games as possible. We don't have any restrictions. The more you play, the higher the points. In order to increase your participation, we take the top 50 as the winners and all can get bonuses.\r\n\r\nHow to get bonus?\r\nFor convenience, our bonus pool is the data currency DOGE. Please abide by the laws and regulations of your country. If it is not allowed, please do not join our competition. After the competition is over, we will distribute bonuses based on the points of the top 50 players. We will notify the winners one by one in the Telegram group and communicate the payment of funds.\r\n\r\nHave fun and Good luck !!\r\n\r\nJoin our gaming community at telegram\r\nhttps:\/\/www.icafecloud.com\/telegram\/",
				"event_game_code": "dota2",
				"event_game_mode": "",
				"event_start_time_utc": "2022-12-06 16:00:00",
				"event_end_time_utc": "2025-09-08 04:00:00",
				"event_score_type": "all",
				"event_top_winners": 3,
				"event_top_matches": 1000,
				"event_bonus_amount": "200.00",
				"event_bonus_currency": "DOGE",
				"event_ticket_price": "0.00",
				"event_is_global": 0,
				"event_update_time": "2023-05-02 20:30:47",
				"event_start_time_local": "2022-12-07 00:00:00",
				"event_end_time_local": "2025-09-08 12:00:00",
				"event_in_banner": 1,
				"event_play_command": "{steam-path}\\steam.exe -silent -noverifyfiles -applaunch 570",
				"emember_id": "05ba2bf1-765d-11ed-aaf5-f23c93e24cac",
				"emember_event_id": "d94eddf1-765c-11ed-aaf5-f23c93e24cac",
				"emember_icafe_id": 18875,
				"emember_member_account": "test",
				"emember_email": "",
				"emember_matches": 0,
				"emember_point_matches": 0,
				"emember_point": 0,
				"emember_wins": 0,
				"emember_kills": 0,
				"emember_assists": 0,
				"emember_deaths": 0,
				"emember_lasthits": 0,
				"emember_game_track_id": 0,
				"emember_ticket_amount": "0.00",
				"emember_bonus": "0.00",
				"emember_bonus_coin_address": "",
				"emember_bonus_pay_status": 0,
				"emember_bonus_trade_id": "",
				"emember_create_time_utc": "2022-12-07 18:29:01",
				"emember_rank_score": 0,
				"emember_status": 1,
				"emember_telegram_username": "",
				"emember_rank": 1,
				"emember_count": 2
			},{
				"event_id": "d94eddf1-765c-11ed-aaf5-f23c93e24cad",
				"event_icafe_id": 18875,
				"event_name": "CCC",
				"event_description": "How to join?\r\nClick the join icon, enter your email address and Telegram username, and then click the Join button. In the pop-up browser, follow the prompts to join our Telegram group (name: iCafeCloud Events). If you have already joined, you can skip this step.\r\n\r\nWhy do I have to join the Telegram group?\r\nYou may encounter the following question: Why don\u2019t I have points when I play the game? How are points calculated? What is the daily ranking change? What's new event? When does it begin? How to collect bonus? Can I organize a competition by myself? You can talk to us directly in the Telegram group.\r\n\r\nWhich games does this Event support?\r\nFortnite\r\nLeague of Legends\r\nDota 2\r\nValorant\r\nAfter you join, you can play any game during the one-month competition period. Each game of yours will be counted as points. The more you play, the higher the points, and there are no restrictions.\r\n\r\nHow to calculate points?\r\nFortnite\u2019s integral calculation formula is:\r\nKills x 3\r\nTop 1 = +9 points\r\n\r\nThe formula for calculating League of Legends points is:\r\nWins x 3\r\nKills x 2\r\nAssists x 1.5\r\nDeaths x -0.5\r\nLOL mode x 1.5\r\nTFT mode x 1.25\r\nKills from 11 to 999 = +2 points\r\nAssists from 11 to 9999 = +2 points\r\n\r\nDota2\u2019s integral calculation formula is:\r\nKills x 2\r\nAssists x 1.5\r\nDeaths x -0.5\r\nLastHits x 0.01\r\nKills from 11 to 999 = +10 points\r\nAssists from 11 to 999 = +10 points\r\n\r\nValorant's integral calculation formula is:\r\nAssists x 0.5\r\nKills x 2\r\nWin = +20 points\r\n\r\nBecause each game has a different difficulty in obtaining points, for the sake of fairness, according to big data analysis, the points of each game should be multiplied by the weight value to calculate the total score, specifically: Fornite weight value is 1, League of Legends is 0.06 , Dota2 is 0.065, Valorant is 0.177.\r\n\r\nHow to win the game?\r\nPlay as many games as possible. We don't have any restrictions. The more you play, the higher the points. In order to increase your participation, we take the top 50 as the winners and all can get bonuses.\r\n\r\nHow to get bonus?\r\nFor convenience, our bonus pool is the data currency DOGE. Please abide by the laws and regulations of your country. If it is not allowed, please do not join our competition. After the competition is over, we will distribute bonuses based on the points of the top 50 players. We will notify the winners one by one in the Telegram group and communicate the payment of funds.\r\n\r\nHave fun and Good luck !!\r\n\r\nJoin our gaming community at telegram\r\nhttps:\/\/www.icafecloud.com\/telegram\/",
				"event_game_code": "dota2",
				"event_game_mode": "",
				"event_start_time_utc": "2022-12-06 16:00:00",
				"event_end_time_utc": "2022-12-08 04:00:00",
				
				"event_ticket_price": "0.00",
				"event_is_global": 0,
				"event_update_time": "2023-05-02 20:30:47",
				"event_start_time_local": "2022-12-07 00:00:00",
				"event_end_time_local": "2022-12-08 12:00:00",
				"event_in_banner": 1,
				"event_play_command": "{steam-path}\\steam.exe -silent -noverifyfiles -applaunch 570",
				"emember_id": "05ba2bf1-765d-11ed-aaf5-f23c93e24cad",
				"emember_event_id": "d94eddf1-765c-11ed-aaf5-f23c93e24cad",
				"emember_icafe_id": 18875,
				"emember_member_account": "test",
				"emember_email": "",
				"emember_matches": 0,
				"emember_point_matches": 0,
				"emember_point": 0,
				"emember_wins": 0,
				"emember_kills": 0,
				"emember_assists": 0,
				"emember_deaths": 0,
				"emember_lasthits": 0,
				"emember_game_track_id": 0,
				"emember_ticket_amount": "0.00",
				"emember_bonus": "0.00",
				"emember_bonus_coin_address": "",
				"emember_bonus_pay_status": 0,
				"emember_bonus_trade_id": "",
				"emember_create_time_utc": "2022-12-07 18:29:01",
				"emember_rank_score": 0,
				"emember_status": 1,
				"emember_telegram_username": "",
				"emember_rank": 1,
				"emember_count": 2
			}, {
				"event_id": "d94eddf1-765c-11ed-aaf5-f23c93e24caa",
				"event_icafe_id": 18875,
				"event_name": "BBB",
				"event_description": "How to join?\r\nClick the join icon, enter your email address and Telegram username, and then click the Join button. In the pop-up browser, follow the prompts to join our Telegram group (name: iCafeCloud Events). If you have already joined, you can skip this step.\r\n\r\nWhy do I have to join the Telegram group?\r\nYou may encounter the following question: Why don\u2019t I have points when I play the game? How are points calculated? What is the daily ranking change? What's new event? When does it begin? How to collect bonus? Can I organize a competition by myself? You can talk to us directly in the Telegram group.\r\n\r\nWhich games does this Event support?\r\nFortnite\r\nLeague of Legends\r\nDota 2\r\nValorant\r\nAfter you join, you can play any game during the one-month competition period. Each game of yours will be counted as points. The more you play, the higher the points, and there are no restrictions.\r\n\r\nHow to calculate points?\r\nFortnite\u2019s integral calculation formula is:\r\nKills x 3\r\nTop 1 = +9 points\r\n\r\nThe formula for calculating League of Legends points is:\r\nWins x 3\r\nKills x 2\r\nAssists x 1.5\r\nDeaths x -0.5\r\nLOL mode x 1.5\r\nTFT mode x 1.25\r\nKills from 11 to 999 = +2 points\r\nAssists from 11 to 9999 = +2 points\r\n\r\nDota2\u2019s integral calculation formula is:\r\nKills x 2\r\nAssists x 1.5\r\nDeaths x -0.5\r\nLastHits x 0.01\r\nKills from 11 to 999 = +10 points\r\nAssists from 11 to 999 = +10 points\r\n\r\nValorant's integral calculation formula is:\r\nAssists x 0.5\r\nKills x 2\r\nWin = +20 points\r\n\r\nBecause each game has a different difficulty in obtaining points, for the sake of fairness, according to big data analysis, the points of each game should be multiplied by the weight value to calculate the total score, specifically: Fornite weight value is 1, League of Legends is 0.06 , Dota2 is 0.065, Valorant is 0.177.\r\n\r\nHow to win the game?\r\nPlay as many games as possible. We don't have any restrictions. The more you play, the higher the points. In order to increase your participation, we take the top 50 as the winners and all can get bonuses.\r\n\r\nHow to get bonus?\r\nFor convenience, our bonus pool is the data currency DOGE. Please abide by the laws and regulations of your country. If it is not allowed, please do not join our competition. After the competition is over, we will distribute bonuses based on the points of the top 50 players. We will notify the winners one by one in the Telegram group and communicate the payment of funds.\r\n\r\nHave fun and Good luck !!\r\n\r\nJoin our gaming community at telegram\r\nhttps:\/\/www.icafecloud.com\/telegram\/",
				"event_game_code": "dota2",
				"event_game_mode": "",
				"event_start_time_utc": "2022-12-06 16:00:00",
				"event_end_time_utc": "2025-09-08 04:00:00",
				"event_score_type": "all",
				"event_top_winners": 3,
				"event_top_matches": 1000,
				"event_bonus_amount": "200.00",
				"event_bonus_currency": "DOGE",
				"event_ticket_price": "0.00",
				"event_is_global": 0,
				"event_update_time": "2023-05-02 20:30:47",
				"event_start_time_local": "2022-12-07 00:00:00",
				"event_end_time_local": "2025-09-08 12:00:00",
				"event_in_banner": 1,
				"event_play_command": "{steam-path}\\steam.exe -silent -noverifyfiles -applaunch 570",
				"event_status": 'active'
			}];
		theEvents.build_event_list_html();
		//event-detail
		var eventData = 
			{
				"event_id": "d94eddf1-765c-11ed-aaf5-f23c93e24cac",
				"event_icafe_id": 18875,
				"event_name": "AAA",
				"event_description": "How to join?\r\nClick the join icon, enter your email address and Telegram username, and then click the Join button. In the pop-up browser, follow the prompts to join our Telegram group (name: iCafeCloud Events). If you have already joined, you can skip this step.\r\n\r\nWhy do I have to join the Telegram group?\r\nYou may encounter the following question: Why don\u2019t I have points when I play the game? How are points calculated? What is the daily ranking change? What's new event? When does it begin? How to collect bonus? Can I organize a competition by myself? You can talk to us directly in the Telegram group.\r\n\r\nWhich games does this Event support?\r\nFortnite\r\nLeague of Legends\r\nDota 2\r\nValorant\r\nAfter you join, you can play any game during the one-month competition period. Each game of yours will be counted as points. The more you play, the higher the points, and there are no restrictions.\r\n\r\nHow to calculate points?\r\nFortnite\u2019s integral calculation formula is:\r\nKills x 3\r\nTop 1 = +9 points\r\n\r\nThe formula for calculating League of Legends points is:\r\nWins x 3\r\nKills x 2\r\nAssists x 1.5\r\nDeaths x -0.5\r\nLOL mode x 1.5\r\nTFT mode x 1.25\r\nKills from 11 to 999 = +2 points\r\nAssists from 11 to 9999 = +2 points\r\n\r\nDota2\u2019s integral calculation formula is:\r\nKills x 2\r\nAssists x 1.5\r\nDeaths x -0.5\r\nLastHits x 0.01\r\nKills from 11 to 999 = +10 points\r\nAssists from 11 to 999 = +10 points\r\n\r\nValorant's integral calculation formula is:\r\nAssists x 0.5\r\nKills x 2\r\nWin = +20 points\r\n\r\nBecause each game has a different difficulty in obtaining points, for the sake of fairness, according to big data analysis, the points of each game should be multiplied by the weight value to calculate the total score, specifically: Fornite weight value is 1, League of Legends is 0.06 , Dota2 is 0.065, Valorant is 0.177.\r\n\r\nHow to win the game?\r\nPlay as many games as possible. We don't have any restrictions. The more you play, the higher the points. In order to increase your participation, we take the top 50 as the winners and all can get bonuses.\r\n\r\nHow to get bonus?\r\nFor convenience, our bonus pool is the data currency DOGE. Please abide by the laws and regulations of your country. If it is not allowed, please do not join our competition. After the competition is over, we will distribute bonuses based on the points of the top 50 players. We will notify the winners one by one in the Telegram group and communicate the payment of funds.\r\n\r\nHave fun and Good luck !!\r\n\r\nJoin our gaming community at telegram\r\nhttps:\/\/www.icafecloud.com\/telegram\/",
				"event_game_code": "dota2",
				"event_game_mode": "",
				"event_start_time_utc": "2022-12-06 16:00:00",
				"event_end_time_utc": "2025-09-08 04:00:00",
				"event_score_type": "all",
				"event_top_winners": 3,
				"event_top_matches": 1000,
				"event_bonus_amount": "200.00",
				"event_bonus_currency": "DOGE",
				"event_ticket_price": "0.00",
				"event_is_global": 0,
				"event_update_time": "2023-05-02 20:30:47",
				"event_start_time_local": "2022-12-07 00:00:00",
				"event_end_time_local": "2025-09-08 12:00:00",
				"event_in_banner": 1,
				"event_play_command": "{steam-path}\\steam.exe -silent -noverifyfiles -applaunch 570",
				"emember_id": "05ba2bf1-765d-11ed-aaf5-f23c93e24cac",
				"emember_event_id": "d94eddf1-765c-11ed-aaf5-f23c93e24cac",
				"emember_icafe_id": 18875,
				"emember_member_account": "test",
				"emember_email": "",
				"emember_matches": 0,
				"emember_point_matches": 0,
				"emember_point": 0,
				"emember_wins": 0,
				"emember_kills": 0,
				"emember_assists": 0,
				"emember_deaths": 0,
				"emember_lasthits": 0,
				"emember_game_track_id": 0,
				"emember_ticket_amount": "0.00",
				"emember_bonus": "0.00",
				"emember_bonus_coin_address": "",
				"emember_bonus_pay_status": 0,
				"emember_bonus_trade_id": "",
				"emember_create_time_utc": "2022-12-07 18:29:01",
				"emember_rank_score": 0,
				"emember_status": 1,
				"emember_telegram_username": "",
				"emember_rank": 1,
				"emember_count": 2,
				"members": [{
					"emember_id": "18c1ceba-d6e8-11ed-b1de-f23c93e24cac",
					"emember_event_id": "d94eddf1-765c-11ed-aaf5-f23c93e24cac",
					"emember_icafe_id": 18875,
					"emember_member_account": "bin",
					"emember_email": "",
					"emember_matches": 0,
					"emember_point_matches": 0,
					"emember_point": 0,
					"emember_wins": 0,
					"emember_kills": 0,
					"emember_assists": 0,
					"emember_deaths": 0,
					"emember_lasthits": 0,
					"emember_game_track_id": 0,
					"emember_ticket_amount": "0.00",
					"emember_bonus": "0.00",
					"emember_bonus_coin_address": "",
					"emember_bonus_pay_status": 0,
					"emember_bonus_trade_id": "",
					"emember_create_time_utc": "2023-04-09 15:06:25",
					"emember_rank_score": 0,
					"emember_status": 1,
					"emember_telegram_username": "",
					"emember_rank": 1
				}, {
					"emember_id": "05ba2bf1-765d-11ed-aaf5-f23c93e24cac",
					"emember_event_id": "d94eddf1-765c-11ed-aaf5-f23c93e24cac",
					"emember_icafe_id": 18875,
					"emember_member_account": "test",
					"emember_email": "",
					"emember_matches": 0,
					"emember_point_matches": 0,
					"emember_point": 0,
					"emember_wins": 0,
					"emember_kills": 0,
					"emember_assists": 0,
					"emember_deaths": 0,
					"emember_lasthits": 0,
					"emember_game_track_id": 0,
					"emember_ticket_amount": "0.00",
					"emember_bonus": "0.00",
					"emember_bonus_coin_address": "",
					"emember_bonus_pay_status": 0,
					"emember_bonus_trade_id": "",
					"emember_create_time_utc": "2022-12-07 18:29:01",
					"emember_rank_score": 0,
					"emember_status": 1,
					"emember_telegram_username": "",
					"emember_rank": 2
				}]
			};
		for (var i=0; i<theEvents.events.length; i++) {
			if (theEvents.events[i].event_id == eventData.event_id) {
				theEvents.events[i] = eventData;

				theEvents.events[i].event_status = 'active';
				if (moment(theEvents.events[i].event_end_time_local).isBefore())
					theEvents.events[i].event_status = 'past';
				if (moment(theEvents.events[i].event_start_time_local).isAfter())
					theEvents.events[i].event_status = 'upcoming';

				theEvents.gamecode2names.forEach(function(game) {
					if (theEvents.events[i].event_game_code == game.code) {
						theEvents.events[i].game_name = game.name;
					}
				});

				// If current member record need push to members end
				if (theEvents.events[i].members.length > 0 && theEvents.events[i].emember_id && theEvents.events[i].emember_rank > theEvents.events[i].members[theEvents.events[i].members.length-1].emember_rank) {
					theEvents.events[i].members.push({
						emember_id: theEvents.events[i].emember_id,
						emember_member_account: theEvents.events[i].emember_member_account,
						emember_rank: theEvents.events[i].emember_rank,
						emember_matches: theEvents.events[i].emember_matches,
						emember_point_matches: theEvents.events[i].emember_point_matches,
						emember_bonus: theEvents.events[i].emember_bonus,
						emember_point: theEvents.events[i].emember_point,
						emember_wins: theEvents.events[i].emember_wins,
						emember_kills: theEvents.events[i].emember_kills,
						emember_assists: theEvents.events[i].emember_assists,
						emember_deaths: theEvents.events[i].emember_deaths,
						emember_lasthits: theEvents.events[i].emember_lasthits,
						license_country: theEvents.events[i].license_country,
						license_icafename: theEvents.events[i].license_icafename
					});
				}
				break;
			}
		}

		theEvents.build_event_list_html();
		theEvents.build_event_detail_html(eventData.event_id);
		
		PetiteVue.nextTick(() => {
			ui_init();
			$('[data-toggle="tooltip"]').tooltip();
		});
		return;
	}

	show_login_page('login');

	if (theIsHomeVersion) {
		unlock_all();
		CallFunction("SETWINDOWSIZE -2*-2");
		theLastWindowSize = "-2*-2";
	}

	CallFunction("WSSSTART");
}

$(window).bind("load resize", function() {
	setBodyStyle();
	// for dual monitor
	if(window.innerWidth > screen.width){
		$("#page_login").css("width", "50%");
		$("#page_lock section").css("width", "50%");
		$(".myModalRegisterMember").css("width", "50%");
	}
	if(window.innerHeight > screen.height){
		$("#page_login").css("height", "50%");
		$("#page_lock section").css("height", "50%");
		$(".myModalRegisterMember").css("height", "50%");
	}

	if (is_logined() && $('#games .games-container').is(":visible"))
		theGameList.load_games_by_class(theGameList.filter_params.type, theGameList.filter_params.class, theGameList.filter_params.search);
});


$(document).keydown(function (event)
{
	theMonitorTurnOffStartTime = new Date();

	if (!is_logined()) {
		if (event.keyCode == 27)
			show_login_page('admin_exit');
		return;
	}

	if (is_locked())
		return;

	// logined and not locking
	// X = 88, B = 66, F = 70, F1 = 112
	if (event.ctrlKey && event.keyCode == 112)
		send_assist();

	if (event.ctrlKey && event.keyCode == 70)
		$('input#search-bar').focus();

	if (event.ctrlKey && event.keyCode == 88)
		checkout_click();

	if (event.ctrlKey && event.keyCode == 66)
		theShop.show();

	if (theSettings == null || typeof(theSettings.license_show_client_mode) == 'undefined' || theSettings.license_show_client_mode != 'full screen') {
		if (event.ctrlKey && event.keyCode == 'M'.charCodeAt(0))
			CallFunction('HIDEWINDOW');
	}
});

$(document).mousedown(function(event) {
	if (!is_logined())
		theMonitorTurnOffStartTime = new Date();
	return true;
});

const SmsClassFun = new SmsClass();

var theConvertToMember = new ConvertToMember();

var theVideo = new Video();

var thePCInfo = {
	"pc_name" : "",
	"pc_turn_off_monitor_seconds" : 0,
	"version_date": ""
}

function set_monitor_turn_off_timeout(seconds)
{
	if (theMonitorTurnOffIntervalId != null) 
	{
		clearInterval(theMonitorTurnOffIntervalId);
		theMonitorTurnOffIntervalId = null;
	}

	if(seconds == 0)
		return;
	
	theMonitorTurnOffStartTime = new Date();
	theMonitorTurnOffIntervalId = setInterval(function() {

		if (new Date() - theMonitorTurnOffStartTime < seconds * 1000)
			return;

		theMonitorTurnOffStartTime = new Date();
		theMonitorTurnOffStartTime.setFullYear(2050,1,1);
		CallFunction("MONITOR OFF");

	}, 10000);
}

// https://github.com/vuejs/vue/issues/1963
// rebuildData plugin for jquery.data()
(function () {
	$.fn.extend({

	/**
	 *   jQuery.data() liefert ein falsches Ergebnis in Verbindung mit VueJS:
	 *   Werden Elemente dynamisch im DOM verändert, referenziert der jQuery.data()-Cache
	 *   evtl. auf Elemente, die ersetzt wurden. 
	 * 
	 *   Wurde ein [data-]-Attribut einmal über jQuery.fn.data() eingelesen,
	 *   liefert jQuery immer den gecachten Wert – auch wenn sich das Tag-Attribut
	 *   verändert hat, z.B. data-poi-uid="10" in data-poi-uid="33" geändert wurde.
	 */
		'rebuildData': function () {
			return this.each(function () {
				$(this).add($(this).find('*')).each(function () {
					var i, name, data, elem = this,
					attrs = elem && elem.attributes;

					if (elem.nodeType === 1) {
						i = attrs.length;
						var obj = {};
						while (i--) {
							if (attrs[i]) {
								name = attrs[i].name;
								if (name.indexOf("data-") === 0) {
									name = jQuery.camelCase(name.slice(5));
									var val = attrs[i].value;
									if ($.isNumeric(val)) val *= 1;
									obj[name] = val;
								}
							}
						}
						$(this).data(obj);
					}
				});
			});
		}
	});
})(jQuery);