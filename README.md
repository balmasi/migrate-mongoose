# migrate-mongoose
A node based migration framework for ES6+ for mongoose

#### Motivation
migrate-mongoose is a migration framework for projects which are already using mongoose.
 

**Most other migration frameworks:**
- Use a local state file to keep track of which migrations have been run: This is a problem for PaS providers like heroku where the file system is wiped each time you deploy
- Not configurable enough: There are not a granular enough controls to manage which migrations get run
- Rely on a document-level migration: You have to change your application code to run a migration if it hasn't been run on a document you're working with

**migrate-mongoose:**
- Stores migration state in MongoDB
- Provides plenty of features such as 
    - Access to mongoose models in migrations
    - Use of promises or standard callbacks
    - custom config files or env variables for migration options
    - ability to delete unused migrations
- Relies on a simple *GLOBAL* state of whether or not each migration has been called 
    


### Getting Started with the CLI
You can install it locally in your project
```
 npm install migrate-mongoose
```
and then run
```
./node_modules/.bin/migrate [command] [options]
```

#### OR

Install it globally
```
 npm install -g migrate-mongoose
```
and then run
```
migrate [command] [options]
```

### Usage
```
Usage: migrate -d <mongo-uri> [[create|up|down<migration-name>]|list|prune] [optional options]

Commands:
  list                     Lists all migrations and their current state.
  create <migration-name>  Creates a new migration file.
  up [migration-name]      Migrates all the migration files that have not yet
                           been run in chronological order. Not including
                           [migration-name] will run UP on all migrations that
                           are in a DOWN state.
  down <migration-name>    Rolls back all migrations down to given name (if down
                           function was provided)
  prune                    Allows you to delete extraneous migrations by
                           removing extraneous local migration files/database
                           migrations.
 
 
Options:
  -d, --dbConnectionUri   The URI of the database connection                           [string] [required]
  --collection            The mongo collection name to use for migrations [string] [default: "migrations"]
  --md, --migrations-dir  The path to the migration files               [string] [default: "./migrations"]
  -t, --template-file     The template file to use when creating a migration                      [string]
  -c, --change-dir        Change current working directory before running  anything               [string]
  --autosync              Automatically add any migrations on filesystem but not in db to db     [boolean]
                          rather than asking interactively (use in scripts)
  -h, --help              Show help                                                              [boolean]

 
 
Examples:
  node_modules/.bin/migrate list -d mongodb://localhost/migrations
  node_modules/.bin/migrate create add_users -d mongodb://localhost/migrations
  node_modules/.bin/migrate up add_user -d mongodb://localhost/migrations
  node_modules/.bin/migrate down delete_names -d mongodb://localhost/migrations
  node_modules/.bin/migrate prune -d mongodb://localhost/migrations
  node_modules/.bin/migrate list --config settings.json
```


### Setting Options Automatically
If you want to not provide the options such as `--dbConnectionUri` to the program every time you have 2 options.

#### 1. Set the option as an Environment Variable with the prefix MIGRATE_
```
export MIGRATE_dbConnectionUri=localhost/migrations
```

`.env` files are also supported. All variables will be read from the `.env` file and set by migrate-mongoose.

```bash
#.env
MIGRATE_dbConnectionUri=mongodb://localhost:27017/mydb
```

#### 2. Provide a config file (defaults to *migrate.json* or *migrate.js*)
```bash
# If you have migrate.json in the directory, you don't need to do anything
migrate list
 
# Otherwise you can provide a config file
migrate list --config somePath/myCustomConfigFile[.json]
```


#### Options Override Order:
Command line args _beat_ Env vars _beats_ Config File

Just make sure you don't have aliases of the same option with 2 different values between env vars and config file


### Migration Files
By default, migrate-mongoose assumes your migration folder exists.

Here's an example of a migration created using `migrate create some-migration-name` . This example demonstrates how you can access your `mongoose` models and handle errors in your migrations


#### migrations/1562460744403-some-migration-name.js
```javascript
/**
 * Easy flow control
 */
// Notice no need for callback 
async function up() {
  // Error handling is as easy as throwing an error  
  if (condition) {
    throw new Error('This is an error. Could not complete migration');  
  }
  
  // You can just run your updates and when function finishes the migration is assumed to be done!
  await new Promise((resolve, reject) => {
    setTimeout(()=> { resolve('ok'); }, 3000);
  });
  
  // ========  OR ===========
  // just return the promise! It will succeed when it resolves or fail when rejected 
  return lib.getPromise();
  
}

module.exports = { up, down };
```


### Access to mongoose models in your migrations

Just go about your business as usual, importing your models and making changes to your database.

migrate-mongoose makes an independent connection to MongoDB to fetch and write migration states and makes no assumptions about your database configurations or even prevent you from making changes to multiple or even non-mongo databases in your migrations. As long as you can import the references to your models you can use them in migrations.

Below is an example of a typical setup in a mongoose project

  #### models/user.js
```javascript
mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
});

const getUserModel = (connection) => {
  return connection.model('user', UserSchema);
};

module.exports = {
  UserSchema,
  getUserModel,
};
```

#### migrations/1459287720919-my-migration.js
```javascript
const { getUserModel } = require('../models/user');

async function up() {
  const User = getUserModel(this.connection);
  // Then you can use it in the migration like so  
  await User.create({ firstName: 'Ada', lastName: 'Lovelace' });
  
  // OR do something such as
  const users = await User.find();
  /* Do something with users */
}
```

If you're using the package programmatically. You can access your models using the connection constructed from Migrator with through the `this` context.

```javascript
const { getUserModel } = require('../models/user');

async function up() {
  const User = getUserModel(this.connection);
  await User.create({ firstName: 'Ada', lastName: 'Lovelace' });
}
```

### Notes

Currently, the **-d**/**dbConnectionUri**  must include the database to use for migrations in the uri.

example: `-d mongodb://localhost:27017/development` . 

If you don't want to pass it in every time feel free to use the `migrate.json` config file or an environment variable


### Examples
Feel Free to check out the examples in the project to get a better idea of usage

### How to contribute
1. Start an issue. We will discuss the best approach
2. Make a pull request. I'll review it and comment until we are both confident about it
3. I'll merge your PR and bump the version of the package
