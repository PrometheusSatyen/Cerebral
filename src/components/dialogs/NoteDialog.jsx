'use strict';

import React from 'react';
import { Dialog, FlatButton, TextField } from 'material-ui';


const styles = {
    dialog: {
        width: 400,
    },
    row: {
        height: 24,
        margin: 10,
    },
    slider: {
        margin: 10,
        width: 200,
    },
};

export default class NoteDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            text: this.props.text,
            details: this.props.details,
        };
    }

    handleClose(e) {
        this.props.onAddNote(undefined);
    }

    handleAdd(e) {
        this.props.onAddNote(this.state.text, this.state.details || '', this.props.editIndex);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.open !== this.props.open) {
            this.setState({ open: nextProps.open });
        }
        if (nextProps.text !== undefined && nextProps.text !== this.props.text) {
            this.setState({ text: nextProps.text });
        }
        if (nextProps.details !== undefined && nextProps.details !== this.props.details) {
            this.setState({ details: nextProps.details });
        }
    }

    render() {
        const actions = [
            <div>
                <FlatButton
                    label="Save"
                    primary={true}
                    onClick={e => this.handleAdd(e)}
                />

                <FlatButton
                    label="Cancel"
                    primary={true}
                    onClick={e => this.handleClose(e)}
                />
            </div>,
        ];

        return (
            <Dialog
                title={'Note'}
                actions={actions}
                modal={false}
                open={this.state.open}
                onRequestClose={(e) => this.handleClose(e)}
                contentStyle={styles.dialog}
            >
                <table>
                    <tbody>
                        <tr style={styles.row}>
                            <td>
                                <span>Title</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <TextField
                                    id="text-field-controlled"
                                    value={this.state.text || ''}
                                    onChange={(e) => this.setState({ text: e.target.value })}
                                />
                            </td>
                        </tr>
                        <tr style={styles.row}>
                            <td>
                                <span>Details</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            <TextField
                                    id="text-field-controlled2"
                                    value={this.state.details || ''}
                                    onChange={(e) => this.setState({ details: e.target.value })}
                                    multiLine={true}
                                    rows={8}
                                    rowsMax={8}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Dialog>
        );
    }
}
