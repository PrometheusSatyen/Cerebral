'use strict';

import React from 'react';

import {
    Card,
    MenuItem,
    Paper,
    RaisedButton,
    SelectField,
} from 'material-ui';

import ExportFromPlanPopover from '../../popovers/ExportFromPlanPopover';
import FilteredSkillList from '../../skillbrowser/FilteredSkillList';
import ImportToPlanPopover from '../../popovers/ImportToPlanPopover';
import NewRenamePlanPopover from '../../popovers/NewRenamePlanPopover';
import NoteDialog from '../../dialogs/NoteDialog';
import PlanCharacter from '../../../models/PlanCharacter';
import PlanSkillPopover from '../../popovers/PlanSkillToLevelPopover';
import RemapDialog from '../../dialogs/RemapDialog';
import SkillPlanStore from '../../../helpers/SkillPlanStore';
import SkillPlanTable from '../../tables/SkillPlanTable';


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
            remapAttribues: {},
            remapImplants: 0,
        };

        
        this.handleSkillSelected = this.handleSkillSelected.bind(this);
        this.handleSkillAdd = this.handleSkillAdd.bind(this);

        this.handleNoteAdd = this.handleNoteAdd.bind(this);
        this.handleRemapAdd = this.handleRemapAdd.bind(this);

        this.handleGetOptimalAttributes = this.handleGetOptimalAttributes.bind(this);
        this.handleItemEdit = this.handleItemEdit.bind(this);

        this.handleItemMove = this.handleItemMove.bind(this);
        this.handleItemRemove = this.handleItemRemove.bind(this);

        this.handleSkillPlanAdd = this.handleSkillPlanAdd.bind(this);
        this.handleSkillPlanChanged = this.handleSkillPlanChanged.bind(this);
        this.handleSkillPlanDuplicate = this.handleSkillPlanDuplicate.bind(this);
        this.handleSkillPlanRemove = this.handleSkillPlanRemove.bind(this);
        this.handleSkillPlanRename = this.handleSkillPlanRename.bind(this);
        this.handleImport = this.handleImport.bind(this);
        this.handleExportClose = this.handleExportClose.bind(this);

        this.planCharacter = new PlanCharacter(this.props.characterId);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.characterId !== this.props.characterId) {
            if (nextProps.characterId !== undefined && nextProps.characterId !== 0) {
                this.planCharacter = new PlanCharacter(nextProps.characterId);
                this.setState({
                    totalTime: this.planCharacter.time,
                    items: this.planCharacter.queue,
                    skillPlans: SkillPlanStore.getSkillPlansForCharacter(nextProps.characterId),
                    skillPlanId: undefined,
                    skillPlanName: undefined,
                });
            }
        }
    }

    handleItemMove(oldIndex, newIndex, selected) {
        if (selected === undefined || selected.length <= 1) {
            this.planCharacter.moveQueuedItemByPosition(oldIndex, newIndex, true);
            this.setState({
                items: this.planCharacter.queue,
                totalTime: this.planCharacter.time,
                selection: [],
            });
            SkillPlanStore.storeSkillPlan(
                this.props.characterId,
                this.state.skillPlanId,
                this.state.skillPlanName,
                this.planCharacter.queue,
            );
        } else if (selected !== undefined || selected.length > 1) {
            this.planCharacter.moveQueuedItemsByPosition(oldIndex, newIndex, selected);
            this.setState({
                items: this.planCharacter.queue,
                totalTime: this.planCharacter.time,
                selection: [],
            });
            SkillPlanStore.storeSkillPlan(
                this.props.characterId,
                this.state.skillPlanId,
                this.state.skillPlanName,
                this.planCharacter.queue,
            );
        }
    }

    handleSkillSelected(selectedType, e) {
        this.setState({
            planSkillPopoverAnchor: e.currentTarget,
            planSkillPopoverOpen: true,
            selectedType,
        });
    }

    handleSkillAdd(level, prereqs) {
        this.setState({ planSkillPopoverOpen: false });

        if (this.state.selectedType !== undefined && level !== undefined) {
            const preReqLevel = prereqs !== undefined && prereqs > 0 ? prereqs : 0;
            this.planCharacter.planSkill(this.state.selectedType, level, preReqLevel);
            this.setState({
                items: this.planCharacter.queue,
                totalTime: this.planCharacter.time,
            });
            SkillPlanStore.storeSkillPlan(
                this.props.characterId,
                this.state.skillPlanId,
                this.state.skillPlanName,
                this.planCharacter.queue,
            );
        }
    }

    handleItemRemove(index, e) {
        if (e.ctrlKey || e.metaKey === 0) {
            this.planCharacter.removeItemByPosition(index, true);
        } else {
            this.planCharacter.removeItemByPosition(index);
        }

        this.setState({
            items: this.planCharacter.queue,
            totalTime: this.planCharacter.time,
        });
        SkillPlanStore.storeSkillPlan(
            this.props.characterId,
            this.state.skillPlanId,
            this.state.skillPlanName,
            this.planCharacter.queue,
        );
    }

    handleRemapAdd(attributes, implants, index) {
        if (attributes !== undefined) {
            if (index === undefined) {
                this.planCharacter.addRemap(attributes, implants);
                this.setState({ items: this.planCharacter.queue });
                SkillPlanStore.storeSkillPlan(
                    this.props.characterId,
                    this.state.skillPlanId,
                    this.state.skillPlanName,
                    this.planCharacter.queue,
                );
            } else {
                this.planCharacter.editRemapAtPosition(attributes, implants, index);
                this.setState({
                    items: this.planCharacter.queue,
                    totalTime: this.planCharacter.time,
                });
                SkillPlanStore.storeSkillPlan(
                    this.props.characterId,
                    this.state.skillPlanId,
                    this.state.skillPlanName,
                    this.planCharacter.queue,
                );
            }
        }
        this.setState({
            remapDialogOpen: false,
            remapDialogEditIndex: undefined,
        });
    }

    handleNoteAdd(text, details, index) {
        if (text !== undefined) {
            if (index === undefined) {
                this.planCharacter.addNote(text, details);
                this.setState({ items: this.planCharacter.queue });
                SkillPlanStore.storeSkillPlan(
                    this.props.characterId,
                    this.state.skillPlanId,
                    this.state.skillPlanName,
                    this.planCharacter.queue,
                );
            } else {
                this.planCharacter.editNoteAtPosition(text, details, index);
                this.setState({
                    items: this.planCharacter.queue,
                    totalTime: this.planCharacter.time,
                });
                SkillPlanStore.storeSkillPlan(
                    this.props.characterId,
                    this.state.skillPlanId,
                    this.state.skillPlanName,
                    this.planCharacter.queue,
                );
            }
        }
        this.setState({
            noteDialogOpen: false,
            noteDialogEditIndex: undefined,
        });
    }

    handleItemEdit(index) {
        if (this.state.items[index] !== undefined && this.state.items[index].type === 'remap') {
            this.setState({
                remapAttribues: Object.assign({}, this.state.items[index].attributes),
                remapImplants: this.state.items[index].implants,
                remapDialogOpen: true,
                remapDialogEditIndex: index,
            });
        } else if (this.state.items[index] !== undefined && this.state.items[index].type === 'note') {
            this.setState({
                noteText: this.state.items[index].text,
                noteDetails: this.state.items[index].details,
                noteDialogOpen: true,
                noteDialogEditIndex: index,
            });
        }
    }

    handleGetOptimalAttributes(index, implants) {
        this.setState({
            remapAttribues: this.planCharacter.getSuggestedAttributesForRemapAt(index, implants),
        });
    }

    handleSkillPlanAdd(name) {
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

    handleSkillPlanChanged(skillPlanId) {
        if (skillPlanId !== undefined) {
            const plan = SkillPlanStore.getSkillPlan(this.props.characterId, skillPlanId);

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

    handleSkillPlanRename(name) {
        if (this.state.skillPlanId !== undefined
            && SkillPlanStore.doesPlanExist(this.props.characterId, this.state.skillPlanId)) {
            this.setState({
                renameSkillPopoverOpen: false,
                renameSkillPopoverAnchor: undefined,
            });
            if (name !== undefined) {
                SkillPlanStore.storeSkillPlan(
                    this.props.characterId,
                    this.state.skillPlanId,
                    name,
                    this.planCharacter.queue,
                );
                this.setState({
                    skillPlans: SkillPlanStore.getSkillPlansForCharacter(this.props.characterId),
                });
            }
        }
    }

    handleSkillPlanRemove() {
        SkillPlanStore.deleteSkillPlan(this.props.characterId, this.state.skillPlanId);
        const plans = SkillPlanStore.getSkillPlansForCharacter(this.props.characterId);
        if (plans.length > 0) {
            this.setState({
                skillPlans: plans,
                skillPlanId: plans[0].id,
                skillPlanName: plans[0].name,
            });
        } else {
            this.setState({
                skillPlans: plans,
                skillPlanId: undefined,
                skillPlanName: undefined,
            });
        }
    }

    handleSkillPlanDuplicate() {
        if (this.state.skillPlanId !== undefined
            && SkillPlanStore.doesPlanExist(this.props.characterId, this.state.skillPlanId)) {
            const newId = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            )

            const newName = `Copy of ${this.state.skillPlanName}`;
            SkillPlanStore.storeSkillPlan(
                this.props.characterId,
                newId, newName,
                this.planCharacter.queue,
            );
            this.setState({
                items: this.planCharacter.queue,
                totalTime: this.planCharacter.time,
                skillPlans: SkillPlanStore.getSkillPlansForCharacter(this.props.characterId),
                skillPlanId: newId,
                skillPlanName: newName,
            });
        }
    }

    handleImport(name, source, skills) {
        if (name !== undefined && source !== undefined && skills !== undefined && skills.length > 0) {
            this.planCharacter.addNote(name, `Imported from ${source}`);
            skills.forEach(s => this.planCharacter.planSkill(s.typeId, s.level));
            
            this.setState({
                items: this.planCharacter.queue,
                totalTime: this.planCharacter.time,
                
            });
            SkillPlanStore.storeSkillPlan(
                this.props.characterId,
                this.state.skillPlanId,
                this.state.skillPlanName,
                this.planCharacter.queue,
            );
        }
        this.setState({ importToPlanPopoverOpen: false });
    }

    handleExportClose() {
        this.setState({ exportFromPlanPopoverOpen: false });
    }


    render() {
        return (
            <div>
                <RemapDialog
                    attributes={this.state.remapAttribues}
                    editIndex={this.state.remapDialogEditIndex}
                    implants={this.state.remapImplants}
                    onAddRemap={this.handleRemapAdd}
                    onGetOptimalAttributes={this.handleGetOptimalAttributes}
                    open={this.state.remapDialogOpen}
                />
                <NoteDialog
                    text={this.state.noteText}
                    details={this.state.noteDetails}
                    editIndex={this.state.noteDialogEditIndex}
                    onAddNote={this.handleNoteAdd}
                    open={this.state.noteDialogOpen}
                />
                <PlanSkillPopover
                    open={this.state.planSkillPopoverOpen}
                    anchorEl={this.state.planSkillPopoverAnchor}
                    onLevelSelected={this.handleSkillAdd}
                />
                <NewRenamePlanPopover
                    open={this.state.newSkillPopoverOpen}
                    anchorEl={this.state.newSkillPopoverAnchor}
                    onNewName={this.handleSkillPlanAdd}
                />
                <NewRenamePlanPopover
                    open={this.state.renameSkillPopoverOpen}
                    anchorEl={this.state.renameSkillPopoverAnchor}
                    onNewName={this.handleSkillPlanRename}
                />
                <ImportToPlanPopover
                    open={this.state.importToPlanPopoverOpen}
                    anchorEl={this.state.importToPlanPopoverAnchor}
                    onImport={this.handleImport}
                />
                <ExportFromPlanPopover
                    open={this.state.exportFromPlanPopoverOpen}
                    anchorEl={this.state.exportFromPlanPopoverAnchor}
                    items={this.state.items}
                    onClose={this.handleExportClose}
                    name={this.state.skillPlanName}
                />
                <Paper
                    style={styles.menuCard}

                >
                    <div style={{ float: 'left', marginLeft: 10 }}>
                        <SelectField
                            style={styles.planSelector}
                            floatingLabelText="Plan"
                            value={this.state.skillPlanId}
                            onChange={(e, k, v) => this.handleSkillPlanChanged(v)}
                        >
                            {
                                this.state.skillPlans.map((plan) => {
                                    return (
                                        <MenuItem
                                            key={plan.id}
                                            value={plan.id}
                                            primaryText={plan.name}
                                        />
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
                                    newSkillPopoverAnchor: e.currentTarget,
                                })}
                                label={'New Plan'}
                                backgroundColor="#616161"
                            />

                            <RaisedButton
                                style={styles.raisedButton}
                                onClick={(e) => this.setState({
                                    renameSkillPopoverOpen: true,
                                    renameSkillPopoverAnchor: e.currentTarget,
                                })}
                                label={'Rename'}
                                backgroundColor="#616161"
                            />
                            <RaisedButton
                                style={styles.raisedButton}
                                onClick={(e) => this.setState({
                                    importToPlanPopoverOpen: true,
                                    importToPlanPopoverAnchor: e.currentTarget })}
                                label={'Import'}
                                backgroundColor="#616161"
                            />
                        </div>
                        <div>
                            <RaisedButton
                                style={styles.raisedButton}
                                onClick={this.handleSkillPlanDuplicate}
                                label={'Duplicate'}
                                backgroundColor="#616161"
                            />
                            <RaisedButton
                                style={styles.raisedButton}
                                onClick={this.handleSkillPlanRemove}
                                label={'Delete'}
                                backgroundColor="#616161"
                            />
                            <RaisedButton
                                style={styles.raisedButton}
                                onClick={(e) => this.setState({
                                    exportFromPlanPopoverOpen: true,
                                    exportFromPlanPopoverAnchor: e.currentTarget })}
                                label={'Export'}
                                backgroundColor="#616161"
                            />
                        </div>
                    </div>
                    <div style={{ float: 'right', marginRight: 8, width: 128 }}>
                        <div>
                            <RaisedButton
                                style={styles.raisedButton}
                                onClick={() => this.setState({ remapDialogOpen: true })}
                                label={'Add Remap'}
                                backgroundColor="#616161"
                            />
                            <RaisedButton
                                style={styles.raisedButton}
                                onClick={() => this.setState({ noteDialogOpen: true })}
                                label={'Add Note'}
                                backgroundColor="#616161"
                            />
                        </div>
                    </div>
                </Paper>
                <table>
                    <tbody>
                        <tr>
                            <td style={styles.leftColumn}>
                                <Card style={styles.skillListCard}>
                                    <FilteredSkillList
                                        style={styles.skillListCard}
                                        characterId={this.props.characterId}
                                        onSkillSelectionChange={this.handleSkillSelected}
                                    />
                                </Card>
                            </td>
                            <td style={styles.rightColumn}>
                                <Paper style={styles.margin10}>
                                    <SkillPlanTable
                                        onEdit={this.handleItemEdit}
                                        onRemove={this.handleItemRemove}
                                        onSkillMove={this.handleItemMove}
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