const mongoose = require('mongoose');
const MigrateMongoose = require('../../src/lib');

mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true }).then((mongooseConn) => {
    let options = {
        migrationsPath: 'examples/programmatic-usage/migrations',
        connection: mongooseConn.connection,
        autosync: true // if making a CLI app, set this to false to prompt the user, otherwise true
    }

    let migrator = new MigrateMongoose(options);
    let logPrune = (result) => {
        if (result && result.length > 0) {
            for (const el of result) {
                console.info("\x1b[93m%s\x1b[0m", `Migrate removed from DB: ${el.name}`);
            }
        }
    }
    let logUp = (result) => {
        if (result && result.length > 0) {
            for (const el of result) {
                console.info("\x1b[92m%s\x1b[0m", `Migrate UP: ${el.name}`);
            }
        } else {
            console.debug("\x1b[93m%s\x1b[0m", "No migrate up results.");
        }
    }
    migrator
        .prune()
        .then(result => {
            logPrune(result);
            return migrator.run("up");
        })
        .then(result => {
            logUp(result);
            process.exit();
        })
        .catch(err => {
            if (err && ["There are no migrations to run", "There are no pending migrations."].includes(err.message)) {
                console.info("\x1b[92m%s\x1b[0m", "No migrations run.");
            } else {
                console.error("Migrate error!", err);
            }
        });
}).catch((err) => {
    console.error(err);
})
