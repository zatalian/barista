// config file
var config = require(__dirname + "/../config.json");

// mqtt client
var mqtt = require('mqtt');
var { v4: uuid } = require('uuid');
var mqttClient = mqtt.connect(config.mqttBroker, {clientId:"Luigi-" + uuid(), clean: true, connectTimeout: 4000});

// mqtt client eventhandlers
mqttClient.on("error", function(error) {console.log("Luigi error: " + error)});
mqttClient.on("close", function() {console.log("Luigi disconnected")});
mqttClient.on("reconnect", function(){console.log("Luigi reconnect")});
mqttClient.on("offline", function(){console.log("Luigi offline")});

// on connect:
// publish default messages + subscribe to topic 
mqttClient.on('connect', () => 
{   
    try
    { 
        mqttClient.publish(config.mqttTopic + "add_milk", "OFF", {qos:2,retain:true});
        mqttClient.publish(config.mqttTopic + "add_coffee", "OFF", {qos:2,retain:true});
        mqttClient.publish(config.mqttTopic + "center_light", "OFF", {qos:2,retain:true});
        mqttClient.publish(config.mqttTopic + "display_text", " ", {qos:2,retain:true});
        mqttClient.subscribe(config.mqttTopic + "#");
    }
    catch (ex)
    {
        console.log("Luigi Connect Error: " + ex);
    }
    console.log("Luigi connected to server " + config.mqttBroker);
});

// button and level state of the coffee machine
var machine = 
{
    button: [false, false, false],
    prevButton: [false, false, false],
    coffee: 0,
    milk: 0
}
// on message received
// 
mqttClient.on('message', (topic, message) => 
{
    //console.log("recv: " + topic + ":" + message.toString());
    if (topic === config.mqttTopic + "button_left")
    {
        var button = (message.toString() === "ON");
        machine.button[0] = button && !machine.prevButton[0];
        machine.prevButton[0] = button;
    }
    else if (topic === config.mqttTopic + "button_center")
    {
        var button = (message.toString() === "ON");
        machine.button[1] = button && !machine.prevButton[1];
        machine.prevButton[1] = button;
    }
    else if (topic === config.mqttTopic + "button_right")
    {
        var button = (message.toString() === "ON");
        machine.button[2] = button && !machine.prevButton[2];
        machine.prevButton[2] = button;
    }
    else if (topic === config.mqttTopic + "level_coffee")
        machine.coffee = parseInt(message.toString());
    else if (topic === config.mqttTopic + "level_milk")
        machine.milk = parseInt(message.toString());
    //else console.log("unknown message received: " + topic + ":" + message.toString());

    //console.log(machine);
});

// process event handlers
process.on("uncaughtException", function(error)
{
    console.log("Luigi Uncaught Exception: " + error);
});

process.on("SIGINT", function()
{
    process.exit();
});

process.on('exit', function()
{
    mqttClient.end();
    console.log("Luici logging off");
});

// config file
var conversation = require(__dirname + config.conversation);

var state = 
{
    "switch": [0, -1],
    "next": [0],
    "actions": [],
    "message": [],
    "msgIndex": 0,
    "display": "",
    "yesno": false,
    "waiting": 0
}

async function run()
{
    if (state.switch[0] != state.switch[1]) console.log("Luigi running: " + state.switch[0]);
    state.switch[1] = state.switch[0];

    switch (state.switch[0])
    {
        case 0: // waiting for on button
            if (machine.button[1])
            {
                console.log("Luigi turning on...");
                machine.button[1] = false;

                // reset state object
                state.next = [0];
                state.actions = [];
                state.yesno = false;
                state.waiting = 0;
                if ("question" in state) delete state.question;
                state.display = "               ";

                state.switch[0] = 1;
            } 
            break;

        case 1: // find next message
            if (state.next.length > 0)
            {
                var msg = conversation.find(obj => obj.id == state.next[0]);
                if (typeof msg === "undefined") msg = conversation.find(obj => obj.id == -1);   // should not happen
                else state.next.shift();

                state.message = msg.message;
                state.msgIndex = 0;
                state.waiting = 0;
                if ("next" in msg) msg.next.forEach(item => state.next.push(item));
                if ("actions" in msg) msg.actions.forEach(item => state.actions.push(item)); else state.actions = [];
                if ("question" in msg) state.question = msg.question; else delete state.question;
                if ("interrupt" in msg) state.interrupt = msg.interrupt; else delete state.interrupt;
                if ("kill" in msg) state.kill = msg.kill; else delete state.kill;

                console.log(state);

                state.switch[0] = 2;
            }
            else state.switch[0] = -1;  // should not happen

            break;
        
        case 2: // display message
            if (state.display.length < 16)
            {
                if (state.msgIndex < state.message.length)
                {
                    state.display += state.message[state.msgIndex] + "                ";
                    state.msgIndex += 1;
                }
            }

            mqttClient.publish(config.mqttTopic + "display_text", state.display.substring(0, 16));
            state.display = state.display.substring(1);

            if (state.display.length < 16 && state.msgIndex == state.message.length) // done displaying
            {
                state.switch[0] = 3;    
            }
            else if (("interrupt" in state) && (machine.button[0] || machine.button[2])) // interrupt
            {
                machine.button[0] = false;
                machine.button[2] = false;

                state.display = state.display.trimEnd();
                if (state.display.length > 12) state.display = state.display.substring(0, 12);
                state.display += "... ";

                state.next = state.interrupt;
                delete state.interrupt;

                if (state.next[0] !== 102) state.next.unshift(99);
                //console.log("Luigi interrupted. Next messages are " + state.next);
                state.switch[0] = 1;
            }
            else if (("kill" in state) && (machine.button[1])) // kill
            {
                machine.button[1] = false;

                state.display = state.display.trimEnd();
                if (state.display.length > 12) state.display = state.display.substring(0, 12);
                state.display += "... ";

                state.next = [100];
                state.switch[0] = 1;
            }
            break;

        case 3: // process response
            if (state.actions.length > 0) state.switch[0] = state.actions[0];
            else if ("question" in state) state.switch[0] = 4;
            else if (state.next.length > 0) state.switch[0] = 1;
            else state.switch[0] = -1;  // should not happen
            break;

        case 4: // yes/no question
            if (state.yesno) mqttClient.publish(config.mqttTopic + "display_text", "<-YES       NO->");
            else mqttClient.publish(config.mqttTopic + "display_text", "<-NO       YES->");
            state.waiting += 1;

            if (((state.yesno) && (machine.button[0])) || ((!state.yesno) && (machine.button[2])))  // yes
            {
                machine.button[0] = false;
                machine.button[2] = false;
                state.next.push(state.question[0])
                state.switch[0] = 1;   
                delete state.question;
            }
            else if (((state.yesno) && (machine.button[2])) || ((!state.yesno) && (machine.button[0])))  // yes
            {
                machine.button[0] = false;
                machine.button[2] = false;

                state.next.push(state.question[1]);
                state.switch[0] = 1;    
                delete state.question;
            }
            else if (state.waiting > 80)
            {
                state.next = [101];
                state.switch[0] = 1;
                delete state.question;
            }
            break;

        case 5: // flip yesno
            state.actions.shift(); 
            state.yesno = !state.yesno;
            state.switch[0] = 3;
            break;

        default:
            console.log("Luigi got stuck...");
            state.next = [-1];
            state.switch[0] = 1;
            break;
    }

    setTimeout(run, 150);
}


// start Luigi
run();

