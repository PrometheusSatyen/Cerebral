import React from 'react';

import CharacterModel from '../../models/Character';
import AuthorizedCharacter from '../../models/AuthorizedCharacter';

import {Card, CardHeader, CardText} from 'material-ui/Card';
import FontIcon from 'material-ui/FontIcon';
import DateTimeHelper from '../../helpers/DateTimeHelper';
import {blue500, red500, greenA200} from 'material-ui/styles/colors';

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
        return (
            <div style={{width: '100%', overflow: 'hidden'}}>
                <div style={styles.cardDiv}>
                    <Card style={styles.card}>
                        <CardHeader
                            title={CharacterModel.get(this.props.match.params.characterId).name}
                            subtitle={CharacterModel.get(this.props.match.params.characterId).getTotalSp().toLocaleString(navigator.language, { minimumFractionDigits: 0 }) + " SP"}
                            avatar={CharacterModel.get(this.props.match.params.characterId).portraits.px128x128}
                        />
                        <CardText>
                            <p style={{marginTop: 0}}>
                                <strong>Date of Birth:</strong> {CharacterModel.get(this.props.match.params.characterId).getDateOfBirth().toLocaleString(navigator.language)}<br/>
                                <strong>Security Status:</strong> {CharacterModel.get(this.props.match.params.characterId).security_status.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}<br/>
                                <strong>Wallet Balance:</strong> {CharacterModel.get(this.props.match.params.characterId).balance.toLocaleString(navigator.language, { minimumFractionDigits: 2 })} ISK<br/>
                                <strong>Corporation:</strong> {CharacterModel.get(this.props.match.params.characterId).corporation.name}<br/>
                                <strong>Alliance:</strong> {CharacterModel.get(this.props.match.params.characterId).alliance !== undefined ? CharacterModel.get(this.props.match.params.characterId).alliance.name : "N/A"}<br/>
                                <strong>Home Location:</strong> {
                                    CharacterModel.get(this.props.match.params.characterId).home_location.location !== undefined ?
                                        CharacterModel.get(this.props.match.params.characterId).home_location.location.name :
                                        "Unknown"
                                }<br/>
                                <strong>Current Location:</strong> {CharacterModel.get(this.props.match.params.characterId).location.system.name} (
                                {
                                    CharacterModel.get(this.props.match.params.characterId).location.hasOwnProperty('location') ?
                                    CharacterModel.get(this.props.match.params.characterId).location.location.name :
                                        (
                                            CharacterModel.get(this.props.match.params.characterId).location.hasOwnProperty('structure_id') ?
                                                "Unknown Structure" :
                                                "Undocked"
                                        )
                                })<br/>
                                <strong>Current Ship:</strong> {CharacterModel.get(this.props.match.params.characterId).ship.ship_name} ({CharacterModel.get(this.props.match.params.characterId).ship.type.name})
                            </p>

                            <p>
                                <strong>Attributes:</strong>
                            </p>
                            <ul>
                                <li>Intelligence: {CharacterModel.get(this.props.match.params.characterId).attributes.intelligence}</li>
                                <li>Memory: {CharacterModel.get(this.props.match.params.characterId).attributes.memory}</li>
                                <li>Perception: {CharacterModel.get(this.props.match.params.characterId).attributes.perception}</li>
                                <li>Willpower: {CharacterModel.get(this.props.match.params.characterId).attributes.willpower}</li>
                                <li>Charisma: {CharacterModel.get(this.props.match.params.characterId).attributes.charisma}</li>
                            </ul>
                            <p>
                                <strong>Bonus Remaps:</strong> {CharacterModel.get(this.props.match.params.characterId).attributes.bonus_remaps}<br/>
                                <strong>Next Yearly Remap:</strong> {
                                    CharacterModel.get(this.props.match.params.characterId).getNextYearlyRemapDate() !== true ?
                                        CharacterModel.get(this.props.match.params.characterId).getNextYearlyRemapDate().toLocaleString(navigator.language) :
                                        "Now"
                                }
                            </p>
                        </CardText>
                    </Card>

                    <Card style={styles.card}>
                        <CardHeader
                            title="Jump Clones"
                        />
                        <CardText>
                            {CharacterModel.get(this.props.match.params.characterId).jumpClones.length > 0 ?
                                CharacterModel.get(this.props.match.params.characterId).jumpClones.map(jumpClone => {
                                    return(
                                        <div key={jumpClone.jump_clone_id}>
                                            <strong>Name:</strong> {jumpClone.name ? jumpClone.name : "N/A" }<br/>
                                            {jumpClone.location !== undefined ? jumpClone.location.name : "Unknown Location" }
                                            <ul>
                                                {jumpClone.implants.map(implant => {
                                                    return (
                                                        <li key={implant.id}>{implant.name}</li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    )
                                }) :
                                "No Jump Clones"}
                        </CardText>
                    </Card>
                </div>

                <div style={styles.cardDiv}>
                    <Card style={styles.card}>
                        <CardHeader
                            title="Active Implants"
                        />
                        <CardText>
                            {
                                CharacterModel.get(this.props.match.params.characterId).implants.length > 0 ?
                                    CharacterModel.get(this.props.match.params.characterId).implants.map(implant => {
                                        return(
                                            <span key={implant.id}>{implant.name}<br/></span>
                                        )
                                    }) :
                                    "No Active Implants"
                            }
                        </CardText>
                    </Card>

                    <Card style={styles.card}>
                        <CardHeader
                            title="Skill Queue"
                            subtitle={CharacterModel.get(this.props.match.params.characterId).getCurrentSkill() !== undefined ? DateTimeHelper.timeUntil(new Date(CharacterModel.get(this.props.match.params.characterId).getLastSkill().finish_date)) : "0d 0h 0m 0s"}
                        />
                        <CardText>
                            {
                                CharacterModel.get(this.props.match.params.characterId).getCurrentSkill() !== undefined ?
                                    CharacterModel.get(this.props.match.params.characterId).skillQueue.map(skill => {
                                        return(
                                            <span key={skill.queue_position}>{skill.skill_name} {skill.finished_level}<br/></span>
                                        )
                                    }) :
                                    "No Skills in Queue"
                            }
                        </CardText>
                    </Card>

                    <Card style={styles.card}>
                        <CardHeader
                            title="Scopes Granted"
                        />
                        <CardText>
                            <strong>Note:</strong> If you are missing any scopes, please simply use the Authorize Character button on the character overview and re-add this character.<br/><br/>

                            {AuthorizedCharacter.get(this.props.match.params.characterId).getScopeInfo().map(scope => {
                                return(
                                    <span key={scope.name}><FontIcon style={styles.scopeIcons} className="material-icons" color={scope.isGranted ? greenA200 : red500}>{scope.isGranted ? "check" : "clear"}</FontIcon> {scope.description}<br/></span>
                                )
                            })}
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    }
}