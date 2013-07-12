// var $video = $("#videoframe");
var w = 4;
var h = 3;
var barWidth = $('.nav-progressbg').first().width();

$(document).ready(function() {
	// init
	$.get("info/ausstellung.html", function(data){
		$("#info-modal .modal-body").html(data);
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
	
	$("#info-modal").on('hide', function() {
		resetNav();
	});
	
	$("#info-modal #info-nav a").click(function(event) {
		$.get("info/" + $(this).attr("id").substring(5) + ".html", function(data){
			$("#info-modal .modal-body").html(data);
		});
	});
});


// Video

function centerVideoFrame() {
	// setup videoframe
	// $("#videoframe").height($(document).height() - $('#nav').height());
	// center videoframe
	$("#videoframe").css("margin-left", ($(document).width() - $("#videoframe").height() / h * w) / 2);
}

function playVideo(v) {
	// load video
	$("#videoframe").attr("src", "vid/" + v.substring(1) + ".mp4");
	$("#videoframe")[0].load();
	
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
	console.log("show frame");
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