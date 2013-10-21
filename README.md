bloomboard
===

3rd Year Group Project
### To build:

    npm install -g karma node-inspector nodemon grunt-cli
    npm install


### To run:

    grunt

Running grunt should start the server with node-inspector (a node server debugger) and watch for any changes in your files (i.e. if you save changes to any files, the node server should be restarted to reflect any changes)

### To test:

    grunt test

runs server side tests using jasmine-node and client side tests using karma

all tests use the jasmine testing framework (http://pivotal.github.io/jasmine/)
