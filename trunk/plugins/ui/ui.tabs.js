/* jQuery UI Tabs (Tabs 3)
 * 
 */
(function($) {
 
 	// if the UI scope is not availalable, add it
	$.ui = $.ui || {};
    
    $.fn.tabs = function(initial, options) {
    	if (initial && initial.constructor == Object) { // shift arguments
    	    options = initial;
    	    initial = null;
    	}
    	options = options || {};
    	
    	// first get initial tab from options
    	initial = initial && initial.constructor == Number && --initial || 0;
    	
    	return this.each(function() {
    		new $.ui.tabs(this, $.extend(options, { initial: initial }));
    	});
    };
    
    // create chainable tabs methods
    $.each(['add', 'remove', 'enable', 'disable', 'click', 'load'], function(i, method) {
        $.fn[method + 'Tab'] = function() {
            var args = arguments;
            return this.each(function() {
                var instance = $.ui.tabs.instances[this.uuid];
                instance[method].apply(instance, args);
            });
        };
    });
    
    $.fn.activeTab = function(returnElement) {
        if (returnElement) {
            
        } else {
            
        }
    };

    $.ui.tabs = function(el, options) {
    	
    	this.source = el;
    	
    	this.options = $.extend({
            initial: 0,
            disabled: [],
            // TODO bookmarkable: $.ajaxHistory ? true : false,
            spinner: 'Loading&#8230;',
            cache: false,
            hashPrefix: 'tab-',
            /*fxFade: null,
            fxSlide: null,
            fxShow: null,
            fxHide: null,*/
            closable: false, // TODO
            closed: false, // TODO selected?
            fxSpeed: 'normal',
            /*fxShowSpeed: null,
            fxHideSpeed: null,*/
            click: function() {},
            hide: function() {},
            show: function() {},
            navClass: 'tabs-nav',
            selectedClass: 'tabs-selected',
            disabledClass: 'tabs-disabled',
            containerClass: 'tabs-container',
            hideClass: 'tabs-hide',
            loadingClass: 'tabs-loading'
        }, options);    	
    	
    	this.tabify(true);
    	
    	// save instance for later
    	var uuid = 'jQueryTabs-' + $.ui.tabs.prototype.count++;
    	$.ui.tabs.instances[uuid] = this;
    	this.source.uuid = uuid;
    };
    
    // static
    $.ui.tabs.instances = {};
    
    $.extend($.ui.tabs.prototype, {
        count: 0,
        tabify: function(init) {
              
            this.$tabs = $('a:first-child', this.source);
            this.$containers = $([]);
            
            var o = this, options = this.options, $source = $(this.source);
            
            this.$tabs.each(function(i, a) {
        	    if (a.hash) { // inline tab
        	        o.$containers = o.$containers.add(a.hash);
        	    } else { // remote tab
        	        var id = a.title && a.title.replace(/\s/g, '_') || options.hashPrefix + (o.count + 1) + '-' + (i + 1), url = a.href;
        	        a.href = '#' + id;
        	        a.url = url;
        	        o.$containers = o.$containers.add(
        	            $('#' + id)[0] || $('<div id="' + id + '" class="' + options.containerClass + '"></div>')
        	                .insertAfter( o.$containers[i - 1] || $source )
        	        );
        	    }
        	});
        	
        	if (init) {
        	    
            	// Try to retrieve initial tab from fragment identifier in url if present,
                // otherwise try to find selected class attribute on <li>.
            	this.$tabs.each(function(i, a) {
                    if (location.hash) {
                        if (a.hash == location.hash) {
                            options.initial = i;
                            // prevent page scroll to fragment
                            //if (($.browser.msie || $.browser.opera) && !options.remote) {
                            if ($.browser.msie || $.browser.opera) {
                                var $toShow = $(location.hash), toShowId = $toShow.attr('id');
                                $toShow.attr('id', '');
                                setTimeout(function() {
                                    $toShow.attr('id', toShowId); // restore id
                                }, 500);
                            }
                            scrollTo(0, 0);
                            return false; // break
                        }
                    } else if ( $(a).parents('li:eq(0)').is('li.' + options.selectedClass) ) {
                        options.initial = i;
                        return false; // break
                    }
            	});
        	
                // attach necessary classes for styling if not present
                $source.is('.' + options.navClass) || $source.addClass(options.navClass);
                this.$containers.each(function() {
                    var $this = $(this);
                    $this.is('.' + options.containerClass) || $this.addClass(options.containerClass);
                });
            
                // highlight tab accordingly
                this.$containers.addClass(options.hideClass);
                $('li', $source).removeClass(options.selectedClass);
                if (!options.closed) {
                    this.$containers.slice(options.initial, options.initial + 1).show();
                    $('li', $source).slice(options.initial, options.initial + 1).addClass(options.selectedClass);
                }
            
                // trigger load of initial tab is remote tab
                if (this.$tabs[options.initial].url) {
                    this.load(options.initial + 1, this.$tabs[options.initial].url);
                    if (options.cache) {
                        this.$tabs[options.initial].url = null; // if loaded once do not load them again
                    }
                    // TODO call show callback? add init/load callback?
                }
        	
            	// disabled tabs
                for (var i = 0, k = options.disabled.length; i < k; i++) {
                    this.disable(options.disabled[i] - 1);
                }
            
            }
        	
        	// setup animations
            var showAnim = {}, hideAnim = {}, showSpeed = options.fxShowSpeed || options.fxSpeed, 
                hideSpeed = options.fxHideSpeed || options.fxSpeed;
            if (options.fxSlide || options.fxFade) {
                if (options.fxSlide) {
                    showAnim['height'] = 'show';
                    hideAnim['height'] = 'hide';
                }
                if (options.fxFade) {
                    showAnim['opacity'] = 'show';
                    hideAnim['opacity'] = 'hide';
                }
            } else {
                if (options.fxShow) {
                    showAnim = options.fxShow;
                } else { // use some kind of animation to prevent browser scrolling to the tab
                    showAnim['min-width'] = 0; // avoid opacity, causes flicker in Firefox
                    showSpeed = 1; // as little as 1 is sufficient
                }
                if (options.fxHide) {
                    hideAnim = options.fxHide;
                } else { // use some kind of animation to prevent browser scrolling to the tab
                    hideAnim['min-width'] = 0; // avoid opacity, causes flicker in Firefox
                    hideSpeed = 1; // as little as 1 is sufficient
                }
            }
        	
        	// callbacks
            var click = options.click, hide = options.hide, show = options.show;
        	
        	// tab click handler
        	function tabClick(e) {

                //var trueClick = e.clientX; // add to history only if true click occured, not a triggered click
                var clicked = this, $li = $(this).parents('li:eq(0)'), $show = $(this.hash), $hide = o.$containers.filter(':visible');
                
                // if tab may be closed
                if (options.closable && !$li.is('.' + options.disabledClass) && !$source['locked']) {
                    
                    if ($li.is('.' + options.selectedClass)) {
                        console.log('hide me TODO');
                    } else {
                        console.log('show me TODO');
                    }
                    
                    // remove class
                    // hide container
                    this.blur();
                    return false;
                }
                
                // if animation is still running, tab is selected or disabled or onClick callback returns false stop here
                // check if onClick returns false last so that it is not executed for a disabled tab
                if ($li.is('.' + options.selectedClass + ', .' + options.disabledClass) 
                    || click(this, $show[0], $hide[0]) === false || $source['locked']) {
                    this.blur();
                    return false;
                }

                $source['locked'] = true;

                // show new tab
                if ($show.length) {

                    // prevent scrollbar scrolling to 0 and than back in IE7, happens only if bookmarking/history is enabled
                    /*if ($.browser.msie && options.bookmarkable) {
                        var showId = this.hash.replace('#', '');
                        $show.attr('id', '');
                        setTimeout(function() {
                            $show.attr('id', showId); // restore id
                        }, 0);
                    }*/

                    var resetCSS = { display: '', overflow: '', height: '' };
                    if (!$.browser.msie) { // not in IE to prevent ClearType font issue
                        resetCSS['opacity'] = '';
                    }

                    // switch tab, animation prevents browser scrolling to the fragment
                    function switchTab() {
                        /*if (options.bookmarkable && trueClick) { // add to history only if true click occured, not a triggered click
                            $.ajaxHistory.update(clicked.hash);
                        }*/
                        $hide.animate(hideAnim, hideSpeed, function() { //
                            $(clicked).parents('li:eq(0)').addClass(options.selectedClass).siblings().removeClass(options.selectedClass);
                            $hide.addClass(options.hideClass).css(resetCSS); // maintain flexible height and accessibility in print etc.                        
                            hide(clicked, $show[0], $hide[0]);
                            
                            // show next tab
                            if (!(options.fxSlide || options.fxFade || options.fxShow)) {
                                $show.css('display', 'block'); // prevent occasionally occuring flicker in Firefox cause by gap between showing and hiding the tab containers
                            }
                            $show.animate(showAnim, showSpeed, function() {
                                $show.removeClass(options.hideClass).css(resetCSS); // maintain flexible height and accessibility in print etc.
                                if ($.browser.msie) {
                                    $hide[0].style.filter = '';
                                    $show[0].style.filter = '';
                                }
                                show(clicked, $show[0], $hide[0]);
                                $source['locked'] = null;
                            });
                            
                            
                        });
                    }                    
                    
                    if (this.url) { // remote tab
                        o.load(o.$tabs.index(this) + 1, this.url, switchTab);
                        if (options.cache) {
                            this.url = null; // if loaded once do not load them again
                        }
                    } else {
                        switchTab();
                    }

                    // Set scrollbar to saved position - need to use timeout with 0 to prevent browser scroll to target of hash
                    /*var scrollX = window.pageXOffset || document.documentElement && document.documentElement.scrollLeft || document.body.scrollLeft || 0;
                    var scrollY = window.pageYOffset || document.documentElement && document.documentElement.scrollTop || document.body.scrollTop || 0;
                    setTimeout(function() {
                        scrollTo(scrollX, scrollY);
                    }, 0);*/

                } else {
                    throw 'jQuery UI Tabs: Mismatching fragment identifier.';
                }

                this.blur(); // prevent IE from keeping other link focussed when using the back button

                //return options.bookmarkable && !!trueClick; // convert trueClick == undefined to Boolean required in IE
                return false;
                
            }
            
        	// attach click event, avoid duplicates from former tabifying
            this.$tabs.unbind('click', tabClick).bind('click', tabClick);
            
        },
        add: function(url, text, position, callback) {
            if (url && text) {
                position = position || this.$tabs.length + 1;
                if (position > this.$tabs.length) {
                    var method = 'insertAfter';
                    position = this.$tabs.length - 1;
                } else {
                    var method = 'insertBefore';
                    --position;
                }
                if (url.indexOf('#') == 0) { // ajax container is created by tabify
                    $('<div id="' + url.replace('#', '') + '" class="' + this.options.containerClass + '"></div>')
                        [method](this.$containers[position]);
                }
                $('<li><a href="' + url + '"><span>' + text + '</span></a></li>')
                    [method](this.$tabs.slice(position, position + 1).parents('li:eq(0)'));
                this.tabify();
                if (callback && callback.constructor == Function) {
                    callback();
                }
            } else {
                throw 'jQuery UI Tabs: Not enough arguments to add tab.';
            }           
        },
        remove: function(position, callback) {
            if (position && position.constructor == Number) {
                --position;
                this.$tabs.slice(position, position + 1).parents('li:eq(0)').remove();
                this.$containers.slice(position, position + 1).remove();
                this.tabify();
            }
            if (callback && callback.constructor == Function) {
                callback();
            }
        },
        enable: function(position, callback) {
            var $li = this.$tabs.slice(position - 1, position).parents('li:eq(0)');
            $li.removeClass(this.options.disabledClass);
            if ($.browser.safari) { // fix disappearing tab after enabling in Safari... TODO check Safari 3
                $li.animate({ opacity: 1 }, 1, function() {
                    $li.css({ opacity: '' });
                });
            }
            if (callback && callback.constructor == Function) {
                callback();
            }
        },
        disable: function(position, callback) {
            var $li = this.$tabs.slice(position - 1, position).parents('li:eq(0)');            
            if ($.browser.safari) { // fix opacity of tab after disabling in Safari... TODO check Safari 3
                $li.animate({ opacity: 0 }, 1, function() {
                   $li.css({ opacity: '' });
                });
            }
            $li.addClass(this.options.disabledClass);
            if (callback && callback.constructor == Function) {
                callback();
            }
        },
        click: function(position) {
            this.$tabs.slice(position - 1, position).trigger('click');
        },
        load: function(position, url, callback) {
            var options = this.options;
            if (url && url.constructor == Function) { // shift arguments
                callback = url;
            }
            // TODO set url if passed
            var $a = this.$tabs.slice(position - 1, position).addClass(options.loadingClass),
                $span = $('span', $a), text = $span.html();
            if (options.spinner) {
                // TODO if spinner is image
                $span.html('<em>' + options.spinner + '</em>');
            }
            setTimeout(function() { // timeout is again required in IE, "wait" for id being restored
                $($a[0].hash).load(url, function() {
                    if (options.spinner) {
                        $span.html(text);
                    }
                    $a.removeClass(options.loadingClass);
                    if (callback && callback.constructor == Function) {
                        callback();
                    }
                });
            }, 0);            
        }
    });
    
})(jQuery);

