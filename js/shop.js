function Shop()
{
	this.order_items = [];
	this.gift_order_items = [];
	this.filtered_items = [];
	this.loaded = false;
	this.current_group_id = -3;
	this.enable_cash = 1;
	this.enable_credit_card = 1;
	this.enable_balance = 1;
	this.search = '';
	var that = this;

	this.show = function() {
		refreshBalanceInfo()
		
		this.order_items = [];

		if (!this.loaded) {
			this.loaded = true;
			theProductGroupList.push({
				product_group_desc: "",
				product_group_has_icon: false,
				product_group_id: -2,
				product_group_name: translate_string("Gifts")
			});

			for (var i=0; i<theProductGroupList.length; i++)
			{
				if (theProductGroupList[i].product_group_id == -2) {
					var total = 0;
					theProductList.forEach(function(obj) {
						if (obj.product_coin_price > 0)
							total += 1;
					});
					theProductGroupList[i].product_count = total;
					continue;
				}

				var total = 0;
				theProductList.forEach(function(obj) {
					if (obj.product_group_id == theProductGroupList[i].product_group_id)
						total += 1;
				});
				theProductGroupList[i].product_count = total;
			}
		}

		//$('#product-group-list ul').html(tmpl('tmpl-product-group', { items: theProductGroupList }));
		//translate_obj($('#product-group-list ul'));
		var items = [];
		let dropdownProductGroupList = [];
		for (var i=0; i<theProductGroupList.length; i++)
		{
			if (theProductGroupList[i].product_count <= 0) continue;

			if (theProductGroupList[i].product_group_id > 0) {
				dropdownProductGroupList.push(theProductGroupList[i]);
			} else {
				items.push(theProductGroupList[i]);
			}
		}

		dropdownProductGroupList.unshift({
			product_group_id: -3,
			product_group_name: translate_string("All"),
		})

		vueProductGroupList.items = JSON.parse(JSON.stringify(items));
		vueProductGroupList.dropdownProductGroupList = JSON.parse(JSON.stringify(dropdownProductGroupList));
		
		this.change_group(-3); // all

		$('#cart_date').html(this.format_date());
		// $('#cart').html(tmpl('tmpl-new-order-items', { items: [] }));
		vueOrderItems.total_cost = 0;
		vueOrderItems.total_tax = 0;
		vueOrderItems.total_amount = 0;
		vueOrderItems.total_discount = 0;
		vueOrderItems.max_bonuses = 0;
		vueOrderItems.payable_balance = 0;
		vueOrderItems.product_count = 0;
		vueOrderItems.member_group_id = thePCStatus.member_group_id;
		vueOrderItems.member_group_discount_rate = thePCStatus.member_group_discount_rate ?? 0;
		vueOrderItems.member_group_discount_offer = thePCStatus.member_group_discount_offer ?? 0;
		vueOrderItems.items = [];

		vueGlobal.pageType = "Shop";
		vueGlobal.showBottom = false;

		$('input#search-product').keyup(function(e){
			let new_search = $(this).val();
			that.change_group(vueProductGroupList.current_group_id, new_search);
		});
		
		//$('#payment-table').html(tmpl('tmpl-payment-method'));
		PetiteVue.nextTick(() => {
			ui_init();
			$('[data-toggle="tooltip"]').tooltip();
		});
	};

	// -3 = all, -4 = promoted
	this.change_group = function(group_id, search = '') {
		that.current_group_id = group_id;
		vueProductGroupList.current_group_id = group_id;

		if (group_id == -2) {
			$('#shop_cart').hide();
			$('#shop_cart_gift').show();
			this.gift_cart_refresh();
		}
		else {
			$('#shop_cart').show();
			$('#shop_cart_gift').hide();
			this.cart_refresh();
		}

		$('input#search-product').val(search);
		that.filtered_items = [];
		theProductList.forEach(function(obj) {

			if (group_id == -4) {
				if(typeof(obj.product_is_promoted) == 'undefined' || obj.product_is_promoted == false)
					return;
			} else if (group_id != -3) {

				if (group_id == -2 && parseFloat(obj.product_coin_price) <= 0)
					return;

				if (group_id != -2 && obj.product_group_id != group_id)
					return;
			}

			// don't show 0 stock
			if (obj.product_unlimited == 0 && obj.product_qty <= 0)
				return;

			// 取消 obj.product_group_id == -1 判断，因为常规产品也支持show_weekday、show_time; -1的代表的是offer
			// pc group, member group
			var pc_group_id = (typeof(thePCStatus.pc_group_id) == 'undefined' ? 0 : thePCStatus.pc_group_id);
			var member_group_id = (typeof(thePCStatus.member_group_id) == 'undefined' ? 0 : thePCStatus.member_group_id);
			if (JSON.parse(obj.product_pc_groups).indexOf('0') < 0 && JSON.parse(obj.product_pc_groups).indexOf(pc_group_id.toString()) < 0)
				return;

			if (JSON.parse(obj.product_member_groups).indexOf('0') < 0 && JSON.parse(obj.product_member_groups).indexOf(member_group_id.toString()) < 0)
				return;

			// empty or "7|1|2|3|4|5|6"
			var todayAvailable = true;
			var yesterdayAvailable = true;
			var product_show_weekday = (typeof(obj.product_show_weekday) != 'undefined' ? obj.product_show_weekday : '');
			if (product_show_weekday.length > 0) {
				var weekdays = product_show_weekday.split('|');
				if (weekdays.indexOf(moment().format('E')) < 0)
					todayAvailable = false;
				if (weekdays.indexOf(moment().add(-1, 'days').format('E')) < 0)
					yesterdayAvailable = false;
				if (!todayAvailable && !yesterdayAvailable)
					return;
			}

			// empty or 00:00-24:00
			var product_show_time = (typeof(obj.product_show_time) != 'undefined' ? obj.product_show_time : '');
			if (product_show_time.length > 0) {
				var times = product_show_time.split('-');
				if (times.length != 2)
					return;

				var begin_times = times[0].split(':');
				var end_times = times[1].split(':');
				if (begin_times.length != 2 || end_times.length != 2)
					return;

				var begin = moment().set({ 'hour': parseInt(begin_times[0]), 'minute': parseInt(begin_times[1]), 'second': 0 });
				var end = moment().set({ 'hour': parseInt(end_times[0]), 'minute': parseInt(end_times[1]), 'second': 0 });
				if (end >= begin) {
					if (!todayAvailable)
						return;
					if (begin.isAfter() || end.isBefore())
						return;
				}

				// if like 23:00-08:00 over mid-night
				if (end < begin) {
					let isValid = ((begin.isBefore() && todayAvailable) || (yesterdayAvailable && end.isAfter()));
					if (!isValid)
						return;
				}
			}

			if (search.length > 0 && obj.product_name.toLowerCase().indexOf(search.toLowerCase()) < 0)
				return;

			that.filtered_items.push(obj);
		});

		//$('#product-list').html(tmpl('tmpl-product', { items: that.filtered_items }));
		//translate_obj($('#product-list'));
		var items = that.filtered_items;
		var itemsNew = [];
		for (var i=0; i<items.length; i++)
		{ 
			if(items[i].product_name.startsWith('*'))continue;
			if (theShop.current_group_id == -2 && items[i].product_coin_price <= 0) continue;
			if (theShop.current_group_id != -2 && items[i].product_price == 0 && items[i].product_coin_price > 0) continue;
			items[i].image = '';
			if (items[i].product_group_id === -1) { items[i].image = 'images/default-offer.jpg'; }
			if (items[i].product_group_id >= 0) { items[i].image = 'images/default-product.jpg'; }
			if (items[i].product_has_image) { items[i].image = 'posters/' + items[i].product_id + '.jpg'; }
			itemsNew.push(items[i]);
		}
		vueProducts.items = JSON.parse(JSON.stringify(itemsNew));

		if(group_id == -4) {
			let promotedProductList = [];
			for(var i=0, j = itemsNew.length; i<j; i+=4) {
				promotedProductList.push(itemsNew.slice(i, i+4))
			}
			vueHome.promotedItems = JSON.parse(JSON.stringify(promotedProductList));
		}

		PetiteVue.nextTick(() => {
			ui_init();
			$('[data-toggle="tooltip"]').tooltip();
		});
	};
	
	this.cart_refresh = function() {
		vueOrderItems.total_cost = 0;
		vueOrderItems.total_tax = 0;
		vueOrderItems.total_amount = 0;
		vueOrderItems.total_discount = 0;
		vueOrderItems.member_group_id = thePCStatus.member_group_id;
		vueOrderItems.member_group_discount_rate = thePCStatus.member_group_discount_rate ?? 0;
		vueOrderItems.member_group_discount_offer = thePCStatus.member_group_discount_offer ?? 0;
		let total_offer = 0;
		let product_count = 0;

		for (var i=0; i< this.order_items.length; i++)
		{
			// Calculate price based on payment method
			var effectivePrice = that.calculatePriceByPaymentMethod(this.order_items[i].product_price, vueOrderItems.payment_method);
			this.order_items[i].order_cost = effectivePrice * this.order_items[i].order_item_qty;
			var order_discount = this.order_items[i].product_is_offer ? vueOrderItems.member_group_discount_offer : vueOrderItems.member_group_discount_rate;
			if(!this.order_items[i].product_enable_discount)
				order_discount = 0;
			var order_tax = theTax.getTaxWithPrice(this.order_items[i].product_tax_id, this.order_items[i].order_cost * (1 - order_discount / 100.0));
			if(vueOrderItems.payment_method == PAY_METHOD_BALANCE)
				order_tax = 0;
			vueOrderItems.total_cost += parseFloat(this.order_items[i].order_cost);
			vueOrderItems.total_tax += parseFloat(order_tax);
			vueOrderItems.total_discount += parseFloat(this.order_items[i].order_cost) * order_discount / 100.0;
			vueOrderItems.total_amount += this.order_items[i].order_cost * (1 - order_discount / 100.0);
			vueOrderItems.total_offer += this.order_items[i].order_cost;
			if (this.order_items[i].product_is_offer) {
				total_offer +=  this.order_items[i].order_cost * (1 - order_discount / 100.0)
			} else {
				product_count++;
			}
			if(theSettings.tax_included_in_price == 0)
				vueOrderItems.total_amount += parseFloat(order_tax);
		}
		let max_bonuses = theSettings.bonus_buy_offer === 1 && theSettings.max_bonus_percentage > 0
			? Math.min(total_offer * theSettings.max_bonus_percentage / 100, memberInfo.member_balance_bonus)
			: 0;
		
		let cost_bonus = vueOrderItems.total_amount <= memberInfo.member_balance ? 0 : max_bonuses; //pay balance first
		if (theSettings.use_bonus_first) {
			cost_bonus = max_bonuses;
		}
		vueOrderItems.max_bonuses = cost_bonus
		vueOrderItems.payable_balance = vueOrderItems.total_amount - vueOrderItems.max_bonuses;
		vueOrderItems.product_count = product_count;
		
		vueOrderItems.items = JSON.parse(JSON.stringify(this.order_items));
		
		this.enable_cash = this.enable_credit_card = this.enable_balance = 1;
		
		for (var i=0; i<this.order_items.length; i++) 
		{
			var product_item = null;
			theProductList.forEach(function(obj) {
				if (obj.product_id == that.order_items[i].product_id)
					product_item = obj;
			});
			if(product_item == null)
				continue;
			if(typeof(product_item.product_group_payment_method) == 'undefined')
				continue;
			product_group_payment_method = JSON.parse(product_item.product_group_payment_method);
			product_group_payment_method = is_member_logined() ? product_group_payment_method.member : product_group_payment_method.guest;
			if(this.enable_cash && product_group_payment_method.indexOf('cash') < 0)
				this.enable_cash = 0;
			if(this.enable_credit_card && product_group_payment_method.indexOf('credit_card') < 0)
				this.enable_credit_card = 0;
			if(this.enable_balance && product_group_payment_method.indexOf('balance') < 0)
				this.enable_balance = 0;
		}

		PetiteVue.nextTick(() => {
			ui_init();
			$('[data-toggle="tooltip"]').tooltip();
		});
	}
	
	this.update_item_qty = function(e) {
		var product_id = $(e.target).data('productid');
		var qty = $(e.target).val();
		qty = parseInt(qty);

		var product_item = null;
		theProductList.forEach(function(obj) {
			if (obj.product_id == product_id)
				product_item = obj;
		});
		if (product_item == null)
			return;

		if (isNaN(qty) || qty < 1)
			qty = 1;
		if (product_item.product_unlimited == 0 && qty > product_item.product_qty)
			qty = product_item.product_qty;

		that.order_items.forEach(function(obj) {
			if (obj.product_id == product_id) {
				obj.order_item_qty = qty;
			}
		});

		that.cart_refresh();
	}

	this.cart_change_qty = function(product_id, qty) {
		var order_item = null;
		var product_item = null;

		theProductList.forEach(function(obj) {
			if (obj.product_id == product_id)
				product_item = obj;
		});
		if (product_item == null)
			return false;

		that.order_items.forEach(function(obj) {
			if (obj.product_id == product_id)
				order_item = obj;
		});

		if (order_item == null && qty > 0) {
			order_item = {
				product_id: product_id,
				product_name: product_item.product_name,
				product_tax_id: product_item.product_tax_id,
				product_price: product_item.product_price,
				product_enable_discount: product_item.product_enable_discount,
				product_is_offer: product_item.product_id.startsWith("o-") ? true : false,
				order_item_qty: 0,
			};
			that.order_items.push(order_item);
		}
		if (order_item == null)
			return false;

		var new_qty = order_item.order_item_qty + qty;
		for (var i=0; i<that.order_items.length; i++) {
			if (that.order_items[i].product_id == product_id) {
				that.order_items[i].order_item_qty = new_qty;
				// delete product or dec qty
				if(new_qty <= 0)
					that.order_items.splice(i, 1);
				break;
			}
		}

		this.cart_refresh();
		return false;
	};

	this.cart_clear = function() {
		refreshBalanceInfo()
		this.order_items = [];
		this.cart_refresh();
	};

	this.buy = function(product_id, qty) {
		this.order_items = [];
		this.cart_change_qty(product_id, qty)
		$('.myModalBuy').modal('show');
		$('.modal-backdrop').css("opacity", "0.7");
	};
	
	this.cart_done_promote = function() {
		theShop.cart_done(true);
	}

	this.cart_done = function(buyNow = false) {

		if(vueOrderItems.payment_method == -1)
		{
			sweetAlert("", translate_string("Please choose a payment method"), "error");
			return;
		}

		var items = [];
		
		that.order_items.forEach(function(obj) {
			items.push({
				product_id: obj.product_id,
				qty: obj.order_item_qty
			});
		});

		getToken().then(token => {
		if (!token) {
			if(buyNow) {
				$('.myModalBuy').modal('hide');
			}
			
			return;
		}
		
		$('#spinner').show();
		$("#new-order-done").prop("disabled", true);
		$.ajax({
			url: getCafeApiUrl('submitOrder'),
			method: 'post',
			data: {
				payment_method: vueOrderItems.payment_method,
				member_group_discount_rate:  thePCStatus.member_group_discount_rate ?? 0,
				member_group_discount_offer:  thePCStatus.member_group_discount_offer ?? 0,
				items: items,
				pc_name: thePCInfo.pc_name
			},
			dataType: 'json',
			headers: {
				'Authorization': 'Bearer ' + token
			},
			success: (result) => {
				console.log(JSON.stringify(result));
				if (result.code != 200) {
					sweetAlert("", result.message, "error");
		
					$('#spinner').hide();
					$("#new-order-done").prop("disabled", false);
					return;
				}
				if(buyNow) {
					$('.myModalBuy').modal('hide');
				}

				toast(translate_string('Your order submitted'));
				if (result.data.pay_method == 3) {
					theShop.gift_cart_clear();
					return;
				}
				theShop.cart_clear();
				$('#spinner').hide();
				$("#new-order-done").prop("disabled", false);
			},
			error: (result) => {
				console.log(JSON.stringify(result));
				requestApiToken();
				sweetAlert("", JSON.stringify(result), "error");
				$('#spinner').hide();
				$("#new-order-done").prop("disabled", false);
				return;
			}
		});
		});
	};

	this.gift_cart_refresh = function() {
		vueGiftOrders.total_amount = 0;
		for (var i=0; i<this.gift_order_items.length; i++) 
		{
			this.gift_order_items[i].order_cost = this.gift_order_items[i].order_item_qty * this.gift_order_items[i].product_coin_price;
			vueGiftOrders.total_amount += parseFloat(this.gift_order_items[i].order_cost);
		}
		vueGiftOrders.items = JSON.parse(JSON.stringify(this.gift_order_items));
		PetiteVue.nextTick(() => {
			ui_init();
			$('[data-toggle="tooltip"]').tooltip();
		});
	}
	
	this.update_gift_item_qty = function(e) {

		var product_id = $(e.target).data('productid');
		var qty = $(e.target).val();
		qty = parseInt(qty);

		var product_item = null;
		theProductList.forEach(function(obj) {
			if (obj.product_id == product_id)
				product_item = obj;
		});
		if (product_item == null)
			return;

		if (isNaN(qty) || qty < 1)
			qty = 1;
		if (product_item.product_unlimited == 0 && qty > product_item.product_qty)
			qty = product_item.product_qty;

		that.gift_order_items.forEach(function(obj) {
			if (obj.product_id == product_id) {
				obj.order_item_qty = qty;
			}
		});

		that.gift_cart_refresh();
	};

	this.gift_cart_change_qty = function(product_id, qty) {
		var order_item = null;
		var product_item = null;

		theProductList.forEach(function(obj) {
			if (obj.product_id == product_id)
				product_item = obj;
		});
		if (product_item == null)
			return false;
		
		this.gift_order_items.forEach(function(obj) {
			if (obj.product_id == product_id)
				order_item = obj;
		});

		if (order_item == null && qty > 0) {
			order_item = {
				product_id: product_id,
				product_name: product_item.product_name,
				product_coin_price: product_item.product_coin_price,
				order_item_qty: 0
			};
			this.gift_order_items.push(order_item);
		}
		if (order_item == null)
			return false;

		// delete product or dec qty
		var new_qty = order_item.order_item_qty + qty;
		if (new_qty <= 0) {
			for (var i=0; i<this.gift_order_items.length; i++) {
				if (this.gift_order_items[i].product_id == product_id) {
					this.gift_order_items.splice(i, 1);
					break;
				}
			}
			this.gift_cart_refresh();
		}

		for (var i=0; i<this.gift_order_items.length; i++) {
			if (this.gift_order_items[i].product_id == product_id) {
				this.gift_order_items[i].order_item_qty = new_qty;
				break;
			}
		}

		this.gift_cart_refresh();
		return false;
	};

	this.gift_cart_clear = function() {
		this.gift_order_items = [];
		this.gift_cart_refresh();
	};

	this.gift_cart_done = function() {

		var items = [];
		that.gift_order_items.forEach(function(obj) {
			items.push({
				product_id: obj.product_id,
				qty: obj.order_item_qty
			});
		});

		getToken().then(token => {
		if (!token) {
			return;
		}
		
		$('#spinner').show();
		$("#new-order-pay-coin").prop("disabled", true);
		$.ajax({
			url: getCafeApiUrl('submitOrder'),
			method: 'post',
			data: {
				payment_method: PAY_METHOD_COIN,
				member_group_discount_rate: 0,
				member_group_discount_offer: 0,
				items: items,
				pc_name: thePCInfo.pc_name
			},
			dataType: 'json',
			headers: {
				'Authorization': 'Bearer ' + token
			},
			success: (result) => {
				console.log(JSON.stringify(result));
				if (result.code != 200) {
					sweetAlert("", result.message, "error");
		
					$('#spinner').hide();
					$("#new-order-pay-coin").prop("disabled", false);
					return;
				}
				toast(translate_string('Your order submitted'));
				if (result.data.pay_method == 3) {
					theShop.gift_cart_clear();
		
					$('#spinner').hide();
					$("#new-order-pay-coin").prop("disabled", false);
					return;
				}
				theShop.cart_clear();
		
				$('#spinner').hide();
				$("#new-order-pay-coin").prop("disabled", false);
			},
			error: (result) => {
				console.log(JSON.stringify(result));
				requestApiToken();
				sweetAlert("", JSON.stringify(result), "error");
		
				$('#spinner').hide();
				$("#new-order-pay-coin").prop("disabled", false);
				return;
			}
		});
		});
	};

	this.format_date = function(time) {
		var WEEKs = ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		var MONTHs = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		var d = new Date();
		if (typeof(time) != 'undefined' && time.length > 0) {
			var cols = time.split(' ');
			if (cols.length == 2) {
				var date_fields = cols[0].split('-');
				var time_fields = cols[1].split(':');
				if (date_fields.length == 3 && time_fields.length > 3)
					d = new Date(date_fields[0], date_fields[1], date_fields[2], time_fields[0], time_fields[1], time_fields[2]);
			}
		}
		return WEEKs[d.getDay() + 1].toUpperCase() + ", " + d.getDate() + " " + MONTHs[d.getMonth()+1].toUpperCase() + " " + (d.getYear() - 100);
	}
	
	this.show_topup = function()
	{	
		$('.myModalTopup input[name=promo_code]').val('');
		$('.myModalTopup #payment_qr').html('');
		$('.myModalTopup #btn-group').show();
		$('.myModalTopup').modal('show');
		$('.myModalTopup #payment_type img').hide();
		$('.myModalTopup #payment_url > div').hide();
		$('.myModalTopup #payment_qr img').show();
		$('.myModalTopup #payment_qr').show();
	}
	
	this.topup = function()
	{
		if($('.myModalTopup #topup_amount').val()<theSettings.mini_qr_payment){
			sweetAlert('', translate_string('Please input mini amount')  + ' ' + theSettings.mini_qr_payment, 'warning');
			return
		}
		$('#spinner').show();
		$('#form-topup button[type="submit"]').prop('disabled', true);
		const topupUrl = getCafeApiUrl('getTopupUrl');

		$.ajax({
			url: topupUrl,
			method: "post",
			data: {member_account: $('.myModalTopup #member_account').val(), topup_amount: $('.myModalTopup #topup_amount').val(), promo_code: $('.myModalTopup input[name=promo_code]').val(), pc_name: thePCInfo.pc_name},
			dataType: "json",
			success: (data) => {
				console.log(JSON.stringify(data));
				$('#spinner').hide();
				$('#form-topup button[type="submit"]').prop('disabled', false);
				if(typeof(data.result) == 'undefined')
				{
					sweetAlert('', translate_string('Topup failed'), 'error');
					return;
				}
				if(data.result == 0)
				{
					sweetAlert('', data.message, 'error');
					return;
				}
				if(data.result == 1)
				{
					$('.myModalTopup #payment_qr').html('');
					new QRCode(document.querySelector('.myModalTopup #payment_qr'), data.url);
					$('.myModalTopup #btn-group').hide();
					
					if(data.type== 'kaspi'){
						$('.myModalTopup #payment_type img').show()	
					}
					if(data.type == 'razorpay'){
						$('.myModalTopup #payment_qr').html('');
						$('.myModalTopup #payment_url > div').show().find("img").prop("src",data.url)
					}
					if(data.type == 'manual'){
						$('.myModalTopup #payment_qr').html('');
						let payment_manual_tip1 = translate_string('Scan and pay ');
						let payment_manual_tip2 = translate_string('Contact the staff and confirm your payment.');
						$('.myModalTopup #payment_url').html(`
							<div>
							<ol>
								<li>
								${payment_manual_tip1}<font color="red" size="3rem">${data.amount.toFixed(2)}</font>
								</li>
								<li>
								${payment_manual_tip2}
								</li>
							</ol>
							<img />
							</div>
							`)
						$('.myModalTopup #payment_url img').prop("src",data.payment_url)
					}
					if(data.type == 'paymongo'){
						$('.myModalTopup #payment_qr').html('');
						$('.myModalTopup #payment_url').html(
							`<img src="${data.payment_url}" alt="QR Code" style="width:266px" />`	
						);
					}
					if(data.type == 'midtrans'){
						$('.myModalTopup #payment_qr').html('');
						$('.myModalTopup #payment_url').html(
							`<img src="${data.payment_url}" alt="midtrans QR Code" style="width:266px" />`	
						);
					}
				}
			},
			error: (res) => {
				console.log(JSON.stringify(res));
				$('#spinner').hide();
				$('#form-topup button[type="submit"]').prop('disabled', false);
				sweetAlert('', translate_string('Topup failed'), 'error');
			}
		});
		return true;
	}
	
	/**
	 * Price calculation helper functions for credit card rate
	 */

	// Get the credit card price rate from settings
	this.getCreditCardPriceRate = function() {
		return parseFloat(theSettings.credit_card_price_rate || 100);
	}

	// Calculate price based on payment method
	this.calculatePriceByPaymentMethod = function(originalPrice, paymentMethod) {
		const rate = that.getCreditCardPriceRate();

		// If rate is 100, no difference in pricing
		if (rate === 100) {
			return originalPrice;
		}

		// For credit card payments, apply the rate
		if (paymentMethod === PAY_METHOD_CARD || paymentMethod === PAY_METHOD_CARD_FOR_OFFER) {
			return originalPrice * (rate / 100);
		}

		// For cash and balance payments, use original price
		return originalPrice;
	}

	// Get both prices (original and credit card) for display
	this.getPriceDisplay = function(originalPrice) {
		const rate = that.getCreditCardPriceRate();
		const creditPrice = originalPrice * (rate / 100);

		return {
			originalPrice: parseFloat(originalPrice),
			creditPrice: parseFloat(creditPrice),
			showBothPrices: rate !== 100,
			rate: rate
		};
	}
}

function Tax()
{
	// get sale price with tax
	this.getPriceWithTax = function(product_tax_id, price) {
		var taxs = {
			tax1_name: theSettings.tax1_name,
			tax1_percentage: theSettings.tax1_percentage,
			tax2_name: theSettings.tax2_name,
			tax2_percentage: theSettings.tax2_percentage,
			tax3_name: theSettings.tax3_name,
			tax3_percentage: theSettings.tax3_percentage,
			tax4_name: theSettings.tax4_name,
			tax4_percentage: theSettings.tax4_percentage,
			tax_included_in_price: theSettings.tax_included_in_price,
		};
		price = parseFloat(price);
		if (taxs.tax_included_in_price == 1)
			return price.toFixed(2).replace('.00', '');

		var tax_percentage = 0;
		if (product_tax_id == 1)
			tax_percentage = taxs.tax1_percentage / 100.0;
		if (product_tax_id == 2)
			tax_percentage = taxs.tax2_percentage / 100.0;
		if (product_tax_id == 3)
			tax_percentage = taxs.tax3_percentage / 100.0;
		if (product_tax_id == 4)
			tax_percentage = taxs.tax4_percentage / 100.0;

		if (tax_percentage <= 0)
			return price.toFixed(2).replace('.00', '');

		return (price * (1 + tax_percentage)).toFixed(2).replace('.00', '');
	}

	// get tax by price
	this.getTaxWithPrice = function(product_tax_id, price) {
		var taxs = {
			tax1_name: theSettings.tax1_name,
			tax1_percentage: theSettings.tax1_percentage,
			tax2_name: theSettings.tax2_name,
			tax2_percentage: theSettings.tax2_percentage,
			tax3_name: theSettings.tax3_name,
			tax3_percentage: theSettings.tax3_percentage,
			tax4_name: theSettings.tax4_name,
			tax4_percentage: theSettings.tax4_percentage,
			tax_included_in_price: theSettings.tax_included_in_price,
		};
		price = parseFloat(price);
		var tax_percentage = 0;
		if (product_tax_id == 1)
			tax_percentage = taxs.tax1_percentage / 100.0;
		if (product_tax_id == 2)
			tax_percentage = taxs.tax2_percentage / 100.0;
		if (product_tax_id == 3)
			tax_percentage = taxs.tax3_percentage / 100.0;
		if (product_tax_id == 4)
			tax_percentage = taxs.tax4_percentage / 100.0;

		if (tax_percentage <= 0)
			return 0;

		// if price include tax
		if (taxs.tax_included_in_price == 1)
			return (price / ( 1 + tax_percentage) * tax_percentage).toFixed(2);

		return (price * tax_percentage).toFixed(2);
	}
}