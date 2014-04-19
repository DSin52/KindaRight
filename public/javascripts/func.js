$(window).load(function() {
	var index = 0;
	$('body').click(function() {
		switch(index) {
			case 3:
				$('html,body').animate({
        			scrollTop: $("#four").offset().top},
        			'slow');
				index = 0;
			break;
			case 2:
				$('html,body').animate({
        			scrollTop: $("#three").offset().top},
        			'slow');
				index++;
			break;
			case 1:
				$('html,body').animate({
        			scrollTop: $("#two").offset().top},
        			'slow');
				index++;
				break;
			case 0:
				$('html,body').animate({
        			scrollTop: $("#one").offset().top},
        			'slow');
				index++;
				break;
			default:
				$('html,body').animate({
        			scrollTop: $("#intro").offset().top},
        			'slow');
				index = 0;
				break;

		}	
		
		
	});
});