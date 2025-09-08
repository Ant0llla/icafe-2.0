function is_logined()
{
	return typeof(thePCStatus.member_account) != 'undefined' && thePCStatus.member_account != null && thePCStatus.member_account.length > 0;
}


function is_member_logined()
{
	return is_logined() && thePCStatus.member_group_id >  MEMBER_GROUP_GUEST;
}

function stop_login_timers()
{
	if (theIdleMonitorTimerId != null) {
		clearTimeout(theIdleMonitorTimerId);
		theIdleMonitorTimerId = null;
	}

	if (theIdleMiningTimerId != null) {
		clearTimeout(theIdleMiningTimerId);
		theIdleMiningTimerId = null;
	}

	if (theMonitorTurnOffIntervalId != null) {
		clearInterval(theMonitorTurnOffIntervalId);
		theMonitorTurnOffIntervalId = null;
	}
}

async function guest_login()
{
	const data = await theApiClient.callCafeApi('clientMemberRegister','POST',{pc_name: thePCInfo.pc_name}).catch(ICafeApiError.show)
	if(theSettings.license_using_billing == 0){
		return;
	}
}

function TopupLogin() {

	var that = this;
	this.show_topup_login = function () {
		$('.myModalTopupLogin .modal-footer').css('display', '');
		$('.myModalTopupLogin #login_payment_qr').html('');
		$('.myModalTopupLogin input[name=promo_code]').val('');
		$('.myModalTopupLogin').modal('show');
		$('.myModalTopupLogin #login_payment_type img').hide();
		$('.myModalTopupLogin #login_payment_url > div').hide();
		$('.myModalTopupLogin #login_payment_qr img').show();
		$('.myModalTopupLogin #login_payment_qr').show();
	}

	this.create_topup_qrcode = function () {
		const topup_memeber_email = $('.myModalTopupLogin input[name=topup_memeber_email]').val();
		const topup_login_amount = $('.myModalTopupLogin input[name=topup_login_amount]').val();
		const promo_code = $('.myModalTopupLogin input[name=promo_code]').val();
		
		if(topup_memeber_email == '') {
			sweetAlert('', translate_string('please input email'), 'warning');
		}

		if(topup_login_amount == '') {
			sweetAlert('', translate_string('please input amount'), 'warning');
		}

		if(topup_login_amount<theSettings.mini_qr_payment){
			sweetAlert('', translate_string('Please input mini amount')  + ' ' + theSettings.mini_qr_payment, 'warning');
			return
		}
		that.addGuest(topup_memeber_email, topup_login_amount, promo_code);

		return true;
	}
	
	this.addGuest =  async function (topup_memeber_email, topup_login_amount, promo_code) {
		// const addGuestUrl = "https://" + theSettings.license_info.license_server_code + ".icafecloud.com/api/v2/cafe/"+theCafe.id+"/memberAddGuest";
		$('#spinner').show();
		$('.myModalTopupLogin button[type="submit"]').prop('disabled', true);
		const data = await theApiClient.callCafeApi('memberAddGuest','POST',{
			topup_amount: topup_login_amount,
			member_email: topup_memeber_email,
			pc_name: thePCInfo.pc_name
		}).catch(ICafeApiError.show).finally(()=>{
			$('#spinner').hide();
			$('.myModalTopupLogin button[type="submit"]').prop('disabled', false);
		})
		if(!data)
			return null;
		const member_account = data?.member_account
		const reqData = { 
			member_account: member_account, 
			topup_amount: topup_login_amount, 
			promo_code: promo_code,
			pc_name: thePCInfo.pc_name 
		};

		return that.topup(reqData);

	}

	this.topupTimeCalculate = ICAFEMENU_CORE.debounce(async function () {
		const reqData = {
			pc_name: thePCInfo.pc_name,
			member_account: $('.myModalTopup #member_account').val(),
			mins: $('#topup_time').val()
		}
		if (reqData['mins'] == '' || reqData['mins'] == null || reqData['mins'] == 0) {
			return
		}
		if (reqData['member_account'] == '')
			return;

		$('#spinner').show();
		const data = await theApiClient.callCafeApi('calculate/amount', 'POST', reqData)
			.catch(ICafeApiError.skip).finally(() => $('#spinner').hide())
		if (data) {
			$('#topup_amount').val(data.cost)
		}

	}, 1_000)

	this.topupAmountCalculate = ICAFEMENU_CORE.debounce(async function () {
		const reqData = {
			pc_name: thePCInfo.pc_name,
			member_account: $('.myModalTopup #member_account').val(),
			topup_amount: $('#topup_amount').val()
		}
		if (reqData['topup_amount'] == '' || reqData['topup_amount'] == null || reqData['topup_amount'] == 0) {
			return
		}
		if (reqData['member_account'] == '')
			return;
		// let calTimeUrl = "https://" + theSettings.license_info.license_server_code + ".icafecloud.com/api/v2/cafe/"+theCafe.id+"/calculate/time";
		const data = await theApiClient.callCafeApi('calculate/time', 'post', reqData).catch(ICafeApiError.skip)
		if(data){
			$('#topup_time').val(data.minutes)
		}

	}, 1_000)

	this.topupLoginTimeCalculate = ICAFEMENU_CORE.debounce(async function () {
		const reqData = {
			pc_name: thePCInfo.pc_name,
			member_account: 'Guest',
			mins: $('#topup_login_time').val()
		}
		if (reqData['mins'] == '' || reqData['mins'] == null || reqData['mins'] == 0) {
			return
		}
		const data = await theApiClient.callCafeApi('calculate/amount', 'POST', reqData).catch(ICafeApiError.skip)
		if(data){
			$('#topup_login_amount').val(data.cost)
		}

	}, 1_000)


	this.topupLoginAmountCalculate = ICAFEMENU_CORE.debounce(async function () {
		const reqData = {
			pc_name: thePCInfo.pc_name,
			member_account: 'Guest',
			topup_amount: $('#topup_login_amount').val()
		}
		if (reqData['topup_amount'] == '' || reqData['topup_amount'] == null || reqData['topup_amount'] == 0) {
			return
		}
		const data = await theApiClient.callCafeApi('calculate/time', 'POST', reqData).catch(ICafeApiError.skip)
		if(data){
			$('#topup_login_time').val(data.minutes)
		}

	}, 1_000)

	this.topup = async function (reqData) {
		if($('.myModalTopupLogin #topup_amount').val()<theSettings.mini_qr_payment){
			sweetAlert('', translate_string('Please input mini amount')  + ' ' + theSettings.mini_qr_payment, 'warning');
			return
		}
		$('.myModalTopupLogin .modal-footer').css('display', 'none');
		$('#spinner').show();
		const data = await theApiClient.callCafeApi('getTopupUrl','POST',reqData).catch(ICafeApiError.show).finally(()=>$('#spinner').hide())
		
		if(data?.result == 0)
		{
			sweetAlert('', data.message, 'error');
			return;
		}
		if(data.result == 1)
		{
			$('.myModalTopupLogin #login_payment_qr').html('');
			new QRCode(document.querySelector('.myModalTopupLogin #login_payment_qr'), data.url);
			$('.myModalTopupLogin #btn-group').hide();
			
			$('.myModalTopupLogin #login_payment_qr img').show()
			$('.myModalTopupLogin #login_payment_type img').hide()
			$('.myModalTopupLogin #login_payment_url > div').hide()
			
			if(data.type == 'kaspi'){
				$('.myModalTopupLogin #login_payment_type img').show()	
			}
			if(data.type == 'razorpay'){
				$('.myModalTopupLogin #login_payment_qr').html('');
				$('.myModalTopupLogin #login_payment_url > div').show()
				$('.myModalTopupLogin #login_payment_url > div img').prop("src",data.url)
			}
			if(data.type == 'manual'){
				let payment_manual_tip1 = translate_string('Scan and pay ');
				let payment_manual_tip2 = translate_string('Contact the staff and confirm your payment.');
				$('.myModalTopupLogin #login_payment_qr').html('');
				$('.myModalTopupLogin #login_payment_url').html(`<div>
					<ol>
						<li>
						${payment_manual_tip1}<font color="red" size="3rem">${data.amount.toFixed(2)}</font>
						</li>
						<li>
						${payment_manual_tip2}
						</li>
					</ol>
					<img />
					</div>`)
					$('.myModalTopupLogin #login_payment_url img').prop("src",data.payment_url)
			}
			if(data.type == 'paymongo'){
				$('.myModalTopupLogin #login_payment_qr').html('')
				$('.myModalTopupLogin #login_payment_url').html(
					`<img src="${data.payment_url}" alt="QR Code" style="width:266px" />`	
				)
			}
			if(data.type == 'midtrans'){
				$('.myModalTopupLogin #login_payment_qr').html('')
				$('.myModalTopupLogin #login_payment_url').html(
					`<img src="${data.payment_url}" alt="midtrans QR Code" style="width:266px" />`	
				)
			}
		}
	}
}

const homecafeid_form_submit = ICAFEMENU_CORE.debounce(function ()
{
	$('#spinner').show();
	$('#loginForm button[type="submit"]').prop('disabled', true);
	ICAFEMENU_CORE.callFun('HOMESETCAFEID ' + $('#homecafeidForm input[name=icafe_id]').val());
})

async function login_form_submit()
{
	var strUserName = $('#loginForm input[name=username]').val();
	var strPassword = $('#loginForm input[name=password]').val();
	var licenseName = theCafe.license_name;

	if (strUserName.length == 0 || strPassword.length == 0)
		return;

	$('#spinner').show();
	change_login_form_state(true);
	
	console.log('login form submit');
	// const memberLoginUrl = "https://" + theSettings.license_info.license_server_code + ".icafecloud.com/api/v2/auth/memberLogin";
	const data = await theApiClient.memberLogin(strUserName, null, strPassword, licenseName, thePCInfo.pc_name).catch(ICafeApiError.show);
	if(!data)
	{
		$('#spinner').hide();
		change_login_form_state(false);
		return;
	}

	vueGlobal.showOrderList = true;
	// 判断当前是否已登录, 如果已登录, 则先清空thePcStatus
	if (is_logined()) {
		thePCStatus = { member_account: '' };
	}
	await theApiClient.callCafeApi('clientStartSession','POST',{
		member_account: strUserName,
		pc_name: thePCInfo.pc_name,
	}).catch(ICafeApiError.show);

	$('#spinner').hide();
	change_login_form_state(false);
}

async function admin_exit_form_submit() {
	$('#spinner').show();
	$('#adminexitForm button[type="submit"]').prop('disabled', true);
	$('#adminexitForm input[type="password"]').prop('disable', true);

	var password = $("#adminexitForm input[name=password]").val();
	if (password.length == 0) {
		$('#spinner').hide();
		$('#adminexitForm button[type="submit"]').prop('disabled', false);
		$('#adminexitForm input[type="password"]').prop('disable', false);
		$('#adminexitForm input[type="password"]').addClass('border-warning');
		return false;
	}

	if (theSettings.admin_password != (theSettings.admin_password.charAt(0) == '*' ? '*' + sha256('*' + sha256(password)) : sha256(md5(password)))) {
		setTimeout(function () {
			sweetAlert("", translate_string("Wrong password!"), "error");
		}, 100);
		$('#spinner').hide();
		$('#adminexitForm button[type="submit"]').prop('disabled', false);
		$('#adminexitForm input[type="password"]').prop('disable', false);
		$('#adminexitForm input[type="password"]').addClass('border-warning');
		return false;
	}

	const data = await theApiClient.callApi(theApiClient.getServerUrl('auth/guestLogin'), 'POST', {
		license_name: theCafe.license_name,
		pc_name: thePCInfo.pc_name,
		is_client: 1,
	}, {timeout: 5000}).catch(ICafeApiError.skip);
	
	if(data)
	{
		await theApiClient.callCafeApi('syslog', 'post', {
				pc_name: thePCInfo.pc_name,
				event: 'ADMINEXIT',
			}, { timeout: 5000 }).catch(ICafeApiError.skip);
	}
	
	$('#spinner').hide();
	$('#adminexitForm button[type="submit"]').prop('disabled', false);
	$('#adminexitForm input[type="password"]').prop('disable', false);

	ICAFEMENU_CORE.unlock_all()
	ICAFEMENU_CORE.callFun("EXIT");

	return false;
}

function confirm_checkout_submit()
{
	$('.myModalConfirmCheckout button[type="submit"]').prop('disabled', true);

	$('.myModalConfirmCheckout').modal('hide');

	if (theIsHomeVersion) {
		var cmd = {
			action: 'request_checkout',
			version: 2,
			type: 'request',
			from: 'client',
			target: 'wss-server',
			data: {
				member_recent_played: theGameList.member_recent_played, source: "client"
			}};
		ICAFEMENU_CORE.callFun('WSSSEND ' + JSON.stringify(cmd));
		// FIXME after upgrade process_wss_package
		process_wss_package({ action: 'client_status', version: 2, type: 'request', from: 'wss-server', target: 'client', status: 'success', data: {client_status: { member_account: '' }}});
		return;
	}

	if (!theWssLogined) {
		toast(translate_string("Cannot send checkout request, please contact admin"));
		$('.myModalConfirmCheckout button[type="submit"]').prop('disabled', false);
		return false;
	}

	if (is_logined() && thePCStatus.member_group_id == MEMBER_GROUP_POSTPAID)
		toast(translate_string("This session needs to check out from server, please contact admin."));

	var cmd = {
		action: 'request_checkout',
		version: 2,
		type: 'request',
		from: 'client',
		target: 'wss-server',
		data: {
			member_recent_played: theGameList.member_recent_played, source: "client"
		}};
	console.log(JSON.stringify(cmd));
	
	ICAFEMENU_CORE.callFun('WSSSEND ' + JSON.stringify(cmd));
	$('.myModalConfirmCheckout button[type="submit"]').prop('disabled', false);

	return false;
}

function close_click() {
	ICAFEMENU_CORE.unlock_all()
	ICAFEMENU_CORE.callFun("EXIT");
}

function MemberLogin() {

	this.show_dialog = function () {
		$('.myModalMemberLogin #member_login').html('');
		var memberLoginUrl = "https://cp.icafecloud.com/shop/"+theCafe.license_name+"?dType=openDevice&dName="+thePCInfo.pc_name;
		if(theSettings.license_info.license_server_code == 'dev') {
			memberLoginUrl = "https://dev.icafecloud.com/shop/"+theCafe.license_name+"?dType=openDevice&dName="+thePCInfo.pc_name;
		}
		new QRCode(document.querySelector('.myModalMemberLogin #member_login'), memberLoginUrl);
		$('.myModalMemberLogin').modal('show');
	}

}

function MemberRegister() {

	this.show_dialog = function () {
		$('.myModalQRMemberRegister #member_register').html('');
		var memberRegisterUrl = "https://cp.icafecloud.com/shop/"+theCafe.license_name+"?dType=openDevice&dName="+thePCInfo.pc_name+"&icafe_id="+theCafe.id+"&request_type=register";
		if(theSettings.license_info.license_server_code == 'dev') {
			memberRegisterUrl = "https://dev.icafecloud.com/shop/"+theCafe.license_name+"?dType=openDevice&dName="+thePCInfo.pc_name+"&icafe_id="+theCafe.id+"&request_type=register";
		}
		new QRCode(document.querySelector('.myModalQRMemberRegister #member_register'), memberRegisterUrl);
		$('.myModalQRMemberRegister').modal('show');
	}

	this.show_client_register = function () {
		var register_agreement_enable = theSettings.register_agreement_enable ?? 0;
		var club_rules = theSettings.club_rules ?? '';
		var privacy_policy = theSettings.privacy_policy ?? '';

		if (register_agreement_enable == 0) {
			$('#form-register-member button[type="submit"]').prop("disabled", false);
			$('#club-rule-agreement-row').hide();
			$('#personal-data-agreement-row').hide();

			$('.myModalRegisterMember').modal('show');
			return;
		}
		
		$('#club_rules_content').html(club_rules);
		$('#personal_data_content').html(privacy_policy);

		$('.myModalRegisterMember').modal('show');
	}

	this.show_club_rules = function () {
		$('.clubRulesModal').modal('show');
	}

	this.show_personal_data = function () {
		$('.personalDataModal').modal('show');
	}

	this.agreement_check = function () {
		var club_rules_checked = $('#club-rule-agreement').prop('checked');
		var personal_data_checked = $('#personal-data-agreement').prop('checked');

		if (club_rules_checked && personal_data_checked) {
			$('#form-register-member button[type="submit"]').prop("disabled", false);
			return;
		}
		
		$('#form-register-member button[type="submit"]').prop("disabled", true);
	}
}

function member_register()
{
	const theIsSmsSwitch = theSettings.sms_enable ?? false;
	var account = $("#form-register-member input[name=account]").val();
	var birthday = $("#form-register-member input[name=birthday]").val();
	var password = $("#form-register-member input[name=password]").val();
	var confirm_password = $("#form-register-member input[name=confirm_password]").val();
	var first_name = $("#form-register-member input[name=first_name]").val();
	var last_name = $("#form-register-member input[name=last_name]").val();
	var phone = $("#form-register-member input[name=phone]").val();
	var email = $("#form-register-member input[name=email]").val();
	var promo_code = $("#form-register-member input[name=promo_code]").val();
	var member_sms_code = $("#form-register-member input[name=member_sms_code]").val();
	
	if (theIsSmsSwitch == 1) {//等于1表示开启手机短信验证
		var code = $("#form-register-member input[name=code]").val();
	}
	if(password != confirm_password) {
		sweetAlert("", translate_string("The new password and confirm password do not match!"), "error");
		return false;
	}

	const subCallForm = function () {
		$('#form-register-member button[type="submit"]').prop('disabled', true);
		$('#spinner').show();
		theApiClient.callCafeApi('clientMemberRegister','POST',{
				pc_name: thePCInfo.pc_name,
				account: account,
				birthday: birthday,
				password: password,
				first_name: first_name,
				last_name: last_name,
				phone: phone,
				email: email,
				promo_code: promo_code
			}).then(()=>{
				sweetAlert("", translate_string("Succeed"), "success");
			}).catch(ICafeApiError.show).finally(()=>{
				$('#spinner').hide();
				$('#form-register-member button[type="submit"]').prop('disabled', false);
			})
	}
	if (theIsSmsSwitch == 1) {//等于1表示开启手机短信验证
		if (!member_sms_code) {
			sweetAlert("", translate_string("Please enter the SMS verification code!"), "error");
			return false;
		} else {
			// 输入的code发起对比是否一致
			SmsClassFun.verifySmscode(function (result) {
				if (result.code && result.code == 200) {
					subCallForm();
				} else {
					sweetAlert("", translate_string(result && result.message ? result.message : 'SMS verification code mismatch'), "error");
					return false;
				}
			})
		}
	} else {
		subCallForm();
	}
}

// sub_div => login, member_register, admin_exit
function show_login_page(sub_div)
{
	ICAFEMENU_CORE.callFun("LOCK 65535");

	ICAFEMENU_CORE.resizeWin("-1*-1");
	ICAFEMENU_CORE.callFun("SETWINDOWTOPMOST 1");

	var MONTHs = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var d = new Date();
	var current_month = d.getMonth();
	var current_year = d.getFullYear();

	var last_month = current_month-1;
	var last_year = current_year;
	if (last_month < 0) {
		last_month = 11;
		last_year -= 1;
	}

	if((theSettings.client_login_format ?? 0) == 0)
	{
		$('body').css({'background-image': `url('${ICAFEMENU_CORE.posters_path('cafe_info_cafe_login.jpg')}'), url('images/games.jpg')`});
		theVideo.hide();
	}
	else
	{
		$('body').css({'background-image': ''});
		theVideo.play(ICAFEMENU_CORE.root_path(theSettings.client_login_video ?? ''));
	}
	// $('#loginForm input[name=username]').prop('disabled', !theWssLogined);
	// $('#loginForm input[name=password]').prop('disabled', !theWssLogined);
	$('#loginForm input[name=username]').val('');
	$('#loginForm input[name=password]').val('');
	var opacity = 1.0;
	if (!theWssLogined)
		opacity = 0.5;
	// $('#loginForm button').css({opacity: opacity});

	if (theIsHomeVersion)
		$('#loginForm input[name=username]').val(thePCInfo.pc_name);
	else
		$('#page_login .pc_name').html(thePCInfo.pc_name);

	$('.myModalBuy').modal('hide');
	$('.myModalLockPassword').modal('hide');
	$('.myModalChangePassword').modal('hide');
	$('.myModalConfirmCheckout').modal('hide');
	$('.myModalFeedback').modal('hide');
	$('.myModalRunGame').modal('hide');
	$('.myModalConvertMember').modal('hide');
	$('.myModalBalanceHistory').modal('hide');
	$('#page_games').removeClass('d-flex').hide();
	$('#page_login').removeClass('d-none').show();

	$('#page_login .loginDiv').hide();
	$('#page_login .registerDiv').hide();
	$('#page_login .adminexitDiv').hide();
	$('#page_login .homecafeidDiv').hide();

	if (sub_div == 'login') {
		$('#page_login .loginDiv').show();
		document.getElementById('username').focus();
	}

	if (sub_div == 'admin_exit') {
		$('#adminexitForm input[name=password]').val('');
		$('#page_login .adminexitDiv').show();
		$('#adminexitForm input[type="password"]').removeClass('border-warning').focus();
	}

	set_monitor_turn_off_timeout(thePCInfo.pc_turn_off_monitor_seconds);

	unlock_pc();
}

// 获取用户信息
function getMemberInfo()
{
	return theApiClient.getMemberInfo() || {}
}

function show_login_by_no_token()
{
	show_login_page('login');
}

function change_login_form_state(type)
{
	$('#loginForm input[name=username]').prop('disabled', type);
	$('#loginForm input[name=password]').prop('disabled', type);
	$('#loginForm button[type="submit"]').prop('disabled', type);
}


function ForgotPassword() {
	var that = this;
	this.phone_number = '';
	this.member_account = '';

	this.show_dialog = function () {
		that.phone_number = '';

		$('#form-forgot-password input[name=phone_number]').val('');

		$('.myModalForgotPassword').modal('show');
	}

	this.submit_form = function() {
		return that.verify_phone_number();
	}

	this.verify_phone_number = function() {
		var phone_number = $('#form-forgot-password input[name=phone_number]').val();

		if (!phone_number) {
			sweetAlert('', translate_string('Please enter your phone number'), 'error');
			return false;
		}

		that.phone_number = phone_number;

		const memberCheckUrl = getCafeApiUrl('memberResetPwd', 'auth');
		$.ajax({
			url: memberCheckUrl,
			method: "post",
			dataType: 'json',
			data: {
				phone_number: phone_number,
				license_name: theCafe.license_name,
				apwd: theSettings.admin_password,
			},
			dataType: "json",
			success: (data) => {
				if (data.code === 200) {
					sweetAlert("", translate_string("Succeed"), "success");
				} else {
					sweetAlert('', data.message, 'error');
				}
			},
			error: (result) => {
				sweetAlert('', translate_string('Failed to verify phone number'), 'error');
			}
		});

		return false;
	}
}