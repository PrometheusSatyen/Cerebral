'use strict';

import React from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

import Character from '../../models/Character';

const styles = {
    refreshButton: {
        margin: '20px 0 20px 10px'
    }
};

export default class RefreshButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshInProgress: false
        };
    }

    async doRefresh() {
        this.setState({refreshInProgress: true});
        await Character.build();
        this.setState({refreshInProgress: false});
    }

    render() {
        return (
            <RaisedButton
                disabled={this.state.refreshInProgress}
                label="Refresh"
                secondary={true}
                onClick={this.doRefresh.bind(this)}
                style={styles.refreshButton}
                icon={<FontIcon className="material-icons">refresh</FontIcon>}
            />
        );
    }
}
