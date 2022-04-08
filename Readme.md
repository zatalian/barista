# Luigi - an Intelligent Internet of Things (IIoT) barista

### Intro
This is my submission to the [Simumatik IoT Coffee Machine Challange](https://academy.simumatik.com/courses/iot-coffee-machine/). 

Luigi is a highly intelligent but completely useless IoT barista. Because the coffee machine is only fitted with buttons and an old text display, Luigi has to communicate with yes/no questions. Can you get him to pour you a coffee?


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
* adjust the `src/config.json` file as needed
* start Luigi with the following command: `node src/luigi.js`
* connect the Simumatik simulation to the gateway and start the simulation
* press the OK button to connect the coffee_machine to the mqtt broker
* press OK again to activate Luigi
* have fun :-)

### Video

