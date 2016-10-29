(function () {
  function onComplete(result) {
  }

  function build_floot_1() {
    var machine1 = $("#machine_1").slotMachine({
      active: 0,
      delay: 500
    })
    var machine2 = $("#machine_2").slotMachine({
      active: 0,
      delay: 500
    })
    var machine3 = $("#machine_3").slotMachine({
      active: 0,
      delay: 500
    })

    $("#go").click(function () {
      machine1.shuffle(3, onComplete)

      setTimeout(function () {
        machine2.shuffle(3, onComplete)
      }, 500)

      setTimeout(function () {
        machine3.shuffle(3, onComplete)
      }, 1000)
    })
  }

  function build_floot_2() {
    var machine4 = $("#machine_4").slotMachine({
      active: 0,
      delay: 500
    })
    var machine5 = $("#machine_5").slotMachine({
      active: 1,
      delay: 500
    })
    var machine6 = $("#machine_6").slotMachine({
      active: 2,
      delay: 500
    })

    $("#shuffle").click(function () {
      machine4.shuffle()
      machine5.shuffle()
      machine6.shuffle()
    })

    $("#stop").click(function () {
      if (machine4.isRunning()) {
        machine4.stop(true)
      }
      else {
        if (machine5.isRunning()) {
          machine5.stop(true)
        }
        else {
          machine6.isRunning() && machine6.stop(true)
        }
      }
    })
  }

  function build_floot_3() {
    var machine7 = $("#machine_7").slotMachine({
      active: 0,
      delay: 500
    })

    $("#down").click(function () {
      machine7.prev()
    })
    $("#up").click(function () {
      machine7.next()
    })
  }

  function build() {
    build_floot_1()
    build_floot_2()
    build_floot_3()
  }

  window.build = build
})()

$(document).ready(function () {
  window.build()
})