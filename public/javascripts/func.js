$(window).load(function() {
	var index = 0;
	$('.mask').click(function() {

		var pos = $(window).scrollTop();
		console.log()

		if (pos < $("#one").offset().top - 5) {
			$('html,body').animate({
        			scrollTop: $("#one").offset().top},
        			'slow');

			console.log(pos);
			console.log($("#one").offset().top);
		}
		else if (pos < $("#two").offset().top -5) {
			$('html,body').animate({
        			scrollTop: $("#two").offset().top},
        			'slow');
		}
		else if (pos < $("#three").offset().top - 5) {
			$('html,body').animate({
        			scrollTop: $("#three").offset().top},
        			'slow');
		}
		else if (pos < $("#four").offset().top - 5) {
			$('html,body').animate({
        			scrollTop: $("#four").offset().top},
        			'slow');
		}
		
		
	});

});