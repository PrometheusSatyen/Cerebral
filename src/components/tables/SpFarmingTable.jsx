'use strict';

import React from 'react';
import {Redirect} from 'react-router';

import Character from '../../models/Character';
import FarmCharacter from '../../models/FarmCharacter';
import FarmHelper from '../../helpers/FarmHelper';
import DateTimeHelper from '../../helpers/DateTimeHelper';

import Avatar from 'material-ui/Avatar';
import {Table, TableHeader, TableHeaderColumn, TableBody, TableRow, TableRowColumn} from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import {red500} from 'material-ui/styles/colors';

const styles = {
    charactersTable: {
        height: '100%',
        width: '100%'
    },
    omegaStatusIcon: {
        marginTop: '5px'
    }
};

export default class SpFarmingTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            characters: FarmCharacter.getAll(),
            ticking: true,
            redirectPath: undefined
        };
    }

    componentDidMount() {
        this.timerId = setInterval(
            () => this.tick(),
            1000
        );

        this.subscriberId = FarmCharacter.subscribe(this);
    }

    componentWillUnmount() {
        clearInterval(this.timerId);

        FarmCharacter.unsubscribe(this.subscriberId);
    }

    tick() {
        if (this.state.ticking) {
            this.forceUpdate();
        }
    }

    handleClick(e, characterId) {
        let path = '/characters/' + characterId;

        this.setState({
            redirectPath: path
        });
    }

    handleDelete(e, characterId) {
        FarmHelper.deleteFarm(characterId);

        this.forceUpdate();
    };

    render() {
        if (this.state.redirectPath !== undefined) {
            this.setState({redirectPath: undefined});

            return <Redirect push to={this.state.redirectPath}/>;
        }

        return (
            <Table style={styles.charactersTable}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
                    <TableRow>
                        <TableHeaderColumn style={{width: '20px'}}/>
                        <TableHeaderColumn style={{width: '20px'}}/>
                        <TableHeaderColumn style={{width: '20px'}}/>
                        <TableHeaderColumn>Character</TableHeaderColumn>
                        <TableHeaderColumn>
                            Base SP<br/>
                            Total SP
                        </TableHeaderColumn>
                        <TableHeaderColumn>
                            Injectors Ready<br/>
                            Time Until Next Injector
                        </TableHeaderColumn>
                        <TableHeaderColumn>
                            Current SP/hour<br/>
                            Queue Length
                        </TableHeaderColumn>
                        <TableHeaderColumn style={{width: 20}}/>
                    </TableRow>
                </TableHeader>

                <TableBody displayRowCheckbox={false}>
                    {this.state.characters.map(farmChar => {
                        const char = Character.get(farmChar.id);
                        let omegaStatusIconPath = './../resources/';
                        switch(char.isOmega()) {
                            case true:
                                omegaStatusIconPath += 'omega.png';
                                break;
                            case false:
                                omegaStatusIconPath += 'alpha.png';
                                break;
                            default:
                                omegaStatusIconPath = '';
                        }
                        const currentSkill = char.getCurrentSkill();

                        return (
                            <TableRow key={char.id} selectable={false}>
                                <TableRowColumn style={{width: '20px'}}>
                                    <Avatar src={char.portraits.px128x128} style={{marginTop: 5}}/>
                                </TableRowColumn>

                                <TableRowColumn style={{width: '20px'}}>
                                    <img src={omegaStatusIconPath} style={{marginTop: 5}}/>
                                </TableRowColumn>

                                <TableRowColumn style={{width: '20px'}}>
                                    <img src={`https://image.eveonline.com/Corporation/${char.corporation_id}_64.png`} width={35} style={{marginTop: 7}}/>
                                </TableRowColumn>

                                <TableRowColumn><a onClick={e => this.handleClick(e, char.id)}>{char.name}</a></TableRowColumn>

                                <TableRowColumn>
                                    {farmChar.baseSp.toLocaleString(navigator.language, { maximumFractionDigits: 0 })} SP<br/>
                                    {char.getTotalSp().toLocaleString(navigator.language, { maximumFractionDigits: 0 })} SP
                                </TableRowColumn>

                                <TableRowColumn>
                                    {char.getInjectorsReady(farmChar.baseSp)}<br/>
                                    {DateTimeHelper.timeUntil(char.getNextInjectorDate(farmChar.baseSp))}
                                </TableRowColumn>

                                <TableRowColumn>
                                    {currentSkill !== undefined ? char.getCurrentSpPerHour() : "Not Training"}<br/>
                                    {currentSkill !== undefined ? DateTimeHelper.timeUntil(new Date(char.getLastSkill().finish_date)) : ""}
                                </TableRowColumn>

                                <TableRowColumn style={{width: 20, textAlign: 'right', paddingRight: 40}}>
                                    <IconButton color={red500} onClick={e => this.handleDelete(e, char.id)}>
                                        <FontIcon className="material-icons">delete</FontIcon>
                                    </IconButton>
                                </TableRowColumn>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        );
    }
}
