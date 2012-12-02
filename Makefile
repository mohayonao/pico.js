all:
	uglifyjs -m -o pico.js pico.dev.js

jshint:
	jshint pico.dev.js libs/*.js
