(function () {
  function onComplete(result) {
    console.warn('id ---', result.node.attr('id'))
    console.log('index ---', result.active.index)
    console.info(result.machine)
  }

  function build_floot_1() {
    var machine1 = $("#machine_1").slotMachine({
      origin: 0,
      delay: 700,
      times: 5,
      speed: 200,
      finals: [0, 1, 2]
    })
    var machine2 = $("#machine_2").slotMachine({
      origin: 1,
      delay: 700,
      times: 4,
      speed: 250,
      finals: [1, 2, 3]
    })
    var machine3 = $("#machine_3").slotMachine({
      origin: 2,
      delay: 700,
      times: 3,
      speed: 300,
      finals: []
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

    $("#go").click(function () {
      if (machine1.isRunning() || machine2.isRunning() || machine3.isRunning()) {
        return false
      }
      machine1.shuffle(onComplete)
      machine2.shuffle(onComplete)
      machine3.shuffle(onComplete)
    })
  }

  function build_floot_2() {
    var machine4 = $("#machine_4").slotMachine({
      origin: 1,
      delay: 100,
      finals: [3, 4, 5]
    })
    var machine5 = $("#machine_5").slotMachine({
      origin: 2,
      delay: 200,
      finals: [0, 1, 2, 3, 4, 5]
    })
    var machine6 = $("#machine_6").slotMachine({
      origin: 3,
      delay: 300,
      finals: [0, 1, 2, 3, 4, 5]
    })

    machine4.start({
      auto: false,
      position: true
    })
    machine5.start({
      auto: false,
      position: true
    })
    machine6.start({
      auto: false,
      position: true
    })

    $("#shuffle").click(function () {
      if (machine4.isRunning() || machine5.isRunning() || machine6.isRunning()) {
        return false
      }
      machine4.shuffle(onComplete)
      machine5.shuffle(onComplete)
      machine6.shuffle(onComplete)
    })

    $("#stop").click(function () {
      if (machine4.isRunning()) {
        // stop after roll 2 times
        machine4.stop({
          repeats: 2
        })
      }
      else {
        if (machine5.isRunning()) {
          // stop after roll 1 time
          machine5.stop({
            stopnow: false
          })
        }
        else {
          // stop immediately
          machine6.isRunning() && machine6.stop()
        }
      }
    })
  }

  function build_floot_3() {
    var machine7 = $("#machine_7").slotMachine({
      origin: 9,
      delay: 100,
      speed: 300
    })

    machine7.start({
      auto: false,
      position: true
    })

    $("#down").click(function () {
      machine7.prev(onComplete)
    })
    $("#up").click(function () {
      machine7.next(onComplete)
    })
  }

  function build_floot_4() {
    var machine8 = $("#machine_8").slotMachine({
      origin: 1,
      speed: 150
    })

    machine8.start({
      auto: false,
      position: true
    })

    machine8.cycle({
      delay: 2000,
      times: 5,
      onCompleted: onComplete
    })
  }

  function build() {
    build_floot_1()
    build_floot_2()
    build_floot_3()
    build_floot_4()
  }

  window.build = build
})()

$(document).ready(function () {
  window.build()
})