'use strict';

import EsiClient from './eve/EsiClient';

export default class BulkIdResolver {

    constructor() {
        this.ids = [];
        this.results = {};
    }

    addId(id) {
        if ((id !== 0) && (id !== undefined) && (!this.ids.includes(id))) {
            this.ids.push(id);
        }
    }

    async resolve() {
        try {
            if (this.ids.length === 0) {
                return true;
            }

            const client = new EsiClient();
            const res = await client.post('universe/names', 'v2', [], {
                body: this.ids
            });

            for (const o of res) {
                this.results[o.id] = {
                    name: o.name,
                    category: o.category
                };
            }

            return true;
        } catch(err) {
            console.log(err);
            throw err;
        }
    }

    get(id) {
        return (this.results.hasOwnProperty(id)) ? this.results[id] : undefined;
    }
}