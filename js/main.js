(function ($) {
 "use strict";

/*--------------------------
 Start at the top on refresh (links to a #section still jump to it)
---------------------------- */
	if ('scrollRestoration' in history) {
		history.scrollRestoration = 'manual';
	}
	$(window).on('load', function () {
		if (!window.location.hash) {
			window.scrollTo(0, 0);
		}
	});

/*--------------------------
 Forms: once a visitor tries to submit with missing or wrong fields, mark the form
 so CSS can highlight those fields in red (each clears as soon as it is valid)
---------------------------- */
	document.addEventListener('invalid', function (e) {
		var form = e.target.form;
		if (form) form.classList.add('show-errors');
	}, true);
	// a form cleared after sending starts fresh, without highlights
	document.addEventListener('reset', function (e) {
		e.target.classList.remove('show-errors');
	}, true);

/*--------------------------
preloader
---------------------------- */
	$(window).on('load',function(){
		var pre_loader = $('#preloader')
	pre_loader.fadeOut('slow',function(){$(this).remove();});
	});	

/*---------------------
  venobox
--------------------- */
	var veno_box = $('.venobox');
	veno_box.venobox();

/*------------------------------------
 search option
------------------------------------- */ 
    $('.search-option').hide();
    $(".main-search").on('click', function(){
        $('.search-option').animate({
            height:'toggle',
        });
    });
/*---------------------
 TOP Menu Stick
--------------------- */
var windows = $(window);
var sticky = $('#sticker');
// holds the header's space while it is fixed, so the page doesn't jump up
var stickySpacer = $('<div class="sticky-spacer"></div>').insertBefore(sticky);

function stickyPoint() {
    // stick only once the normal header has scrolled out of view, then slide the fixed one in
    var anchor = sticky.hasClass('stick') ? stickySpacer : sticky;
    return anchor.offset().top + anchor.outerHeight();
}

windows.on('scroll', function() {
    var scroll = windows.scrollTop();
    if (!sticky.hasClass('stick') && scroll > stickyPoint()) {
        stickySpacer.height(sticky.outerHeight());
        sticky.addClass('stick');
    } else if (sticky.hasClass('stick') && scroll <= stickyPoint() - stickySpacer.height()) {
        sticky.removeClass('stick');
        stickySpacer.height(0);
    }
});
/*----------------------------
 Footer year
------------------------------ */
    $('.js-year').text(new Date().getFullYear());
/*----------------------------
 Service cards: the whole card opens its page
------------------------------ */
    $('.img-hover-text12').each(function() {
        var link = $(this).find('.button24 a').attr('href');
        $(this).toggleClass('has-link', !!link && link !== '#');
    }).on('click', function(e) {
        var link = $(this).find('.button24 a').attr('href');
        if (link && link !== '#' && !$(e.target).closest('a').length) {
            window.location.href = link;
        }
    });
/*----------------------------
 jQuery MeanMenu
------------------------------ */
    var mean_menu = $('nav#dropdown');
    mean_menu.meanmenu();
	
/*--------------------------
 scrollUp
---------------------------- */
	$.scrollUp({
		scrollText: '<i class="fa fa-angle-up"></i>',
		easingType: 'linear',
		scrollSpeed: 900,
		animation: 'fade'
	});
    
/*----------------------------
 Counter js active
------------------------------ */
    // Count from 0 to the number on every frame, easing out, once the counter scrolls into view
    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        var duration = 2500;
        var start = null;
        function step(now) {
            if (start === null) start = now;
            var progress = Math.min((now - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
    }

    $('.counter').each(function () {
        var el = this;
        el.setAttribute('data-target', el.textContent.replace(/[^0-9]/g, ''));
        if (!('IntersectionObserver' in window) || !window.requestAnimationFrame) return;
        el.textContent = '0';
        var observer = new IntersectionObserver(function (entries) {
            if (!entries[0].isIntersecting) return;
            observer.disconnect();
            animateCounter(el);
        }, { threshold: 0.5 });
        observer.observe(el);
    });
	
/*--------------------------
 collapse
---------------------------- */
	var panel_test = $('.panel-heading a');
	panel_test.on('click', function(){
		panel_test.removeClass('active');
		$(this).addClass('active');
	});
	
/*--------------------------
 Parallax
---------------------------- */	
    var parallaxeffect = $(window);
    parallaxeffect.stellar({
        responsive: true,
        positionProperty: 'position',
        horizontalScrolling: false
    });
	
/*--------------------------
 MagnificPopup
---------------------------- */	
    $('.video-play').magnificPopup({
        type: 'iframe'
    });
	
/*---------------------
 Appoinment Wrapper
---------------------*/	

	if($('.header-right-link .slice-btn').length){
		//Show Form
		$('.header-right-link .slice-btn').on('click', function(e) {
			e.preventDefault();
			$('body').addClass('visible-appointment');
		});
		//Hide Form
		$('.appointment-wrapper .appoint-box .cross-icon,.layer-drop').on('click', function(e) {
			e.preventDefault();
			$('body').removeClass('visible-appointment');
		});
	}

/*--------------------------
     slider carousel
---------------------------- */
    var intro_carousel = $('.intro-carousel');
    intro_carousel.owlCarousel({
        loop:true,
        nav:true,		
        autoplay:false,
        dots:false,
        navText: ["<i class='icon icon-chevron-left'></i>","<i class='icon icon-chevron-right'></i>"],
        responsive:{
            0:{
                items:1
            },
            600:{
                items:1
            },
            1000:{
                items:1
            }
        }
    });

/*--------------------------
     Services carousel
---------------------------- */
	var services_carousel = $('.services-carousel');
	services_carousel.owlCarousel({
        loop:true,
        nav:true,		
        autoplay:false,
        dots:false,
        center:true,
        navText: ["<i class='icon icon-chevron-left'></i>","<i class='icon icon-chevron-right'></i>"],
        responsive:{
            0:{
                items:1
            },
            700:{
                items:1
            },
            1000:{
                items:3
            }
        }
    });
/*--------------------------
     Project carousel
---------------------------- */
	var project_carousel = $('.project-carousel');
	project_carousel.owlCarousel({
        loop:true,
        nav:true,
        navText: ["<i class='icon icon-chevron-left'></i>","<i class='icon icon-chevron-right'></i>"],
        autoplay:true,
        dots:false,
        responsive:{
            0:{
                items:2
            },
            500:{
                items:3
            },
            700:{
                items:4
            },
            1000:{
                items:6
            }
        }
    });
/*--------------------------
     Project carousel 2
---------------------------- */
	var project_carousel_2 = $('.project-carousel-2');
    project_carousel_2.owlCarousel({
        loop:true,
        nav:true,		
        autoplay:false,
        dots:false,
		margin:30,
        navText: ["<i class='icon icon-chevron-left'></i>","<i class='icon icon-chevron-right'></i>"],
        responsive:{
            0:{
                items:1
            },
            700:{
                items:1
            },
            1000:{
                items:2
            }
        }
    });
/*----------------------------
 isotope active
------------------------------ */
	// project start
    $(window).on("load",function() {
        var $container = $('.project-content');
        $container.isotope({
            filter: '*',
            animationOptions: {
                duration: 750,
                easing: 'linear',
                queue: false
            }
        });
        $('.project-menu li a').on("click", function() {
            $('.project-menu li a.active').removeClass('active');
            $(this).addClass('active');
            var selector = $(this).attr('data-filter');
            $container.isotope({
                filter: selector,
                animationOptions: {
                    duration: 750,
                    easing: 'linear',
                    queue: false
                }
            });
            return false;
        });

    });
    //portfolio end
	
/*---------------------
 Testimonial carousel
---------------------*/
    var review = $('.testimonial-carousel');
    review.owlCarousel({
		loop:true,
		nav:false,
        margin:40,
		dots:true,
		autoplay:false,
		responsive:{
			0:{
				items:1
			},
			768:{
				items:2
			},
			1000:{
				items:3
			}
		}
	});
	
/*----------------------------
    Contact form
------------------------------ */
	$("#contactForm").on("submit", function (event) {
		if (event.isDefaultPrevented()) {
			formError();
			submitMSG(false, "Did you fill in the form properly?");
		} else {
			event.preventDefault();
			submitForm();
		}
	});
	// Emailed to info@akgm.ae from webadminakgm@gmail.com (js/form-mailer.js) — no email app needed
	function submitForm(){
		var name = $.trim($("#name").val());
		var email = $.trim($("#email").val());
		var msg_subject = $.trim($("#msg_subject").val());
		var message = $.trim($("#message").val());
		var $button = $("#submit");

		$button.prop("disabled", true).text("Sending...");
		window.FormMailer.send('contact', {
			subject: 'Website Enquiry: ' + msg_subject + ' - ' + name,
			replyTo: email,
			fields: {
				'Name': name,
				'Email': email,
				'Subject': msg_subject,
				'Message': message
			},
			botcheck: $("#contactForm [name=botcheck]").prop("checked")
		}).then(function () {
			formSuccess();
		}, function (error) {
			formError();
			submitMSG(false, error);
		}).then(function () {
			$button.prop("disabled", false).text("Submit");
		});
	}

	function formSuccess(){
		$("#contactForm")[0].reset();
		$("#msgSubmit").addClass("hidden").text("");
		window.FormMailer.showSuccess("Message Sent Successfully", "Thank you for contacting us. Our team will get back to you soon.");
	}

	function formError(){
		$("#contactForm").removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
			$(this).removeClass();
		});
	}

	function submitMSG(valid, msg){
		if(valid){
			var msgClasses = "h3 text-center tada animated text-success";
		} else {
			var msgClasses = "h3 text-center text-danger";
		}
		$("#msgSubmit").removeClass().addClass(msgClasses).text(msg);
	}
    
})(jQuery); 