var Store = require('./store')
var slice = [].slice

function Vuex (options) {
  options = options || {}
  this.debug = options.debug
  this.debugHandler = options.debugHandler
  this.subs = []
  this.actions = {}
  this.history = []
  this.stores = []
  var mixin = createMixin(this)
  var Vue = options.injectActions
  if (Vue) {
    var inject = [mixin.created]
    Vue.options.created = Vue.options.created
      ? inject.concat(Vue.options.created)
      : inject
  } else {
    this.mixin = mixin
  }
}

Vuex.prototype.dispatch = function (action) {
  var args = slice.call(arguments, 1)
  this._dispatch(action, args)
}

Vuex.prototype._dispatch = function (action, args) {
  var record
  if (this.debug) {
    record = {
      action: action,
      args: args,
      timestamp: Date.now(),
      affectedStores: []
    }
    this.history.push(record)
  }
  for (var i = 0; i < this.stores.length; i++) {
    this.stores[i].handleAction(action, args, this.debug)
  }
  if (this.debug) {
    if (this.debugHandler) {
      this.debugHandler(record)
    } else {
      console.log(record)
    }
  }
}

Vuex.prototype.registerAction = function (action) {
  var self = this
  function dispatch () {
    self._dispatch(action, slice.call(arguments))
  }
  if (!this.actions[action]) {
    this.actions[action] = dispatch
  }
  this.subs.forEach(function (sub) {
    sub[action] = dispatch
  })
}

Vuex.prototype.createStore = function (options) {
  var store = new Store(options, this)
  this.stores.push(store)
  return store
}

function createMixin (flux) {
  return {
    created: function () {
      var vm = this
      Object.keys(flux.actions).forEach(function (action) {
        vm[action] = flux.actions[action]
      })
      flux.subs.push(this)
    }
  }
}

module.exports = Vuex
