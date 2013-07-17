/*
 *	TODO
 *
 *	seamless video transition
 *	answerFrame nav hover leave
 *	navclicked frame open -> nav hover leave
 *
 *	on page loaded auto resizing
 *
 */ 

var w = 4;
var h = 3;
var progressbarWidth = $('.nav-progressbg').first().width();

// Video
function playVideo(v, $f) {
	if(v != null) {
		// load video
		$f.attr("src", "vid/video" + v + ".mp4");
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

function showFrame($f, cb) {
	if($f.is(':hidden')) {
		activateNavHovering();
		
		$f.css("margin-left", ($(document).width() - $f.height() / h * w) / 2);
		
		$f.fadeIn(1000, function() {
			if(typeof cb !== 'undefined') {
				console.log("callback");
				cb();
			}
		});
		$f.prev().fadeIn(1000);

	}
}

function hideFrame($f) {
	if($f.is(':visible')) {
		$f.prev().fadeOut();
		$f.fadeOut();
		
		pauseVideo($f);
		
		$("#content > *").animate({opacity: 1});
		if($("#videoframe").is(':hidden') && $("#answerframe").is(':hidden')) {
			deactivateNavHovering();
		}
	}
}

function closeFrame($f) {
	$("#quiz-modal").modal("hide");
	hideFrame($f);
	pauseVideo($f);
}

function showQuiz(vid) {
	$.get("quiz/answers" + vid + ".html", function(data){
		$("#quiz-modal #answerButton").before(data);
		
		$("input[name=answer]:radio").change(function() {
			$("#answerframe").attr("src", "vid/video" + vid + "/answer" + $(this).val() + ".mp4");
			$("#answerframe")[0].load();
		});
	});
	$("#quiz-modal").data("vid", vid);
	$("#quiz-modal").modal("show");
}

function submitAnswer() {
	if($("input[name=answer]:radio:checked").val()) {
		$("#answerframe").data("next", $("#quiz-modal input[name=answer]:radio:checked").data("next"));
		$("#answerframe").data("vid", $("#quiz-modal").data("vid"));
		showFrame($("#answerframe"), function() {
			hideFrame($("#videoframe"));
		});
		$("#quiz-modal").modal("hide");
		
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

function navigate(vid) {
	var $e;
	if(vid == "info") {
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

function activateNavHovering() {
	$("#nav").animate({opacity: 0});
	$("#nav").hover(function() {
		console.log("hover IN");
		$("#nav").stop().animate({opacity: 1}, 1000);
	}, function() {
		console.log("hover OUT");
		$("#nav").stop().animate({opacity: 0});
	});
}

function deactivateNavHovering() {
	$("#nav").off("mouseenter mouseleave");
	$("#nav").stop().animate({opacity: 1});
}

function toggleMute() {
	$("#videoframe").prop('muted', !$("#videoframe").prop('muted'));
	$("#answerframe").prop('muted', !$("#answerframe").prop('muted'));
	$("#audio a").toggleClass("muted");
}

function IsDocumentAvailable(url) {
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
	$.get("info/ausstellung.html", function(data){
		$("#info-modal .modal-body").html(data);
	});

	//////////	Navigation	//////////
	$("#nav li a, #postcardwrap a").click(function() {
		if(!$(this).hasClass("novideo")) {
			var vid = $(this).attr('href').substring(6);

			navigate(vid);
			$("#content > *").animate({opacity: 0}, 1000, function() {
				playVideo(vid, $("#videoframe"));
				if($("#info-modal").is(':visible')) {
					$("#info-modal").modal('hide');
				}
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
			pauseVideo();
		}
	});
	
	$("#info-modal").on('hide', function() {
		if($(this).data("switcher")) {
			$($(this).data("switcher")).show();
			$(this).removeData("switcher");
		} else {
			$("#content > *").fadeIn();
			if($("#videoframe").is(':hidden') && $("#answerframe").is(':hidden')) {
				resetNav();
			} else {
				if($("#videoframe").get(0).paused) {
					$("#videoframe").get(0).play();
				}
			}
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

	//////////	Quiz Modal	//////////
	$("#quiz-modal").on('show', function() {
		deactivateNavHovering();
	});

	$("#quiz-modal").on('hidden', function() {
		$("#quiz-modal .modal-body fieldset label").remove();
		$("#quiz-modal #question p").remove();
		activateNavHovering();
	});
	

	//////////	Video	//////////
    $("#videoframe").bind("timeupdate", videoTimeUpdateHandler);
    function videoTimeUpdateHandler(e) {
        var video = $("#videoframe").get(0);
        var percent = video.currentTime / video.duration;
        updateProgressWidth(percent);
    }
    function updateProgressWidth(percent) {
        $("#nav li.active").last().children().children(".nav-progress").width(percent * progressbarWidth);
    }
	
	$("#videoframe").on("ended", function() {
		var vid = Number($("#videoframe").attr("src").substring(9, 10));
		
		if(IsDocumentAvailable("quiz/question" + vid + ".html")) {
	        //file exists
			console.log("question" + vid + " exists, show question");
			$.get("quiz/question" + vid + ".html", function(data) {
				$("#quiz-modal .modal-header #question").html(data);
			});
			showQuiz(vid);
	    } else {
	        //file not exists
			console.log("no question, next vid");
			$(this).data("vid", vid + 1);
			navigate(vid + 1);
			playVideo(vid + 1, $("#videoframe"));
	    }
	});
	
	$("#answerframe").on("ended", function() {
		var vid = Number($(this).data("vid"));
		if($(this).data("next") == true) {
			console.log("Play video" + ($(this).data("vid") + 1) + ".");
			navigate(vid + 1);
			playVideo(vid + 1, $("#videoframe"));
			$("#answerframe").fadeOut();
			if($("#info-modal").is(':visible')) {
				$("#info-modal").modal('hide');
			}
		} else {
			console.log("Play NOT video" + vid);
			showFrame($("#videoframe"), function() {
				hideFrame($("#answerframe"));
			});
			$("input[name=answer]:radio").removeAttr("checked");
			showQuiz(vid);
		}
	});
});