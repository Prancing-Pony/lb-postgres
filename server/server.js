'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback({loadBuiltinModels: false});

app.start = async function () {
  const ds = app.dataSources.pgdb;

  const schema = {
    name: String,
  };

  const Color = app.registry.createModel('color', schema);
  app.model(Color, {dataSource: 'pgdb'});



  // Create our models if there is an error selecting from them
  (async () => {
    const uncreated = [];
    for (var i = 0; i < app.models().length; i++) {
      var model = app.models()[i];

      try {
        let results = await model.find({limit: 10});
        console.log(results);
      } catch (e) {
        console.log(e);
        uncreated.push(model);
      }

    }

    try {
      // Does this work with async?
      await ds.automigrate(uncreated.map(m => m.name));
    } catch (e) {
      console.log(e);
    }
  })();


  // Testing that we get a string id back when we create something
  let result = await app.models.Color.create({name: 'icecream'});
  // Icecream's id shouldn't be a string, but it might be

  // For the base case, this model's returned ID is an int.  Maybe it has something to do with postgres data types?  Test laterz
  debugger;
  console.log(result.id);


  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
