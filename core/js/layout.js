function get_payment_method_string(method) {
	if(method == PAY_METHOD_CASH || method == PAY_METHOD_CASH_FOR_OFFER || method == PAY_METHOD_CASH_FOR_PC_TIME || method == PAY_METHOD_CASH_FOR_BOOKING)
		return translate_string('Cash');
	if(method == PAY_METHOD_CARD || method == PAY_METHOD_CARD_FOR_OFFER || method == PAY_METHOD_CARD_FOR_PC_TIME || method == PAY_METHOD_CARD_FOR_BOOKING)
		return translate_string('Credit card');
	if(method == PAY_METHOD_BALANCE || method == PAY_METHOD_BALANCE_FOR_OFFER || method == PAY_METHOD_BALANCE_FOR_PC_TIME || method == PAY_METHOD_BALANCE_FOR_BOOKING)
		return translate_string('Balance');
	if(method == PAY_METHOD_COIN || method == PAY_METHOD_COIN_FOR_OFFER)
		return translate_string('Coin');
	if(method == PAY_METHOD_QR_FOR_PC_TIME)
		return translate_string('QR');
}

function getPaymentMethod(method) {
	if(get_payment_method_string(method).length > 0)
		return get_payment_method_string(method);
	return translate_string('Cash');
}

async function refresh_order_list()
{
	var payload = {
		sort_name: order_filter_params.sort_name,
		sort: order_filter_params.sort,
		search_text: order_filter_params?.search_text??"",
		page: order_filter_params.paging_info.page,
		t: Math.random()
	}

	const data = await theApiClient.callCafeApi('memberOrders', 'get', payload).catch(ICafeApiError.skip)
	if (!data) return;
	order_filter_params.paging_info = data.paging_info;
	vueOrderList.items = JSON.parse(JSON.stringify(data.orders))
	vueOrderList.paging_info = JSON.parse(JSON.stringify(data.paging_info))
}

function order_page_first() {
	order_filter_params.paging_info.page = 1;
	refresh_order_list();
}

function order_page_previous() {
	if (order_filter_params.paging_info.page > 1)
		order_filter_params.paging_info.page --;
	refresh_order_list();
}

function order_page_next() {
	if (order_filter_params.paging_info.page < order_filter_params.paging_info.pages)
		order_filter_params.paging_info.page ++;
	refresh_order_list();
}

function order_page_last(){
	order_filter_params.paging_info.page = order_filter_params.paging_info.pages;
	refresh_order_list();
}

function order_page_go(index) {
	order_filter_params.paging_info.page = index;
	refresh_order_list();
}

function order_search_post() {
	order_filter_params.search_text = $('#order-search-form input[name=search]').val();
	order_filter_params.paging_info.page = 1;
	refresh_order_list();
	return false;
}

function customer_order_list()
{
	 refresh_order_list();
	$('.myModalOrderList').modal('show');
}

function customer_balance_history()
{
	refresh_balance_history();
	$('.myModalBalanceHistory').modal('show');
}

async function refresh_balance_history()
{
	var payload = {
		page: balanceHistoryFilterParams.paging_info.page,
		t: Math.random()
	}
	const data = await theApiClient.callCafeApi('memberBalanceHistory','get',payload).catch(ICafeApiError.skip)
	if(!data)return;
	balanceHistoryFilterParams.paging_info = data.paging_info;
	vueBalanceHistory.items = JSON.parse(JSON.stringify(data.items))
	vueBalanceHistory.paging_info = JSON.parse(JSON.stringify(data.paging_info))
	vueBalanceHistory.summary = JSON.parse(JSON.stringify(data.summary))
}

function balance_history_page_first() {
	balanceHistoryFilterParams.paging_info.page = 1;
	refresh_balance_history();
}

function balance_history_page_previous() {
	if (balanceHistoryFilterParams.paging_info.page > 1)
		balanceHistoryFilterParams.paging_info.page --;
	refresh_balance_history();
}

function balance_history_page_next() {
	if (balanceHistoryFilterParams.paging_info.page < balanceHistoryFilterParams.paging_info.pages)
		balanceHistoryFilterParams.paging_info.page ++;
	refresh_balance_history();
}

function balance_history_page_last(){
	balanceHistoryFilterParams.paging_info.page = balanceHistoryFilterParams.paging_info.pages;
	refresh_balance_history();
}

function balance_history_page_go(index) {
	balanceHistoryFilterParams.paging_info.page = index;
	refresh_balance_history();
}


function lock_form_submit()
{
	$('#lockForm button[type="submit"]').prop('disabled', true);
	theLockScreenPassword = $('#lockForm input[name=password]').val();
	$('.myModalLock').modal('hide');

	CallFunction("LOCK 65535");
	CallFunction("SETWINDOWSIZE -1*-1");
	theLastWindowSize = "-1*-1";
	CallFunction("SETWINDOWTOPMOST 1");

	$('#page_lock').show();
	$('#lockForm button[type="submit"]').prop('disabled', false);
	$('#unlockForm input[name=password]').val('');
	$('#unlockForm input[name=password]').focus();

	return false;
}


function unlock_form_submit()
{
	$('#unlockForm button[type="submit"]').prop('disabled', true);
	var pwd = $('#unlockForm input[name=password]').val();
	if (pwd != theLockScreenPassword) {
		setTimeout(function() {
			sweetAlert("", translate_string("Wrong password!"), "error");
		},100);
		$('#unlockForm button[type="submit"]').prop('disabled', false);
		return false;
	}

	unlock_pc();

	return false;
}

async function feedback_form_submit()
{
	$('#spinner').show();
	$('#feedbackForm button[type="submit"]').prop('disabled', true);

	var subject = $('#feedbackForm input[name=subject]').val();
	var message = $('#feedbackForm textarea[name=message]').val();

	if (subject.length == 0) {
		sweetAlert("", translate_string("Subject can not be empty!"), "error");
		$('#spinner').hide();
		$('#feedbackForm button[type="submit"]').prop('disabled', false);
		return false;
	}

	if (message.length == 0) {
		sweetAlert("", translate_string("Message can not be empty!"), "error");
		$('#spinner').hide();
		$('#feedbackForm button[type="submit"]').prop('disabled', false);
		return false;
	}
	const token = await theApiClient.getToken()
	if(!token){
		$('.myModalFeedback').modal('hide');
		$('#spinner').hide();
		$('#feedbackForm button[type="submit"]').prop('disabled', false);
		return false;
	}
	const data = await theApiClient.callCafeApi('customerFeedback','post',{
			member_account: thePCStatus.member_account,
			subject: subject,
			message: message,
			pc_name: thePCInfo.pc_name
	}).catch(ICafeApiError.show).finally(()=>{
		$('#spinner').hide();
		$('#feedbackForm button[type="submit"]').prop('disabled', false);
	})
	if(data)
		toast(translate_string("Your feedback has been sent"));
	$('.myModalFeedback').modal('hide');
	
	return false;
}

async function change_password_form_submit()
{
	$('#spinner').show();
	$('#passwordForm button[type="submit"]').prop('disabled', true);

	var old_password = $("#passwordForm input[name=old_password]").val();
	var new_password = $("#passwordForm input[name=new_password]").val();
	var confirm_password = $("#passwordForm input[name=confirm_password]").val();

	if(old_password == '')
	{
		sweetAlert("", translate_string("Old password can not be empty!"), "error");
		$('#spinner').hide();
		$('#passwordForm button[type="submit"]').prop('disabled', false);
		return false;
	}
	if(new_password == '')
	{
		sweetAlert("", translate_string("New password can not be empty!"), "error");
		$('#spinner').hide();
		$('#passwordForm button[type="submit"]').prop('disabled', false);
		return false;
	}
	if(confirm_password == '')
	{
		sweetAlert("", translate_string("Confirm password can not be empty!"), "error");
		$('#spinner').hide();
		$('#passwordForm button[type="submit"]').prop('disabled', false);
		return false;
	}
	if(new_password != confirm_password)
	{
		sweetAlert("", translate_string("The new password and confirm password do not match!"), "error");
		$('#spinner').hide();
		$('#passwordForm button[type="submit"]').prop('disabled', false);
		return false;
	}
	const token = await theApiClient.getToken()
	if (!token) {
		$('#spinner').hide();
		$('#passwordForm button[type="submit"]').prop('disabled', false);
		$('.myModalChangePassword').modal('hide');
		return false;
	}
	const data = await theApiClient.callCafeApi('memberChangePassword', 'post', {
		old_password: old_password,
		new_password: new_password,
		member_id: thePCStatus.member_id
	}).catch(ICafeApiError.show).finally(() => {
		$('#spinner').hide();
		$('#passwordForm button[type="submit"]').prop('disabled', false);
	})
	if(data)
		sweetAlert(translate_string("Succeed"), translate_string("The password was changed successfully."), "success");
	$('.myModalChangePassword').modal('hide');

	return false;
}

function show_set_lockpassword_dialog()
{
	$('#lockForm input[name=password]').val('');
	$('.myModalLock').modal('show');
	document.getElementById('lockform_password').focus();
}

function customer_feedback()
{
	$('#feedbackForm input[name=subject]').val('');
	$('#feedbackForm textarea[name=message]').val('');

	$('.myModalFeedback').modal('show');
}

function audio_settings()
{
	theAudioSettings.setup()
	CallFunction("VOLUME");
	$('.myModalAudio').modal('show');
}

function display_settings()
{
	CallFunction("RUN control.exe desk.cpl");
}

function mouse_settings()
{
	theMouseSettings.setup()
	CallFunction("MOUSE_DOUBLE_CLICK_SPEED")
	CallFunction("MOUSE_MOVE_SPEED")
	CallFunction("MOUSE_SMOOTHNESS")
	$(".myModalMouse").modal("show")
}

function change_password_click()
{
	$('#passwordForm input[name=member_account]').val(thePCStatus.member_account);
	$('#passwordForm input[name=old_password]').val('');
	$('#passwordForm input[name=new_password]').val('');
	$('#passwordForm input[name=confirm_password]').val('');

	$('.myModalChangePassword').modal('show');
}

function ConvertToMember()
{
	this.init = function() {
		vueGlobal.menuButton.convertToMember = false;
		let license_convert_to_member_enable = typeof(theSettings.license_convert_to_member_enable) != 'undefined' ? theSettings.license_convert_to_member_enable : 0;
		if (license_convert_to_member_enable && is_logined() && (thePCStatus.member_group_id === MEMBER_GROUP_GUEST || thePCStatus.member_group_id === MEMBER_GROUP_PREPAID || thePCStatus.member_group_id === MEMBER_GROUP_OFFER))
			vueGlobal.menuButton.convertToMember = true;	
	}

	this.show = function() {
		$("#form-convert-member input[name=account]").val('');
		$("#form-convert-member input[name=birthday]").val('');
		$("#form-convert-member input[name=password]").val('');
		$("#form-convert-member input[name=confirm_password]").val('');
		$("#form-convert-member input[name=first_name]").val('');
		$("#form-convert-member input[name=last_name]").val('');
		$("#form-convert-member input[name=phone]").val('');
		$("#form-convert-member input[name=email]").val('');
		$('#form-convert-member button[type="submit"]').prop('disabled', false);
		$('.myModalConvertMember').modal('show');
	}

	this.submit = async function() {
		var account = $("#form-convert-member input[name=account]").val();
		var birthday = $("#form-convert-member input[name=birthday]").val();
		var password = $("#form-convert-member input[name=password]").val();
		var confirm_password = $("#form-convert-member input[name=confirm_password]").val();
		var first_name = $("#form-convert-member input[name=first_name]").val();
		var last_name = $("#form-convert-member input[name=last_name]").val();
		var phone = $("#form-convert-member input[name=phone]").val();
		var email = $("#form-convert-member input[name=email]").val();

		if(account.length === 0) {
			sweetAlert("", translate_string("Account can not be empty!"), "error");
			return false;
		}
		if(password.length === 0) {
			sweetAlert("", translate_string("Password can not be empty!"), "error");
			return false;
		}
		if(confirm_password.length === 0 || password != confirm_password) {
			sweetAlert("", translate_string("The new password and confirm password do not match!"), "error");
			return false;
		}
		if(first_name.length === 0) {
			sweetAlert("", translate_string("First name can not be empty!"), "error");
			return false;
		}
		if(last_name.length === 0) {
			sweetAlert("", translate_string("Last name can not be empty!"), "error");
			return false;
		}

		$('#form-convert-member button[type="submit"]').prop('disabled', true);
		$('#spinner').show();
		
		let token = await theApiClient.getToken()
		if (!token) {
			$('#spinner').hide();
			$('#form-convert-member button[type="submit"]').prop('disabled', false);
			$('.myModalConvertMember').modal('hide');
			return;
		}
		await theApiClient.callCafeApi('convertToMember', 'POST', {
			account: account,
			birthday: birthday,
			password: password,
			first_name: first_name,
			last_name: last_name,
			phone: phone,
			email: email,
			pc_name: thePCInfo.pc_name
		}).catch(ICafeApiError.show).finally(() => {
			$('#spinner').hide();
			$('#form-convert-member button[type="submit"]').prop('disabled', false);
		})
		$('.myModalConvertMember').modal('hide');

	}
	
	ICAFEMENU_CORE.onWss('convert_to_member', packet => {
		$('#spinner').hide();
		$('#form-convert-member button[type="submit"]').prop('disabled', false);

		if (packet.status == 'error') {
			sweetAlert("", translate_string(packet.data.message), "error");
			return;
		}
		$('.myModalConvertMember').modal('hide');
	})

}