'use strict';

import AllSkills from '../../resources/all_skills';
import Character from '../models/Character';

class PlanCharacter {

    constructor(id) {
        if (id !== undefined) {
            id = id.toString();
            this.baseCharacter = Character.get(id);
        }
        this.id = id;
        this.load();
    }


    /**
     * (Re)Loads the character
     *
     */
    load() {
        this.name = this.baseCharacter.name.toString();
        this.attributes = Object.assign({}, this.baseCharacter.attributes);
        this.isOmega = this.baseCharacter.isOmega();

        this.skills = {};
        this.queue = [];
        this.time = 0;

        for (const skill in AllSkills.skills) {
            const skillId = AllSkills.skills[skill].type_id;
            this.skills[skillId] = Object.assign({}, AllSkills.skills[skillId]);

            const baseCharacterSkill = this.baseCharacter.skills.filter(s => (s.skill_id.toString() === skill));
            if (baseCharacterSkill !== undefined && baseCharacterSkill[0] !== undefined) {
                this.skills[skillId].trained_skill_level = baseCharacterSkill[0].trained_skill_level;
                this.skills[skillId].planned_skill_level = 0;
                this.skills[skillId].skillpoints_in_skill = baseCharacterSkill[0].skillpoints_in_skill;
                this.skills[skillId].planned_skillpoints_in_skill = 0;
                this.isUnknown = false;
            } else {
                this.skills[skillId].trained_skill_level = 0;
                this.skills[skillId].planned_skill_level = 0;
                this.skills[skillId].skillpoints_in_skill = 0;
                this.skills[skillId].planned_skillpoints_in_skill = 0;
                this.isUnknown = true;
            }
        }
    }

    /**
     * Resets any planned skill and queue for the character
     *
     */
    reset() {
        this.queue = [];
        this.time = 0;

        for (const skill in AllSkills.skills) {
            const skillId = AllSkills.skills[skill].type_id;
            this.skills[skillId].planned_skill_level = 0;
            this.skills[skillId].planned_skillpoints_in_skill = 0;
        }
    }


    /**
     * Returns duration of a skill train.
     *
     * Gets the duration of a skill training at the current state of the plan without modifying it. Does not resolve prerequisit skills and will not include them in the training time estimate.
     *
     *
     * @param {number}   typeId     EVE Type ID of the skill to check.
     * @param {number}   lvl        Desired level of the skill.
     * 
     * @return {number} Remaining training time in seconds.
     */
    peekDuration(typeId, lvl) {
        const skill = this.skills[typeId];
        const l = [];
        let totalTime = 0;

        if (skill !== undefined && skill.trained_skill_level < lvl && skill.planned_skill_level < lvl) {
                const currentLvl = skill.trained_skill_level > skill.planned_skill_level ? skill.trained_skill_level : skill.planned_skill_level;
                let currentSP = skill.skillpoints_in_skill > skill.planned_skillpoints_in_skill ? skill.skillpoints_in_skill : skill.planned_skillpoints_in_skill;

                // add each level individually
                for (let i = currentLvl + 1; i <= lvl; i += 1) {
                    const spForLevel = 250 * skill.training_time_multiplier * (Math.sqrt(32) ** (i - 1));
                    
                    const missingSPforLevel = spForLevel - currentSP;

                    const pri = this.attributes.hasOwnProperty(skill.primary_attribute) ? this.attributes[skill.primary_attribute] : 0;
                    const sec = this.attributes.hasOwnProperty(skill.secondary_attribute) ? this.attributes[skill.secondary_attribute] : 0;

                    let time = 0;
                    if (this.isOmega) {
                        time = missingSPforLevel / (pri + (sec / 2)) * 60 * 1000;
                    } else {
                        time = missingSPforLevel / (pri + (sec / 2)) * 60 * 2 * 1000;
                    }

                    currentSP = spForLevel;
                    totalTime += time;
                }
        }
        return totalTime;
    }

    /**
     * Returns duration of a single level of skill train.
     *
     * Gets the duration of a skill training at the current state of the plan without modifying it. Does not resolve prerequisit skills or prerequisit levels and will not include them in the training time estimate.
     *
     *
     * @param {number}   typeId     EVE Type ID of the skill to check.
     * @param {number}   lvl        Desired level of the skill.
     * 
     * @return {number} Remaining training time in milliseconds.
     */
    peekSingleLevelDuration(typeId, lvl) {
        const skill = this.skills[typeId];
        const l = [];
        let totalTime = 0;

        if (skill !== undefined && skill.trained_skill_level < lvl && skill.planned_skill_level < lvl) {
                const currentLvl = skill.trained_skill_level > skill.planned_skill_level ? skill.trained_skill_level : skill.planned_skill_level;
                let currentSP = skill.skillpoints_in_skill > skill.planned_skillpoints_in_skill ? skill.skillpoints_in_skill : skill.planned_skillpoints_in_skill;

                // add each level individually
                for (let i = currentLvl + 1; i <= lvl; i += 1) {
                    const spForLevel = 250 * skill.training_time_multiplier * (Math.sqrt(32) ** (i - 1));
                    
                    const missingSPforLevel = spForLevel - currentSP;

                    const pri = this.attributes.hasOwnProperty(skill.primary_attribute) ? this.attributes[skill.primary_attribute] : 0;
                    const sec = this.attributes.hasOwnProperty(skill.secondary_attribute) ? this.attributes[skill.secondary_attribute] : 0;

                    let time = 0;
                    if (this.isOmega) {
                        time = missingSPforLevel / (pri + (sec / 2)) * 60 * 1000;
                    } else {
                        time = missingSPforLevel / (pri + (sec / 2)) * 60 * 2 * 1000;
                    }

                    currentSP = spForLevel;
                    // we only care about this one
                    totalTime = time;
                }
        }
        return totalTime;
    }

    /**
     * Adds a skill to the queue.
     *
     * Resolves the skill and all prerequisite skills and adds them to the plan queue. Optionally 
     *
     *
     * @param {number}   typeId     EVE Type ID of the skill to check.
     * @param {number}   lvl        Desired level of the skill.
     * @param {number}   [preReqLvl]  Desired level of any prerequisite skill. Ignored if below the actual unlock level.
     * 
     */
    planSkill(typeId, lvl, preReqLvl) {
        const skill = this.skills[typeId];

        if (skill !== undefined && ((skill.trained_skill_level < lvl && skill.planned_skill_level < lvl) || lvl === 0)) {
                const currentLvl = skill.trained_skill_level > skill.planned_skill_level ? skill.trained_skill_level : skill.planned_skill_level;
                const l = [];

                // add each level individually
                for (let i = currentLvl + 1; i <= lvl; i += 1) {
                    const spForLevel = 250 * skill.training_time_multiplier * (Math.sqrt(32) ** (i - 1));
                    const currentSP = skill.skillpoints_in_skill > skill.planned_skillpoints_in_skill ? skill.skillpoints_in_skill : skill.planned_skillpoints_in_skill;
                    const missingSPforLevel = spForLevel - currentSP;

                    const pri = this.attributes.hasOwnProperty(skill.primary_attribute) ? this.attributes[skill.primary_attribute] : 0;
                    const sec = this.attributes.hasOwnProperty(skill.secondary_attribute) ? this.attributes[skill.secondary_attribute] : 0;

                    const spPerHour = (pri + (sec / 2)) * 60;

                    let time = 0;
                    if (this.isOmega) {
                        time = missingSPforLevel / (pri + (sec / 2)) * 60 * 1000;
                    } else {
                        time = missingSPforLevel / (pri + (sec / 2)) * 60 * 2 * 1000;
                    }

                    this.time += time;

                    skill.planned_skill_level = i;
                    skill.planned_skillpoints_in_skill = spForLevel;

                    l.push({
                        id: typeId,
                        lvl: i,
                        sp: missingSPforLevel,
                        spTotal: spForLevel,
                        name: skill.name,
                        spHour: spPerHour,
                        time: time,
                    });
                }

                this.queue = l.concat(this.queue);

                // any required skills to train?
                if (skill.required_skills.length > 0) {
                    for (const requiredSkill of skill.required_skills) {
                        // should we train to min lvl or a different level?
                        const targetLvl = preReqLvl === undefined && preReqLvl > requiredSkill.level ? preReqLvl : requiredSkill.level;
                        this.planSkill(requiredSkill.id, targetLvl, preReqLvl);
                    }
                }
        }
    }

}

export default PlanCharacter;
