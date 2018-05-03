'use strict';

import React from 'react';

import { FontIcon, List, ListItem, TextField } from 'material-ui';

import AllSkills from '../../../resources/all_skills';
import Character from '../../models/Character';

const styles = {
    skillFilter: {
        margin: 5,
        width: 270,
        height: 40,
    },
    skillList: {
        margin: 5,
        width: 270,
    },
};

const romanNumerals = {
    0: '',
    1: 'Ⅰ',
    2: 'Ⅱ',
    3: 'Ⅲ',
    4: 'Ⅳ',
    5: 'Ⅴ',
}

export class SkillListSearchBar extends React.Component {
    constructor(props) {
        super(props);

        this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
    }

    handleFilterTextChange(e) {
        this.props.onFilterTextChange(e.target.value);
    }

    render() {
        return (
            <TextField
                hintText="Search..."
                style={styles.skillFilter}
                onChange={this.handleFilterTextChange}
            />
        );
    }
}

export default class FilteredSkillList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filterText: '',
        };

        this.handleSkillListSelection = this.handleSkillListSelection.bind(this);
        this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
    }

    handleSkillListSelection(id) {
        this.props.onSkillSelectionChange(id);
    }

    handleFilterTextChange(filterText) {
        this.setState({ filterText: filterText });
    }

    render() {
        return (
            <div>
                <SkillListSearchBar
                    onFilterTextChange={this.handleFilterTextChange}
                />
                <SkillList
                    characterId={this.props.characterId}
                    onSkillSelectionChange={this.handleSkillListSelection}
                    filter={this.state.filterText}
                />
            </div>
        );
    }
}

export class SkillList extends React.Component {
    constructor(props) {
        super(props);

        this.handleSkillListSelection = this.handleSkillListSelection.bind(this);

        this.skillGroups = AllSkills.groups;
        this.skillGroups.sort((a, b) => a.name.localeCompare(b.name));

        for (const group of this.skillGroups) {
            let groupMembers = [];
            for (const typeId of group.types) {
                if (AllSkills.skills[typeId] !== undefined) {
                    groupMembers.push(AllSkills.skills[typeId]);
                }
            }
            groupMembers.sort((a, b) => a.name.localeCompare(b.name));
            group.children = groupMembers;
        }
    }

    handleSkillListSelection(id) {
        this.props.onSkillSelectionChange(id);
    }

    render() {
        const character = Character.get(this.props.characterId);
        const filter = this.props.filter.toLowerCase();

        const items = [];

        // a filter is set, add flat list of matching skills
        if (filter !== undefined && filter !== '') {
            for (const skillGroup of this.skillGroups) {
                for (const skill of skillGroup.children) {
                    if (skill.name.toLowerCase().indexOf(filter) !== -1) {
                        let skillLevel = 0;
                        if (character !== undefined) {
                            const charskill = character.skills.filter(s => (s.skill_id === skill.type_id));

                            if (charskill !== undefined && charskill[0] !== undefined) {
                                skillLevel = charskill[0].trained_skill_level;
                            }
                        }

                        items.push(
                            <ListItem
                                key={skill.type_id}
                                primaryText={skill.name}
                                onClick={() => this.handleSkillListSelection(skill.type_id)}
                                rightIcon={
                                    <FontIcon style={{ 'fontSize': 18 }}>{romanNumerals[skillLevel]}</FontIcon>
                                }
                            />,
                        );
                    }
                }
            }
            items.sort((a, b) => a.props.primaryText.localeCompare(b.props.primaryText));
        // unfiltered, group skills by their market groups
        } else {
            for (const skillGroup of this.skillGroups) {
                const nestedItems = [];
                for (const skill of skillGroup.children) {
                    let skillLevel = 0;
                    if (character !== undefined) {
                        const charskill = character.skills.filter(s => (s.skill_id === skill.type_id));
    
                        if (charskill !== undefined && charskill[0] !== undefined) {
                            skillLevel = charskill[0].trained_skill_level;
                        }
                    }
                    nestedItems.push(
                        <ListItem
                            key={skill.type_id}
                            primaryText={skill.name}
                            onClick={() => this.handleSkillListSelection(skill.type_id)}
                            rightIcon={
                                <FontIcon style={{ 'fontSize': 18 }}>{romanNumerals[skillLevel]}</FontIcon>
                            }
                        />,
                    );
                }

                items.push(
                    <ListItem
                        key={skillGroup.market_group_id}
                        primaryText={skillGroup.name}
                        initiallyOpen={false}
                        primaryTogglesNestedList={true}
                        nestedItems={nestedItems}
                    />,
                );
            }
        }

        return (
            <List style={styles.skillList}>
                {items}
            </List>
        );
    }
}
