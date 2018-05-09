'use strict';

import Store from 'electron-store';


let skillPlans = undefined;
const skillPlansStore = new Store({
    name: 'skillplans-store',
});
let skillPlansLastUsed = 0;
let thingsSaveTimeout;

export default class SkillPlanStore {

    static getSkillPlan(characterId, planId) {
        characterId = characterId.toString();

        SkillPlanStore.require();

        if (skillPlans.hasOwnProperty(characterId) && skillPlans[characterId].hasOwnProperty(planId)) {
            return skillPlans[characterId][planId];
        }
        return undefined;

        skillPlansLastUsed = new Date().getTime();
    }

    static storeSkillPlan(characterId, planId, name, queue) {
        characterId = characterId.toString();

        SkillPlanStore.require();

        if (!skillPlans.hasOwnProperty(characterId)) {
            skillPlans[characterId] = {};
        }

        if (!skillPlans[characterId].hasOwnProperty(planId)) {
            skillPlans[characterId][planId] = {};
        }

        skillPlans[characterId][planId].queue = queue;
        skillPlans[characterId][planId].name = name;
        skillPlans[characterId][planId].lastSaved = new Date().getTime();

        skillPlansLastUsed = new Date().getTime();
        SkillPlanStore.save();
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
            skillPlans = skillPlansStore.get('skillplans-store');
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
                skillPlansStore.set('skillplans-store', skillPlans);
            }, 10000);
        }
    }

    static saveImmediately() {
        if (skillPlans !== undefined) {
            if (thingsSaveTimeout !== undefined) {
                clearTimeout(thingsSaveTimeout);
            }

            skillPlansStore.set('skillplans-store', skillPlans);
        }
    }

}

setInterval(SkillPlanStore.doMaintenance, 5000);