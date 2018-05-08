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
import RemapDialog from '../../dialogs/RemapDialog';


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
            characterId: this.props.characterId,

            selectedType: 0,
            items: [],
            selection: [],
            totalTime: 0,

            planSkillPopoverOpen: false,
            planSkillPopoverAnchor: undefined,

            remapDialogOpen: false,
            remapDialogMode: 'add',
            remapAttribues: {},
            remapImplants: 0,
        };

        this.onSkillLevelSelected = this.onSkillLevelSelected.bind(this);
        this.onSkillSelected = this.onSkillSelected.bind(this);

        this.onEdit = this.onEdit.bind(this);
        this.onGetOptimalAttributes = this.onGetOptimalAttributes.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.onRemapAdd = this.onRemapAdd.bind(this);
        this.onSortEnd = this.onSortEnd.bind(this);

        this.planCharacter = new PlanCharacter(this.props.characterId);
    }

    onSortEnd(oldIndex, newIndex, selected) {
        if (selected === undefined || selected.length <= 1) {
            this.planCharacter.moveQueuedItemByPosition(oldIndex, newIndex, true);
            this.setState({
                items: this.planCharacter.queue,
                totalTime: this.planCharacter.time,
                selection: [],
            });
        } else if (selected !== undefined || selected.length > 1) {
            this.planCharacter.moveQueuedItemsByPosition(oldIndex, newIndex, selected);
            this.setState({
                items: this.planCharacter.queue,
                totalTime: this.planCharacter.time,
                selection: [],
            });
        }
    }

    onSkillSelected(selectedType, e) {
        this.setState({
            planSkillPopoverAnchor: e.currentTarget,
            planSkillPopoverOpen: true,
            selectedType: selectedType,
        });
    }

    onSkillLevelSelected(level, prereqs) {
        this.setState({ planSkillPopoverOpen: false });

        if (this.state.selectedType !== undefined && level !== undefined) {
            const preReqLevel = prereqs !== undefined && prereqs > 0 ? prereqs : 0;
            this.planCharacter.planSkill(this.state.selectedType, level, preReqLevel);
            this.setState({ items: this.planCharacter.queue });
            this.setState({ totalTime: this.planCharacter.time });
        }
    }

    onRemapAdd(attributes, implants, index) {
        if (attributes !== undefined) {
            if (index === undefined) {
                this.planCharacter.addRemap(attributes, implants);
                this.setState({ items: this.planCharacter.queue });
            } else {
                this.planCharacter.editRemapAtPosition(attributes, implants, index);
                this.setState({
                    items: this.planCharacter.queue,
                    totalTime: this.planCharacter.time,
                });
            }
        }
        this.setState({
            remapDialogOpen: false,
            remapDialogMode: 'add',
            remapDialogEditIndex: undefined,
        });
    }

    onEdit(index) {
        if (this.state.items[index] !== undefined && this.state.items[index].type === 'remap') {
            this.setState({
                remapAttribues: Object.assign({}, this.state.items[index].attributes),
                remapImplants: this.state.items[index].implants,
                remapDialogOpen: true,
                remapDialogMode: 'edit',
                remapDialogEditIndex: index,
            });
        }
    }

    onGetOptimalAttributes(index, implants) {
        this.setState({
            remapAttribues: this.planCharacter.getSuggestedAttributesForRemapAt(index, implants),
        });
    }

    onRemove(index, e) {
        if (e.ctrlKey || e.metaKey === 0) {
            this.planCharacter.removeItemByPosition(index, true);
        } else {
            this.planCharacter.removeItemByPosition(index);
        }

        this.setState({ items: this.planCharacter.queue });
        this.setState({ totalTime: this.planCharacter.time });
    }

    render() {
        return (
            <div>
                <RemapDialog
                    attributes={this.state.remapAttribues}
                    editIndex={this.state.remapDialogEditIndex}
                    implants={this.state.remapImplants}
                    onAddRemap={this.onRemapAdd}
                    onGetOptimalAttributes={this.onGetOptimalAttributes}
                    open={this.state.remapDialogOpen}
                />
                <PlanSkillPopover
                    open={this.state.planSkillPopoverOpen}
                    anchorEl={this.state.planSkillPopoverAnchor}
                    onLevelSelected={this.onSkillLevelSelected}
                />
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
                    <IconButton style={styles.iconButton} onClick={() => this.setState({ remapDialogOpen: true, remapDialogMode: 'add' })}>
                        <FontIcon className="material-icons">navigate_next</FontIcon>
                    </IconButton>
                </Card>
                <table>
                    <tbody>
                        <tr>
                            <td style={styles.leftColumn}>
                                <Card style={styles.skillListCard}>
                                    <FilteredSkillList style={styles.skillListCard} characterId={this.state.characterId} onSkillSelectionChange={this.onSkillSelected} />
                                </Card>
                            </td>
                            <td style={styles.rightColumn}>
                                <Paper style={styles.margin10}>
                                    <SkillPlanTable
                                        onEdit={this.onEdit}
                                        onRemove={this.onRemove}
                                        onSkillMove={this.onSortEnd}
                                        items={this.state.items}
                                        totalTime={this.state.totalTime}
                                        selected={this.state.selected}
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