# GeoFire for JavaScript — Realtime location queries with Firebase

[![Build Status](https://travis-ci.org/firebase/geofire-js.svg?branch=master)](https://travis-ci.org/firebase/geofire-js)
[![Coverage Status](https://coveralls.io/repos/github/firebase/geofire-js/badge.svg?branch=master)](https://coveralls.io/github/firebase/geofire-js?branch=master)
[![Version](https://badge.fury.io/gh/firebase%2Fgeofire-js.svg)](http://badge.fury.io/gh/firebase%2Fgeofire-js)

GeoFire is an open-source library that allows you to store and query a set of keys based on their
geographic location. At its heart, GeoFire simply stores locations with string keys. Its main
benefit, however, is the possibility of retrieving only those keys within a given geographic
area - all in realtime.

GeoFire uses the [Firebase](https://www.firebase.com/?utm_source=geofire-js) database for data storage, allowing
query results to be updated in realtime as they change. GeoFire *selectively loads only the data
near certain locations, keeping your applications light and responsive*, even with extremely large
datasets.

A compatible GeoFire client is also available for [Objective-C](https://github.com/firebase/geofire-objc)
and [Java](https://github.com/firebase/geofire-java).

### Integrating GeoFire with your data

GeoFire is designed as a lightweight add-on to Firebase. To keep things simple, GeoFire stores data
in its own format and its own location within your Firebase database. This allows your existing data format
and security rules to remain unchanged while still providing you with an easy solution for geo
queries.

### Example Usage

Assume you are building an app to rate bars and you store all information for a bar, e.g. name,
business hours and price range, at `/bars/<bar-id>`. Later, you want to add the possibility for
users to search for bars in their vicinity. This is where GeoFire comes in. You can store the
location for each bar using GeoFire, using the bar IDs as GeoFire keys. GeoFire then allows you to
easily query which bar IDs (the keys) are nearby. To display any additional information about the
bars, you can load the information for each bar returned by the query at `/bars/<bar-id>`.


## Live Demos

To see GeoFire in action, you can [play around with our fully-featured demo](https://geofire.firebaseapp.com/sfVehicles/index.html). (Drag the purple circle!)
This demo maps all of the San Francisco MUNI vehicles within a certain search radius. You can
drag around the search radius and see the vehicles update in realtime.

[![SF MUNI Demo Image](./examples/sfVehicles/images/sf-vehicles.png)](https://geofire.firebaseapp.com/sfVehicles/index.html)

You can find a full list of our demos [here](https://geofire.firebaseapp.com/index.html)
and view the code for each of them in the [examples directory](./examples/) of this repository.
The examples cover some of the common use cases for GeoFire and explain how to protect your data
using Security and Firebase Rules.


## Upgrading GeoFire

Using an older version of GeoFire and want to upgrade to the latest version? Check out our
[migration guides](./migration) to find out how!


## Downloading GeoFire

In order to use GeoFire in your project, you need to include the following files in your HTML:

```html
<!-- Firebase -->
<script src="https://cdn.firebase.com/js/client/2.4.1/firebase.js"></script>

<!-- GeoFire -->
<script src="https://cdn.firebase.com/libs/geofire/4.0.0/geofire.min.js"></script>
```

Use the URL above to download both the minified and non-minified versions of GeoFire from the
Firebase CDN. You can also download them from the
[releases page of this GitHub repository](https://github.com/firebase/geofire-js/releases).

You can also install GeoFire via npm or Bower. If downloading via npm, you will have to install
Firebase separately (because it is a peer dependency to GeoFire):

```bash
$ npm install geofire firebase --save
```

On Bower, the Firebase dependency will be downloaded automatically:

```bash
$ bower install geofire --save
```


## Getting Started with Firebase

GeoFire requires the Firebase database in order to store location data. You can [sign up here for a free account](https://www.firebase.com/signup/?utm_source=geofire-js).


## API Reference

### GeoFire

A `GeoFire` instance is used to read and write geolocation data to your Firebase database and to create queries.

#### new GeoFire(firebaseRef)

Creates and returns a new `GeoFire` instance to manage your location data. Data will be stored at
the location pointed to by `firebaseRef`. Note that this `firebaseRef` can point to anywhere in your Firebase database.

```JavaScript
// Create a Firebase reference where GeoFire will store its information
var firebaseRef = new Firebase("https://<your-firebase>.firebaseio.com/");

// Create a GeoFire index
var geoFire = new GeoFire(firebaseRef);
```

#### GeoFire.ref()

Returns the `Firebase` reference used to create this `GeoFire` instance.

```JavaScript
var firebaseRef = new Firebase("https://<your-firebase>.firebaseio.com/");
var geoFire = new GeoFire(firebaseRef);

var ref = geoFire.ref();  // ref === firebaseRef
```

#### GeoFire.set(keyOrLocations[, location])

Adds the specified key - location pair(s) to this `GeoFire`. If the provided `keyOrLocations`
argument is a string, the single `location` will be added. The `keyOrLocations` argument can also
be an object containing a mapping between keys and locations allowing you to add several locations
to GeoFire in one write. It is much more efficient to add several locations at once than to write
each one individually.

If any of the provided keys already exist in this `GeoFire`, they will be overwritten with the new
location values. Locations must have the form `[latitude, longitude]`.

Returns a promise which is fulfilled when the new location has been synchronized with the Firebase
servers.

Keys must be strings and [valid Firebase database key
names](https://www.firebase.com/docs/web/guide/understanding-data.html#section-creating-references?utm_source=geofire-js).

```JavaScript
geoFire.set("some_key", [37.79, -122.41]).then(function() {
  console.log("Provided key has been added to GeoFire");
}, function(error) {
  console.log("Error: " + error);
});
```

```JavaScript
geoFire.set({
  "some_key": [37.79, -122.41],
  "another_key": [36.98, -122.56]
}).then(function() {
  console.log("Provided keys have been added to GeoFire");
}, function(error) {
  console.log("Error: " + error);
});
```

#### GeoFire.get(key)

Fetches the location stored for `key`.

Returns a promise fulfilled with the `location` corresponding to the provided `key`.
If `key` does not exist, the returned promise is fulfilled with `null`.

```JavaScript
geoFire.get("some_key").then(function(location) {
  if (location === null) {
    console.log("Provided key is not in GeoFire");
  }
  else {
    console.log("Provided key has a location of " + location);
  }
}, function(error) {
  console.log("Error: " + error);
});
```

#### GeoFire.remove(key)

Removes the provided `key` from this `GeoFire`. Returns a promise fulfilled when
the removal of `key` has been synchronized with the Firebase servers. If the provided
`key` is not present in this `GeoFire`, the promise will still successfully resolve.

This is equivalent to calling `set(key, null)` or `set({ <key>: null })`.

```JavaScript
geoFire.remove("some_key").then(function() {
  console.log("Provided key has been removed from GeoFire");
}, function(error) {
  console.log("Error: " + error);
});
```

#### GeoFire.query(queryCriteria)

Creates and returns a new `GeoQuery` instance with the provided `queryCriteria`.

The `queryCriteria` describe a circular query and must be an object with the following keys:

* `center` - the center of this query, with the form `[latitude, longitude]`
* `radius` - the radius, in kilometers, from the center of this query in which to include results

```JavaScript
var geoQuery = geoFire.query({
  center: [10.38, 2.41],
  radius: 10.5
});
```

### GeoQuery

A standing query that tracks a set of keys matching a criteria. A new `GeoQuery` is created every time you call `GeoFire.query()`.

#### GeoQuery.center()

Returns the `location` signifying the center of this query.

The returned `location` will have the form `[latitude, longitude]`.

```JavaScript
var geoQuery = geoFire.query({
  center: [10.38, 2.41],
  radius: 10.5
});

var center = geoQuery.center();  // center === [10.38, 2.41]
```

#### GeoQuery.radius()

Returns the `radius` of this query, in kilometers.

```JavaScript
var geoQuery = geoFire.query({
  center: [10.38, 2.41],
  radius: 10.5
});

var radius = geoQuery.radius();  // radius === 10.5
```

#### GeoQuery.updateCriteria(newQueryCriteria)

Updates the criteria for this query.

`newQueryCriteria` must be an object containing `center`, `radius`, or both.

```JavaScript
var geoQuery = geoFire.query({
  center: [10.38, 2.41],
  radius: 10.5
});

var center = geoQuery.center();  // center === [10.38, 2.41]
var radius = geoQuery.radius();  // radius === 10.5

geoQuery.updateCriteria({
  center: [-50.83, 100.19],
  radius: 5
});

center = geoQuery.center();  // center === [-50.83, 100.19]
radius = geoQuery.radius();  // radius === 5

geoQuery.updateCriteria({
  radius: 7
});

center = geoQuery.center();  // center === [-50.83, 100.19]
radius = geoQuery.radius();  // radius === 7
```

#### GeoQuery.on(eventType, callback)

Attaches a `callback` to this query which will be run when the provided `eventType` fires. Valid `eventType` values are `ready`, `key_entered`, `key_exited`, and `key_moved`. The `ready` event `callback` is passed no parameters. All other `callbacks` will be passed three parameters:

1. the location's key
2. the location's [latitude, longitude] pair
3. the distance, in kilometers, from the location to this query's center

`ready` fires once when this query's initial state has been loaded from the server.
The `ready` event will fire after all other events associated with the loaded data
have been triggered. `ready` will fire again once each time `updateQuery()` is called, after all new data is loaded and all other new events have been fired.

`key_entered` fires when a key enters this query. This can happen when a key moves from a location outside of this query to one inside of it or when a key is written to `GeoFire` for the first time and it falls within this query.

`key_exited` fires when a key moves from a location inside of this query to one outside of it. If the key was entirely removed from `GeoFire`, both the location and distance passed to the `callback` will be `null`.

`key_moved` fires when a key which is already in this query moves to another location inside of it.

Returns a `GeoCallbackRegistration` which can be used to cancel the `callback`. You can add as many callbacks as you would like for the same `eventType` by repeatedly calling `on()`. Each one will get called when its corresponding `eventType` fires. Each `callback` must be cancelled individually.

```JavaScript
var onReadyRegistration = geoQuery.on("ready", function() {
  console.log("GeoQuery has loaded and fired all other events for initial data");
});

var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
  console.log(key + " entered query at " + location + " (" + distance + " km from center)");
});

var onKeyExitedRegistration = geoQuery.on("key_exited", function(key, location, distance) {
  console.log(key + " exited query to " + location + " (" + distance + " km from center)");
});

var onKeyMovedRegistration = geoQuery.on("key_moved", function(key, location, distance) {
  console.log(key + " moved within query to " + location + " (" + distance + " km from center)");
});
```

#### GeoQuery.cancel()

Terminates this query so that it no longer sends location updates. All callbacks attached to this query via `on()` will be cancelled. This query can no longer be used in the future.

```JavaScript
// This example stops listening for all key events in the query once the
// first key leaves the query

var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
  console.log(key + " entered query at " + location + " (" + distance + " km from center)");
});

var onKeyExitedRegistration = geoQuery.on("key_exited", function(key, location, distance) {
  console.log(key + " exited query to " + location + " (" + distance + " km from center)");

  // Cancel all of the query's callbacks
  geoQuery.cancel();
});
```

### GeoCallbackRegistration

An event registration which is used to cancel a `GeoQuery.on()` callback when it is no longer needed. A new `GeoCallbackRegistration` is returned every time you call `GeoQuery.on()`.

These are useful when you want to stop firing a callback for a certain `eventType` but do not want to cancel all of the query's event callbacks.

#### GeoCallbackRegistration.cancel()

Cancels this callback registration so that it no longer fires its callback. This has no effect on any other callback registrations you may have created.

```JavaScript
// This example stops listening for new keys entering the query once the
// first key leaves the query

var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
  console.log(key + " entered query at " + location + " (" + distance + " km from center)");
});

var onKeyExitedRegistration = geoQuery.on("key_exited", function(key, location, distance) {
  console.log(key + " exited query to " + location + " (" + distance + " km from center)");

  // Cancel the "key_entered" callback
  onKeyEnteredRegistration.cancel();
});
```

### Helper Methods

#### GeoFire.distance(location1, location2)

Static helper method which returns the distance, in kilometers, between `location1` and `location2`.

`location1` and `location1` must have the form `[latitude, longitude]`.

```JavaScript
var location1 = [10.3, -55.3];
var location2 = [-78.3, 105.6];

var distance = GeoFire.distance(location1, location2);  // distance === 12378.536597423461
```


## Promises

GeoFire uses promises when writing and retrieving data. Promises represent the result of a potentially
long-running operation and allow code to run asynchronously. Upon completion of the operation, the
promise will be "resolved" / "fulfilled" with the operation's result. This result will be passed to
the function defined in the promise's `then()` method.

If you are unfamiliar with promises, check out [this blog post](http://www.html5rocks.com/en/tutorials/es6/promises).
Here is a quick example of how to consume a promise:

```JavaScript
promise.then(function(result) {
  console.log("Promise was successfully resolved with the following value: " + result);
}, function(error) {
  console.log("Promise was rejected with the following error: " + error);
})
```


## Contributing

If you'd like to contribute to GeoFire, you'll need to run the following commands to get your environment set up:

```bash
$ git clone https://github.com/firebase/geofire-js.git
$ cd geofire-js         # go to the geofire directory
$ npm install -g gulp   # globally install gulp task runner
$ npm install -g bower  # globally install Bower package manager
$ npm install           # install local npm build / test dependencies
$ bower install         # install local JavaScript dependencies
$ gulp watch            # watch for source file changes
```

`gulp watch` will watch for changes in the `/src/` directory and lint, concatenate, and minify the source files when a change occurs. The output files - `geofire.js` and `geofire.min.js` - are written to the `/dist/` directory.

You can run the test suite by navigating to `file:///path/to/geofire-js/tests/index.html` or via the command line using `gulp test`.