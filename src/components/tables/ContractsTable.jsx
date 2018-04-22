'use strict';

import React from 'react';

import ReactTable from "react-table";
import ContractInfoDialog from '../dialogs/ContractInfoDialog';
import {FontIcon, IconButton} from 'material-ui';

const styles = {
    iconButton: {
        padding: '0px 0px 0px 0px',
        margin: '6px 3px 0px 0px',
        height: 24,
        width: 24,
    },
    fontIcon: {
        padding: '0 0 0 0',
        margin: '0 0 0 0',
    }
};

export default class ContractsTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            openedContract: undefined
        }
    }

    render() {
        const contracts = this.props.contracts;

        let columns = [
            {
                Header: "ID",
                id: "contract_id",
                accessor: 'contract_id',
                show: false
            },
            {
                Header: "Type",
                headerStyle: {
                    textAlign: 'left'
                },
                id: "type",
                accessor: c => c.type.replace("_", " "),
                style: {
                    textTransform: 'capitalize'
                },
                maxWidth: 120
            },
            {
                Header: "Status",
                headerStyle: {
                    textAlign: 'left'
                },
                id: "status",
                accessor: c => c.status.replace("_", " "),
                style: {
                    textTransform: 'capitalize'
                },
                maxWidth: 100
            },
            {
                Header: "Details",
                headerStyle: {
                    textAlign: 'left'
                },
                id: "title",
                accessor: c => {
                    if (c.type === 'courier') {
                        let str = '';

                        str += (c.start_location !== undefined) ? c.start_location.system.name : 'Unknown';
                        str += ' >> ';
                        str += (c.end_location !== undefined) ? c.end_location.system.name : 'Unknown';
                        str += ' (' + parseInt(c.volume).toLocaleString(navigator.language) + ' m³)';

                        return str;
                    } else {
                        return c.title;
                    }
                }
            },
            {
                Header: "From",
                headerStyle: {
                    textAlign: 'left'
                },
                id: "issuer_id",
                accessor: c => c.for_corporation === true ? c.issuer_corporation.name : c.issuer.name,
                maxWidth: 120
            },
            {
                Header: "To",
                headerStyle: {
                    textAlign: 'left'
                },
                id: "assignee_id",
                accessor: c => {
                    if (c.acceptor !== undefined) {
                        return c.acceptor.name;
                    } else if (c.assignee !== undefined) {
                        return c.assignee.name;
                    } else {
                        return 'Public';
                    }
                },
                maxWidth: 120
            },
            {
                Header: "Issued",
                headerStyle: {
                    textAlign: 'left'
                },
                accessor: "date_issued",
                Cell: row => <span>{new Date(row.value).toLocaleDateString(navigator.language)}</span>,
                sortMethod: (a, b) => new Date(a).getTime() > new Date(b).getTime() ? 1 : -1,
                maxWidth: 80
            },
        ];

        if (this.props.complete === true) {
            columns.push({
                Header: "Completed",
                headerStyle: {
                    textAlign: 'left'
                },
                id: "date_completed",
                accessor: c => c.date_completed !== undefined ? c.date_completed : c.date_issued,
                Cell: row => <span>{new Date(row.value).toLocaleDateString(navigator.language)}</span>,
                sortMethod: (a, b) => new Date(a).getTime() > new Date(b).getTime() ? 1 : -1,
                maxWidth: 80
            });
        }

        columns.push({
            Header: "",
            accessor: "contract_id",
            style: {
                textAlign: 'right',
                height: 32,
                margin: '0 0 0 0',
                padding: '0 0 0 0'
            },
            Cell: row => (
                <IconButton style={styles.iconButton} onClick={e => this.setState({openedContract: contracts.find(c => c.contract_id === row.value)})}>
                    <FontIcon className="material-icons">navigate_next</FontIcon>
                </IconButton>
            ),
            width: 30
        });

        if (contracts.length > 0) {
            return (
                <div>
                    <ContractInfoDialog contract={this.state.openedContract}/>

                    <ReactTable
                        style={{
                            color: '#fff',
                            fontSize: '9pt',
                        }}
                        data={contracts}
                        columns={columns}
                        showPagination={false}
                        defaultPageSize={contracts.length}
                        defaultSorted={[
                            {
                                id: this.props.complete === true ? 'date_completed' : 'date_issued',
                                desc: true
                            }
                        ]}
                    />
                </div>
            );
        } else {
            return (
                <p>No contracts found.</p>
            )
        }
    }
}
