const path = require("path");
const root = path.join(path.dirname(require.main.filename), "../");

const Collection = require(path.join(root, "/src/database/collection"));
const YamlFile = require("../yamlfile");

class YamlCollection extends Collection {
    constructor(name, modelClass, path) {
        super(name, modelClass);

        this.name = name;
        this.path = path;

        const defaults = {};
        defaults[this.name] = [];
        this.yaml = new YamlFile(this.path, { defaults });
    }

    get data() {
        if (!this.yaml.loaded) return [];

        return this.yaml.get(this.name);
    }

    load() {
        return this.yaml.load();
    }

    matchQuery(item, query) {
        for (const key of Object.keys(query)) {
            if (query[key] !== item[key]) return false;
        }

        return true;
    }

    async find(query) {
        super.find(query);

        if (!this.yaml.loaded) await this.yaml.load();

        return this.data.filter(item => this.matchQuery(item, query)).map(item => new (this.modelClass)(item));
    }

    async findOne(query) {
        super.findOne(query);

        return (await this.find(query))[0];
    }

    async add(items) {
        super.add(items);

        if (!this.yaml.loaded) await this.yaml.load();

        for (const item of items) {
            this.data.push(item.toObject());
        }
    }

    addOne(item) {
        super.addOne(item);

        return this.add([item]);
    }

    async remove(query, { replace } = {}) {
        super.remove(query);

        if (!this.yaml.loaded) await this.yaml.load();

        for (let item of this.data) {
            if (!this.matchQuery(item, query)) continue;

            this.data.splice(this.data.indexOf(item), 1, replace);
        }
    }

    async removeOne(query, { replace } = {}) {
        super.removeOne(query);

        if (!this.yaml.loaded) await this.yaml.load();

        for (let item of this.data) {
            if (!this.matchQuery(item, query)) continue;

            this.data.splice(this.data.indexOf(item), 1, replace);

            return;
        }
    }

    update(query, item) {
        super.update(query, item);

        return this.remove(query, { replace: item.toObject() });
    }

    updateOne(query, item) {
        super.updateOne(query, item);

        return this.removeOne(query, { replace: item.toObject() });
    }

    save() {
        return this.yaml.save();
    }
}

module.exports = YamlCollection;
