const YamlDatabase = require("./database/database");

/**
 * Loads the plugin
 * @param {Core} core IJO's core
 */
function load(core) {
    core.databaseTypes.register("yaml", YamlDatabase);
}

module.exports = {
    load
};
