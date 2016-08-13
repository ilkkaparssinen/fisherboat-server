# Introduction

#Internet enabled Raspberry Pi fishing boat

Raspberry Pi in boat, which controls GPS, camera and the motors. Boat is steered and controlled from web ui.

## Boat software consists of three projects:
 - **BOAT**:  python program which handles steering, gps, camera and other stuff. https://github.com/ilkkaparssinen/raspifisherboat
 - **WEB UI**: Angular 2 based web client. https://github.com/ilkkaparssinen/fisherboat-web
 - **SERVER**: This project: node.js server gets boat information via websockets and passess them forward to clients. Websocket connection is used also to pass information from client to boat (steering & speed). 

## Full description of project:
  
  Look from: https://github.com/ilkkaparssinen/raspifisherboat
 
## Server features:
 - Web socket connection from the boat and to the clients. 
 - Simple pub/sub server
 - Serves the static angular 2 files for the web app
 - Can support multiple boats (each boat must have their own boat id)
 - Simple node.js websocket solution. This was a quick hack, but it turned out to be surprisingly robust - I just put it running to EC2 and it just keeps running and responsing whenever we test the boat. No problems.

## Project structure
  - controllers/websocket.js - contains all web socket pub&sub logic
  - app.js - initializes the app. Uses express to server static files from public-directory. If you use project https://github.com/ilkkaparssinen/fisherboat-web, copy the static html + javascript etc. files here.
  - 
## Software license:
 - DWYWDBM-license: Do what you want, don't blame me

