'use strict';

import Store from 'electron-store';

import EsiClient from '../helpers/eve/EsiClient';
import TypeHelper from '../helpers/TypeHelper';

import AuthorizedCharacter from './AuthorizedCharacter';

import alphaSkillSet from '../../resources/alpha_skill_set';
import appProperties from '../../resources/properties';

let subscribedComponents = [];
let characters;
const charactersStore = new Store({
    name: 'character-data'
});
let charactersSaveTimeout;

class Character {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.nextRefreshes = {};
    }

    getCurrentSkill() {
        const currentDate = new Date();

        for(let o of this.skillQueue) {
            if ((o.hasOwnProperty('finish_date')) && (new Date(o.finish_date) > currentDate)) {
                return o;
            }
        }

        return undefined;
    }

    getLastSkill() {
        let lastDate = new Date();
        let lastSkill = undefined;

        for(let o of this.skillQueue) {
            if ((o.hasOwnProperty('finish_date')) && (new Date(o.finish_date) > lastDate)) {
                lastSkill = o;
                lastDate = new Date(o.finish_date);
            }
        }

        return lastSkill;
    }

    getCurrentSpPerMillisecond() {
        let currentSkill = this.getCurrentSkill();
        if (currentSkill === undefined) {
            return 0;
        }

        let startingSp = currentSkill.training_start_sp;
        let startingMilliseconds = new Date(currentSkill.start_date).getTime();
        let endingSp = currentSkill.level_end_sp;
        let endingMilliseconds = new Date(currentSkill.finish_date).getTime();
        return (endingSp - startingSp) / (endingMilliseconds - startingMilliseconds);
    }

    getCurrentSpPerHour() {
        return Math.round(this.getCurrentSpPerMillisecond() * 1000 * 3600);
    }

    getInjectorsReady(baseSp) {
        if (baseSp === undefined) {
            baseSp = 5000000;
        }

        return Math.max(0, Math.floor((this.getTotalSp() - baseSp) / 500000));
    }

    getNextInjectorDate(baseSp) {
        if (baseSp === undefined) {
            baseSp = 5000000;
        }

        const currentSp = this.getTotalSp();
        const nextInjectorTotalSp = baseSp + ((this.getInjectorsReady(baseSp) + 1) * 500000);

        const spNeeded = nextInjectorTotalSp - currentSp;
        const millisecondsToTrainSp = spNeeded / this.getCurrentSpPerMillisecond();

        return new Date(new Date().getTime() + millisecondsToTrainSp);
    }

    getTotalSp() {
        let totalSp = 0;

        let currentSkill = this.getCurrentSkill();
        if (currentSkill === undefined) {
            return this.total_sp;
        }

        for(let skill of this.skills) {
            if (skill.skill_id !== currentSkill.skill_id) {
                totalSp += skill.skillpoints_in_skill;
            } else {
                // Note: THIS WILL NOT BE ACCURATE IF TRAINING BOOSTERS HAVE BEEN TAKEN
                let startingMilliseconds = new Date(currentSkill.start_date).getTime();
                let millisecondsPassed = new Date().getTime() - startingMilliseconds;
                let additionalTrainedSp = millisecondsPassed * this.getCurrentSpPerMillisecond();
                totalSp += (currentSkill.training_start_sp + additionalTrainedSp);
            }
        }

        return Math.floor(totalSp);
    }

    isOmega() {
        // if they have >5 mil sp and a skill actively training, must be omega
        if ((this.total_sp > 5000000) && (this.getCurrentSkill() !== null)) {
            return true;
        }

        // if they have any skills with active level > enabled, must be alpha
        if (this.skills.find(o => o.active_skill_level > o.trained_skill_level) !== undefined) {
            return false;
        }

        // if they have any skills with a higher active level than the maximum alpha level, must be omega
        if (this.skills.find(o =>
                !alphaSkillSet.hasOwnProperty(o.name) ||
                o.active_skill_level > alphaSkillSet[o.name]
            ) !== undefined) {
            return true;
        }

        // if they have any skills starting >24 hours in the future with a scheduled finish date, must be omega
        if (this.skills.find(o =>
                (new Date(o.start_date).getTime()) > (new Date().getTime() + 24*60*60) &&
                o.hasOwnProperty('finish_date')
            ) !== undefined) {
            return true;
        }

        // no definitive answer
        return undefined;
    }

    async refreshAll() {
        // first refresh basic info which will be needed for the rest of the calls
        await this.refreshInfo();

        // asynchronously fetch all the other information and return a promise which resolves when everything is fetched
        return Promise.all([
            this.refreshPortrait(),
            this.refreshSkills(),
            this.refreshSkillQueue(),
            this.refreshAttributes(),
            this.refreshCorporation(),
            this.refreshAlliance(),
            this.refreshWallet(),
            this.refreshImplants()
        ]);
    }

    async refreshInfo() {
        if (this.shouldRefresh('character_info')) {
            let client = new EsiClient();
            let charData = await client.get('characters/' + this.id, 'v4');
            Object.assign(this, charData);
            this.save();
            this.markRefreshed('character_info');
        }
    }

    async refreshPortrait() {
        if (this.shouldRefresh('portrait')) {
            let client = new EsiClient();
            this.portraits = await client.get('characters/' + this.id + '/portrait', 'v2');
            this.save();
            this.markRefreshed('portrait');
        }
    }

    async refreshCorporation() {
        if (this.shouldRefresh('corporation')) {
            let client = new EsiClient();
            this.corporation = await client.get('corporations/' + this.corporation_id, 'v4');
            this.save();
            this.markRefreshed('corporation');
        }
    }

    async refreshAlliance() {
        if (this.shouldRefresh('alliance')) {
            if (this.alliance_id !== undefined) {
                let client = new EsiClient();
                this.alliance = await client.get('alliances/' + this.alliance_id, 'v3');
                this.save();
                this.markRefreshed('alliance');
            }
        }
    }

    async refreshSkills() {
        if (this.shouldRefresh('skills')) {
            let client = new EsiClient();

            let authInfo = AuthorizedCharacter.get(this.id);
            client.auth(await authInfo.getAccessToken());

            let skillData = await client.get('characters/' + this.id + '/skills', 'v4');
            Object.assign(this, skillData);

            let promises = this.skills.map((o) => {
                return TypeHelper.resolveType(o.skill_id).then(res => {
                    o.skill_name = res.name;
                    return o;
                });
            });

            await Promise.all(promises);

            this.save();
            this.markRefreshed('skills');
        }
    }

    async refreshSkillQueue() {
        if (this.shouldRefresh('skill_queue')) {
            let client = new EsiClient();

            let authInfo = AuthorizedCharacter.get(this.id);
            client.auth(await authInfo.getAccessToken());

            this.skillQueue = await client.get('characters/' + this.id + '/skillqueue', 'v2');

            let promises = this.skillQueue.map((o) => {
                return TypeHelper.resolveType(o.skill_id).then(res => {
                    o.skill_name = res.name;
                    return o;
                });
            });

            await Promise.all(promises);

            this.save();
            this.markRefreshed('skill_queue');
        }
    }

    async refreshAttributes() {
        if (this.shouldRefresh('attributes')) {
            let client = new EsiClient();

            let authInfo = AuthorizedCharacter.get(this.id);
            client.auth(await authInfo.getAccessToken());

            this.attributes = await client.get('characters/' + this.id + '/attributes', 'v1');
            this.save();
            this.markRefreshed('attributes');
        }
    }

    async refreshImplants() {
        if (this.shouldRefresh('implants')) {
            let client = new EsiClient();

            let authInfo = AuthorizedCharacter.get(this.id);
            client.auth(await authInfo.getAccessToken());

            let implantIds = await client.get('characters/' + this.id + '/implants', 'v1');
            this.implants = [];
            for (let id of implantIds) {
                this.implants.push({id: id});
            }

            let promises = this.implants.map((o) => {
                return TypeHelper.resolveType(o.id).then(res => {
                    o.name = res.name;
                    o.dogmaAttributes = res.dogma_attributes;
                    return o;
                });
            });

            await Promise.all(promises);

            this.save();
            this.markRefreshed('implants');
        }
    }

    async refreshWallet() {
        if (this.shouldRefresh('wallet')) {
            let client = new EsiClient();

            let authInfo = AuthorizedCharacter.get(this.id);
            client.auth(await authInfo.getAccessToken());

            this.balance = await client.get('characters/' + this.id + '/wallet', 'v1');
            this.save();
            this.markRefreshed('wallet');
        }
    }

    shouldRefresh(type) {
        return (!this.nextRefreshes.hasOwnProperty(type)) || (new Date(this.nextRefreshes[type].do) < new Date());
    }

    markRefreshed(type) {
        this.nextRefreshes[type] = {
            last: new Date(),
            do: new Date(new Date().getTime() + appProperties.refresh_intervals[type] * 1000)
        };
    }

    static async build() {
        Character.suspendSubscribers();

        let authorizedChars = AuthorizedCharacter.getAll();

        let promises = [];
        Object.keys(authorizedChars).map(id => {
            if (characters.hasOwnProperty(id)) {
                promises.push(characters[id].refreshAll());
            } else {
                let char = new Character(id);
                promises.push(char.refreshAll());
                characters[id] = char;
            }
        });

        await Promise.all(promises);

        Character.pushToSubscribers();
    }

    static getAll() {
        return characters;
    }

    static get(id) {
        return characters[id];
    }

    static load() {
        if (characters === undefined) {
            let rawCharacters = charactersStore.get('characters');
            let newCharacters = {};

            if (rawCharacters !== undefined) {
                Object.keys(rawCharacters).map(id => {
                    newCharacters[id] = new Character();
                    Object.assign(newCharacters[id], rawCharacters[id])
                });
            }

            characters = newCharacters;
        }
    }

    save() {
        if (characters !== undefined) {
            characters[this.id] = this;

            if (charactersSaveTimeout !== undefined) {
                clearTimeout(charactersSaveTimeout);
            }

            charactersSaveTimeout = setTimeout(() => {
                charactersStore.set('characters', characters);
            }, 10000);
        }
    }

    saveImmediately() {
        if (characters !== undefined) {
            characters[this.id] = this;

            if (charactersSaveTimeout !== undefined) {
                clearTimeout(charactersSaveTimeout);
            }

            charactersStore.set('characters', characters);
        }
    }

    static subscribe(component) {
        return subscribedComponents.push(component) - 1;
    }

    static unsubscribe(id) {
        subscribedComponents[id] = null;
    }

    static suspendSubscribers() {
        for(let component of subscribedComponents) {
            if (component !== null) {
                component.setState({'ticking': false});
            }
        }
    }

    static pushToSubscribers() {
        for(let component of subscribedComponents) {
            if (component !== null) {
                component.setState({'characters': Object.values(Character.getAll()).sort((a, b) => b.getTotalSp() - a.getTotalSp())});
                component.setState({'ticking': true});
            }
        }
    }
}

Character.load();

setInterval(Character.build, 60000);

export default Character;