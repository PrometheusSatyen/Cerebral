'use strict';

import React from 'react';
import { Avatar, Chip, Dialog, FlatButton, FontIcon, List, ListItem, Paper } from 'material-ui';


const styles = {
    dialog: {
        width: 700,
    },
    p: {
        color: '#fff',
        textColor: '#fff',
        textAlign: 'left',
        fontSize: 14,
    },
    th: {
        width: 120,
    },
    table: {
        marginBottom: 10,
    },
    chip: {
        margin: 2,
    },
    wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    browsericon: {
        width: 32,
        height: 32,
      },
};

export default class MainContentDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            closed: false,
        }
    }

    handleClose(e) {
        this.setState({ closed: true });
    }

    componentWillReceiveProps() {
        this.setState({ closed: false });
    }

    getAvatarComponent(id, type) {
        switch (type) {
            case 'character':
                return <Avatar key={id} style={styles.avatar} size={32} src={`https://image.eveonline.com/Character/${id}_32.jpg`} />;
                break;
            case 'corporation':
                return <Avatar key={id} style={styles.avatar} size={32} src={`https://image.eveonline.com/Corporation/${id}_32.png`} />;
                break;
            case 'alliance':
                return <Avatar key={id} style={styles.avatar} size={32} src={`https://image.eveonline.com/Alliance/${id}_32.png`} />;
                break;
            case 'mailing_list':
                return <Avatar key={id} style={styles.avatar} size={32} icon={<FontIcon className="material-icons">list</FontIcon>} />;
                break;
            default:
                return <Avatar key={id} style={styles.avatar} size={32} icon={<FontIcon className="material-icons">help</FontIcon>} />;
        }
    }

    render() {
        if (this.props.mail === undefined) {
            return null;
        }

        const actions = [
            <FlatButton
                label="Close"
                primary={true}
                onClick={e => this.handleClose(e)}
            />
        ];

        const mail = this.props.mail;

        return (
            <div>
                <Dialog
                    title={mail.subject}
                    actions={actions}
                    modal={false}
                    open={this.props.mail !== undefined && this.state.closed !== true}
                    onRequestClose={(e) => this.handleClose(e)}
                    contentStyle={styles.dialog}
                    autoScrollBodyContent={true}
                >
                    <div style={styles.p}>
                        <table cellPadding={0} style={styles.table}>
                            <tbody>
                                <tr>
                                    <th style={styles.th}>To:</th>
                                    <td style={{ textTransform: 'capitalize' }}>
                                        <div style={styles.wrapper}>
                                            {
                                                mail.recipients.map(r =>
                                                    <Chip key={r.recipient_id} style={styles.chip}>{this.getAvatarComponent(r.recipient_id, r.recipient_type)}{r.recipient_name}</Chip>,
                                                )
                                            }
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th style={styles.th}>From:</th>
                                    <td style={{ textTransform: 'capitalize' }}><Chip style={styles.chip}>{this.getAvatarComponent(mail.from, 'character')}{mail.from_name}</Chip></td>
                                </tr>
                                <tr>
                                    <th style={styles.th}>Time:</th>
                                    <td>{ new Date(mail.timestamp).toLocaleString(navigator.language)}</td>
                                </tr>
                                <tr>
                                    <th style={styles.th}>Labels:</th>
                                    <td>{ mail.label_names !== undefined ? mail.label_names.join(',') : ''}</td>
                                </tr>
                            </tbody>
                        </table>
                        <Paper>
                            <div style={{ margin: 10 }}>
                                {mail.body.body.split(/\n/g).map((text, i) => <span key={i}>{text}<br /></span>)}
                            </div>
                        </Paper>
                    </div>
                    {
                        mail.body.links !== undefined && mail.body.links.length > 0 ?
                            <div>
                                <List style={styles.p}>
                                {
                                    mail.body.links.map((link, index) =>
                                    (<ListItem
                                        key={index}
                                        primaryText={`${index + 1} - ${link}`}
                                        rightIcon={<FontIcon className="material-icons">open_in_new</FontIcon>}
                                        onClick={e => {require("electron").shell.openExternal(link); }}
                                    />),
                                    )
                                }
                                </List>
                            </div>
                        : ''
                    }
                </Dialog>
            </div>
        );
    }
}
