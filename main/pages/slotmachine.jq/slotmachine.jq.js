(function ($) {
  function SlotMachine(machine, config) {
    this.config = $.extend({}, this.defaultConfig, config)

    this.nodes = {
      container: 'container',
      machine: $(machine),
      slots: $(machine).children(),
    }

    this.states = {
      running: false,
      forceStop: false
    }

    this.params = {
      pattern: /([\d\.]*)(.*)/,
      unit: 'px',
      height: 0
    }

    this.active = {
      animate: null,
      index: config.origin,
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

    this.boot()
  }

  $.extend(SlotMachine.prototype,
    {
      // properties
      defaultConfig: {
        origin: 0,
        delay: 0,
        speed: 150,
        slowdown: 2,
        finals: [0]
      },
    },
    {
      // build auxiliary methods
      _build_svg: function () {
        return {
          head: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg">',
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
        this.bootEasing()

        $(document).ready(function () {
          var svg = this.bootSVG()

          var style = this.bootStyle()

          $('body').append(svg + style)
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

        var result = 0
        for (var i = 0; i < position; i++) {
          result += $(self.nodes.slots.get(i)).outerHeight()
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

        matches.length == 1 && machine.addClass(matches.pop())

        (!fade || speed === 'stop') ?
          machine.removeClass(bootConfig.fadeConfig.klass) :
          machine.addClass(bootConfig.fadeConfig.klass)
      },

      _animateMarginTop: function (config, onCompleted) {
        var self = this

        var blur = config.blur || 'fast'
        var fade = config.fade !== undefined ? config.fade : true
        var multiple = config.multiple
        var speed = config.speed !== undefined ? config.speed : self.config.speed
        var easing = config.easing || 'linear'

        var height = self.params.height
        var unit = self.params.unit

        var multiple = multiple !== undefined ? multiple : self.slots.length
        var marginTop = String(-parseFloat(multiple * height)) + unit
        var duration = Math.abs(+parseInt(multiple * speed))

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
          index: this.active.index - 1 < 0 ? this.nodes.slots.length - 1 : this.active.index - 1,
        }
      },

      nextSlot: function () {
        return {
          index: this.active.index + 1 < this.nodes.slots.length ? this.active.index + 1 : 0
        }
      },

      randomSlot: function () {
        var self = this

        var times = Math.floor(Math.random() * 10)
        var active = self.active
        var slotsLength = self.nodes.slots.length

        var finals = $.map(self.config.finals, function (final) {
          return final < slotsLength ? final : (final % slotsLength)
        })

        var length = finals.length

        var random = Math.floor(Math.random() * length)
        while (times > 0) {
          random = Math.floor(Math.random() * length)
          random !== active.index && times--
        }

        return {
          index: Number(finals[random])
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
            container.css("margin-top", 0)

            !self.states.forceStop && self.roll(times, onCompleted)
          })
        }
        else {
          if (times >= 1) {
            self._animateMarginTop({
              blur: times > 1 ? 'fast' : 'medium',
              fade: true
            }, function () {
              container.css("margin-top", 0)
              self.roll(times - 1)
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

        var container = self.nodes.container

        self.active.animate !== null && self.active.animate.stop()

        var random = typeof gambleMethod === 'function' ? gambleMethod() : self.randomSlot()
        random.index === 0 && container.css('margin-top', (-self.params.height / 2) + self.params.unit)

        if (config.stopnow || config.repeats <= 1) {
          self._animateMarginTop({
            blur: 'slow',
            fade: true,
            multiple: random.index,
            easing: 'easeOutBounce'
          }, function () {
            self.active.index = random.index
            self.states.running = false
            self.states.forceStop = false

            self._setBlurAndFade('stop')

            config.onCompleted && config.onCompleted()
          })
        }
        else {
          self.roll(config.repeats || 3)
        }
      },

      start: function (position) {
        var self = this

        var nodes = self.nodes

        var machine = nodes.machine
        var slots = nodes.slots

        var params = machine.css('height').match(self.params.pattern)
        self.params.unit = params.pop()
        self.params.height = +parseFloat(params.pop()).toFixed(2)

        slots.wrapAll('<div class="' + nodes.container + '"></div>')
        self.nodes.container = machine.find('.' + nodes.container)

        position && self.nodes.container.css("margin-top", self._getMarginTop(position))

        machine.css("overflow", "hidden")
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
          onCompleted: onCompleted
        }, slotmachine.prevSlot.bind(slotmachine))
      },

      next: function (onCompleted) {
        if (slotmachine.states.running) return true

        slotmachine.states.running = true

        slotmachine.gamble({
          stopnow: true,
          onCompleted: onCompleted
        }, slotmachine.nextSlot.bind(slotmachine))

      },

      stop: function (stopnowOrRepeats) {
        slotmachine.states.forceStop = true

        if (config.repeat && cycleTimer !== null) {
          clearTimeout(cycleTimer)
        }

        slotmachine.gamble(stopnowOrRepeats)
      },

      cycle: function (config) {
        var self = this

        var config = config || {
            delay: 1000,
            times: 3,
            onCompleted: null
          }

        if (!slotmachine.states.forceStop) {
          cycleTimer = setTimeout(function () {
              !slotmachine.states.forceStop && slotmachine.roll(config.times, config.onCompleted)

              cycleTimer = self.cycle(config)
            }, config.delay
          )
        }
      },

      start: function (config, onCompleted) {
        var self = this

        var config = config || {}

        slotmachine.start(config.position)

        config.auto && self.shuffle(onCompleted)
      },
    })

    return machine
  }
})(window.jQuery)