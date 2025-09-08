function Home()
{
	this.show = function(refreshBanance = false) {

		vueGlobal.pageType = "Home";
		vueGlobal.showBottom = true;
		
		setBodyStyle();
		if((theSettings.client_bg_format ?? 0) == 0)
		{
			$('body').css({'background-image': "url('posters/cafe_info_cafe_background.jpg'), url('images/games.jpg')"});
			theVideo.hide();
		}
		else
		{
			$('body').css({'background-image': ''});
			theVideo.play(theSettings.client_bg_video ?? '');
		}

		$('#page_login').addClass('d-none').hide();
		$('#page_games').addClass('d-flex').show();

		// Top 5 Games
		var topFiveGames = [];
		theGames.sort(theGameList.local_hot_compare).forEach(game => {
			if (game.pkg_name.toLowerCase() === 'icafemenu' || game.pkg_name.toLowerCase() === 'overwolf')
				return;
			topFiveGames.push(game);
		})
		
		topFiveGames = topFiveGames.slice(0, 5);
		vueGames.topFiveItems = JSON.parse(JSON.stringify(topFiveGames));

		// Promoted product
		theShop.change_group(-4);
		setDropdownMenu();

		if (is_member_logined())
			vueGlobal.menuButton.changepassword = true;

		// 用户积分
		if((thePCStatus.member_points ?? null) && (theSettings.point_enable ?? 0)) {
			theMemberGroup = theMemberGroup.filter(obj => obj.member_group_id > 0 && obj.member_group_point_min !== undefined)
			.sort((a, b) => parseFloat(a.member_group_point_min) - parseFloat(b.member_group_point_min));

			var memberGroup = [];
			var groupIndex = 1;
			var memberCurrentGroup = 0;
			var memberCurrentGroupPoint = 0;
			theMemberGroup.forEach(function(group) {

				let point_min = parseFloat(group.member_group_point_min);

				if(thePCStatus.member_group_id == group.member_group_id) {
					memberCurrentGroup = groupIndex;
					memberCurrentGroupPoint = (groupIndex == theMemberGroup.length ? point_min : theMemberGroup[groupIndex].member_group_point_min);
				}

				memberGroup.push(
					{
						mebmer_group_index: groupIndex,
						member_group_id: group.member_group_id,
						member_group_name: group.member_group_name,
						member_group_point_min: point_min,
					}
				);

				groupIndex++;
			});
			
			if(memberGroup.length > 0)
			{
				var lastGroupIndex = memberGroup[memberGroup.length - 1].mebmer_group_index;
				var showMemberGroup = [];
				if(memberCurrentGroup == 1 || memberCurrentGroup == 0) {
					showMemberGroup = memberGroup.slice(0, 3);
				} else if(lastGroupIndex == memberCurrentGroup) {
					let startIndex = memberGroup.length > 3 ? memberGroup.length - 3 : 0;
					showMemberGroup = memberGroup.slice(startIndex, memberGroup.length);
				} else {
					showMemberGroup = memberGroup.slice(memberCurrentGroup - 2, memberCurrentGroup + 1);
				}

				if(memberCurrentGroup == 0 && showMemberGroup.length > 0) {
					memberCurrentGroupPoint = showMemberGroup[0].member_group_point_min;
				}

				vueHome.memberCurrentGroup = memberCurrentGroup; 
				vueHome.memberGroup = JSON.parse(JSON.stringify(showMemberGroup));
				vueHome.memberPointValue = thePCStatus.member_points + '/' + memberCurrentGroupPoint;
			}
		}

		PetiteVue.nextTick(() => {
			ui_init();
			$('[data-toggle="tooltip"]').tooltip();
			//that.load_games_by_class('class', 'Favorite', '');
		});
		
		if (typeof(theCafeNews) != 'undefined' && theCafeNews != null && theCafeNews.length > 0) {
			//$('#news_carousel_main .carousel-inner').html(tmpl('tmpl-news', { items: theCafeNews } ));
			//translate_obj($('#news_carousel_main .carousel-inner'));
			for(var i = 0; i < theCafeNews.length; i ++)
			{
				theCafeNews[i].active = '';
			}
			if(theCafeNews.length > 0)
				theCafeNews[0].active = 'active';
			vueCafeNews.items = JSON.parse(JSON.stringify(theCafeNews)).map((item) => {
				item.news_show_qr = typeof(item.news_show_qr) == 'undefined' ? true : item.news_show_qr;
				item.news_video = typeof(item.news_video) == 'undefined' ? '' : item.news_video;
				item.isYoutube = false;
				item.news_duration = typeof(item.news_duration) == 'undefined' ? 5000 : item.news_duration;
				item.news_type = typeof(item.news_type) == 'undefined' ? 'picture' : item.news_type;
				if (item.news_video.match(/youtube/) !== null){
					var videoSplit = item.news_video.split("?v=");
					var videoId = videoSplit ? videoSplit[1] : "";
					if(videoId.length > 0)
					{
						item.isYoutube = true;
						item.news_video = "https://www.youtube.com/embed/" + videoId + "?mute=1&modestbranding=1&autohide=1&showinfo=0&controls=0&autoplay=1&loop=1&playlist=" + videoId + "&version=3";
					}
				}
				
				if(item.news_type === 'picture') {
					item.news_video = ''
				}

				return item;
			});
			
			PetiteVue.nextTick(() => {
				var start = $('#home_carousel_news .carousel-inner').find('.active').attr('data-bs-interval');
				var t = setTimeout("$('#home_carousel_news').carousel({interval: 1000});", start-1000);
				$('#home_carousel_news').on('slid.bs.carousel', function () {
					clearTimeout(t); 
					var duration = $('#home_carousel_news .carousel-inner').find('.active').attr('data-bs-interval');
					 $('#home_carousel_news').carousel('pause');
					 t = setTimeout("$('#home_carousel_news').carousel({interval: 1000});", duration-1000);
				})

				$('#home_carousel_news .carousel-indicators').on('click', function(){
					clearTimeout(t); 
				});

				$('#home_carousel_news .carousel-indicators').on('click', function(){
					clearTimeout(t); 
				});
				ui_init();
				$('[data-toggle="tooltip"]').tooltip();
			});

			//$('#home_carousel_news').carousel({ interval: 1000 });
		}
		// 刷新余额
		if (refreshBanance) {
			refreshBalanceInfo();
		}
	}
}

function open_news(id)
{
	theCafeNews.forEach(function(obj) {
		if (obj.news_id == id) {
			CallFunction('RUN ' + obj.news_url);
			console.log('open news ' + obj.news_url);
		}
	});
}

function handleQRClick(id) {
	vueCafeNews.items = vueCafeNews.items.map((item) => {
		if (item.news_id === id) {
			item.news_show_qr = false;
		}
		return item;
	});
}

function refreshBalanceInfo()
{
	getToken().then(token => {
	if (!token) {
		return;
	}
	$.ajax({
		url: getCafeApiUrl('getRealTimeBalance'),
		method: 'post',
		dataType: 'json',
		data: {
			member_account: thePCStatus.member_account,
			pc_name: thePCInfo.pc_name
		},
		headers: {
			'Authorization': 'Bearer ' + token
		},
		success: (result) => {
			console.log(JSON.stringify(result));
			if (result.code == 200) {
				var member_info = result?.data ?? null;
				if (member_info) {
					var member_balance = member_info.member_balance ?? 0;
					memberInfo.member_balance_realtime = format_balance(member_balance);
					memberInfo.member_balance = member_balance;
					
					var member_balance_bonus = member_info.member_balance_bonus ?? 0;
					memberInfo.member_balance_bonus_realtime = format_balance(member_balance_bonus);
					memberInfo.member_balance_bonus = member_balance_bonus;
					
					var member_coin_balance = member_info.member_coin_balance ?? 0;
					memberInfo.member_coin_balance = format_balance(member_coin_balance);
				}
				return;
			}
		},
		error: (result) => {
			console.log(JSON.stringify(result));
			requestApiToken();
		}
	});
	});
}