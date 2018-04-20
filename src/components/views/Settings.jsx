'use strict';

import React from 'react';

import {Card, CardHeader, CardText} from 'material-ui/Card';
import {deepOrange400} from 'material-ui/styles/colors';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {FontIcon} from 'material-ui';

import SettingsHelper from './../../helpers/SettingsHelper'

const styles = {
    card: {
        margin: 10
    },
    button: {
        marginTop: 20,
        fontWeight: 'bold',
    },
};

export default class Settings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            eveClientId: SettingsHelper.get('eve_client_id', ''),
            eveClientSecret: SettingsHelper.get('eve_client_secret', ''),
            testStatusText: 'Untested',
            testStatusColor: 'gray',
        };

        this.handleChange = this.handleChange.bind(this);
        this.saveDeveloperCredentials = this.saveDeveloperCredentials.bind(this);
    }

    handleChange(event, value) {
        let change = {};
        change[event.target.id] = event.target.value;
        this.setState(change);
    };

    async saveDeveloperCredentials() {
        if ((this.state.eveClientId === '') || (this.state.eveClientSecret === '')) {
            return;
        }

        SettingsHelper.set('eve_client_id', this.state.eveClientId);
        SettingsHelper.set('eve_client_secret', this.state.eveClientSecret);
    }

    render() {
        return (
            <div>
                <Card style={styles.card}>
                    <CardHeader
                        title="EVE API Application Credentials"
                        subtitle="You must input a client ID and secret key from the EVE Developers website in order to authorize your EVE characters."
                    />

                    <CardText>
                        <p>
                            Please visit this page and follow the instructions to create a Client ID/Secret Key:<br/>
                            <a href="https://github.com/PrometheusSatyen/Cerebral/blob/master/docs/API-SETUP.md" target="_blank" style={{color: '#fff'}}>API Setup Instructions</a><br/>
                            Please read the instructions <strong>very carefully</strong> as it is important that you follow them <strong>exactly</strong>.
                        </p>

                        <p style={{color: deepOrange400}}>
                            <strong>Warning:</strong> After changing your client credentials, all of your characters will lose authorization within 20 minutes, and must be re-authorized before new data will be pulled.
                        </p>

                        <TextField
                            id="eveClientId"
                            value={this.state.eveClientId}
                            floatingLabelText="EVE Client ID"
                            fullWidth={true}
                            onChange={this.handleChange}
                        />

                        <br/>

                        <TextField
                            id="eveClientSecret"
                            value={this.state.eveClientSecret}
                            floatingLabelText="EVE Secret Key"
                            fullWidth={true}
                            onChange={this.handleChange}
                        />

                        <br/>

                        <RaisedButton
                            label="Save"
                            backgroundColor="#616161"
                            style={styles.button}
                            icon={<FontIcon className="material-icons">save</FontIcon>}
                            onClick={this.saveDeveloperCredentials}
                        />
                    </CardText>
                </Card>
            </div>
        );
    }
}
