'use strict';

import React from 'react';

import {Card, CardHeader, CardText} from 'material-ui/Card';
import FontIcon from 'material-ui/FontIcon';
import {red500, greenA200, grey500} from 'material-ui/styles/colors';

import CharacterModel from '../../models/Character';
import AuthorizedCharacter from '../../models/AuthorizedCharacter';
import DateTimeHelper from '../../helpers/DateTimeHelper';

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

export default class Character extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const char = CharacterModel.get(this.props.match.params.characterId);

        return (
            <div style={{width: '100%', overflow: 'hidden'}}>
                <div style={styles.cardDiv}>
                    <Card style={styles.card}>
                        <CardHeader
                            title={char.name}
                            subtitle={char.getTotalSp().toLocaleString(navigator.language, { minimumFractionDigits: 0 }) + ' SP'}
                            avatar={char.portraits.px128x128}
                        />

                        <CardText>
                            <p style={{marginTop: 0}}>
                                <strong>Character ID:</strong> {char.id}<br/>
                                <strong>Date of Birth:</strong> {char.getDateOfBirth().toLocaleString(navigator.language)}<br/>
                                <strong>Security Status:</strong> {char.security_status.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br/>
                                <strong>Wallet Balance:</strong> {char.balance.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK<br/>
                                <strong>Corporation:</strong> {char.corporation.name}<br/>
                                <strong>Alliance:</strong> {char.alliance !== undefined ? char.alliance.name : 'N/A'}<br/>
                                <strong>Home Location:</strong> {char.home_location.location !== undefined ?
                                    `${char.home_location.location.name} (${char.home_location.location.type.name})` :
                                    'Unknown Structure'
                                }<br/>
                                <strong>Current Location:</strong> {char.location.system.name} ({
                                    char.location.hasOwnProperty('location') ?
                                        `${char.location.location.name} (${char.location.location.type.name})` :
                                        (char.location.hasOwnProperty('structure_id') ? 'Unknown Structure' : 'Undocked')
                                })<br/>
                                <strong>Current Ship:</strong> {char.ship.ship_name} ({char.ship.type.name})
                            </p>

                            <p>
                                <strong>Attributes:</strong>
                            </p>
                            <ul>
                                <li>Intelligence: {char.attributes.intelligence}</li>
                                <li>Memory: {char.attributes.memory}</li>
                                <li>Perception: {char.attributes.perception}</li>
                                <li>Willpower: {char.attributes.willpower}</li>
                                <li>Charisma: {char.attributes.charisma}</li>
                            </ul>
                            <p>
                                <strong>Bonus Remaps:</strong> {char.attributes.bonus_remaps}<br/>
                                <strong>Next Yearly Remap:</strong> {char.getNextYearlyRemapDate() !== true ?
                                    char.getNextYearlyRemapDate().toLocaleString(navigator.language) : 'Now'
                                }
                            </p>
                        </CardText>
                    </Card>

                    <Card style={styles.card}>
                        <CardHeader title='Jump Clones'/>
                        <CardText>
                            {
                                char.jumpClones.length > 0 ?
                                    char.jumpClones.map(jumpClone =>
                                        <div key={jumpClone.jump_clone_id}>
                                            <strong>Name:</strong> {jumpClone.name ? jumpClone.name : 'N/A' }<br/>
                                            {jumpClone.location !== undefined ? `${jumpClone.location.name} (${jumpClone.location.type.name})` : 'Unknown Structure'}
                                            <ul>
                                                {jumpClone.implants.map(implant => <li key={implant.id}>{implant.name}</li>)}
                                            </ul>
                                        </div>
                                    ) :
                                    'No Jump Clones'
                            }
                        </CardText>
                    </Card>
                </div>

                <div style={styles.cardDiv}>
                    <Card style={styles.card}>
                        <CardHeader title='Active Implants'/>
                        <CardText>
                            {
                                char.implants.length > 0 ?
                                    <table cellPadding={0}>
                                        {
                                            char.implants.map(implant =>
                                                <tr key={implant.id}>
                                                    <td width={30}><img width={24} src={`https://image.eveonline.com/Type/${implant.id}_32.png`}/></td>
                                                    <td>{implant.name}</td>
                                                </tr>
                                            )
                                        }

                                    </table> :
                                    'No Active Implants'
                            }
                        </CardText>
                    </Card>

                    <Card style={styles.card}>
                        <CardHeader
                            title='Skill Queue'
                            subtitle={
                                char.getCurrentSkill() !== undefined ?
                                    DateTimeHelper.timeUntil(new Date(char.getLastSkill().finish_date)) :
                                    '0d 0h 0m 0s'
                            }
                        />

                        <CardText>
                            {
                                char.getCurrentSkill() !== undefined ?
                                    char.skillQueue.map(skill => {
                                        if (new Date(skill.finish_date) < new Date()) {
                                            return undefined;
                                        } else {
                                            return (
                                                <span key={skill.queue_position}>
                                                    {skill.skill_name} {skill.finished_level}&nbsp;

                                                    <span style={{color: grey500}}>
                                                        {DateTimeHelper.skillLength(skill.start_date, skill.finish_date)}
                                                    </span>
                                                    <br/>
                                                </span>
                                            );
                                        }
                                    }) :
                                    'No Skills in Queue'
                            }
                        </CardText>
                    </Card>

                    <Card style={styles.card}>
                        <CardHeader title='Scopes Granted'/>
                        <CardText>
                            <strong>Note:</strong> If you are missing any scopes, please simply use the Authorize Character button on the character
                            overview and re-add this character.<br/><br/>

                            {
                                AuthorizedCharacter.get(this.props.match.params.characterId)
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