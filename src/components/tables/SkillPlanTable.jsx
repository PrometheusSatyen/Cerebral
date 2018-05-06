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

const SortableItem = SortableElement(({ index, value, onRemove, idx }) =>
    <TableRow selectable style={styles.planRow}>
        <TableRowColumn style={styles.planRowColumnSkill}>
            {value.title}
        </TableRowColumn>
        <TableRowColumn style={styles.planRowColumnTime}>
            {DateHelper.niceCountdown(value.time)}
        </TableRowColumn>
        <TableRowColumn style={styles.planRowColumn}>
            {AllSkills.skills[value.id].market_group_name}
        </TableRowColumn>
        <TableRowColumn style={styles.planRowColumnDelete}>
            <IconButton
                style={styles.deleteButton}
                iconStyle={styles.deleteButton}
                onClick={() => onRemove(idx)}
            >
                <FontIcon style={styles.deleteButton} className="material-icons">delete</FontIcon>
            </IconButton>
        </TableRowColumn>
    </TableRow>
);

const SortableList = SortableContainer(({ items, onRemove }) => {
    return (
        <TableBody displayRowCheckbox={false}>
            {items.map((value, index) => (
                <SortableItem
                    key={`item-${index}`}
                    index={index}
                    value={value}
                    onRemove={onRemove}
                    idx={index}
                />
            ))}
        </TableBody>
    );
}
);

// workaround for https://github.com/mui-org/material-ui/issues/6579
SortableList.muiName = 'TableBody';

export default class SkillPlanTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
            totalTime: 0,
        };

        this.onSortEnd = this.onSortEnd.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.shouldCancelStart = this.shouldCancelStart.bind(this);
    }

    onSortEnd(oldIndex, newIndex) {
        this.props.onSkillMove(oldIndex, newIndex);
    }

    onDelete(index) {
        this.props.onRemove(index);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.items !== this.props.items) {
            this.setState({ items: nextProps.items });
        }
        if (nextProps.totalTime !== this.props.totalTime) {
            this.setState({ totalTime: nextProps.totalTime });
        }
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
                    onSortEnd={this.onSortEnd}
                    distance={1}
                    shouldCancelStart={this.shouldCancelStart}
                    onRemove={(index) => this.onDelete(index)}
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