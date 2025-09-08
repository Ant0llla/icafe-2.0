function translate_string(eng)
{
	eng = eng.toString();
	
	if(eng.length == 0)
		return '';

	var eng_lower = eng.toLowerCase();

	if(typeof(theLangStrings) != 'undefined' && typeof(theLangStrings[eng_lower]) != 'undefined')
		return theLangStrings[eng_lower];
	
	return eng;
}

// translate all childs with lang class for DOM => translate_obj($('body')),  translate_obj($('#member-table'))
function translate_obj(object)
{
	if (typeof(object) !== 'object')
		return '';

	object.find('.lang').each(function(index, obj) {

		// translate inner html
		if ($(this).children().length == 0) {
			var eng = $(this).html().trim();
			var trans = translate_string(eng);
			if (trans.length > 0 && eng != trans)
				$(this).text(trans); // 避免vue render 的时候与vue变量冲突
		}

		// translate title
		if ($(this).attr('title')) {
			var eng = $(this).attr('title').trim();
			var trans = translate_string(eng);
			if (trans.length > 0 && eng != trans)
				$(this).attr('title', trans);
		}

		// translate placeholder
		if ($(this).attr('placeholder')) {
			var eng = $(this).attr('placeholder').trim();
			var trans = translate_string(eng);
			if (trans.length > 0 && eng != trans)
				$(this).attr('placeholder', trans);
		}

		// translate value
		if ($(this).is('input') && ($(this).attr('type') == 'button' || $(this).attr('type') == 'submit')) {
			var eng = $(this).attr('value').trim();
			var trans = translate_string(eng);
			if (trans.length > 0 && eng != trans)
				$(this).attr('value', trans);
		}

	});
}
