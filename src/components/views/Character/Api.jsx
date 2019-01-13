'use strict';

import React from 'react';

import {Card, CardHeader, CardText} from 'material-ui/Card';
import FontIcon from 'material-ui/FontIcon';
import {red500, greenA200} from 'material-ui/styles/colors';

import CharacterModel from '../../../models/Character';
import AuthorizedCharacter from '../../../models/AuthorizedCharacter';
import DateTimeHelper from '../../../helpers/DateTimeHelper';

const styles = {
    cardDiv: {
        width: '50%',
        float: 'left'
    },
    card: {
        margin: 10
    },
    scopeIcons: {
        fontSize: 14
    }
};

export default class Api extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const char = CharacterModel.get(this.props.characterId);
        const auth = AuthorizedCharacter.get(this.props.characterId);
        const authStatus = (auth.lastRefresh.success !== false) || (auth.lastRefresh.shouldRetry !== false);

        return (
            <div>
                <div style={styles.cardDiv}>
                    <Card style={styles.card}>
                        <CardHeader title='Scopes Granted'/>
                        <CardText>
                            <strong>Note:</strong> If you are missing any scopes, please simply use the Authorize Character button on the character
                            overview and re-add this character.<br/><br/>

                            {
                                AuthorizedCharacter.get(this.props.characterId)
                                    .getScopeInfo()
                                    .map(scope =>
                                        <span key={scope.name}>
                                            <FontIcon
                                                style={styles.scopeIcons}
                                                className='material-icons'
                                                color={scope.isGranted ? greenA200 : red500}>
                                                {scope.isGranted ? 'check' : 'clear'}
                                            </FontIcon> {scope.description}<br/>
                                        </span>
                                    )
                            }
                        </CardText>
                    </Card>
                </div>

                <div style={styles.cardDiv}>
                    <Card style={styles.card}>
                        <CardHeader title='API Health'/>
                        <CardText>
                            <strong>SSO Version:</strong> v{auth.ssoVersion}<br/>
                            <strong>Token Status:</strong>&nbsp;
                            <span style={{color: authStatus !== false ? greenA200 : red500}}>
                                {authStatus ? 'OK' : 'Dead, please re-authorize!'}
                            </span><br/><br/>

                            <strong>Access Token:</strong> ****<br/>
                            <strong>Access Token Expiry:</strong> {DateTimeHelper.relativeTimeString(new Date(auth.accessTokenExpiry))}<br/><br/>

                            <strong>Refresh Token:</strong> ****
                            {
                                auth.lastRefresh.date !== undefined ?
                                    <div>
                                        <strong>Last Refresh:</strong>&nbsp;

                                        <span style={{color: auth.lastRefresh.success !== false ? greenA200 : red500}}>
                                            {auth.lastRefresh.success !== false ? 'Success' : 'Failure'}
                                        </span>,&nbsp;

                                        {DateTimeHelper.timeSince(new Date(auth.lastRefresh.date))} ago
                                    </div> :
                                    ''
                            }
                        </CardText>
                    </Card>

                    <Card style={styles.card}>
                        <CardHeader title='Data Refresh'/>
                        <CardText>
                            <table width='100%' style={{textAlign: 'right'}}>
                                <thead>
                                <tr>
                                    <th/>
                                    <th>Last</th>
                                    <th>Next</th>
                                </tr>
                                </thead>

                                <tbody>
                                {
                                    char.getDataRefreshInfo().map(o =>
                                        <tr key={o.type}>
                                            <td>{o.type}</td>
                                            <td>{o.lastRefresh}</td>
                                            <td>{o.nextRefresh}</td>
                                        </tr>
                                    )
                                }
                                </tbody>
                            </table>
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    }
}