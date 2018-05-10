'use strict';

import Store from 'electron-store';


let skillPlans = undefined;
const skillPlansStore = new Store({
    name: 'skillplans-store',
});
let skillPlansLastUsed = 0;
let thingsSaveTimeout;

export default class SkillPlanStore {

    /**
     * Retrieves skill plan
     *
     * @param {string}  characterId Character ID
     * @param {string}  planId ID of the plan
     * @returns {object} Plan object or undefined
     */
    static getSkillPlan(characterId, planId) {
        characterId = characterId.toString();

        SkillPlanStore.require();

        if (skillPlans.hasOwnProperty(characterId) && skillPlans[characterId].hasOwnProperty(planId)) {
            return skillPlans[characterId][planId];
        }
        return undefined;

        skillPlansLastUsed = new Date().getTime();
    }

    /**
     * Write skillplan to storage
     *
     * @param {string} characterId Character ID
     * @param {string} planId ID of the plan
     * @param {string} name Name of the plan
     * @param {array} queue Plan queue to store
     */
    static storeSkillPlan(characterId, planId, name, queue) {
        characterId = characterId.toString();

        SkillPlanStore.require();

        if (!skillPlans.hasOwnProperty(characterId)) {
            skillPlans[characterId] = {};
        }

        if (planId !== undefined && !skillPlans[characterId].hasOwnProperty(planId)) {
            skillPlans[characterId][planId] = {};
            skillPlans[characterId][planId].queue = [...queue];
            skillPlans[characterId][planId].name = name;
            skillPlans[characterId][planId].lastSaved = new Date().getTime();
        } else if (planId !== undefined && skillPlans[characterId].hasOwnProperty(planId)) {
            skillPlans[characterId][planId].queue = [...queue];
            skillPlans[characterId][planId].name = name;
            skillPlans[characterId][planId].lastSaved = new Date().getTime();
        }

        skillPlansLastUsed = new Date().getTime();
        SkillPlanStore.save();
    }

    /**
     * Deleted skill plan
     *
     * @param {string}  characterId Character ID
     * @param {string}  planId ID of the plan
     */
    static deleteSkillPlan(characterId, planId) {
        characterId = characterId.toString();

        SkillPlanStore.require();

        if (!skillPlans.hasOwnProperty(characterId)) {
            skillPlans[characterId] = {};
        }

        if (skillPlans[characterId].hasOwnProperty(planId)) {
            delete skillPlans[characterId][planId];
        }

        skillPlansLastUsed = new Date().getTime();
        SkillPlanStore.save();
    }

    /**
     * Checks if a plan exists
     *
     * @param {string}  characterId Character ID
     * @param {string}  planId ID of the plan
     * @returns {boolean}
     */
    static doesPlanExist(characterId, planId) {
        characterId = characterId.toString();

        SkillPlanStore.require();

        if (!skillPlans.hasOwnProperty(characterId)) {
            skillPlans[characterId] = {};
        }
        return skillPlans[characterId].hasOwnProperty(planId);
    }

    static getSkillPlansForCharacter(characterId) {
        characterId = characterId.toString();

        SkillPlanStore.require();

        const plans = [];
        if (skillPlans.hasOwnProperty(characterId)) {
            for (const i in skillPlans[characterId]) {
                plans.push({ id: i, name: skillPlans[characterId][i].name });
            }
        }
        skillPlansLastUsed = new Date().getTime();
        return plans;
    }

    static doMaintenance() {
        if ((skillPlans !== undefined) && (skillPlansLastUsed + 10000 < new Date().getTime())) {
            SkillPlanStore.saveImmediately();
            skillPlans = undefined;
        }
    }

    static require() {
        skillPlansLastUsed = new Date().getTime();

        if (skillPlans === undefined) {
            const retrieved = skillPlansStore.get('skillplans-store');
            if (retrieved.hasOwnProperty('version') && retrieved.version === 1) {
                skillPlans = retrieved.plans;
            }
            if (skillPlans === undefined) {
                skillPlans = {};
            }
        }
    }

    static save() {
        if (skillPlans !== undefined) {
            if (thingsSaveTimeout !== undefined) {
                clearTimeout(thingsSaveTimeout);
            }

            thingsSaveTimeout = setTimeout(() => {
                skillPlansStore.set('skillplans-store', { version: 1, plans: skillPlans });
            }, 10000);
        }
    }

    static saveImmediately() {
        if (skillPlans !== undefined) {
            if (thingsSaveTimeout !== undefined) {
                clearTimeout(thingsSaveTimeout);
            }

            skillPlansStore.set('skillplans-store', { version: 1, plans: skillPlans });
        }
    }

}

setInterval(SkillPlanStore.doMaintenance, 5000);
