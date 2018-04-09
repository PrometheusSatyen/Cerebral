'use strict';

import React from 'react';

import DateTimeHelper from '../../helpers/DateTimeHelper';
import Character from '../../models/Character';

import {Table, TableHeader, TableHeaderColumn, TableBody, TableRow, TableRowColumn} from 'material-ui/Table';

const styles = {
    contractsTable: {
        height: '100%',
        width: '100%'
    }
};

export default class ContractsTable extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const contracts = Character.getAllContracts();

        return (
            <Table style={styles.contractsTable}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
                    <TableRow>
                        <TableHeaderColumn>Type</TableHeaderColumn>
                        <TableHeaderColumn>Status</TableHeaderColumn>
                        <TableHeaderColumn>Issuer</TableHeaderColumn>
                        <TableHeaderColumn>Assignee</TableHeaderColumn>
                        <TableHeaderColumn>Issued</TableHeaderColumn>
                        <TableHeaderColumn>Completed</TableHeaderColumn>
                    </TableRow>
                </TableHeader>

                <TableBody displayRowCheckbox={false}>
                    {
                        contracts.map(contract =>
                            <TableRow key={contract.contract_id} selectable={false}>
                                <TableRowColumn>{contract.type}</TableRowColumn>
                                <TableRowColumn>{contract.status}</TableRowColumn>
                                <TableRowColumn>{contract.issuer !== undefined ? contract.issuer.name : contract.issuer_id}</TableRowColumn>
                                <TableRowColumn>{contract.assignee !== undefined ? contract.assignee.name : contract.assignee_id}</TableRowColumn>
                                <TableRowColumn>{contract.date_issued}</TableRowColumn>
                                <TableRowColumn>{contract.date_completed}</TableRowColumn>
                            </TableRow>
                        )
                    }
                </TableBody>
            </Table>
        );
    }
}
