/*
 *	TODO
 *
 *	on page loaded auto resizing
 *	
 *	overlay management
 *	
 *	BUGS
 *	
 *	videoframe close -> nav hidden
 *	
 *	SONSTIGES
 *	social mail forward
 *	video7 480p but twice the filesize
 *	
 *	DELETED FEATURES
 *	video start card flip
 *	ambiente audio
 *	
 *	
 *	
 *	
 */ 

var w = 4;
var h = 3;
var progressbarWidth;


//////////	Video	//////////

function pauseVideo($f) {
	// if(!$f.get(0).paused) {
		$f.get(0).pause();
	// }	
}

function toggleMute() {
	$("#videoframe").prop('muted', !$("#videoframe").prop('muted'));
	$("#answerframe").prop('muted', !$("#answerframe").prop('muted'));
	$("#audio a").toggleClass("muted");
}

function playVideo(v, $f) {
	// load video
	$f.attr("src", "vid/video" + v + ".mp4");
	$f.data("vid", v);
	$f[0].load();

	showFrame($f);
	
	if($f.get(0).paused) {
		$f.get(0).play();
	}
}

function closeFrame($f) {
	$("#videocurtain").fadeOut();
	$("#quiz-modal, #answer-modal").modal("hide");
	$f.removeData("vid");
	hideFrame($f);
	$("#content > *").animate({opacity: 1});
	deactivateNavHovering();
}

function hideFrame($f) {
	if($f.is(':visible')) {
		$f.prev().fadeOut();
		$f.fadeOut();
		
		pauseVideo($f);
		$("#content > *").animate({opacity: 1});
	}
}

function showFrame($f, cb) {
	if($f.is(':hidden')) {
		activateNavHovering();
		
		$f.css("margin-left", ($(document).width() - $f.height() / h * w) / 2);
		
		$f.fadeIn(1000, function() {
			if(typeof cb !== 'undefined') {
				cb();
			}
		});
		$f.prev().fadeIn(1000);
		$("#videocurtain").fadeIn(2000);
	}
}


//////////	Quiz Functions	//////////

function showQuiz(vid) {
	$.get("quiz/answers" + vid + ".html", function(data){
		$("#quiz-modal #answerButton").before(data);
		
		$("input[name='answer']:radio").change(function() {
			$("#answerframe").attr("src", "vid/video" + vid + "/answer" + $(this).val() + ".mp4");
			if(typeof $("#quiz-modal input[name='answer']:radio:checked").data("next") !== 'undefined') {
				$("#answerframe").data("next", true);
			} else {
				$("#answerframe").removeData("next");
			}
			
			$("#answerframe")[0].load();
		});
	});
	$("#quiz-modal").data("vid", vid);
	$("#quiz-modal").modal("show");
	deactivateNavHovering();
}

function submitAnswer() {
	if($("input[name='answer']:radio:checked").val()) {
		$("#videoframe").data("vid", $("#quiz-modal").data("vid"));
		showFrame($("#answerframe"), function() {
			hideFrame($("#videoframe"));
		});
		$("#quiz-modal").modal("hide");
		activateNavHovering();
		
		if($("#answerframe").get(0).paused) {
			$("#answerframe").get(0).play();
		}
	} else {
		alert("Bitte wählen Sie Ihren nächsten Schritt.");
	}
}


//////////	Navigation	//////////

function resetNav() {
	if($("#videoframe, #answerframe").is(':hidden')) {
		$("#nav").children().removeClass("active");
		$(".nav-progress").width(0);
	}
}

function activateNav(vid) {
	var $e;
	if(vid == 10) {
		$e = $("#nav a[href='#info-modal']");
	} else {
		$e = $("#nav a[href='#video" + vid + "']");
		$e.children(".nav-progress").width(0);
	}
	$e.parent().prevAll().addClass("active");
	$e.parent().prevAll().children().children(".nav-progress").width(progressbarWidth);
	$e.parent().nextAll().removeClass("active");
	$e.parent().nextAll().children().children(".nav-progress").width(0);
	$e.parent().addClass("active");
}

function deactivateNavHovering() {
	$("#nav").off("mouseenter mouseleave");
	$("#nav").stop().animate({opacity: 1});
}

function activateNavHovering() {
	$("#nav").animate({opacity: 0});
	$("#nav").hover(function() {
		$("#nav").stop().animate({opacity: 1}, 1000);
	}, function() {
		$("#nav").stop().animate({opacity: 0});
	});
}

function documentExists(url) {
    // XHR is supported by most browsers.
    // IE 9 supports it (maybe IE8 and earlier) off webserver
    // IE running pages off of disk disallows XHR unless security zones are set appropriately. Throws a security exception.
    // Workaround is to use old ActiveX control on IE (especially for older versions of IE that don't support XHR)
    // FireFox 4 supports XHR (and likely v3 as well) on web and from local disk
    // Works on Chrome, but Chrome doesn't seem to allow XHR from local disk. (Throws a security exception) No workaround known.
    var fSuccess = false;
    var client = null;
	
    try {
        client = new XMLHttpRequest();
        client.open("GET", url, false);
        client.send();
    } catch(err) {
        client = null;
    }

    // Try the ActiveX control if available
    if(client === null) {
        try {
            client = new ActiveXObject("Microsoft.XMLHTTP");
            client.open("GET", url, false);
            client.send();
        } catch(err) {
            // Giving up, nothing we can do
            client = null;
        }
    }
	
	// check 404
	var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    var client404 = http.status!=404;
	
    fSuccess = Boolean(client && client.responseText && client404);

    return fSuccess;
}

$(document).ready(function() {
	// init
	progressbarWidth = $('.nav-progressbg').first().width();
	$.get("info/ausstellung.html", function(data){
		$("#info-modal .modal-body").html(data);
	});

	//////////	Navigation	//////////
	$("#nav li a, #postcardwrap a").click(function() {
		if(!$(this).hasClass("novideo")) {
			$("#info-modal, #quiz-modal").modal('hide');	
			var vid = $(this).attr('href').substring(6);
			activateNav(vid);
			$("#content > *").animate({opacity: 0}, 1000, function() {
				playVideo(vid, $("#videoframe"));
			});
		}
	});

	//////////	Info Modal	//////////
	$("#info-nav a").click(function() {
		$("#info-nav a").removeClass("active");
		$(this).addClass("active");
		$.get("info/" + $(this).attr("id").substring(5) + ".html", function(data) {
			$("#info-modal .modal-body").html(data);
		});
	});

	$("#info-modal").on('show', function() {
		if($("#quiz-modal").is(':visible')) {
			// remind previous window
			$(this).data("switcher", "#quiz-modal");
			$("#quiz-modal").hide();
		} else {
			$("#content > *").fadeOut();
			pauseVideo($("#videoframe"));
			pauseVideo($("#answerframe"));
			deactivateNavHovering();
		}
		activateNav(10);
	});
	
	$("#info-modal").on('hide', function() {
		if($(this).data("switcher")) {
			$($(this).data("switcher")).show();
			$(this).removeData("switcher");
			$("#nav li.active").last().children().children(".nav-progress").width(progressbarWidth);
		} else {
			$("#content > *").fadeIn();
			
			if($("#answerframe").is(':visible')) {
				$("#answerframe").get(0).play();
				activateNavHovering();
			} else if($("#videoframe").is(':visible')) {
				$("#videoframe").get(0).play();
				activateNavHovering();
			} else {
				$("#content > *").fadeIn();
				resetNav();
			}
		}
		activateNav($("#videoframe").data("vid"));
	});

	//////////	Quiz Modal	//////////
	$("#quiz-modal").on('show', function() {
		$(this).removeData("next");
	});

	$("#quiz-modal").on('hidden', function() {
		$("#quiz-modal .modal-body fieldset label").remove();
		$("#quiz-modal #question p").remove();
	});
	

	//////////	Video	//////////
    $("#videoframe").bind("timeupdate", videoTimeUpdateHandler);
    function updateProgressWidth(percent) {
        $("#nav li.active").last().children().children(".nav-progress").width(percent * progressbarWidth);
    }
    function videoTimeUpdateHandler(e) {
        var video = $("#videoframe").get(0);
        var percent = video.currentTime / video.duration;
        updateProgressWidth(percent);
    }
	
	$("#videoframe").on("ended", function() {
		var vid = Number($("#videoframe").attr("src").substring(9, 10));
		
		if(documentExists("quiz/question" + vid + ".html")) {
	        // question exists

			$.get("quiz/question" + vid + ".html", function(data) {
				$("#quiz-modal .modal-header #question").html(data);
			});
			showQuiz(vid);
			deactivateNavHovering();
	    } else {
	        // no question
			$(this).data("vid", vid + 1);
			activateNav(vid + 1);
			playVideo(vid + 1, $("#videoframe"));
	    }
	});
	
	$("#answerframe").on("ended", function() {
		var vid = $("#videoframe").data("vid");

		if($(this).data("next") == true) {
			if(documentExists("vid/video" + (vid+1) + ".mp4")) {
				// next video
				activateNav(vid + 1);
				playVideo(vid + 1, $("#videoframe"));
				$("#answerframe").fadeOut();
				if($("#info-modal").is(':visible')) {
					$("#info-modal").modal('hide');
				}
			} else {
				// finish
				closeFrame($("#answerframe"));
				closeFrame($("#videoframe"));
				$("#info-modal").modal('show');
			}
		} else {
			// wrong answer
			showFrame($("#videoframe"), function() {
				hideFrame($("#answerframe"));
			});
			$("input[name='answer']:radio").removeAttr("checked");
			showQuiz(vid);
		}
	});
});