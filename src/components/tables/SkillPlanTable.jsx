'use strict';

import React from 'react';

import {
    Checkbox,
    IconButton,
    FontIcon,
    Popover,
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
    TableFooter,
} from 'material-ui';

import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import DateHelper from '../../helpers/DateTimeHelper';
import AllSkills from '../../../resources/all_skills';

const styles = {
    planRow: {
        height: 20,
    },
    planRowHighlight: {
        height: 20,
        background: '#404040',
    },
    planRowColumn: {
        height: 20,
        paddingRight: 6,
        paddingLeft: 6,
        textTransform: 'capitalize',
    },
    planRowColumnBuffer: {
        height: 20,
        width: '0%',
        paddingRight: 6,
        paddingLeft: 6,
        textTransform: 'capitalize',
    },
    planRowColumnHidden: {
        height: 20,
        paddingRight: 0,
        paddingLeft: 0,
        visibility: 'hidden',
        width: 0,
    },
    planRowColumnSkill: {
        height: 20,
        width: 250,
        paddingRight: 6,
        paddingLeft: 6,
    },
    planRowColumnTime: {
        height: 20,
        width: 110,
        paddingRight: 6,
        paddingLeft: 6,
    },
    planRowColumnDelete: {
        height: 20,
        width: 20,
        paddingRight: 3,
        paddingLeft: 6,
    },
    planRowColumnSPh: {
        height: 20,
        width: 40,
        paddingRight: 6,
        paddingLeft: 6,
    },
    planRowColumnEdit: {
        height: 20,
        width: 20,
        paddingRight: 0,
        paddingLeft: 0,
    },
    deleteButton: {
        height: 20,
        width: 20,
        margin: 0,
        fontSize: 16,
        padding: 0,
    },
};

const SortableItem = SortableElement(
    class SortableItemA extends React.Component {
        onMouseDown(e) {
            if (e.target.innerText !== undefined && e.target.innerText === 'delete') {
                this.props.onRemove(this.props.idx, e);
            } else if (e.target.innerText !== undefined && e.target.innerText === 'mode_edit') {
                this.props.onEdit(this.props.idx, e);
            } else {
                this.props.onMouseDown(this.props.idx, e);
            }
        }
        render() {
            const style = this.props.highlighted ? styles.planRowHighlight : styles.planRow;
            switch (this.props.value.type) {
                case 'skill': {
                    return (
                        <TableRow selectable style={style} onMouseDown={this.onMouseDown.bind(this)}>
                            <TableRowColumn style={styles.planRowColumnSkill}>
                                {this.props.value.title}
                            </TableRowColumn>
                            <TableRowColumn style={this.props.columnTime}>
                                {DateHelper.niceCountdown(this.props.value.time)}
                            </TableRowColumn>
                            <TableRowColumn style={this.props.columnMarketGroup}>
                                {AllSkills.skills[this.props.value.id].market_group_name}
                            </TableRowColumn>
                            <TableRowColumn style={this.props.columnAttributes}>
                                {this.props.value.attributeTitle}
                            </TableRowColumn>
                            <TableRowColumn style={this.props.columnSPhs}>
                                {this.props.value.spHour}
                            </TableRowColumn>
                            <TableRowColumn style={this.props.columnLastRemap}>
                                {DateHelper.niceCountdown(this.props.value.lastRemap)}
                            </TableRowColumn>
                            <TableRowColumn style={styles.planRowColumnEdit}>
                            </TableRowColumn>
                            <TableRowColumn style={styles.planRowColumnDelete}>
                                <IconButton
                                    style={styles.deleteButton}
                                    iconStyle={styles.deleteButton}
                                >
                                    <FontIcon style={styles.deleteButton} className="material-icons">delete</FontIcon>
                                </IconButton>
                            </TableRowColumn>
                        </TableRow>
                    );
                }
                case 'note':
                case 'remap': {
                    return (
                        <TableRow selectable style={style} onMouseDown={this.onMouseDown.bind(this)}>
                            <TableRowColumn style={styles.planRowColumnSkill}>
                                {this.props.value.title}
                            </TableRowColumn>
                            <TableRowColumn style={this.props.columnTime} />
                            <TableRowColumn style={this.props.columnMarketGroup} />
                            <TableRowColumn style={this.props.columnAttributes} />
                            <TableRowColumn style={this.props.columnSPhs} />
                            <TableRowColumn style={this.props.columnLastRemap} />
                            <TableRowColumn style={styles.planRowColumnEdit}>
                                <IconButton
                                    style={styles.deleteButton}
                                    iconStyle={styles.deleteButton}
                                >
                                    <FontIcon style={styles.deleteButton} className="material-icons">mode_edit</FontIcon>
                                </IconButton>
                            </TableRowColumn>
                            <TableRowColumn style={styles.planRowColumnDelete}>
                                <IconButton
                                    style={styles.deleteButton}
                                    iconStyle={styles.deleteButton}
                                >
                                    <FontIcon style={styles.deleteButton} className="material-icons">delete</FontIcon>
                                </IconButton>
                            </TableRowColumn>
                        </TableRow>
                    );
                }
                default: {
                    return (<TableRow />);
                }
            }
        }
    },
);

const SortableList = SortableContainer(
    class SortableListAnonymous extends React.Component {
        render() {
            return (
                <TableBody displayRowCheckbox={false}>
                    {this.props.items.map((value, index) => {
                        {
                            const highlighted = this.props.selection !== undefined ? this.props.selection.indexOf(index) > -1 : 0
                            return (
                                <SortableItem
                                    key={`item-${index}`}
                                    index={index}
                                    value={value}
                                    onRemove={this.props.onRemove}
                                    onMouseDown={this.props.onMouseDown}
                                    onEdit={this.props.onEdit}
                                    idx={index}
                                    highlighted={highlighted}
                                    columnTime={this.props.columnTime}
                                    columnMarketGroup={this.props.columnMarketGroup}
                                    columnAttributes={this.props.columnAttributes}
                                    columnSPhs={this.props.columnSPhs}
                                    columnLastRemap={this.props.columnLastRemap}
                                />
                            );
                        }
                    })
                    }
                </TableBody>
            );
        }
    },
);

// workaround for https://github.com/mui-org/material-ui/issues/6579
SortableList.muiName = 'TableBody';

export default class SkillPlanTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
            totalTime: 0,
            selection: [],
            columnTimeChecked: true,
            columnMarketGroupChecked: true,
            columnAttributesChecked: false,
            columnSPhsStyleChecked: false,
            columnLastRemapChecked: false,
            columnTimeStyle: styles.planRowColumnTime,
            columnMarketGroupStyle: styles.planRowColumn,
            columnAttributesStyle: styles.planRowColumnHidden,
            columnSPhsStyle: styles.planRowColumnHidden,
            columnLastRemapStyle: styles.planRowColumnHidden,
        };

        this.handleColumnEditRequestClose = this.handleColumnEditRequestClose.bind(this);

        this.onSortEnd = this.onSortEnd.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onMouseDownCallback = this.onMouseDownCallback.bind(this);
        this.shouldCancelStart = this.shouldCancelStart.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.items !== this.props.items) {
            this.setState({ items: nextProps.items });
        }
        if (nextProps.totalTime !== this.props.totalTime) {
            this.setState({ totalTime: nextProps.totalTime });
        }
    }

    onDelete(index, e) {
        this.props.onRemove(index, e);
    }

    onMouseDownCallback(index, event) {
        let newSelection = this.state.selection;
        const testIndex = newSelection.indexOf(index);

        if (event.shiftKey && this.state.selection.length === 1) {
            if (newSelection[0] > index) {
                for (let i = index; i < newSelection[0]; i += 1) {
                    newSelection = newSelection.concat([i]);
                }
            } else {
                for (let i = index; i > newSelection[0]; i -= 1) {
                    newSelection = newSelection.concat([i]);
                }
            }
        } else if (event.ctrlKey || event.metaKey || this.state.selection.length === 0) {
            if (newSelection && testIndex !== -1) {
                newSelection.splice(testIndex, 1);
            } else {
                newSelection = newSelection.concat([index]);
            }
        } else if (testIndex === -1) {
            newSelection = [index];
        }
        this.setState({
            selection: newSelection.sort((a, b) => { return a - b })
        });
        event.preventDefault();
        return false;
    }

    onSortEnd({ oldIndex, newIndex }) {
        this.props.onSkillMove(oldIndex, newIndex, this.state.selection);
        this.setState({ selection: [] });
    }

    shouldCancelStart(e) {
        // Prevent sorting from being triggered if target is input or button
        if (['delete', 'mode_edit', 'add'].indexOf(e.target.textContent.toLowerCase()) !== -1) {
            return true; // Return true to cancel sorting
        }
        return false;
    }

    handleColumnEditRequestClose() {
        this.setState({
            columnEditOpen: false,
        });
    };

    render() {
        return (
            <div>
                <Popover
                    open={this.state.columnEditOpen}
                    anchorEl={this.state.columnEditAnchor}
                    anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                    targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                    onRequestClose={this.handleColumnEditRequestClose}
                    style={{ background: '#404040' }}
                >
                    <div style={{ margin: 10 }}>
                        <Checkbox
                            label="Time"
                            style={styles.checkbox}
                            checked={this.state.columnTimeChecked}
                            onCheck={(e, c) => this.setState({
                                columnTimeStyle: c ? styles.planRowColumnTime : styles.planRowColumnHidden,
                                columnTimeChecked: c,
                            })}
                        />
                        <Checkbox
                            label="Group"
                            style={styles.checkbox}
                            checked={this.state.columnMarketGroupChecked}
                            onCheck={(e, c) => this.setState({
                                columnMarketGroupStyle: c ? styles.planRowColumn : styles.planRowColumnHidden,
                                columnMarketGroupChecked: c,
                             })}
                        />
                        <Checkbox
                            label="Attributes"
                            style={styles.checkbox}
                            checked={this.state.columnAttributesChecked}
                            onCheck={(e, c) => this.setState({
                                columnAttributesStyle: c ? styles.planRowColumn : styles.planRowColumnHidden,
                                columnAttributesChecked: c,
                             })}
                        />
                        <Checkbox
                            label="SP/h"
                            style={styles.checkbox}
                            checked={this.state.columnSPhsStyleChecked}
                            onCheck={(e, c) => this.setState({
                                columnSPhsStyle: c ? styles.planRowColumnSPh : styles.planRowColumnHidden,
                                columnSPhsStyleChecked: c,
                            })}
                        />
                        <Checkbox
                            label="Remap"
                            style={styles.checkbox}
                            checked={this.state.columnLastRemapChecked}
                            onCheck={(e, c) => this.setState({
                                columnLastRemapStyle: c ? styles.planRowColumn : styles.planRowColumnHidden,
                                columnLastRemapChecked: c,
                            })}
                        />
                    </div>
                </Popover>
                <Table style={{overflow: 'hidden'}}>
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow style={styles.planRow}>
                            <TableHeaderColumn style={styles.planRowColumnSkill}>Skill</TableHeaderColumn>
                            <TableHeaderColumn style={this.state.columnTimeStyle}>Training Time</TableHeaderColumn>
                            <TableHeaderColumn style={this.state.columnMarketGroupStyle}>Group</TableHeaderColumn>
                            <TableHeaderColumn style={this.state.columnAttributesStyle}>Attributes</TableHeaderColumn>
                            <TableHeaderColumn style={this.state.columnSPhsStyle}>SP/h</TableHeaderColumn>
                            <TableHeaderColumn style={this.state.columnLastRemapStyle}>Since remap</TableHeaderColumn>
                            <TableHeaderColumn style={styles.planRowColumnEdit}></TableHeaderColumn>
                            <TableHeaderColumn style={styles.planRowColumnDelete}>
                                <IconButton
                                    style={styles.deleteButton}
                                    iconStyle={styles.deleteButton}
                                    onClick={(e) => this.setState({
                                        columnEditOpen: true,
                                        columnEditAnchor: e.currentTarget
                                    })}
                                >
                                    <FontIcon style={styles.deleteButton} className="material-icons">keyboard_arrow_down</FontIcon>
                                </IconButton>
                            </TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <SortableList
                        items={this.state.items}
                        distance={1}
                        shouldCancelStart={this.shouldCancelStart}
                        selection={this.state.selection}
                        onEdit={this.props.onEdit}
                        onMouseDown={this.onMouseDownCallback}
                        onRemove={this.onDelete}
                        onSortEnd={this.onSortEnd}
                        columnTime={this.state.columnTimeStyle}
                        columnMarketGroup={this.state.columnMarketGroupStyle}
                        columnAttributes={this.state.columnAttributesStyle}
                        columnSPhs={this.state.columnSPhsStyle}
                        columnLastRemap={this.state.columnLastRemapStyle}
                    />
                    <TableFooter style={styles.planRow} adjustForCheckbox={false}>
                        <TableRow style={styles.planRow}>
                            <TableHeaderColumn style={styles.planRowColumnSkill}>
                                {
                                    this.state.selection.length > 1 ?
                                    `${this.state.items.length} skills (${this.state.selection.length} selected - ${
                                        DateHelper.niceCountdown(
                                            this.state.selection.reduce(
                                                (totalTime, index) => (totalTime + (this.state.items[index].type === 'skill' ? this.state.items[index].time : 0)), 0,
                                            )
                                        )
                                    })`
                                    :
                                    `${this.state.items.length} skills`
                                }</TableHeaderColumn>
                            <TableHeaderColumn style={this.state.columnTimeStyle}>{DateHelper.niceCountdown(this.state.totalTime)}</TableHeaderColumn>
                            <TableHeaderColumn style={this.state.columnMarketGroupStyle} />
                            <TableHeaderColumn style={this.state.columnAttributesStyle} />
                            <TableHeaderColumn style={this.state.columnSPhsStyle} />
                            <TableHeaderColumn style={this.state.columnLastRemapStyle} />
                            <TableHeaderColumn style={styles.planRowColumnEdit} />
                            <TableHeaderColumn style={styles.planRowColumnDelete} />
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        );
    }
}
