(function ($) {
  var booted = false

  function SlotMachine(machine, config) {
    this.config = $.extend({}, this.defaultConfig, config)

    this.config.origin = this.config.origin % $(machine).children().length

    this.nodes = {
      container: 'container',
      machine: $(machine),
      slots: $(machine).children(),
      patchSlot: null
    }

    this.states = {
      running: false,
      forceStop: false
    }

    this.params = {
      pattern: /([\d\.]*)(.*)/,
      unit: 'px',
      height: 0,
      indexOffset: 0
    }

    this.active = {
      animate: null,
      index: this.config.origin,
    }

    this.bootConfig = {
      filterConfigs: [
        {
          klass: 'fast',
          blur: '5',
          unit: 'px',
          id: 'blurFilterFast',
          stdDeviation: 5
        },
        {
          klass: 'medium',
          blur: '3',
          unit: 'px',
          id: 'blurFilterMedium',
          stdDeviation: 3
        },
        {
          klass: 'slow',
          blur: '1',
          unit: 'px',
          id: 'blurFilterSlow',
          stdDeviation: 1
        }
      ],

      fadeConfig: {
        id: 'fadeMask',
        klass: 'fade'
      }
    }

    !booted && this.boot()
  }

  $.extend(SlotMachine.prototype,
    {
      // properties
      defaultConfig: {
        origin: 0,
        delay: 0,
        speed: 150,
        finals: []
      },
    },
    {
      // build auxiliary methods
      _build_svg: function () {
        return {
          head: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="0" height="0">',
          foot: '</svg>'
        }
      },

      _build_filter: function (id) {
        return {
          head: '<filter id="' + id + '">',
          foot: '</filter>'
        }
      },

      _build_feGaussianBlur: function (stdDeviation) {
        return {
          head: '<feGaussianBlur stdDeviation="' + stdDeviation + '" />',
          foot: '',
        }
      },

      _build_mask: function (id) {
        var fadeGradientId = 'fadeGradient'

        var mask = {
          head: '<mask id="' + id + '" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">',
          foot: '</mask>',
        }

        var linearGradient = {
          head: '<linearGradient id="' + fadeGradientId + '" gradientUnits="objectBoundingBox" x="0" y="0">',
          foot: '</linearGradient>'
        }

        var stopConfigs = [
          {
            color: 'white',
            opacity: 0,
            offset: 0
          },
          {
            color: 'white',
            opacity: 1,
            offset: 0.25
          },
          {
            color: 'white',
            opacity: 1,
            offset: 0.75
          },
          {
            color: 'white',
            opacity: 0,
            offset: 1
          }
        ]

        var stops = $.map(stopConfigs, function (config) {
          return '<stop stop-color="' + config.color +
            '" stop-opacity="' + config.opacity +
            '" offset="' + config.offset + '' +
            '"></stop>'
        }).join('')

        var rect = {
          head: '<rect x="0" y="-1" width="1" height="1" transform="rotate(90)" fill="url(#' + fadeGradientId + ')">',
          foot: '</rect>'
        }

        return mask.head + linearGradient.head + stops + linearGradient.foot + rect.head + rect.foot + mask.foot
      }
    },
    {
      // boot details
      bootEasing: function () {
        if (typeof $.easing.easeOutBounce === 'function')  return true

        $.extend($.easing, {
          easeOutBounce: function (x, t, b, c, d) {
            var t = t / d

            var constant_1 = 2.75
            var constant_2 = 7.5625

            var result = c * (constant_2 * (t -= (2.625 / constant_1)) * t + 0.984375) + b

            if (t < (1 / constant_1)) {
              result = c * (constant_2 * t * t) + b
            }
            else if (t < (2 / constant_1)) {
              result = c * (constant_2 * (t -= (1.5 / constant_1)) * t + 0.75) + b
            }
            else if (t < (2.5 / constant_1)) {
              result = c * (constant_2 * (t -= (2.25 / constant_1)) * t + 0.9375) + b
            }

            return result
          },
        })
      },

      bootSVG: function () {
        var self = this
        var bootConfig = self.bootConfig

        var html = ''

        var svg = self._build_svg()

        $.each(bootConfig.filterConfigs, function (index, config) {
          var filter = self._build_filter(config.id)
          var feGaussianBlur = self._build_feGaussianBlur(config.stdDeviation)

          html += svg.head + filter.head + feGaussianBlur.head + feGaussianBlur.foot + filter.foot + svg.foot
        })

        html += svg.head + self._build_mask(bootConfig.fadeConfig.id) + svg.foot

        return html
      },

      bootStyle: function () {
        var self = this
        var bootConfig = self.bootConfig

        var style = ''
        var props = ['-webkit-filter', '-moz-filter', '-o-filter', '-ms-filter', 'filter']

        style += $.map(bootConfig.filterConfigs, function (config) {
          var klass = '.' + config.klass

          var rules = $.map(props, function (prop) {
            return prop + ':' + 'blur(' + config.blur + config.unit + ')'
          }).join(';')

          rules += ';filter: url(#' + config.id + ');'
          rules += "filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius='" + config.blur + "');"

          return klass + '{' + rules + '}'
        }).join('')

        var gradientProps = [
          'linear',
          'left top',
          'left bottom',
          'color-stop(0%, rgba(0, 0, 0, 0))',
          'color-stop(25%, rgba(0, 0, 0, 1))',
          'color-stop(75%, rgba(0, 0, 0, 1))',
          'color-stop(100%, rgba(0, 0, 0, 0))'
        ].join(',')

        style += '.' + bootConfig.fadeConfig.klass +
          '{' +
          '-webkit-mask-image: -webkit-gradient(' + gradientProps + ');' +
          'mask: url(#' + bootConfig.fadeConfig.id + ');' +
          '}'

        return '<style>' + style + '</style>'
      },

      boot: function () {
        var self = this

        booted = true

        self.bootEasing()

        $(document).ready(function () {
          var svg = self.bootSVG()

          var style = self.bootStyle()

          $('body').prepend(svg + style)
        })
      }
    },
    {
      // utils
      _isVisible: function () {
        var self = this

        var machine = self.nodes.machine

        var above = machine.offset().top > $(window).scrollTop() + $(window).height()
        var below = $(window).scrollTop() > machine.height() + machine.offset().top

        return !above && !below
      },

      _getMarginTop: function (position) {
        var self = this

        var solts = self.nodes.slots
        var position = position % solts.length

        var result = 0
        for (var i = 0; i < position; i++) {
          result += $(solts.get(i)).outerHeight()
        }

        return -result
      },

      _setBlurAndFade: function (speed, fade) {
        var self = this

        var bootConfig = self.bootConfig
        var machine = self.nodes.machine

        var klasses = $.map(bootConfig.filterConfigs, function (config) {
          return config.klass
        })

        machine.removeClass(klasses.join(' '))

        var matches = $.grep(klasses, function (klass) {
          return klass === speed
        })

        matches.length == 1 && machine.addClass(matches.pop());

        (!fade || speed === 'stop') ?
          machine.removeClass(bootConfig.fadeConfig.klass) :
          machine.addClass(bootConfig.fadeConfig.klass)
      },

      _animateMarginTop: function (config, onCompleted) {
        var self = this

        var blur = config.blur || 'fast'
        var fade = config.fade !== undefined ? config.fade : true
        var endIndex = config.endIndex
        var speed = config.speed !== undefined ? config.speed : self.config.speed
        var easing = config.easing || 'linear'

        var height = self.params.height
        var unit = self.params.unit

        var endIndex = endIndex !== undefined ? endIndex : self.nodes.slots.length
        var marginTop = String(-parseFloat(endIndex * height)) + unit
        var duration = Math.abs(+parseInt((endIndex == 0 ? 1 : endIndex) * speed))

        self._setBlurAndFade(blur, fade)

        self.active.animate = self.nodes.container.animate({
          marginTop: marginTop
        }, duration, easing, function () {
          self.active.animate = null

          onCompleted && onCompleted()
        })
      }
    },
    {
      // APIs
      prevSlot: function () {
        return {
          index: this.active.index - 1 < 0 ? -1 : this.active.index - 1,
        }
      },

      nextSlot: function () {
        return {
          index: this.active.index < this.nodes.slots.length ? this.active.index + 1 : 0
        }
      },

      randomSlot: function (times) {
        var self = this

        var times = times || Math.floor(Math.random() * 10)

        var finals = self.config.finals
        var seed = finals.length ? finals.length : self.nodes.slots.length

        var random = Math.floor(Math.random() * seed)
        while (times > 0) {
          random = Math.floor(Math.random() * seed)
          times--
        }

        return {
          index: finals.length ? finals[random] : random
        }
      },

      roll: function (times, onCompleted) {
        var self = this

        var container = self.nodes.container

        if (times === undefined) {
          self._animateMarginTop({
            blur: 'fast',
            fade: true
          }, function () {
            container.css('margin-top', 0)

            !self.states.forceStop && self.roll(times, onCompleted)
          })
        }
        else {
          if (times >= 1) {
            self._animateMarginTop({
              blur: times > 1 ? 'fast' : 'medium',
              fade: true
            }, function () {
              container.css('margin-top', 0)
              self.roll(times - 1, onCompleted)
            })
          }
          else {
            self.gamble({
              stopnow: true,
              onCompleted: onCompleted
            })
          }
        }
      },

      gamble: function (config, gambleMethod) {
        var self = this

        self.active.animate !== null && self.active.animate.stop()

        var random = typeof gambleMethod === 'function' ? gambleMethod() : self.randomSlot()

        if (config.stopnow || config.repeats < 1) {
          self._animateMarginTop({
            blur: 'slow',
            fade: true,
            endIndex: random.index + self.params.indexOffset,
            easing: 'easeOutBounce'
          }, function () {
            self.active.index = random.index
            self.states.running = false
            self.states.forceStop = false

            self._setBlurAndFade('stop')

            config.onCompleted && config.onCompleted({
              node: self.nodes.machine,
              machine: self,
              active: self.active
            })
          })
        }
        else {
          self.roll(config.repeats || 1, config.onCompleted)
        }
      },

      start: function (position, needReverse) {
        var self = this

        var nodes = self.nodes

        var machine = nodes.machine
        var slots = nodes.slots

        var params = machine.css('height').match(self.params.pattern)
        self.params.unit = params.pop()
        self.params.height = +parseFloat(params.pop()).toFixed(2)

        slots.wrapAll('<div class="' + nodes.container + '"></div>')
        self.nodes.container = machine.find('.' + nodes.container)

        self.nodes.patchSlot = $(slots.get(0)).clone()
        self.nodes.patchSlot.appendTo(self.nodes.container)

        if (needReverse) {
          self.nodes.reversePatchSlot = $(slots.get(slots.length - 1)).clone()
          self.nodes.reversePatchSlot.prependTo(self.nodes.container)
          self.params.indexOffset += 1
        }

        position && self.nodes.container.css('margin-top', self._getMarginTop(self.config.origin + self.params.indexOffset))
        machine.css('overflow', 'hidden')
      }
    }
  )

  $.fn.slotMachine = function (config) {
    var machine = $(this)
    var config = config

    var slotmachine = new SlotMachine(machine, config)
    var cycleTimer = null

    $.extend(machine, {
      isRunning: function () {
        return slotmachine.states.running
      },

      shuffle: function (onCompleted) {
        var times = slotmachine.config.times

        slotmachine.states.running = true

        if (slotmachine.config.delay > 0) {
          setTimeout(function () {
            slotmachine.roll(times, onCompleted)
          }, slotmachine.config.delay)
        }
        else {
          slotmachine.roll(times, onCompleted)
        }
      },

      prev: function (onCompleted) {
        if (slotmachine.states.running) return true

        slotmachine.states.running = true

        slotmachine.gamble({
          stopnow: true,
          onCompleted: function (result) {
            var result = result
            var params = slotmachine.params
            var len = slotmachine.nodes.slots.length

            if (slotmachine.active.index == -1) {
              slotmachine.nodes.container.css('margin-top', -(len * params.height) + params.unit)
              slotmachine.active.index = len - 1
              result.index = len - 1
            }

            onCompleted && onCompleted(result)
          }
        }, slotmachine.prevSlot.bind(slotmachine))
      },

      next: function (onCompleted) {
        if (slotmachine.states.running) return true

        slotmachine.states.running = true

        slotmachine.gamble({
          stopnow: true,
          onCompleted: function (result) {
            var result = result
            var params = slotmachine.params

            if (slotmachine.active.index == slotmachine.nodes.slots.length) {
              slotmachine.nodes.container.css('margin-top', -(params.indexOffset * params.height) + params.unit)
              slotmachine.active.index = 0
              result.index = 0
            }
            onCompleted && onCompleted(result)
          }
        }, slotmachine.nextSlot.bind(slotmachine))

      },

      stop: function (settings) {
        var settings = settings || {
            stopnow: true,
            onCompleted: null
          }

        slotmachine.states.forceStop = true

        if (config.repeat && cycleTimer !== null) {
          clearTimeout(cycleTimer)
        }

        slotmachine.gamble(settings)
      },

      cycle: function (settings) {
        var self = this

        var settings = settings || {
            delay: 1000,
            times: 3,
            onCompleted: null
          }

        slotmachine.states.running = true
        if (slotmachine.states.forceStop)  return false

        cycleTimer = setTimeout(function () {
          !slotmachine.states.forceStop && slotmachine.roll(settings.times, function (result) {
            clearTimeout(cycleTimer)

            settings.onCompleted && settings.onCompleted(result)

            cycleTimer = self.cycle(settings)
          })
        }, settings.delay)
      },

      start: function (settings, onCompleted) {
        var self = this

        var settings = settings || {}

        slotmachine.start(settings.position, settings.needReverse)

        settings.auto && self.shuffle(onCompleted)
      },
    })

    return machine
  }
})(window.jQuery)