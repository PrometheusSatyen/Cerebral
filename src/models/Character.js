'use strict';

import Store from 'electron-store';

import EsiClient from '../helpers/eve/EsiClient';
import TypeHelper from '../helpers/TypeHelper';
import StationHelper from '../helpers/StationHelper';
import StructureHelper from '../helpers/StructureHelper';

import AuthorizedCharacter from './AuthorizedCharacter';

import alphaSkillSet from '../../resources/alpha_skill_set';
import appProperties from '../../resources/properties';
import SystemHelper from '../helpers/SystemHelper';

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

    getFinishedSkillsInQueue() {
        const currentDate = new Date();

        return this.skillQueue.filter((o) => {
            return (o.hasOwnProperty('finish_date')) && (new Date(o.finish_date) < currentDate);
        });
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

    /**
     * Determining total SP is quite challenging. This is the method:
     *
     *  * Iterate over all skills the character has
     *  * If a skill is the currently training skill, we completely ignore the skillpoints_in_skill which CCP gives us.
     *    Instead, we use the training_start_sp figure from the queue, and then add on the projected SP which the
     *    character will have trained since the start_date.
     *  * Else if a skill is in the queue at least once listed as finished, we start with the skillpoints_in_skill
     *    figure for the skill. We then add on the difference between the end and start sp for each finished level of
     *    the skill in the queue.
     *  * Else, the skill is not in any way in the queue, and we can simply use the skillpoints_in_skill figure
     *
     * Note that this will NOT be accurate if the character is currently using a cerebral accelerator (boosters are not
     * shown in the API).
     *
     * @returns int projected character sp at this moment in time
     */
    getTotalSp() {
        let totalSp = 0;

        let currentSkill = this.getCurrentSkill();
        if (currentSkill === undefined) {
            return this.total_sp;
        }

        const finishedSkills = this.getFinishedSkillsInQueue();
        const finishedSkillIds = finishedSkills.map(o => o.skill_id);
        for(let skill of this.skills) {
            if (skill.skill_id === currentSkill.skill_id) {
                let startingMilliseconds = new Date(currentSkill.start_date).getTime();
                let millisecondsPassed = new Date().getTime() - startingMilliseconds;
                let additionalTrainedSp = millisecondsPassed * this.getCurrentSpPerMillisecond();
                totalSp += (currentSkill.training_start_sp + additionalTrainedSp);
            } else if (finishedSkillIds.includes(skill.skill_id)) {
                const queueEntries = finishedSkills.filter(o => o.skill_id === skill.skill_id);

                for(let queueEntry of queueEntries) {
                    totalSp += (queueEntry.level_end_sp - queueEntry.training_start_sp);
                }

                totalSp += skill.skillpoints_in_skill;
            } else {
                totalSp += skill.skillpoints_in_skill;
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
            this.refreshImplants(),
            this.refreshJumpClones(),
            this.refreshLocation(),
            this.refreshShip()
        ]);
    }

    getDateOfBirth() {
        return new Date(this.birthday);
    }

    getNextYearlyRemapDate() {
        const remapAvailable = new Date(this.attributes.accrued_remap_cooldown_date);
        return remapAvailable > new Date() ? remapAvailable : true;
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

    async refreshJumpClones() {
        if (this.shouldRefresh('clones')) {
            let client = new EsiClient();

            let authInfo = AuthorizedCharacter.get(this.id);
            client.auth(await authInfo.getAccessToken());

            let cloneData = await client.get('characters/' + this.id + '/clones', 'v3');

            // home location
            this.home_location = cloneData.home_location;
            if (this.home_location.location_type === 'station') {
                const station = await StationHelper.resolveStation(this.home_location.location_id);
                delete station.system.planets;
                this.home_location.location = station;
            } else if (this.home_location.location_type === 'structure') {
                const structure = await StructureHelper.resolveStructure(this.home_location.location_id, client, this.id);
                if (structure !== undefined) {
                    delete structure.system.planets;
                    this.home_location.location = structure;
                }
            }

            // general jump clone data + resolve implant names/dogma attributes in the clones
            let promises = [];
            this.jumpClones = [];
            for (let jumpCloneData of cloneData.jump_clones) {
                let jumpClone = {};

                jumpClone.implants = [];
                for (let id of jumpCloneData.implants) {
                    jumpClone.implants.push({id: id});
                }

                Array.prototype.push.apply(promises, jumpClone.implants.map((o) => {
                    return TypeHelper.resolveType(o.id).then(res => {
                        o.name = res.name;
                        o.dogmaAttributes = res.dogma_attributes;
                        return o;
                    });
                }));

                delete jumpCloneData.implants;
                Object.assign(jumpClone, jumpCloneData);

                this.jumpClones.push(jumpClone);
            }

            // resolve locations
            Array.prototype.push.apply(promises, this.jumpClones.map((o) => {
                if (o.location_type === "station") {
                    return StationHelper.resolveStation(o.location_id).then(station => {
                        delete station.system.planets;
                        o.location = station;
                        return o;
                    });
                } else if (o.location_type === "structure") {
                    return StructureHelper.resolveStructure(o.location_id, client, authInfo.id).then(structure => {
                        if (structure !== undefined) {
                            delete structure.system.planets;
                            o.location = structure;
                        }
                        return o;
                    });
                } else {
                    return Promise.resolve(undefined); // unknown location type (wtf? this won't happen, if it does, smths changed with jump clones)
                }
            }));

            await Promise.all(promises);

            this.save();
            this.markRefreshed('clones');
        }
    }

    async refreshLocation() {
        if (this.shouldRefresh('location')) {
            let client = new EsiClient();

            let authInfo = AuthorizedCharacter.get(this.id);
            client.auth(await authInfo.getAccessToken());

            this.location = await client.get('characters/' + this.id + '/location', 'v1');

            // standardising solar_system_id --> system_id since ccp is indecisive
            this.location.system_id = this.location.solar_system_id;
            delete this.location.solar_system_id;
            this.location.system = await SystemHelper.resolveSystem(this.location.system_id);

            // lookup station/structure
            if (this.location.station_id !== undefined) {
                const station = await StationHelper.resolveStation(this.location.station_id);
                delete station.system.planets;
                this.location.location = station;
            } else if (this.location.structure_id !== undefined) {
                const structure = await StructureHelper.resolveStructure(this.location.structure_id, client, this.id);
                if (structure !== undefined) {
                    delete structure.system.planets;
                    this.location.location = structure;
                }
            }

            this.save();
            this.markRefreshed('location');
        }
    }

    async refreshShip() {
        if (this.shouldRefresh('ship')) {
            let client = new EsiClient();

            let authInfo = AuthorizedCharacter.get(this.id);
            client.auth(await authInfo.getAccessToken());

            this.ship = await client.get('characters/' + this.id + '/ship', 'v1');
            this.ship.type = await TypeHelper.resolveType(this.ship.ship_type_id);

            this.save();
            this.markRefreshed('ship');
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