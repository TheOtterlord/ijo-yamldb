const nodePath = require("path");
const root = nodePath.join(nodePath.dirname(require.main.filename), "../");

const fs = require("fs");
const {FSUtils} = require("ijo-utils");
const Database = require(nodePath.join(root, "/src/database/database"));
const YamlCollection = require("./collection");

class YamlDatabase extends Database {
    constructor({ path } = {}, { root } = {}) {
        super();

        this.path = path === undefined ? root : nodePath.join(root, path);
    }

    register(name, modelClass) {
        super.register(name, modelClass);

        this.collections.push(new YamlCollection(name, modelClass, nodePath.join(this.path, `${name}.yml`)));
    }

    unregister(name) {
        this.collections.splice(this.collection.findIndex(collection => collection.name === name));
    }

    collection(name) {
        super.collection(name);

        return this.collections.find(collection => collection.name === name);
    }

    async load() {
        if (!fs.existsSync(this.path) || !(await FSUtils.isFolder(this.path).catch(err => { throw err }))) {
            await FSUtils.createFolder(this.path).catch(err => { throw err });
        }

        for (const collection of this.collections) {
            await collection.load();
        }
    }

    async close() {
        super.close();

        for (const collection of this.collections) {
            await collection.save();
        }
    }
}

module.exports = YamlDatabase;
