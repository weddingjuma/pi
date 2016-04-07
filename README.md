HospitalRun frontend
========

_Ember frontend for HospitalRun_

[![Build Status](https://travis-ci.org/HospitalRun/hospitalrun-frontend.svg?branch=master)](https://travis-ci.org/HospitalRun/hospitalrun-frontend)

To run the development environment for this frontend you will need to have [Git](https://git-scm.com/), [Node.js](https://nodejs.org), [Ember CLI](http://ember-cli.com/), [Bower](http://bower.io/) and [CouchDB](http://couchdb.apache.org/) installed.

## Install
To install the frontend please do the following:

1. Make sure you have installed [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
2. Make sure you have installed [Node.js](https://nodejs.org/en/download/). Versions after 0.10.0 should work, but please note if you encounter errors using 5.x it may be necessary to upgrade your npm version. Versions after 3.5.x should work:
    1. `npm install -g npm`
3. Install [ember-cli latest](https://www.npmjs.org/package/ember-cli): `npm install -g ember-cli@latest`.
   Depending on your [npm permissions](https://docs.npmjs.com/getting-started/fixing-npm-permissions) you might need root access to install ember-cli.
4. Install [bower](https://www.npmjs.org/package/bower): `npm install -g bower`
5. Make sure you have Ruby installed (for the scss linter).
6. Clone this repo with `git clone https://github.com/HospitalRun/hospitalrun-frontend`, go to the cloned folder and run `script/bootstrap`. (*Note: Depending on your [npm permissions](https://docs.npmjs.com/getting-started/fixing-npm-permissions) you might need root access to install PhantomJS2; also, Windows users must run with [Cygwin](http://cygwin.org/)*, and will need to install Ruby)
7. Install and configure [CouchDB](http://couchdb.apache.org/)
    1. Download and install CouchDB from http://couchdb.apache.org/#download
    2. Create admin user:
        1. If you have just installed CouchDB and have no admin user, please run `./script/initcouch.sh` in the folder you cloned the HospitalRun repo.  A user `hradmin` will be created with password: `test`.
        2. If you already have a CouchDB admin user, please run `./script/initcouch.sh USER PASS` in the folder you cloned the HospitalRun repo.  `USER` and `PASS` are the CouchDB admin user credentials.
8. Copy the `server/config-example.js` to `server/config.js` in the folder you cloned the HospitalRun repo.

### Experimental
If you are willing to try using `make`, ensure you have installed git, node and couchdb (steps 1, 2 and 6 above), you may skip the rest.  This requires couchdb in the path to work correctly.
* Run `make serve`, it will start couchdb, install npm dependencies and start the server.
* Run `make all` to run all tests and build the app.
* Look into `Makefile` to figure other targets available.

## Start
To start the frontend please do the following:

- Start the server by running `npm start` in the repo folder.
- Go to [http://localhost:4200/](http://localhost:4200/) in a browser and login with username `hradmin` and password `test`.

### Troubleshooting your local environment
Always make sure to `git pull` and get the latest from master.

The app will usually tell you when something needs to happen (i.e. if you try to `npm start` and npm is out of date, it will tell you to run `npm update`. But If you run into problems you can't resolve, feel free to open an issue, or ask for help in the [HospitalRun Slack channel](https://hospitalrun.slack.com/) (you can request an invite [here](https://hospitalrun-slackin.herokuapp.com/)).

Otherwise, here are some tips for common issues:

**The browser shows only a loading dialog**

Is your server (still) running? Is Couch running? If not, that's probably the issue.

**My changes aren't showing up in the browser**

Try a browser refresh `cmd + r`.

## Loading sample data
If you would like to load sample data, you can do so by navigating to **Load DB** under the Administration menu.  You should see the following screen:
![Load DB screenshot](screenshots/load-db.png)

Click on ***Choose File*** and select the file **sample-data.txt** which is included in root directory of the repo at [sample-data.txt](sample-data.txt).
Next, click on ***Load File***.  When the database load is complete a message will appear indicating if the load was successful.

## Testing

### Fixtures for Acceptance Tests

Fixtures are PouchDB dumps that are generated with [pouchdb-dump-cli](https://github.com/nolanlawson/pouchdb-dump-cli).

To create a fixture, run `pouchdb-dump http://localhost:5984/main -u hradmin -p test | cat > tests/fixtures/${name_of_fixture}.txt`.

To use a fixture, use `runWithPouchDump(${name_of_fixture}, function(){..});` in your acceptance test. For example,

```
test('visiting /patients', function(assert) {
  runWithPouchDump('default', function() {
    //Actual test code here
    authenticateUser();
    visit('/patients');
    andThen(function() {
      assert.equal(currentURL(), '/patients');
    });
  });
});
```

### The SCSS linter

To keep our styling scalable and consistent, we are using an [scss linter](https://www.npmjs.com/package/ember-cli-scss-lint) that will throw an error in the build if you do not conform to it's syntax rules. The syntax rules are defined in the [`.scss-lint.yml`](https://github.com/HospitalRun/hospitalrun-frontend/blob/master/.scss-lint.yml) file, and documentation for each linter is [available here](https://github.com/brigade/scss-lint/blob/master/lib/scss_lint/linter/README.md).

The easiest way to work with styles in the project and abide by our linting rules is to install the [linter-scss-lint](https://atom.io/packages/linter-scss-lint) package for Atom. The package will then show you in real time where your styles are breaking the linter and how to correct them.

## Contributing

Contributions are welcome via pull requests and issues.  Please see our [contributing guide](https://github.com/hospitalrun/hospitalrun-frontend/blob/master/.github/CONTRIBUTING.md) for more details.

**Seriously, please read the [Contribution Guide](https://github.com/hospitalrun/hospitalrun-frontend/blob/master/.github/CONTRIBUTING.md).**

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
