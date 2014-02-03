# Single Page Application Build
Your one-stop shop for a single-page application build that includes the following:

- SASS -> CSS building with minification in distribution phase
- JavaScript Modules -> Single JS File with minification in distribution phase
- Support for both CommonJS and AMD modules
- Both a Distribution Build and a Developer Build with optimizations that are appropriate for both
- The option to use NPM OR Bower for your front-end package manager
- A .editorconfig and .jshint file with some initialization to get you started
- Image optimization for distribution
- A stubbed out .gitignore to bootstrap things up
- An archive of the project with no GIT information, so you can do whatever you want VCS-wise
- A "watch" operation that utilizes live reload for pushing hot content
- The latest in JavaScript build technology! (Gulp, Webpack, SASS, and so much more!)

## Getting Started
You'll need the following installed to make this whole build operational:

### Required:
- Ruby, Ruby Gems, and the SASS Gem
- Node.js, NPM, and bower* installed

### Optional: 
- JSHint installed
- A zip utility to unarchive the latest.zip
- git or some sort of VCS

## Building
If you're familiar with this sort of a thing, just clone this repo and run `npm install` in the root directory. You're ready to go.

If not, here is the play-by-play:

- In command line, run `git clone https://github.com/joelgriffith/spa-build.git` in a folder of your choosing
- Then (again in the command line), run `cd spa-build && npm install`
- OPTIONAL: If you want to use this bootstrap of sorts without the git information from cloning, there is a `latest.zip` that is an archive of the project, minus the `.git/` folder
- You're ready to code!

## More specifically
The build process utilizies numerous packages and optimizations from the NPM/Gulp community. Many thanks to all of those packages! 
If you'd like to make changes, feel free to see the mostly annoted build code in `gulpfile.js` which includes all the information you'll need. Make changes as you see fit.
To that end, most of the build operations look for a manifest of some sort, this is either in the`src/js/index.js` or `src/scss/index.scss`. Include whatever modules/code in there and they'll be built out into one file.

## *Optional Packages
Due to the fractured nature of the front-end packages (NPM vs Bower), this build assumes you'll use BOTH by default. Since Node/NPM is required, it's assumed you'll likely NOT need Bower if you're going the browserify/NPM route. To that end, you can remove the Bower dependency by:

 - Deleting `.bowerrc` and `bower.json` files.
 - Removing the `bower install &&` text form the this snippet in package.json:

 	`"scripts": { 
 		"install": "bower install && gulp" 
 	}`
	
	Will now be:

 	`"scripts": { 
 		"install": "gulp" 
 	}`