'use strict';

import React from 'react';

import {
    Card,
    MenuItem,
    Paper,
    RaisedButton,
    SelectField,
} from 'material-ui';


import FilteredSkillList from '../../skillbrowser/FilteredSkillList';
import NewRenamePlanPopover from '../../popovers/NewRenamePlanPopover';
import PlanCharacter from '../../../models/PlanCharacter';
import SkillPlanTable from '../../tables/SkillPlanTable';
import PlanSkillPopover from '../../popovers/PlanSkillToLevelPopover';
import SkillPlanStore from '../../../helpers/SkillPlanStore';
import RemapDialog from '../../dialogs/RemapDialog';


const styles = {
    margin10: {
        margin: 10,
    },
    menuCard: {
        width: '100%',
        overflow: 'hidden',
        marginTop: 20,
        marginRight: 10,
    },
    planSelector: {
        margin: 2,
        marginLeft: 10,
        width: 268,

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
    raisedButton: {
        margin: 3,
        height: 32,
        width: 120,
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
            selectedPlanId: undefined,

            skillPlans: SkillPlanStore.getSkillPlansForCharacter(this.props.characterId),
            skillPlanId: undefined,
            skillPlanName: undefined,

            planSkillPopoverOpen: false,
            planSkillPopoverAnchor: undefined,

            newSkillPopoverOpen: false,
            newSkillPopoverAnchor: undefined,

            renameSkillPopoverOpen: false,
            renameSkillPopoverAnchor: undefined,

            remapDialogOpen: false,
            remapDialogMode: 'add',
            remapAttribues: {},
            remapImplants: 0,
        };

        this.onSkillLevelSelected = this.onSkillLevelSelected.bind(this);
        this.onSkillSelected = this.onSkillSelected.bind(this);

        this.onEdit = this.onEdit.bind(this);
        this.onGetOptimalAttributes = this.onGetOptimalAttributes.bind(this);
        this.onNewSkillPlan = this.onNewSkillPlan.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.onRemapAdd = this.onRemapAdd.bind(this);
        this.onRenameSkillPlan = this.onRenameSkillPlan.bind(this);
        this.onSelectedSkillPlanChanged = this.onSelectedSkillPlanChanged.bind(this);
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
            SkillPlanStore.storeSkillPlan(this.state.characterId, this.state.skillPlanId, this.state.skillPlanName, this.planCharacter.queue);
        } else if (selected !== undefined || selected.length > 1) {
            this.planCharacter.moveQueuedItemsByPosition(oldIndex, newIndex, selected);
            this.setState({
                items: this.planCharacter.queue,
                totalTime: this.planCharacter.time,
                selection: [],
            });
            SkillPlanStore.storeSkillPlan(this.state.characterId, this.state.skillPlanId, this.state.skillPlanName, this.planCharacter.queue);
        }
    }

    onSkillSelected(selectedType, e) {
        this.setState({
            planSkillPopoverAnchor: e.currentTarget,
            planSkillPopoverOpen: true,
            selectedType,
        });
    }

    onSkillLevelSelected(level, prereqs) {
        this.setState({ planSkillPopoverOpen: false });

        if (this.state.selectedType !== undefined && level !== undefined) {
            const preReqLevel = prereqs !== undefined && prereqs > 0 ? prereqs : 0;
            this.planCharacter.planSkill(this.state.selectedType, level, preReqLevel);
            this.setState({
                items: this.planCharacter.queue,
                totalTime: this.planCharacter.time,
            });
            SkillPlanStore.storeSkillPlan(this.state.characterId, this.state.skillPlanId, this.state.skillPlanName, this.planCharacter.queue);
        }
    }

    onRemove(index, e) {
        if (e.ctrlKey || e.metaKey === 0) {
            this.planCharacter.removeItemByPosition(index, true);
        } else {
            this.planCharacter.removeItemByPosition(index);
        }

        this.setState({
            items: this.planCharacter.queue,
            totalTime: this.planCharacter.time,
        });
        SkillPlanStore.storeSkillPlan(this.state.characterId, this.state.skillPlanId, this.state.skillPlanName, this.planCharacter.queue);
    }

    onRemapAdd(attributes, implants, index) {
        if (attributes !== undefined) {
            if (index === undefined) {
                this.planCharacter.addRemap(attributes, implants);
                this.setState({ items: this.planCharacter.queue });
                SkillPlanStore.storeSkillPlan(this.state.characterId, this.state.skillPlanId, this.state.skillPlanName, this.planCharacter.queue);
            } else {
                this.planCharacter.editRemapAtPosition(attributes, implants, index);
                this.setState({
                    items: this.planCharacter.queue,
                    totalTime: this.planCharacter.time,
                });
                SkillPlanStore.storeSkillPlan(this.state.characterId, this.state.skillPlanId, this.state.skillPlanName, this.planCharacter.queue);
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

    onNewSkillPlan(name) {
        this.setState({
            newSkillPopoverOpen: false,
            newSkillPopoverAnchor: undefined,
        });
        if (name !== undefined) {
            this.planCharacter.reset();

            const newId = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            )

            SkillPlanStore.storeSkillPlan(this.props.characterId, newId, name, this.planCharacter.queue);
            this.setState({
                items: this.planCharacter.queue,
                totalTime: this.planCharacter.time,
                skillPlans: SkillPlanStore.getSkillPlansForCharacter(this.props.characterId),
                skillPlanId: newId,
                skillPlanName: name,
            });
        }
    }

    onSelectedSkillPlanChanged(skillPlanId) {
        if (skillPlanId !== undefined) {
            const plan = SkillPlanStore.getSkillPlan(this.state.characterId, skillPlanId);

            if (plan !== undefined) {
                this.planCharacter.reset();
                plan.queue.forEach(item =>
                    this.planCharacter.addItemToQueue(item),
                );
                this.setState({
                    skillPlanId,
                    items: this.planCharacter.queue,
                    totalTime: this.planCharacter.time,
                    skillPlanName: plan.name,
                });
            }
        }
    }

    onRenameSkillPlan(name) {
        this.setState({
            renameSkillPopoverOpen: false,
            renameSkillPopoverAnchor: undefined,
        });
        if (name !== undefined) {
            SkillPlanStore.storeSkillPlan(this.state.characterId, this.state.skillPlanId, name, this.planCharacter.queue);
            this.setState({ skillPlans: SkillPlanStore.getSkillPlansForCharacter(this.props.characterId) });
        }
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
                <NewRenamePlanPopover
                    open={this.state.newSkillPopoverOpen}
                    anchorEl={this.state.newSkillPopoverAnchor}
                    onNewName={this.onNewSkillPlan}
                />
                <NewRenamePlanPopover
                    open={this.state.renameSkillPopoverOpen}
                    anchorEl={this.state.renameSkillPopoverAnchor}
                    onNewName={this.onRenameSkillPlan}
                />
                <Paper
                    style={styles.menuCard}

                >
                    <div style={{ float: 'left', marginLeft: 10 }}>
                        <SelectField
                            style={styles.planSelector}
                            floatingLabelText="Plan"
                            value={this.state.skillPlanId}
                            onChange={(e, k, v) => this.onSelectedSkillPlanChanged(v)}
                        >
                            {
                                this.state.skillPlans.map((v, i) => {
                                    return (
                                        <MenuItem key={v.id} value={v.id} primaryText={v.name} />
                                    );
                                })
                            }
                        </SelectField>
                    </div>
                    <div style={{ float: 'left', marginLeft: 24 }}>
                        <div>
                            <RaisedButton
                                style={styles.raisedButton}
                                onClick={(e) => this.setState({
                                    newSkillPopoverOpen: true,
                                    newSkillPopoverAnchor: e.currentTarget
                                })}
                                label={'New Plan'}
                                backgroundColor="#616161"
                            />

                            <RaisedButton
                                style={styles.raisedButton}
                                onClick={(e) => this.setState({
                                    renameSkillPopoverOpen: true,
                                    renameSkillPopoverAnchor: e.currentTarget
                                })}
                                label={'Rename'}
                                backgroundColor="#616161"
                            />
                            <RaisedButton
                                style={styles.raisedButton}
                                onClick={() => this.setState({ remapDialogOpen: true, remapDialogMode: 'add' })}
                                label={'Import'}
                                backgroundColor="#616161"
                                disabled={true}
                            />
                        </div>
                        <div>
                            <RaisedButton
                                style={styles.raisedButton}
                                onClick={() => this.setState({ remapDialogOpen: true, remapDialogMode: 'add' })}
                                label={'Duplicate'}
                                backgroundColor="#616161"
                                disabled={true}
                            />
                            <RaisedButton
                                style={styles.raisedButton}
                                onClick={() => this.setState({ remapDialogOpen: true, remapDialogMode: 'add' })}
                                label={'Delete'}
                                backgroundColor="#616161"
                            />
                            <RaisedButton
                                style={styles.raisedButton}
                                onClick={() => this.setState({ remapDialogOpen: true, remapDialogMode: 'add' })}
                                label={'Export'}
                                backgroundColor="#616161"
                                disabled={true}
                            />
                        </div>
                    </div>
                    <div style={{ float: 'right', marginRight: 8, width: 128 }}>
                        <div>
                            <RaisedButton
                                style={styles.raisedButton}
                                onClick={() => this.setState({ remapDialogOpen: true, remapDialogMode: 'add' })}
                                label={'Add Remap'}
                                backgroundColor="#616161"
                            />
                            <RaisedButton
                                style={styles.raisedButton}
                                onClick={() => this.setState({ remapDialogOpen: true, remapDialogMode: 'add' })}
                                label={'Add Note'}
                                backgroundColor="#616161"
                                disabled={true}
                            />
                        </div>
                    </div>
                </Paper>
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
            </div >
        );
    }
}