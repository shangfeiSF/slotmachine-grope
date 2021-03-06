window.buildSlotmachine = function ($) {
  function SlotMachine(machine, config) {
    this.config = $.extend({}, this.defaultConfig, config)

    this.nodes = {
      machine: $(machine)
    }

    this.states = {
      running: false,
      forceStop: false
    }

    this.jq = $.fn && $.fn.jquery !== undefined

    this.params = {
      pattern: /([\d\.]*)(.*)/,
      unit: 'px',
      height: 0
    }

    this.active = {
      index: config.origin,
    }
  }

  $.extend(SlotMachine.prototype,
    {
      // properties
      defaultConfig: {
        origin: 0,
        delay: 0,
        speed: 150,
        slowdown: 2,
        shake: false,
        finals: [0]
      },

      klasses: {
        fast: 'fast',
        medium: 'medium',
        slow: 'slow',
        fade: 'fade'
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

      _setBlurAndFade: function (speed, fade) {
        var self = this

        var machine = self.nodes.machine

        var klasses = self.klasses
        var clearKlasses = [klasses.fast, klasses.medium, klasses.slow].join(' ')

        machine.removeClass(clearKlasses)

        switch (speed) {
          case 'fast':
            machine.addClass(klasses.fast)
            break

          case 'medium':
            machine.addClass(klasses.medium)
            break

          case 'slow':
            machine.addClass(klasses.slow)
            break
        }

        (!fade || speed === 'stop') ?
          machine.removeClass(klasses.fade) :
          machine.addClass(klasses.fade)
      },

      _animateBackgroundPositionY: function (config, onCompleted) {
        var self = this

        var blur = config.blur || 'fast'
        var fade = config.fade !== undefined ? config.fade : true
        var multiple = config.multiple
        var speed = config.speed !== undefined ? config.speed : self.config.speed

        var machine = self.nodes.machine

        var height = self.params.height
        var unit = self.params.unit

        var multiple = multiple !== undefined ? multiple : 10
        var originalBackgroundPositionY = +parseFloat(machine.css('background-position-y'))
        var backgroundPositionY = originalBackgroundPositionY - parseFloat(multiple * height)
        var duration = Math.abs(+parseInt(multiple * speed))

        self._setBlurAndFade(blur, fade)

        var props = {}
        props[self.jq ? 'backgroundPositionY' : 'background-position-y'] = String(backgroundPositionY) + unit

        var easing = 'linear'
        if (config.easing) {
          if (self.jq) {
            if (config.easing === 'swing' || config.easing === 'linear') {
              easing = config.easing
            }
          } else {
            easing = config.easing
          }
        }

        machine.animate(props, duration, easing, function () {
          onCompleted && onCompleted()
        })
      },

      _reviseBackgroundPositionY: function () {
        this.nodes.machine.css(
          'background-position-y',
          -(this.active.index * this.params.height) + this.params.unit
        )
      },
    },
    {
      // auxiliary methods
      _boot: function (position) {
        var self = this

        var machine = self.nodes.machine

        var params = machine.css('height').match(self.params.pattern)

        self.params.unit = params.pop()
        self.params.height = +parseFloat(params.pop()).toFixed(2)

        position && machine.css('background-position-y',
          (+parseFloat(machine.css('background-position-y')) - parseFloat(self.config.origin * self.params.height)) + self.params.unit
        )

        machine.css("overflow", "hidden")
      },

      _roll: function (times, onCompleted) {
        var self = this

        if (times === undefined) {
          self._animateBackgroundPositionY({
            blur: 'medium',
            fade: true
          }, function () {
            if (self.states.forceStop) {
              self._gamble({
                onCompleted: onCompleted
              })
            }
            else {
              self._roll(times, onCompleted)
            }
          })
        }
        else {
          var temp = Math.floor(Math.random() * 10)

          if (times > 1) {
            self._animateBackgroundPositionY({
              blur: 'medium',
              fade: true,
              multiple: 10 * (times - 1) + temp,
              easing: 'ease-in-out'
            }, function () {
              self.active.index = (self.active.index + temp) % 10
              self._gamble({
                onCompleted: onCompleted
              })
            })
          }
          else {
            self._gamble({
              onCompleted: onCompleted
            })
          }
        }
      },

      _gamble: function (config, gambleMethod) {
        var self = this

        self.states.forceStop = true

        var random = typeof gambleMethod === 'function' ? gambleMethod() : self._randomPosition()

        var speed = parseInt(self.config.speed * self.config.slowdown)
        var multiple = 10 - self.active.index + random.index

        var shake = config.shake !== undefined ? config.shake : self.config.shake

        if (shake) {
          speed = self.config.speed

          if ((random.index - self.active.index) < -8) {
            multiple = 1
          }
          else if ((random.index - self.active.index) > 8) {
            multiple = -1
          }
          else {
            multiple = random.index - self.active.index
          }
        }

        setTimeout(function () {
          self._animateBackgroundPositionY({
            blur: 'slow',
            fade: true,
            speed: speed,
            multiple: multiple,
            easing: 'ease-in-out'
          }, function () {
            self.active = random

            self._reviseBackgroundPositionY()

            self.states.running = false
            self.states.forceStop = false

            self._setBlurAndFade('stop')

            config.onCompleted && config.onCompleted({
              node: self.nodes.machine,
              machine: self,
              active: self.active
            })
          })
        }, 0)
      }
    },
    {
      // update this.active
      _prevPosition: function () {
        return {
          index: (this.active.index + 1) > 9 ? 0 : (this.active.index + 1),
        }
      },

      _nextPosition: function () {
        return {
          index: (this.active.index - 1) < 0 ? 9 : (this.active.index - 1)
        }
      },

      _randomPosition: function (times) {
        var self = this

        var times = times || Math.floor(Math.random() * 10)

        var finals = self.config.finals
        var seed = finals.length ? finals.length : 10

        var random = Math.floor(Math.random() * seed)
        while (times > 0) {
          random = Math.floor(Math.random() * seed)
          times--
        }

        return {
          index: finals.length ? finals[random] : random
        }
      }
    },
    {
      // APIs
      isRunning: function () {
        return this.states.running
      },

      shuffle: function (onCompleted) {
        var self = this

        var times = self.config.times

        self.states.running = true

        if (self.config.delay > 0) {
          setTimeout(function () {
            self._roll(times, onCompleted)
          }, self.config.delay)
        }
        else {
          self._roll(times, onCompleted)
        }
      },

      prev: function (onCompleted) {
        var self = this

        if (!self.states.running) {
          self.states.running = true

          self._gamble({
            shake: true,
            onCompleted: onCompleted
          }, self._prevPosition.bind(self))
        }
      },

      next: function (onCompleted) {
        var self = this

        if (!self.states.running) {
          self.states.running = true

          self._gamble({
            shake: true,
            onCompleted: onCompleted
          }, self._nextPosition.bind(self))
        }
      },

      stop: function () {
        this.states.forceStop = true
      },

      start: function (config, onCompleted) {
        var self = this

        var config = config || {}

        self._boot(config.position)

        config.auto && self.shuffle(onCompleted)
      }
    }
  )

  return SlotMachine
}