'use strict';

import React from 'react';

import {
    Card,
    IconButton,
    FontIcon,
    MenuItem,
    Paper,
    SelectField,
} from 'material-ui';


import FilteredSkillList from '../../skillbrowser/FilteredSkillList';
import PlanCharacter from '../../../models/PlanCharacter';
import SkillPlanTable from '../../tables/SkillPlanTable';
import PlanSkillPopover from '../../popovers/PlanSkillToLevelPopover';


const styles = {
    margin10: {
        margin: 10,
    },
    menuCard: {
        width: '100%',
        overflow: 'hidden',
        height: '80px',
        margin: 10,
    },
    planSelector: {
        marginLeft: 10,
    },
    skillListCard: {
        margin: 10,
        width: 280,
        verticalAlign: 'top',
    },
    leftColumn: {
        verticalAlign: 'top',
        height: '100%',
    },
    rightColumn: {
        verticalAlign: 'top',
        width: '100%',
        height: '100%',
    },
};

export default class Plans extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedType: 0,
            characterId: this.props.characterId,
            items: [],
            totalTime: 0,
            planSkillPopoverOpen: false,
            planSkillPopoverAnchor: undefined,
        };

        this.handleSkillLevelSelection = this.handleSkillLevelSelection.bind(this);
        this.handleSkillListSelection = this.handleSkillListSelection.bind(this);

        this.onSortEnd = this.onSortEnd.bind(this);

        this.planCharacter = new PlanCharacter(this.props.characterId);
        this.queue = [];
    }

    onSortEnd({ oldIndex, newIndex }) {
        this.planCharacter.moveQueuedSkillByPosition(oldIndex, newIndex, true);
        this.setState({ items: this.planCharacter.queue });
        this.setState({ totalTime: this.planCharacter.time });
    }

    handleSkillListSelection(selectedType, e) {
        this.setState({ planSkillPopoverAnchor: e.currentTarget });
        this.setState({ planSkillPopoverOpen: true });
        this.setState({ selectedType: selectedType });
    }

    handleSkillLevelSelection(level, prereqs) {
        this.setState({ planSkillPopoverOpen: false });

        if (this.state.selectedType !== undefined && level !== undefined) {
            const preReqLevel = prereqs !== undefined && prereqs > 0 ? prereqs : 0;
            this.planCharacter.planSkill(this.state.selectedType, level, preReqLevel);
            this.setState({ items: this.planCharacter.queue });
            this.setState({ totalTime: this.planCharacter.time });
        }
    }

    remove(index) {
        const requestedOrder = [...this.state.items];
        requestedOrder.splice(index, 1);
        this.planCharacter.reset();

        // build a new queue from the proposed list
        for (const skill of requestedOrder) {
            this.planCharacter.planSkill(skill.id, skill.level);
        }
        this.setState({ items: this.planCharacter.queue });
        this.setState({ totalTime: this.planCharacter.time });
    }

    render() {
        return (
            <div>
                <PlanSkillPopover open={this.state.planSkillPopoverOpen} anchorEl={this.state.planSkillPopoverAnchor} onLevelSelected={this.handleSkillLevelSelection} />
                <Card style={styles.menuCard}>
                    <SelectField
                    style={styles.planSelector}
                    floatingLabelText="Plan"
                    value={this.state.characterId}
                    onChange={this.handleCharacterChange}
                    >
                        <MenuItem value={1} primaryText="This" />
                        <MenuItem value={2} primaryText="that" />
                        <MenuItem value={3} primaryText="and" />
                        <MenuItem value={4} primaryText="the other thing" />
                    </SelectField>
                </Card>
                <table>
                    <tbody>
                        <tr>
                            <td style={styles.leftColumn}>
                                <Card style={styles.skillListCard}>
                                    <FilteredSkillList style={styles.skillListCard} characterId={this.state.characterId} onSkillSelectionChange={this.handleSkillListSelection} />
                                </Card>
                            </td>
                            <td style={styles.rightColumn}>
                                <Paper style={styles.margin10}>
                                    <SkillPlanTable
                                        onRemove={(index) => this.remove(index)}
                                        onSkillMove={this.onSortEnd}
                                        items={this.state.items}
                                        totalTime={this.state.totalTime}
                                    />
                                </Paper>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}