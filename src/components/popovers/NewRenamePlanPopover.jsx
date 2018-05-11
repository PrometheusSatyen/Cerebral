import React from 'react';
import { Popover, TextField } from 'material-ui';

const styles = {
    popover: {
        background: '#404040',
    },
    margin10: {
        margin: 10,
    },
};

export default class NewRenamePlanPopover extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            anchorEl: undefined,
            text: this.props.text !== undefined ? this.props.text : '',
        };
        this.handleRequestClose = this.handleRequestClose.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.open !== this.props.open) {
            this.setState({ open: nextProps.open });
        }
        if (nextProps.anchorEl !== this.props.anchorEl) {
            this.setState({ anchorEl: nextProps.anchorEl });
        }
    }


    handleRequestClose() {
        this.setState({
            open: false,
        });
        if (this.state.text !== undefined && this.state.text.length > 0) {
            this.props.onNewName(this.state.text);
        } else {
            this.props.onNewName(undefined);
        }
    }

    render() {
        return (
            <Popover style={styles.popover}
                open={this.state.open}
                anchorEl={this.state.anchorEl}
                style={{ background: '#404040' }}
                onRequestClose={this.handleRequestClose}
            >
                <div style={styles.margin10}>
                    <TextField
                        id={'text-field-controlled'}
                        hintText="Plan Name"
                        onChange={(e) => this.setState({ text: e.target.value })}
                        value={this.state.text}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                this.handleRequestClose();
                                e.preventDefault();
                            }
                        }}
                    />
                </div>
            </Popover>
        );
    }
}
