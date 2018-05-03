'use strict';

import React from 'react';

import { red500, green600 } from 'material-ui/styles/colors';
import SortableTree from 'react-sortable-tree';

import CharacterModel from '../../models/Character';
import AllSkills from '../../../resources/all_skills';

export default class SkillTree extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedType: 0,
            treeData: [],
        };

        if (this.props.characterId !== undefined && this.props.characterId !== 0) {
            this.character = CharacterModel.get(this.props.characterId);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.characterId !== this.props.characterId) {
            if (nextProps.characterId !== undefined && nextProps.characterId !== 0) {
                const skillTree = [];
                this.character = CharacterModel.get(nextProps.characterId);

                if (this.props.selectedType !== undefined && this.props.selectedType !== 0) {
                    skillTree.push(this.getTreeNode(this.props.selectedType));
                    this.setState({ treeData: skillTree });
                }
            }
        } else if (nextProps.selectedType !== this.props.selectedType) {
            const skillTree = [];
            skillTree.push(this.getTreeNode(nextProps.selectedType));
            this.setState({ treeData: skillTree });
        }
    }

    getTreeNode(typeId, lvl) {
        const children = [];
        const skill = AllSkills.skills[typeId];

        let subtitle = '';
        if (lvl !== undefined && lvl > 0) {
            subtitle = `Required Level: ${lvl}`;
        }

        if (this.character !== undefined) {
            const charskill = this.character.skills.filter(s => (s.skill_id === typeId));

            if (charskill !== undefined && charskill[0] !== undefined &&
                charskill[0].trained_skill_level !== undefined) {
                // trained above the required level -> green
                if (charskill[0].trained_skill_level >= lvl) {
                    subtitle = <span style={{ color: green600 }}>{subtitle} Trained Level: {charskill[0].trained_skill_level}</span>;
                // trained but not required (top node) -> green
                } else if (lvl === undefined || lvl === 0) {
                    subtitle = <span style={{ color: green600 }}> Trained Level: {charskill[0].trained_skill_level}</span>;
                // not trained high enough -> red
                } else {
                    subtitle = <span style={{ color: red500 }}>{subtitle} Trained Level: {charskill[0].trained_skill_level}</span>;
                }
            // char did not inject the skill -> red
            } else {
                subtitle = <span style={{ color: red500 }}>{subtitle} Trained Level: 0</span>;
            }
        }

        const item = {
            title: skill.name,
            subtitle: subtitle,
            expanded: true,
            noDragging: true,
        };

        if (skill.required_skills.length > 0) {
            for (const requiredSkill of skill.required_skills) {
                children.push(this.getTreeNode(requiredSkill.id, requiredSkill.level));
            }
            item.children = children;
        }
        return item;
    }

    render() {
        return (
            <div style={{ height: '100%' }}>
                <SortableTree
                    style={{ height: '100%', color: '#303030' }}
                    treeData={this.state.treeData}
                    onChange={treeData => this.setState({ treeData })}
                    isVirtualized={false}
                    canDrag={false}
                />
            </div>
        );
    }
}
