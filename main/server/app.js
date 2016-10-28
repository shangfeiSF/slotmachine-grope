#!/usr/bin/env node
var fs = require('fs')
var path = require('path')

var colors = require('colors')
var express = require('express')
var Promise = require("bluebird")

Promise.promisifyAll(fs)

var app = express()

app.use(express.static('../asset'))
app.use('/pages', express.static('../pages'))

app.get('/slotmachine.zp.jq.html', function (req, res) {
  var file = path.join(__dirname, '../pages/slotmachine.zp.jq.html')

  fs.readFile(file, function (error, data) {
    var html = data.toString('utf-8')
    res.writeHead(200)
    res.end(html)
  })
})

app.get('/slotmachine.jq.html', function (req, res) {
  var file = path.join(__dirname, '../pages/slotmachine.jq.html')

  fs.readFile(file, function (error, data) {
    var html = data.toString('utf-8')
    res.writeHead(200)
    res.end(html)
  })
})

app.listen(8080, function () {
  console.log('[Server] -- listening localhost:8080....'.green)
})