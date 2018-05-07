'use strict';

import React from 'react';

import {
    IconButton,
    FontIcon,
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
    planRowHidden: {
        height: 0,
        visibility: false,
    },
    planRowColumn: {
        height: 20,
        paddingRight: 6,
        paddingLeft: 60,
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
        width: 30,
        paddingRight: 6,
        paddingLeft: 6,
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
            } else {
                this.props.onMouseDown(this.props.idx, e);
            }
        }
        render() {
            const style = this.props.highlighted ? styles.planRowHighlight : styles.planRow;
            return (
                <TableRow selectable style={style} onMouseDown={this.onMouseDown.bind(this)}>
                    <TableRowColumn style={styles.planRowColumnSkill}>
                        {this.props.value.title}
                    </TableRowColumn>
                    <TableRowColumn style={styles.planRowColumnTime}>
                        {DateHelper.niceCountdown(this.props.value.time)}
                    </TableRowColumn>
                    <TableRowColumn style={styles.planRowColumn}>
                        {AllSkills.skills[this.props.value.id].market_group_name}
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
            )
        }
    }
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
                                    idx={index}
                                    highlighted={highlighted}
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
        };

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

        if (event.ctrlKey || event.metaKey || this.state.selection.length === 0) {
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
        if (['delete', 'add'].indexOf(e.target.textContent.toLowerCase()) !== -1) {
            return true; // Return true to cancel sorting
        }
        return false;
    }

    render() {
        return (
            <Table >
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <TableRow style={styles.planRow}>
                        <TableHeaderColumn style={styles.planRowColumnSkill}>Skill</TableHeaderColumn>
                        <TableHeaderColumn style={styles.planRowColumnTime}>Training Time</TableHeaderColumn>
                        <TableHeaderColumn style={styles.planRowColumn}>Group</TableHeaderColumn>
                        <TableHeaderColumn style={styles.planRowColumnDelete}></TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <SortableList
                    items={this.state.items}
                    distance={1}
                    shouldCancelStart={this.shouldCancelStart}
                    selection={this.state.selection}
                    onMouseDown={this.onMouseDownCallback}
                    onRemove={this.onDelete}
                    onSortEnd={this.onSortEnd}
                />
                <TableFooter style={styles.planRow} adjustForCheckbox={false}>
                    <TableRow style={styles.planRow}>
                        <TableHeaderColumn style={styles.planRowColumnSkill}>{`${this.state.items.length} skills`}</TableHeaderColumn>
                        <TableHeaderColumn style={styles.planRowColumnTime}>{DateHelper.niceCountdown(this.state.totalTime)}</TableHeaderColumn>
                        <TableHeaderColumn style={styles.planRowColumn}></TableHeaderColumn>
                        <TableHeaderColumn style={styles.planRowColumnDelete}></TableHeaderColumn>
                    </TableRow>
                </TableFooter>
            </Table>

        );
    }
}