function Rank()
{
	this.show = function() {

		let gameCode = ['fortnite', 'pubg', 'lol', 'dota2', 'valorant', 'csgo', 'apex'];

		// 添加游戏到gameCode
		if (theSettings.game_rank_options_fortnite == 0) {
			gameCode = gameCode.filter(game => game !== 'fortnite');
		}
		if (theSettings.game_rank_options_pubg == 0) {
			gameCode = gameCode.filter((game) => game !== "pubg")
		}
		if (theSettings.game_rank_options_dota2 == 0) {
			gameCode = gameCode.filter(game => game !== 'dota2');
		}
		if (theSettings.game_rank_options_csgo == 0) {
			gameCode = gameCode.filter(game => game !== 'csgo');
		}
		if (theSettings.game_rank_options_valorant == 0) {
			gameCode = gameCode.filter(game => game !== 'valorant');
		}
		if (theSettings.game_rank_options_lol == 0) {
			gameCode = gameCode.filter(game => game !== 'lol');
		}
		if (theSettings.game_rank_options_apex == 0) {
			gameCode = gameCode.filter(game => game !== 'apex');
		}

		gameCode.forEach((type) => {

			if(vueRank.items[type] != undefined && vueRank.items[type].length > 0) {
				return;
			}

			$('#spinner').show();
			$.ajax({
				url: "https://rank.icafecloud.com/game-rank.php",
				method: "post",
				data: { action: "ajax-rank-data", game_code: type, page_size: 10, data_type: 'weekly', rank_week: 'last' },
				dataType: "json"
			}).done(function(data) {

				if(typeof(data.items) != undefined) {
					vueRank.items[type] = JSON.parse(JSON.stringify(data.items));
				}

			}).fail(function(xhr, status, error) {
				console.log(error);
			}).always(function(){
				$('#spinner').hide();
			});
			
		})

		vueGlobal.pageType = "Rank";
		vueGlobal.showBottom = false;
		if (gameCode.length == 0) {
			vueRank.active_game = 'fortnite'
		} else {
			vueRank.active_game = gameCode[0];
		}

		PetiteVue.nextTick(() => {
			$("#rank-carousel").carousel();
			$('#rank-carousel').on('slid.bs.carousel', function () {
				var activeItem = $(this).find('.carousel-item.active');
				vueRank.active_game = activeItem.data("game");
				$('#rank-game-logo-img').attr("src", "./images/" + vueRank.active_game + ".png")
			});
			ui_init();
			$('[data-toggle="tooltip"]').tooltip();
		});
		
	}
}