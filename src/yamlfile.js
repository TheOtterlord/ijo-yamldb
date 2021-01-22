const fs = require("fs");
const yaml = require("js-yaml");
const {FSUtils} = require("ijo-utils");

/**
 * This class handles the data along with transforming it between formats.
 * This is based off the `ConfigFile` class from `ijo-utils`.
 */
class YamlFile {
    /**
	 * 
	 * @param {string} path The path to the yaml file
	 * @param {object} defaults The default data (if file doesn't exist)
	 */
    constructor(path, {defaults = {}} = {}) {
        this.path = path;
        this.data = undefined;
        this.options = {defaults};
        this.loaded = false;
    }

    /**
	 * Get an object
	 * @param {string} key The key of object to get
	 */
    get(key) {
        if (!this.loaded) return undefined;

        return this.data[key];
    }

    /**
	 * Asynchronously Load the file (or use defaults if no file exists)
	 */
    async load() {
        if (!FSUtils.exists(this.path) || !(await FSUtils.isFile(this.path).catch(err => {throw err}))) {
            if (!this.options.defaults) throw Error("File not found.");

            this.data = this.options.defaults;
            this.loaded = true;
            await this.save().catch(err => {throw err});

            return;
        }

        this.data = await new Promise((resolve, reject) => {
            fs.readFile(this.path, (err, data) => {
                if (err) reject(err);
                else {
                    try {
                        resolve(yaml.load(data.toString()));
                    }
                    catch (err) {
                        reject(err);
                    }
                }
            });
        }).catch(err => {throw err});
        this.loaded = true;
    }

    /**
	 * Synchronously load the file (or use defaults if no file exists)
	 */
    loadSync() {
        if (!FSUtils.exists(this.path) || !this.isFileSync()) {
            if (!this.options.defaults) throw Error("File not found.");

            this.data = this.options.defaults;
            this.loaded = true;
            this.saveSync();

            return;
        }

        try {
            const data = fs.readFileSync(this.path);
            this.data = yaml.load(data.toString());
            this.loaded = true;
        }
        catch (err) {
            // TODO: add better handling
            throw err;
        }
    }
  
    /**
	 * Returns synchronously if the specified path is actually a file.
	 * @returns {Boolean} A boolean if the config file is actually a file.
	 */
    isFileSync() {
        return fs.statSync(this.path).isFile();
    }

    /**
	 * Saves the yaml file asynchronously and adds some spacing for better readability.
	 * @returns {Promise} A promise that is resolved after the config file has been saved.
	 */
    save() {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.path, this.toString({spaces: 2}), err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
	 * Saves the yaml file synchronously and adds some spacing for better readability.
	 */
    saveSync() {
        fs.writeFileSync(this.path, this.toString({spaces: 2}));
    }
	
    /**
	 * Convert the JavaScript object to yaml, returning it as a string
	 * @param {object} options The options to use when generating yaml
	 * @param {Function} options.replacer The replacer (see JSON.stringify)
	 * @param {number} options.spaces The number of spaces to use for indentation
	 * @returns {string} The generated yaml
	 */
    toString({replacer, spaces} = {}) {
        return yaml.dump(this.data, replacer, spaces);
    }
}

module.exports = YamlFile;
