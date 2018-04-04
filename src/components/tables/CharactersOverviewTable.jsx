'use strict';

import React from 'react';
import {Redirect} from 'react-router';

import Character from '../../models/Character';
import DateTimeHelper from '../../helpers/DateTimeHelper';

import Avatar from 'material-ui/Avatar';
import {Table, TableBody, TableRow, TableRowColumn} from 'material-ui/Table';

const styles = {
    charactersTable: {
        height: '100%',
        width: '100%'
    },
    alphaOmegaIndicator: {
        marginTop: '5px'
    }
};

export default class CharactersOverviewTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            characters: Object.values(Character.getAll()).sort((a, b) => b.getTotalSp() - a.getTotalSp()),
            ticking: true,
            redirectPath: undefined
        };
    }

    componentDidMount() {
        this.timerId = setInterval(
            () => this.tick(),
            1000
        );

        this.subscriberId = Character.subscribe(this);
    }

    componentWillUnmount() {
        clearInterval(this.timerId);

        Character.unsubscribe(this.subscriberId);
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

    render() {
        if (this.state.redirectPath !== undefined) {
            this.setState({redirectPath: undefined});

            return <Redirect push to={this.state.redirectPath}/>;
        }

        return (
            <Table style={styles.charactersTable}>
                <TableBody displayRowCheckbox={false}>
                    {this.state.characters.map(char =>
                        <TableRow key={char.id} selectable={false} onClick={(e) => this.handleClick(e, char.id)}>
                            <TableRowColumn style={{width: '20px'}}>
                                <Avatar src={char.portraits.px128x128} style={{marginTop: "5px"}}/>
                            </TableRowColumn>

                            <TableRowColumn style={{width: '20px'}}>
                                <img
                                    src={char.isOmega() ?
                                        './../resources/omega.png' :
                                        (
                                            char.isOmega() === false ?
                                                './../resources/alpha.png' :
                                                ''
                                        )
                                    }
                                    style={styles.alphaOmegaIndicator}
                                />
                            </TableRowColumn>

                            <TableRowColumn>
                                {char.name}<br/>
                                {char.corporation.name} / {char.alliance_id !== undefined ? char.alliance.name : "N/A"}
                            </TableRowColumn>

                            <TableRowColumn>
                                {char.balance.toLocaleString(navigator.language, { minimumFractionDigits: 2 })} ISK<br/>
                                {char.getTotalSp().toLocaleString(navigator.language, { minimumFractionDigits: 0 })} SP
                            </TableRowColumn>

                            <TableRowColumn>
                                {char.getCurrentSkill() !== undefined ?
                                    `${char.getCurrentSkill().skill_name} ${char.getCurrentSkill().finished_level}` :
                                    "Not Training"}<br/>

                                {char.getCurrentSkill() !== undefined ?
                                    DateTimeHelper.timeUntil(new Date(char.getCurrentSkill().finish_date)) :
                                    ""}
                            </TableRowColumn>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        );
    }
}
