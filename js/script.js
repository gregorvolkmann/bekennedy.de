// var $video = $("#videoframe");
var w = 4;
var h = 3;
var barWidth = $('.progressbg').first().width();

$(document).ready(function() {
	centerVideoFrame();
	
	// progress handling
    $("#videoframe").bind("timeupdate", videoTimeUpdateHandler);

    function videoTimeUpdateHandler(e) {
        var video = $("#videoframe").get(0);
        var percent = video.currentTime / video.duration;
        updateProgressWidth(percent);
    }

    function updateProgressWidth(percent) {
        $(".active").last().children().children(".progress").width(percent * barWidth);
    }
});

function centerVideoFrame() {
	// setup videoframe
	$("#videoframe").height($(document).height() - $('#nav').height());
	// center videoframe
	$("#videoframe").css("margin-left", ($(document).width() - $("#videoframe").height() / h * w) / 2);
}

function showVideo() {
	if($("#videoframe").css('display') == 'none') {
		$("#videoframe").show();
	}
}

function playVideo(v) {
	console.log("playVideo()");
	
	// load video
	$("#videoframe").attr("src", "vid/" + v + ".mp4");
	$("#videoframe")[0].load();
	
	showVideo();
	
	if($("#videoframe").get(0).paused) {
		$("#videoframe").get(0).play();
	}
}

function navigate(e) {
	console.log(e);
	var vid = e.attr("href").substring(1);
	console.log(vid);
	e.parent().prevAll().addClass("active");
	e.parent().prevAll().children().children(".progress").width(barWidth);
	e.parent().nextAll().removeClass("active");
	e.parent().nextAll().children().children(".progress").width(0);
	e.parent().addClass("active");
	e.children(".progress").width(0);
	
	playVideo(vid);
}