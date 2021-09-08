scripts:
build: tsc to compile our code
prepare: this is a NPM hook which executes a command before publishing to npm ( we tell it the execute the build command above )