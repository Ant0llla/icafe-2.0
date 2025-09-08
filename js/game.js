function stop_game_timers()
{
	if (theQueryRunGameIdsIntervalId != null) {
		clearInterval(theQueryRunGameIdsIntervalId);
		theQueryRunGameIdsIntervalId = null;
	}

	if (theGameTrackerInterval != null) {
		clearInterval(theGameTrackerInterval);
		theGameTrackerInterval = null;
	}

	countdown_stop();
}

function query_rungame_ids()
{
	CallFunction("RUNGAME_QUERY_IDS");
}

function GameList()
{
	this.filter_params = { type: 'home', class: '', search: '' };
	this.member_recent_played = [];
	this.local_hot_sorted_games = [];

	// 进入GAMES页后，所有的处理要重新处理，可以重进入（例如：已经是GAMES页，再进入时，LEFT_TIME要重启一下
	// 置thePCStatus时，就要重启left_time.
	this.show = function() {
		var that = this;

		that.local_hot_sorted_games = [];
		theGames.sort(that.local_hot_compare).forEach(game => {
			if (game.pkg_name.toLowerCase() === 'icafemenu' || game.pkg_name.toLowerCase() === 'overwolf')
				return;
			that.local_hot_sorted_games.push(game);
		});

		for (var i=0; i<that.local_hot_sorted_games.length; i++) {
			that.local_hot_sorted_games[i].local_hot_rank = i+1;
		}
		//$('#top-buttons .dropdown-menu').html(tmpl('tmpl-more-games-classes', { items: theClasses == null ? [] : theClasses.sort(that.class_compare) }));
		//translate_obj($('#top-buttons'));

		if(theClasses == null)
			theClasses = [];
		theClasses = theClasses.filter((item) => {
			item.game_count = 0;
			for (var i=0; i<theGames.length; i++) {
				if(theGames[i].pkg_idc_class == item.class_name && theGames[i].pkg_name.toLowerCase() != 'icafemenu' && theGames[i].pkg_name.toLowerCase() != 'overwolf')
					item.game_count ++;
			}
			if(item.game_count == 0)
				return false;
			return true;
		});

		theClasses.unshift({class_name: 'All Games'});

		let gameClass = [
			{class_name: 'More', icon: 'fa-bars', subClasses: []},
			{class_name: 'Favorite', icon: 'fa-star'},
			{class_name: 'Free to play', icon: 'fa-bookmark'},
		];

		gameClass[0]['subClasses'] = theClasses;
		vueClasses.items = JSON.parse(JSON.stringify(gameClass));
		
		PetiteVue.nextTick(() => {
			ui_init();
			$('[data-toggle="tooltip"]').tooltip();
			that.load_games_by_class('class', 'All Games', '');
		});

		$('input#search-bar').keyup(function(e){
			var new_search = $(this).val();
			if (that.filter_params.search.toLowerCase() == new_search)
				return;

			that.load_games_by_class('class', 'All Games', $(this).val());
		});
	
		setDropdownMenu();

		// load recent played from client_status package
		if (typeof(thePCStatus.member_recent_played) != 'undefined' && thePCStatus.member_recent_played != null) {
			that.member_recent_played = JSON.parse(thePCStatus.member_recent_played);
		}
	}

	this.local_hot_compare = function(a, b) {
		var a_is_favorite = a.pkg_favorite;
		var b_is_favorite = b.pkg_favorite;

		var a_value = a.pkg_local_hot || 0;
		var b_value = b.pkg_local_hot || 0;

		if (a_is_favorite && !b_is_favorite)
			return -1;

		if (!a_is_favorite && b_is_favorite)
			return 1;

		if (a_value < b_value)
			return 1;
		if (a_value > b_value)
			return -1;

		return 0;
	}

	this.is_recent_played = function(pkg_id) {
		var exists = false;
		this.member_recent_played.forEach(function(game) {
			if (game.pkg_id === parseInt(pkg_id))
				exists = true;
		})
		return exists;
	}

	this.load_games_by_class = function(type, class_name, search) {
		if(class_name == 'Favorite')
			type = 'home';
		if(class_name == 'All Games')
			type = 'all';
		if(class_name == 'Free to play')
			type = 'license';

		acitve_class = class_name;
		class_name = decodeURIComponent(class_name);
		acitve_class = decodeURIComponent(acitve_class);
		$('#more-games').html(type != 'class' ? translate_string('More games') : class_name);
		var that = this;

		that.filter_params = { type: type, class: class_name, search: search };
		$('input#search-bar').val(search);

		// Home, We always show the 5 games on top that member played, then show the favorite games, then order by local hot.
		// All games, it will show favorite games first, then order by local hot.
		// Licensed Games, it will show licensed games, favorite first then local hot.
		// More Games, will show menu of categories, favorite first, then local hot.
		var limit_count = Math.MAX_VALUE;

		{
			var games_width = parseInt($('#games').css('width').replace('px', ''), 10) || 0;
			games_width -= 0;
			var games_height = parseInt($("#games").css("height").replace('px', ''), 10) || 0;
			games_height -= 20;

			var item_width = 168+15;
			var item_height = 264+15;

			if (item_width <= 0)
				return;

			var cols = Math.max(Math.floor(games_width / item_width), 2);
			var rows = Math.max(Math.floor(games_height / item_height), 2);
			if (type === 'home')
				limit_count = cols*rows;

			var width = cols * item_width;
			//$('#games .games-container').css("width", width+ "px");
			var padding = parseInt((games_width - width) / 2);
			//$('#top-buttons').css("padding-left", padding + "px");
			//$('#top-buttons').css("padding-right", padding + "px");
		}

		var sorted_games = that.local_hot_sorted_games.sort(that.local_hot_compare);
		var show_games = [];
		sorted_games.forEach(function(game) {
			if (type === 'home' && that.is_recent_played(game.pkg_id))
				return;

			if (type === 'home' && (game.pkg_idc_class.toLowerCase() === 'internet tools' || game.pkg_idc_class.toLowerCase() === 'Apps'))
				return;

			if (game.pkg_name.toLowerCase() === 'icafemenu' || game.pkg_name.toLowerCase() === 'overwolf')
				return;

			if (type === 'license' && !game.pkg_has_license)
				return;

			if (type === 'class' && class_name.length > 0 && game.pkg_idc_class != class_name)
				return;

			if (search.length > 0 && game.pkg_name.toLowerCase().indexOf(search.toLowerCase()) < 0)
				return;

			// pc groups
			var pkg_pc_group_ids = typeof(game.pkg_pc_group_ids) != 'undefined' ? game.pkg_pc_group_ids : [];
			if (pkg_pc_group_ids.length > 0 && pkg_pc_group_ids.indexOf(thePCStatus.pc_group_id) < 0)
				return;

			if (game.pkg_rating > 0)
			{
				if(thePCStatus.member_birthday == null || thePCStatus.member_birthday == '0000-00-00')
				{
					if(game.pkg_rating > 13) // default age is 13 years
						return;
				}
				else
				{
					var cols = thePCStatus.member_birthday.split('-');
					if (cols.length === 3) {
						var year = cols[0];
						var month = cols[1];
						var day = cols[2];

						// 获取当前日期
						var currentDate = new Date();
						// 获取出生日期
						var dob = new Date(year, month, day);
						// 计算年龄
						var age = currentDate.getFullYear() - dob.getFullYear();
						// 如果当前月份小于出生月份，或者当前月份等于出生月份但是当前日期小于出生日期，则年龄减一
						if (currentDate.getMonth() < dob.getMonth() || (currentDate.getMonth() == dob.getMonth() && currentDate.getDate() < dob.getDate())) {
							age--;
						}
						if (age < game.pkg_rating)
							return;
					}
					else
					{
						if(game.pkg_rating > 13) // default age is 13 years
							return;
					}
				}
			}

			limit_count = limit_count - 1;
			if (limit_count < 0)
				return;

			if (type === 'home' && limit_count <= theGameList.member_recent_played.length)
				return;

			show_games.push(game);
		});

		if (type === 'home') {
			for (var i=theGameList.member_recent_played.length-1; i>=0; i--) {
				that.local_hot_sorted_games.forEach(function(game) {
					if (theGameList.member_recent_played[i].pkg_id == game.pkg_id)
					{
						var pkg_pc_group_ids = typeof(game.pkg_pc_group_ids) != 'undefined' ? game.pkg_pc_group_ids : [];
						if (pkg_pc_group_ids.length > 0 && pkg_pc_group_ids.indexOf(thePCStatus.pc_group_id) < 0)
							return;
						show_games.unshift(game);
					}
				})
			}
		}
		// $('#games .games-container').html(tmpl('tmpl-games', { items: show_games, type: type }));
		vueGames.items = JSON.parse(JSON.stringify(show_games));
		vueGames.type = type;
		vueGames.active_class = acitve_class;
		vueGames.status_pc_token = thePCStatus.status_pc_token;

		vueGlobal.pageType = "Games";
		vueGlobal.showBottom = true;

		PetiteVue.nextTick(() => {
			ui_init();
			$('[data-toggle="tooltip"]').tooltip();
		});
	}

	this.play_game = function(pkg_id, status_pc_token, use_icafecloud_license, license_account, game_auto_launch_delay) {
		// if use license pool, cover show/hide control by pool, else show cover 3 seconds, prevent users click repeatedly
		CallFunction("RUNGAME " + pkg_id + " " + status_pc_token + " 0 " + use_icafecloud_license + " " + license_account + " " + game_auto_launch_delay);

		var params = 'type=update-hot&id=' + pkg_id + '&token=' + thePCStatus.status_pc_token;
		CallFunction('API ' + params);
		
		var that = this;

		for (var i=0; i<that.member_recent_played.length; i++) {
			if (that.member_recent_played[i].pkg_id === parseInt(pkg_id)) {
				that.member_recent_played.splice(i, 1);
				break;
			}
		}

		that.member_recent_played.unshift({ pkg_id: parseInt(pkg_id) });
		if (that.member_recent_played.length > 5)
			that.member_recent_played.splice(5,that.member_recent_played.length - 5);
	}
	
	var menu_target_id = null;

	this.request_game_licenses = function(pkg_id, target_id) {
		$.contextMenu('destroy', '#btn-play-with-license-' + pkg_id);
		$.contextMenu('destroy', '#btn-home-play-with-license-' + pkg_id);
		this.menu_target_id = target_id;

		getToken().then(token => {
		if (!token) {
			return;
		}
		
		$.ajax({
			url: getCafeApiUrl('gameLicenses'),
			method: 'post',
			data: {
				pc_name: thePCInfo.pc_name,
				pkg_id: pkg_id
			},
			dataType: 'json',
			headers: {
				'Authorization': 'Bearer ' + token
			},
			success: (result) => {
				console.log(JSON.stringify(result));
				var that = this;
				if (result.code != 200) {
					sweetAlert("", result.message, "error");
					return;
				}
				
				$.contextMenu({
					selector: '#' + that.menu_target_id,
					className: 'play-with-license-title',
					trigger: 'none',
					build: function($trigger, e) {
						e.preventDefault();
		
						var items = {};
						if (result.data.licenses.length == 0)
							items['no_free_account'] = { name: translate_string('No free account'), disabled: true };
		
						if (result.data.licenses.length > 0) {
							var show_licenses = result.data.licenses.sort(that.game_licenses_sort);
							show_licenses.forEach(function (license) {
								items[license.license_account] = {
									name: license.license_account,
									disabled: (license.license_status.toUpperCase() != 'FREE'),
									icon: (license.license_status.toUpperCase() != 'FREE' ? 'fal fa-lock' : '')
								};
							});
						}
		
						return {
							callback: function(key, options) {
								var game_auto_launch_delay = typeof(result.data.game_auto_launch_delay) != 'undefined' ? result.data.game_auto_launch_delay : 0;
								theGameList.play_game(result.data.pkg_id, thePCStatus.status_pc_token, 1, key, game_auto_launch_delay);
							},
							items: items
						};
					}
				});
		
				$('#' + that.menu_target_id).trigger('contextmenu');
				return true;
			},
			error: (result) => {
				requestApiToken();
				sweetAlert("", JSON.stringify(result), "error");
				console.log(JSON.stringify(result));
			}
		});
		});
	}

	this.game_licenses_sort = function(a, b) {
		var a_value = (a.license_status.toUpperCase() == 'FREE' ? 1 : 0);
		var b_value = (b.license_status.toUpperCase() == 'FREE' ? 1 : 0);

		return b_value - a_value;
	}

	this.process_wss_package = function(packet){
		if (packet.action != 'game_licenses')
			return false;
		
		var that = this;
		
		$.contextMenu({
			selector: '#' + that.menu_target_id,
			className: 'play-with-license-title',
			trigger: 'none',
			build: function($trigger, e) {
				e.preventDefault();

				var items = {};
				if (packet.data.licenses.length == 0)
					items['no_free_account'] = { name: translate_string('No free account'), disabled: true };

				if (packet.data.licenses.length > 0) {
					var show_licenses = packet.data.licenses.sort(that.game_licenses_sort);
					show_licenses.forEach(function (license) {
						items[license.license_account] = {
							name: license.license_account,
							disabled: (license.license_status.toUpperCase() != 'FREE'),
							icon: (license.license_status.toUpperCase() != 'FREE' ? 'fal fa-lock' : '')
						};
					});
				}

				return {
					callback: function(key, options) {
						var game_auto_launch_delay = typeof(packet.data.game_auto_launch_delay) != 'undefined' ? packet.data.game_auto_launch_delay : 0;
						theGameList.play_game(packet.data.pkg_id, thePCStatus.status_pc_token, 1, key, game_auto_launch_delay);
					},
					items: items
				};
			}
		});

		$('#' + that.menu_target_id).trigger('contextmenu');
		return true;
	}
}

function rungame_show_dialog(game_id)
{
	theGames.forEach(function(obj) {
		if (game_id != obj.pkg_id)
			return;

		$('.myModalRunGame input[name=game_id]').val(obj.pkg_id);
		$('.myModalRunGame .modal-title').html(obj.pkg_name);
		$('.myModalRunGame').modal('show');
	})
}

function rungame_switch_to()
{
	var game_id = $('.myModalRunGame input[name=game_id]').val();
	$('.myModalRunGame').modal('hide');
	CallFunction("RUNGAME_SWITCH_TO " + game_id);
}

function rungame_terminate()
{
	var game_id = $('.myModalRunGame input[name=game_id]').val();
	$('.myModalRunGame').modal('hide');
	CallFunction("RUNGAME_TERMINATE " + game_id);
}

function game_tracker()
{
	// game api
	if (typeof(theLocalParams) != 'undefined' && typeof(theLocalParams.beta) != 'undefined' && theLocalParams.beta == 1)
		CallFunction("GAMETRACKER " + thePCStatus.member_id + " " + thePCStatus.status_pc_token);
}