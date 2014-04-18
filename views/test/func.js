$(window).load(function() {
	var index = 0;
	$('body').click(function() {
		switch(index) {
			case 3:
				$('#two').css('top', '-100%');
				$('#three').css('top', '0%');
				index++;
			break;
			case 2:
				$('#one').css('top', '-100%');
				$('#two').css('top', '0%');
				index++;
			break;
			case 1:
				$('#intro').css('top', '-100%');
				$('#one').css('top', '0%');
				index++;
				break;
			case 0:
				$('#intro').css('top', '0%');
				index++;
		}	
		
		
	});
});