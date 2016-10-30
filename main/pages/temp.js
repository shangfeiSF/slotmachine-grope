/*
 * jQuery Slot Machine v1.0.0
 * https://github.com/josex2r/jQuery-SlotMachine
 *
 * Copyright 2014 Jose Luis Represa
 * Released under the MIT license
 */
(function ($) {
  $(document).ready(function () {

    //Fast blur
    if ($("filter#slotMachineBlurSVG").length <= 0) {
      $("body").append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg">' +
        '<filter id="slotMachineBlurFilterFast">' +
        '<feGaussianBlur stdDeviation="5" />' +
        '</filter>' +
        '</svg>');
    }

    //Medium blur
    if ($("filter#slotMachineBlurSVG").length <= 0) {
      $("body").append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg">' +
        '<filter id="slotMachineBlurFilterMedium">' +
        '<feGaussianBlur stdDeviation="3" />' +
        '</filter>' +
        '</svg>');
    }

    //Slow blur
    if ($("filter#slotMachineBlurSVG").length <= 0) {
      $("body").append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg">' +
        '<filter id="slotMachineBlurFilterSlow">' +
        '<feGaussianBlur stdDeviation="1" />' +
        '</filter>' +
        '</svg>');
    }

    //Fade mask
    if ($("mask#slotMachineFadeSVG").length <= 0) {
      $("body").append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg">' +
        '<mask id="slotMachineFadeMask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">' +
        '<linearGradient id="slotMachineFadeGradient" gradientUnits="objectBoundingBox" x="0" y="0">' +
        '<stop stop-color="white" stop-opacity="0" offset="0"></stop>' +
        '<stop stop-color="white" stop-opacity="1" offset="0.25"></stop>' +
        '<stop stop-color="white" stop-opacity="1" offset="0.75"></stop>' +
        '<stop stop-color="white" stop-opacity="0" offset="1"></stop>' +
        '</linearGradient>' +
        '<rect x="0" y="-1" width="1" height="1" transform="rotate(90)" fill="url(#slotMachineFadeGradient)"></rect>' +
        '</mask>' +
        '</svg>');
    }

    //CSS classes
    $("body").append("<style>" +
      ".slotMachineBlurFast{-webkit-filter: blur(5px);-moz-filter: blur(5px);-o-filter: blur(5px);-ms-filter: blur(5px);filter: blur(5px);filter: url(#slotMachineBlurFilterFast);filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius='5')}" +
      ".slotMachineBlurMedium{-webkit-filter: blur(3px);-moz-filter: blur(3px);-o-filter: blur(3px);-ms-filter: blur(3px);filter: blur(3px);filter: url(#slotMachineBlurFilterMedium);filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius='3')}" +
      ".slotMachineBlurSlow{-webkit-filter: blur(1px);-moz-filter: blur(1px);-o-filter: blur(1px);-ms-filter: blur(1px);filter: blur(1px);filter: url(#slotMachineBlurFilterSlow);filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius='1')}" +
      ".slotMachineGradient{" +
      "-webkit-mask-image: -webkit-gradient(linear, left top, left bottom, color-stop(0%, rgba(0,0,0,0)), color-stop(25%, rgba(0,0,0,1)), color-stop(75%, rgba(0,0,0,1)), color-stop(100%, rgba(0,0,0,0)) );" +
      "mask: url(#slotMachineFadeMask);" +
      "}" +
      "</style>");

  });

  if (typeof $.easing.easeOutBounce !== "function") {
    //From jQuery easing, extend jQuery animations functions
    $.extend($.easing, {
      easeOutBounce: function (x, t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
          return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
          return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
        } else if (t < (2.5 / 2.75)) {
          return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
        } else {
          return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
        }
      },
    });
  }

  $.fn.slotMachine = function (settings) {

    var defaults = {
      active: 0, //Active element [int]
      delay: 200, //Animation time [int]
      repeat: false //Repeat delay [false||int]
    };

    settings = $.extend(defaults, settings); //Plugin settings

    var $slot = $(this), //jQuery selector
      $titles = $slot.children(), //Slot Machine elements
      $container, //Container to wrap $titles
      _maxTop, //Max marginTop offset
      _timer = null, //Timeout recursive function to handle auto (settings.repeat)
      _currentAnim = null, //Current playing jQuery animation
      _forceStop = false, //Force execution for some functions
      _oncompleteShuffling = null, //Callback function
      _isRunning = false, //Machine is running?
      _active = { //Current active element
        index: settings.active,
        el: $titles.get(settings.active)
      };

    function _getOffset(index) {
      var offset = 0;
      for (var i = 0; i < index; i++) {
        offset += $($titles.get(i)).outerHeight();
      }
      return -offset;
    }

    function _getRandom() {
      var rnd;
      do {
        rnd = Math.floor(Math.random() * $titles.length);
      } while (rnd === _active.index && rnd >= 0);

      var choosen = {
        index: rnd,
        el: $titles.get(rnd)
      };
      return choosen;
    }

    function _getActive() {
      return _active;
    }

    function _setActive(elWithIndex) {
      _active = elWithIndex;
    }

    function _getPrev() {
      var prevIndex = _active.index - 1 < 0 ? $titles.length - 1 : _active.index - 1;
      var prevObj = {
        index: prevIndex,
        el: $titles.get(prevIndex)
      };
      return prevObj;
    }

    function _getNext() {
      var nextIndex = _active.index + 1 < $titles.length ? _active.index + 1 : 0;
      var nextObj = {
        index: nextIndex,
        el: $titles.get(nextIndex)
      };
      return nextObj;
    }

    function _setAnimationFX(speed, fade) {
      $slot.add($titles).removeClass("slotMachineBlurFast slotMachineBlurMedium slotMachineBlurSlow");
      switch (speed) {
        case 'fast':
          $titles.addClass("slotMachineBlurFast");
          break;
        case 'medium':
          $titles.addClass("slotMachineBlurMedium");
          break;
        case 'slow':
          $titles.addClass("slotMachineBlurSlow");
          break;
      }

      if (fade !== true || speed === "stop") {
        $slot.add($titles).removeClass("slotMachineGradient");
      } else {
        $slot.add($titles).addClass("slotMachineGradient");
      }
    }

    function _resetPosition() {
      $container.css("margin-top", _getOffset(_active.index));
    }

    function _shuffle(count) {
      _isRunning = true;
      var delay = settings.delay;

      if (count === undefined) {
        _setAnimationFX("fast", true);
        _currentAnim = $container.animate({
          marginTop: _maxTop
        }, delay, function () {
          _currentAnim = null
          $container.css("margin-top", 0)
          if (_forceStop === false) {
            _shuffle()
          }
        })
      }
      else {
        if (count >= 1) {
          if (count > 1) {
            _setAnimationFX("fast", true);
          } else {
            _setAnimationFX("medium", true);
          }
          _currentAnim = $container.animate({
            marginTop: _maxTop
          }, delay, function () {
            _currentAnim = null
            $container.css("margin-top", 0)
            _shuffle(count - 1);
          })
        }
        else {
          _stop(true);
        }
      }
    }

    function completeCallback() {

      if (typeof _oncompleteShuffling === "function") {

        _oncompleteShuffling($slot, _active);

        _oncompleteShuffling = null;

      }

    }

    function _stop(nowOrRepeations, getElementFn) {
      if (_currentAnim !== null) {
        _currentAnim.stop();
      }
      var rnd;
      if (typeof getElementFn === "function") {
        rnd = getElementFn();
      }
      else {
        if (settings.repeat) {
          rnd = _getNext();
        } else {
          rnd = _getRandom();
        }
      }
      if (nowOrRepeations === true || nowOrRepeations <= 1) {
        _setAnimationFX("slow", true);

        var offset = _getOffset(rnd.index);

        if (rnd.index === 0) {
          $container.css("margin-top", -$(rnd.el).height() / 2);
        }

        var delay = 75 * $titles.length - rnd.index;

        if (_isVisible()) {
          _setActive(rnd);
          $container.animate({
            marginTop: offset
          }, delay, "easeOutBounce", completeCallback);
        } else {
          _setAnimationFX("stop");
          _resetPosition();
        }

        setTimeout(function () {
          _setAnimationFX("stop");
          _isRunning = false;
        }, delay + 25);
      }
      else {
        _shuffle(nowOrRepeations || 3);
      }
    }

    function _isVisible() {
      var above = $slot.offset().top > $(window).scrollTop() + $(window).height(),
        below = $(window).scrollTop() > $slot.height() + $slot.offset().top;

      return !above && !below;
    }

    function _auto(delay) {
      if (_forceStop === false) {
        delay = delay === undefined ? 1 : settings.repeat + 1000;
        _timer = setTimeout(function () {
          if (_forceStop === false) {
            _shuffle(3);
          }
          _timer = _auto(delay);
        }, delay);
      }
    }

    $slot.css("overflow", "hidden");

    $titles.wrapAll("<div class='slotMachineContainer' />");
    $container = $slot.find(".slotMachineContainer");

    _maxTop = -$container.height();

    $container.css("margin-top", _getOffset(settings.active));

    if (settings.repeat ) {

      _auto();

    }

    $slot.shuffle = function (count, oncomplete) {
      _forceStop = false;
      _oncompleteShuffling = oncomplete;
      _shuffle(count);
    };

    $slot.stop = function (nowOrRepeations) {

      _forceStop = true;

      if (settings.repeat  && _timer !== null) {

        clearTimeout(_timer);

      }

      _stop(nowOrRepeations);

    };

    $slot.prev = function () {

      _stop(true, _getPrev);

    };

    $slot.next = function () {

      _stop(true, _getNext);

    };

    $slot.active = function () {
      return _getActive();
    };

    $slot.isRunning = function () {
      return _isRunning;
    };

    $slot.auto = _auto;
    return $slot;
  };

})(jQuery);