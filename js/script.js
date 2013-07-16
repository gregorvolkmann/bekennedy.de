// var $video = $("#videoframe");
var w = 4;
var h = 3;
var progressbarWidth = $('.nav-progressbg').first().width();

// Video
function playVideo(v, $f) {
	if(v != null) {
		// load video
		$f.attr("src", "vid/" + v + ".mp4");
		$f[0].load();
	}
	
	showFrame($f);
	
	if($f.get(0).paused) {
		$f.get(0).play();
	}
}

function pauseVideo($f) {
	if($f && !$f.get(0).paused) {
		$f.get(0).pause();
	}
}

function showFrame($f) {
	if($f.is(':hidden')) {
		$f.css("margin-left", ($(document).width() - $f.height() / h * w) / 2);
		$f.show();
		$("#frame-closebutton").show();
		
		$("#nav").animate({bottom: -$("#nav").height()});
	}
}

function hideFrame($f) {
	if($f.is(':visible')) {
		$f.hide();
		$("#frame-closebutton").hide();
		pauseVideo();
		
		$("#content > *").animate({opacity: 1});
		$("#nav").animate({bottom: 0});
	}
}

function submitAnswer() {
	console.log($("input[name=answer]:radio:checked").val());
	if($("input[name=answer]:radio:checked").val()) {
		showFrame($("#answerframe"));
		$("#quiz-modal").modal("hide");
		hideFrame($("#videoframe"));
		
		if($("#answerframe").get(0).paused) {
			$("#answerframe").get(0).play();
		}
	} else {
		alert("Bitte wählen Sie Ihren nächsten Schritt.");
	}
}

// Navigation

function resetNav() {
	$("#nav").children().removeClass("active");
	$(".nav-progress").width(0);
}

function navigate(e) {
	e.parent().prevAll().addClass("active");
	e.parent().prevAll().children().children(".nav-progress").width(progressbarWidth);
	e.parent().nextAll().removeClass("active");
	e.parent().nextAll().children().children(".nav-progress").width(0);
	e.parent().addClass("active");
	e.children(".nav-progress").width(0);
}

function toggleMute() {
	$("#videoframe").prop('muted', !$("#videoframe").prop('muted'));
	$("#answerframe").prop('muted', !$("#videoframe").prop('muted'));
	$("#audio a").toggleClass("muted");
}


$(document).ready(function() {
	// init
	$.get("info/ausstellung.html", function(data){
		$("#info-modal .modal-body").html(data);
	});

	$("#info-modal").on('show', function() {
		$("#content > *").animate({opacity: 0});
		pauseVideo();
	});
	
	$("#info-modal").on('hide', function() {
		if($("#videoframe").is(':hidden') && $("#answerframe").is(':hidden')) {
			resetNav();
		} else {
			// activate video nav element
		}
	});

	$("#info-modal").on('hidden', function() {
		if($("#videoframe").is(':visible')) {
			$("#videoframe").get(0).play();
		} else if($("#answerframe").is(':visible')) {
			$("#answerframe").get(0).play();
		} else {
			$("#content > *").animate({opacity: 1});
		}
	});
	
	// nav
	// nav-progress handling
    $("#videoframe").bind("timeupdate", videoTimeUpdateHandler);
    function videoTimeUpdateHandler(e) {
        var video = $("#videoframe").get(0);
        var percent = video.currentTime / video.duration;
        updateProgressWidth(percent);
    }
    function updateProgressWidth(percent) {
        $(".active").last().children().children(".nav-progress").width(percent * progressbarWidth);
    }

	$("#nav li a, #postcardwrap a").click(function() {
		if(!$(this).hasClass("novideo")) {
			navigate($(this));
			playVideo($(this).attr('href').substring(1), $("#videoframe"));
			if($("#info-modal").is(':visible')) {
				$("#info-modal").modal('hide');
			}
		}
	});
	
	$("#info-nav a").click(function() {
		$("#info-nav a").removeClass("active");
		$(this).addClass("active");
		$.get("info/" + $(this).attr("id").substring(5) + ".html", function(data){
			$("#info-modal .modal-body").html(data);
		});
	});
	
	$("#videoframe").on("ended", function() {
		var videoNumber = $("#videoframe").attr("src").substring(9, 10);
		$.get("quiz/question" + videoNumber + ".html", function(data){
			$("#quiz-modal .modal-header #question").html(data);
		});
		$.get("quiz/answers" + videoNumber + ".html", function(data){
			$("#quiz-modal #answerButton").before(data);
			
			$("input[name=answer]:radio").change(function() {
				$("#answerframe").attr("src", "vid/video" + videoNumber + "/answer" + $(this).val() + ".mp4");
				$("#answerframe")[0].load();
			});
		});
		$("#quiz-modal").modal("show");
	});
});