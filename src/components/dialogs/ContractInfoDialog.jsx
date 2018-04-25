'use strict';

import React from 'react';

import {red500, greenA200} from 'material-ui/styles/colors';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import DateTimeHelper from '../../helpers/DateTimeHelper';

const styles = {
    dialog: {
        width: 700
    },
    p: {
        color: '#fff',
        textColor: '#fff',
        textAlign: 'left',
        fontSize: 14
    },
    th: {
        width: 250
    },
    table: {
        marginBottom: 20
    }
};

export default class ContractInfoDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            closed: false
        }
    }

    handleClose(e) {
        this.setState({closed: true});
    };

    componentWillReceiveProps() {
        this.setState({closed: false});
    }

    render() {
        if (this.props.contract === undefined) {
            return null;
        }

        const actions = [
            <FlatButton
                label="Close"
                primary={true}
                onClick={(e) => this.handleClose(e)}
            />
        ];

        const contract = this.props.contract;

        let typeSpecific = '';
        switch(contract.type) {
            case 'courier':
                typeSpecific =
                    <table cellPadding={0} style={styles.table}>
                        <tr>
                            <th style={styles.th}>Pickup:</th>
                            <td>{contract.start_location !== undefined ? contract.start_location.name : 'Unknown'}</td>
                        </tr>
                        <tr>
                            <th style={styles.th}>Delivery:</th>
                            <td>{contract.end_location !== undefined ? contract.end_location.name : 'Unknown'}</td>
                        </tr>
                        <tr>
                            <th style={styles.th}>Volume:</th>
                            <td>{contract.volume.toLocaleString(navigator.language)} m³</td>
                        </tr>
                        <tr>
                            <th style={styles.th}>Reward:</th>
                            <td style={{color: greenA200, fontWeight: 'bold'}}>{contract.reward.toLocaleString(navigator.language)} ISK</td>
                        </tr>
                        <tr>
                            <th style={styles.th}>Collateral:</th>
                            <td style={{color: red500, fontWeight: 'bold'}}>{contract.collateral.toLocaleString(navigator.language)} ISK</td>
                        </tr>
                        <tr>
                            <th style={styles.th}>Days to Complete:</th>
                            <td>{contract.days_to_complete}</td>
                        </tr>
                    </table>;
                break;

            case 'item_exchange':
                typeSpecific =
                    <table cellPadding={0} style={styles.table}>
                        <tr>
                            <th style={styles.th}>Buyer Will {contract.price >= 0 ? 'Pay' : 'Get'}:</th>
                            <td style={{color: contract.price >= 0 ? red500 : greenA200, fontWeight: 'bold'}}>
                                {(contract.price >= 0 ? contract.price : (contract.price * -1)).toLocaleString(navigator.language)} ISK
                            </td>
                        </tr>
                    </table>;
                break;

            case 'auction':
                typeSpecific =
                    <table cellPadding={0} style={styles.table}>
                        <tr>
                            <th style={styles.th}>Opening Bid:</th>
                            <td style={{color: red500, fontWeight: 'bold'}}>{contract.price.toLocaleString(navigator.language)} ISK</td>
                        </tr>
                    </table>;
                break;
        }

        return (
            <div>
                <Dialog
                    title="Contract Info"
                    actions={actions}
                    modal={false}
                    open={this.props.contract !== undefined && this.state.closed !== true}
                    onRequestClose={(e) => this.handleClose(e)}
                    contentStyle={styles.dialog}
                >
                    <div style={styles.p}>
                        <table cellPadding={0} style={styles.table}>
                            <tr>
                                <th style={styles.th}>Type:</th>
                                <td style={{textTransform: 'capitalize'}}>{contract.type.replace("_", " ")}</td>
                            </tr>
                            <tr>
                                <th style={styles.th}>Status:</th>
                                <td style={{textTransform: 'capitalize'}}>{contract.status.replace("_", " ")}</td>
                            </tr>
                            <tr>
                                <th style={styles.th}>Date Completed:</th>
                                <td>
                                    {
                                        contract.date_completed !== undefined ?
                                            new Date(contract.date_completed).toLocaleString(navigator.language) +
                                            ' (' + DateTimeHelper.relativeTimeString(new Date(contract.date_completed)) + ')' :
                                            'Not Completed'
                                    }
                                </td>
                            </tr>
                            <tr>
                                <th style={styles.th}>Description:</th>
                                <td>{contract.title !== undefined && contract.title !== '' ? contract.title : 'N/A'}</td>
                            </tr>
                        </table>

                        <table cellPadding={0} style={styles.table}>
                            <tr>
                                <th style={styles.th}>Date Issued:</th>
                                <td>
                                    {new Date(contract.date_issued).toLocaleString(navigator.language)}&nbsp;
                                    ({DateTimeHelper.relativeTimeString(new Date(contract.date_issued))})
                                </td>
                            </tr>
                            <tr>
                                <th style={styles.th}>Issuer:</th>
                                <td>{contract.issuer.name}</td>
                            </tr>
                            <tr>
                                <th style={styles.th}>Issuer Corporation:</th>
                                <td>{contract.issuer_corporation.name}</td>
                            </tr>
                            <tr>
                                <th style={styles.th}>Behalf of Corp?</th>
                                <td>{contract.for_corporation ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                                <th style={styles.th}>Expiry Date:</th>
                                <td>
                                    {new Date(contract.date_expired).toLocaleString(navigator.language)}&nbsp;
                                    ({DateTimeHelper.relativeTimeString(new Date(contract.date_expired))})
                                </td>
                            </tr>
                        </table>

                        <table cellPadding={0} style={styles.table}>
                            <tr>
                                <th style={styles.th}>Availability:</th>
                                <td style={{textTransform: 'capitalize'}}>
                                    {contract.availability.replace("_", " ")}
                                    {contract.assignee !== undefined ? ` - ${contract.assignee.name}` : ''}
                                </td>
                            </tr>
                            <tr>
                                <th style={styles.th}>Date Accepted:</th>
                                <td>
                                    {
                                        contract.date_accepted !== undefined ?
                                            new Date(contract.date_accepted).toLocaleString(navigator.language) +
                                            ' (' + DateTimeHelper.relativeTimeString(new Date(contract.date_accepted)) + ')' :
                                            'Not Accepted'
                                    }
                                </td>
                            </tr>
                            <tr>
                                <th style={styles.th}>Acceptor:</th>
                                <td>{contract.acceptor !== undefined ? contract.acceptor.name : 'Not Accepted'}</td>
                            </tr>
                        </table>

                        {typeSpecific}
                    </div>
                </Dialog>
            </div>
        );
    }
}