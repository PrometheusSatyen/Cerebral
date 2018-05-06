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
     * Verifies if the skill in position oldIndex can be moved to newIndex.
     *
     * @param {number} oldIndex     Current position of the skill in queue
     * @param {number} newIndex     Desired position of the skill in queue
     * @returns {boolean} Valid move without violating prereqs
     */
    canMoveSkillToPosition(oldIndex, newIndex) {
        const skillToMove = this.queue[oldIndex];
        let illegalMove = false;

        // going down in the list?
        if (oldIndex < newIndex) {
            const queueSubset = this.queue.slice(oldIndex + 1, newIndex + 1);
            // do we have to rebuild the whole queue?
            illegalMove = queueSubset.some((skill) => {
                // same skill but higher level? can't move past it
                if (skill.id === skillToMove.id && skill.level > skillToMove.level) {
                    return true;
                }

                // any skill that requires this one? can't move past that one either
                if (skill.required_skills.length > 0 &&
                    skill.required_skills.some(
                        req => req.id === skillToMove.id && req.level >= skillToMove.level
                    )) {
                        return true;
                }
                return false;
            });
        // going up, need to check the "to be moved" skill prereqs against those
        } else {
            const queueSubset = this.queue.slice(newIndex, oldIndex).reverse();
            illegalMove = queueSubset.some((skill) => {
                // same skill but lower level? can't move past it
                if (skillToMove.id === skill.id && skill.level < skillToMove.level) {
                    return true;
                }

                // are any of those a prereq for this one? can't move past
                if (skillToMove.required_skills.length > 0
                    && skillToMove.required_skills.some(
                        req => req.id === skill.id && skill.level <= req.level)
                    ) {
                    return true;
                }
                return false;
            });
        }
        return !illegalMove;
    }

     /**
     * Tries to move a skill in the current queue
     *
     * Attempt to move the skill in position oldIndex to newIndex.
     * To force a move and allow other skills to be reorderd use forceMoveByRebuild.
     * Forced moves will still honor prereqs.
     *
     *
     * @param {number}   oldIndex     Current position of the skill in queue
     * @param {number}   newIndex     Desired position of the skill in queue
     * @param {boolean}  forceMoveByRebuild Rebuild queue to force a reorder if nessessacy
     *
     */
    moveQueuedSkillByPosition(oldIndex, newIndex, forceMoveByRebuild) {
        const canMove = this.canMoveSkillToPosition(oldIndex, newIndex);

        if (canMove) {
            if (newIndex >= this.queue.length) {
                let k = newIndex - this.queue.length;
                while (k + 1) {
                    k -= 1;
                    this.queue.push(undefined);
                }
            }
            this.queue.splice(newIndex, 0, this.queue.splice(oldIndex, 1)[0]);
        // reset the queue and readd all skills
        } else if (forceMoveByRebuild) {
            const oldQueue = this.queue.slice(0);
            if (newIndex >= oldQueue.length) {
                let k = newIndex - oldQueue.length;
                while (k + 1) {
                    k -= 1;
                    oldQueue.push(undefined);
                }
              }
              oldQueue.splice(newIndex, 0, oldQueue.splice(oldIndex, 1)[0]);

            this.reset();
            for (const s of oldQueue) {
                this.planSkill(s.id, s.level);
            }
        }
    }

    /**
     * Adds a skill to the queue.
     *
     * Resolves the skill and all prerequisite skills and adds them to the plan queue.
     * Optionally plan prerequisite skills to at least preReqLvl.
     *
     *
     * @param {number}   typeId       EVE Type ID of the skill to check.
     * @param {number}   lvl          Desired level of the skill.
     * @param {number}   [preReqLvl]  Desired level of any prerequisite skill.
     *                                Ignored if below the actual unlock level.
     *
     */
    planSkill(typeId, lvl, preReqLvl) {
        const skill = this.skills[typeId];

        if (skill !== undefined
            && ((skill.trained_skill_level < lvl && skill.planned_skill_level < lvl) || lvl === 0)) {
            const currentLvl = skill.trained_skill_level > skill.planned_skill_level ? skill.trained_skill_level : skill.planned_skill_level;

            // any required skills to train?
            if (skill.required_skills.length > 0) {
                for (const requiredSkill of skill.required_skills) {
                    // should we train to min lvl or a different level?
                    const targetLvl = preReqLvl !== undefined && preReqLvl > requiredSkill.level ? preReqLvl : requiredSkill.level;
                    this.planSkill(requiredSkill.id, targetLvl, preReqLvl);
                }
            }

            const spPerHour = (this.attributes[skill.primary_attribute] +
                (this.attributes[skill.secondary_attribute] / 2)) * 60;

            // add each level individually
            for (let i = currentLvl + 1; i <= lvl; i += 1) {
                const currentSP = skill.skillpoints_in_skill > skill.planned_skillpoints_in_skill ? skill.skillpoints_in_skill : skill.planned_skillpoints_in_skill;
                const spForLevel = 250 * skill.training_time_multiplier * (Math.sqrt(32) ** (i - 1));
                const missingSPforLevel = spForLevel - currentSP;

                let time = missingSPforLevel * (3600 / spPerHour);

                if (!this.isOmega) {
                    time *= 2;
                }

                this.time += time * 1000;

                skill.planned_skill_level = i;
                skill.planned_skillpoints_in_skill = spForLevel;

                this.queue.push({
                    type: 'skill',
                    id: typeId,
                    level: i,
                    name: skill.name,
                    title: `${skill.name} ${i}`,
                    sp: missingSPforLevel,
                    spTotal: spForLevel,
                    spHour: spPerHour,
                    time: time * 1000,
                    required_skills: skill.required_skills,
                });
            }
        }
    }

}

export default PlanCharacter;
