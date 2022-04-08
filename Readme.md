# Luigi - an Intelligent Internet of Things (IIoT) barista

### Intro
This is my submission to the [Simumatik IoT Coffee Machine Challange](https://academy.simumatik.com/iot-challenge/). 

Luigi is a highly intelligent but completely useless IoT barista. Because he is only fitted with 3 buttons and an old display, he has to communicate with yes/no questions. Can you get him to pour you a coffee?

### Prerequisites
To run Luigi you will need
* an account at [simumatik.com](https://simumatik.com/) + simumatik launcher installed
* [nodejs](https://nodejs.org/) installed
* an mqtt broker with anonymous login


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
![youtube](https://imgyoutu.com/vi/xcjudPhLdfc/0.jpg)
