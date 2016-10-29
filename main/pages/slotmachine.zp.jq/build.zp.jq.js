(function () {
  function onComplete(result) {
    var MAP = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]

    console.warn('id ---', result.node.attr('id'))
    console.log('index ---', result.active.index)
    console.log('value ---', MAP[result.active.index])
    console.info(result.machine)
  }

  function build_floot_1(SlotMachine) {
    var machine1 = new SlotMachine('#machine_1', {
      origin: 4,
      delay: 500,
      times: 3,
      finals: [2, 3, 4, 5, 6, 7, 8]
    })
    var machine2 = new SlotMachine('#machine_2', {
      origin: 1,
      delay: 800,
      times: 4,
      finals: [2, 3]
    })
    var machine3 = new SlotMachine('#machine_3', {
      origin: 2,
      delay: 1100,
      times: 3,
      finals: [4, 5]
    })

    machine1.start({
      auto: false,
      position: true
    }, onComplete)
    machine2.start({
      auto: false,
      position: true
    }, onComplete)
    machine3.start({
      auto: false,
      position: true
    }, onComplete)

    $('#go').click(function () {
      if (machine1.isRunning() || machine2.isRunning() || machine3.isRunning()) {
        return false
      }
      machine1.shuffle(onComplete)
      machine2.shuffle(onComplete)
      machine3.shuffle(onComplete)
    })
  }

  function build_floot_2(SlotMachine) {
    var machine4 = new SlotMachine('#machine_4', {
      origin: 3,
      delay: 500,
      shake: false,
      finals: [3, 4]
    })
    var machine5 = new SlotMachine('#machine_5', {
      origin: 4,
      delay: 600,
      shake: true,
      finals: [5, 6]
    })
    var machine6 = new SlotMachine('#machine_6', {
      origin: 5,
      delay: 800,
      shake: true,
      finals: [7, 8]
    })

    machine4.start({
      position: true
    })
    machine5.start({
      position: true
    })
    machine6.start({
      position: true
    })

    $('#shuffle').click(function () {
      if (machine4.isRunning() || machine5.isRunning() || machine6.isRunning()) {
        return false
      }
      machine4.shuffle(onComplete)
      machine5.shuffle(onComplete)
      machine6.shuffle(onComplete)
    })
    $('#stop').click(function () {
      if (machine4.isRunning()) {
        machine4.stop()
      }
      else {
        if (machine5.isRunning()) {
          machine5.stop()
        }
        else {
          machine6.isRunning() && machine6.stop()
        }
      }
    })
  }

  function build_floot_3(SlotMachine) {
    var machine7 = new SlotMachine('#machine_7', {
      origin: 9,
      delay: 200,
      speed: 400
    })
    machine7.start({
      position: true
    })

    $('#down').click(function () {
      machine7.prev(onComplete)
    })
    $('#up').click(function () {
      machine7.next(onComplete)
    })
  }

  function build() {
    var SlotMachine = window.buildSlotmachine(window.$)

    build_floot_1(SlotMachine)
    build_floot_2(SlotMachine)
    build_floot_3(SlotMachine)
  }

  window.build = build
})()

var params = window.location.search.slice(1).split('&')

var useJquery = false
for (var i = 0; i < params.length; i++) {
  if (params[i] === 'jq') {
    useJquery = true
    break
  }
}

var script = document.createElement('script')
script.type = "text/javascript"
script.src = useJquery ? '/jquery.js' : '/zepto.min.js'
script.onload = function () {
  $(document).ready(function () {
    window.build()
  })
}

document.getElementsByTagName('head')[0].appendChild(script)


