// Keep list of sockets/connections
// Ideally subscriptions could be in redis
// Note - here is no cleaning logic, these strucutures can be polluted
// Simple subscribe system for boat data
//
// Two types of cleints
// BOAT: = boat (receives SETTINGS, and at startup sends SETTINGS initial values). sends STATUS
// CLIENT = angular client (sends and receives SETTINGS, receives STATUS
// topic = boat id
//
// CAn handle multiple boats
// DAta in socket is always format
// {topic: "BOATNUMBER", action: "PING,SUBSCRIBE,STATUS,SETTINGS",  possible data fields}

var subscriptions = [];
var boats = [];

module.exports.connection = function (ws) {
  console.log("Connected");
  ws.on('message', function incoming(message) {
    console.log("Message:" + message.substr(0,100));

    try {
      var data = JSON.parse(message);
      if (!data.action) return;
      if (data.action === "PING") {
        ping(ws);
      }
      if (data.action === "SUBSCRIBE") {
        subscribe(ws, data);
      }
      if (data.action === "STATUS") {
        receiveStatus(ws, data);
      }
      if (data.action === "IMAGE") {
        passClients(ws, data);
      }
      if (data.action === "SETTINGS") {
        receiveSettings(ws, data);
      }
    } catch (err) {
      console.log(err);
    }

  });
  ws.on('close', function close() {
    unsubscribe(ws);
    console.log('disconnected');
  });
};

function ping(ws) {
  ws.send(JSON.stringify({action: "PING"}));
}
function subscribe(ws, data) {
  try {
    console.log("Subscribe");
    console.log(data);

    var subs = {};
    subs.type = data.type;
    subs.topic = data.topic; // Topic = BOAT ID
    subs.ws = ws;
    subscriptions.push(subs);
    // Create boat if don't we have it
    if (!boats[data.topic]) {
      boats[data.topic] = {status: {}, settings: {}};
    } else {
      if (data.type === "CLIENT") {
        sendStatus(ws, data.topic);
        sendSettings(ws, data.topic);
      }
    }
  } catch (err) {
    console.log(err);
  }
}

function sendStatus(ws, topic) {
    console.log("Send status:" + topic);
  var message = Object.assign({}, boats[topic].status);
  message.topic = topic;
  message.action = "STATUS";
  ws.send(JSON.stringify(message));
}

function sendSettings(ws, topic) {
  var message = Object.assign({}, boats[topic].settings);
  message.topic = topic;
  message.action = "SETTINGS";
  ws.send(JSON.stringify(message));
}

function unsubscribe(ws) {
  for (var i = subscriptions.length - 1; i >= 0; i--) {
    if (ws === subscriptions[i].ws) {
      subscriptions.splice(i, 1);
    }
  }
}

function receiveSettings(ws, data) {
  var boat = boats[data.topic];
  console.log("Receive settings");
  console.log(data);
  if (!boat) {
    console.log("Unknown boat at receive settings");
    console.log(data);
    return;
  }
  // Copy settings execept topc and action field
  boat.settings = Object.assign({}, data);
  delete boat.settings.topic;
  delete boat.settings.action;

  for (var i = 0; i < subscriptions.length; i++) {
    var subs = subscription[i];
    if (ws != subs.ws && data.topic === subs.topic) {
      sendSettings(subs.ws, subs.topic);
    }
  }
}
function passClients(ws, data) {
  var boat = boats[data.topic];
  console.log("Pass data to clients (probably image)");
  if (!boat) {
    console.log("Unknown boat at pass Clients");
    return;
  }
  // Copy settings execept topc and action field

  // Send status to all subscribers
  for (var i = 0; i < subscriptions.length; i++) {
    var subs = subscriptions[i];
    if (subs.type === "CLIENT" && data.topic === subs.topic) {
      ws.send(JSON.stringify(data));

    }
  }
}
function receiveStatus(ws, data) {
  var boat = boats[data.topic];
  console.log("Receive status");
  console.log(data);
  if (!boat) {
    console.log("Unknown boat at receive status");
    console.log(data);
    return;
  }
  // Copy settings execept topc and action field

  boat.status = Object.assign({}, data);
  delete boat.status.topic;
  delete boat.status.action;
  // Send status to all subscribers
  for (var i = 0; i < subscriptions.length; i++) {
    var subs = subscriptions[i];
    if (subs.type === "CLIENT" && data.topic === subs.topic) {
      sendStatus(subs.ws, subs.topic);
    }
  }
}

// Just put random data to T
var the_interval = 5 * 1000;
setInterval(function () {
  boats["TEST"] = {
    status: {
      latitude: Math.random() * 0.001 + 61.6039, longitude: Math.random() * 0.001 + 28.2278, speed: Math.random() * 4.0,
      track: Math.random() * 360, song: 1, state: 1
    },
    settings: {
      speed: Math.random(), turn: Math.random(), speed_change_cycle: 2 + Math.random() * 10,
      speed_motors_full_percent: Math.random() * 99,
      low_speed_percent: Math.random() * 99, play_music: false
    }
  };

  for (var i = 0; i < subscriptions.length; i++) {
    var subs = subscriptions[i];
    if (subs.topic === "TEST") {
      if (subs.type === "CLIENT") sendStatus(subs.ws, subs.topic);
      sendSettings(subs.ws, subs.topic);
    }
  }

  console.log("I am doing my 5 second test");


}, the_interval);
