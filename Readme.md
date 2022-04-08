# Luigi - an Intelligent Internet of Things (IIoT) barista

### Intro
This is my submission to the [Simumatik IoT Coffee Machine Challange](https://academy.simumatik.com/courses/iot-coffee-machine/). Luigi is a highly intelligent but completely useless IoT barista.

### Prerequisites
To run Luigi you will need
* an account at simumatik.com + simumatik launcher installed
* nodejs installed
* an mqtt broker with anonymous login allowed

### Getting Started
* start your mqtt broker
* go to [apps.simumatik.com](https://apps.simumatik.com) and start the IOT Coffee Machine. Point the coffee machine to your mqtt broker.
* download this repository
* open a terminal, go to the folder where you downloaded this repository and run the follwing command: `npm -a update`
* point the entry mqttBroker in the config file to your mqtt broker
* start Luigi with the following command: `node src/luigi.js`
* connect the Simumatik simulation to the gateway and start the simulation
* press the OK button to connect the coffee_machine to te mqtt broker
* press OK again to activate Luigi


