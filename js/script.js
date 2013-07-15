// var $video = $("#videoframe");
var w = 4;
var h = 3;
var barWidth = $('.nav-progressbg').first().width();

// Video

function centerVideoFrame() {
	// setup videoframe
	// $("#videoframe").height($(document).height() - $('#nav').height());
	// center videoframe
	$("#videoframe").css("margin-left", ($(document).width() - $("#videoframe").height() / h * w) / 2);
}

function playVideo(v) {
	if(v) {
		// load video
		$("#videoframe").attr("src", "vid/" + v + ".mp4");
		$("#videoframe")[0].load();
	}
	
	showVideoframe();
	
	if($("#videoframe").get(0).paused) {
		$("#videoframe").get(0).play();
	}
}

function pauseVideo() {
	if(!$("#videoframe").get(0).paused) {
		$("#videoframe").get(0).pause();
	}
}

function showVideoframe() {
	if($("#videoframe").is(':hidden')) {
		centerVideoFrame();
		$("#videoframe").show();
		$("#video-closebutton").show();
		
		$("#navwrap").animate({bottom: -$("#nav").height()});
	}
}

function hideVideoframe() {
	if($("#videoframe").is(':visible')) {
		$("#videoframe").hide();
		$("#video-closebutton").hide();
		pauseVideo();
		
		$("#content > *").animate({opacity: 1});
		$("#navwrap").animate({bottom: 0});
	}
}

// Navigation

function resetNav() {
	$("#nav").children().removeClass("active");
	$(".nav-progress").width(0);
}

function navigate(e) {
	e.parent().prevAll().addClass("active");
	e.parent().prevAll().children().children(".nav-progress").width(barWidth);
	e.parent().nextAll().removeClass("active");
	e.parent().nextAll().children().children(".nav-progress").width(0);
	e.parent().addClass("active");
	e.children(".nav-progress").width(0);
}

function toggleMute(e) {
	$("#videoframe").prop('muted', !$("#videoframe").prop('muted'));
	e.toggleClass("muted");
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
		if($("#videoframe").is(':hidden')) {
			resetNav();
		} else {
			// activate video nav element
		}
	});

	$("#info-modal").on('hidden', function() {
		if($("#videoframe").is(':visible')) {
			$("#videoframe").get(0).play();
		} else {
			$("#content > *").animate({opacity: 1});
		}
	});
	
	
	// nav-progress handling
    $("#videoframe").bind("timeupdate", videoTimeUpdateHandler);
    function videoTimeUpdateHandler(e) {
        var video = $("#videoframe").get(0);
        var percent = video.currentTime / video.duration;
        updateProgressWidth(percent);
    }
    function updateProgressWidth(percent) {
        $(".active").last().children().children(".nav-progress").width(percent * barWidth);
    }
	
	$("#nav li a").click(function() {
		if(!$(this).hasClass("novideo")) {
			navigate($(this));
			playVideo($(this).attr('href').substring(1));
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
		console.log("Video ended");
		$.get("quiz/question" + $("#videoframe").attr("src").substring(9, 10) + ".html", function(data){
			$("#quiz-modal .modal-header #question").html(data);
		});
		$.get("quiz/answers" + $("#videoframe").attr("src").substring(9, 10) + ".html", function(data){
			$("#quiz-modal .modal-body").html(data);
		});
		$("#quiz-modal").modal("show");
	});
});