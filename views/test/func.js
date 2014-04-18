$(window).load(function() {
	var index = 0;
	$('body').click(function() {
		switch(index) {
			case 2:
				$('body').animate({
			        scrollTop: $("#three").offset().top},
			        'slow');
				index++;
			break;
			case 1:
				$('body').animate({
			        scrollTop: $("#two").offset().top},
			        'slow');
				index++;
				break;
			case 0:
				$('body').animate({
			        scrollTop: $("#one").offset().top},
			        'slow');
				index++;
		}			
	});
});