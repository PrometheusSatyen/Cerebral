import React from 'react';
import Avatar from 'material-ui/Avatar';

import {
    Table,
    TableBody,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';
import Character from '../../models/Character';
import DateTimeHelper from '../../helpers/DateTimeHelper';

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
            ticking: true
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

    render() {
        return (
            <Table style={styles.charactersTable}>
                <TableBody displayRowCheckbox={false}>
                    {this.state.characters.map(character => {
                        return (
                            <TableRow key={character.id}>
                                <TableRowColumn style={{width: '20px'}}>
                                    <Avatar src={character.portraits.px128x128} style={{marginTop: "5px"}}/>
                                </TableRowColumn>
                                <TableRowColumn style={{width: '20px'}}>
                                    <img
                                        src={
                                            character.isOmega() ?
                                                './../resources/omega.png' :
                                                (character.isOmega() === false ?
                                                    './../resources/alpha.png' :
                                                    '')
                                    }
                                         style={styles.alphaOmegaIndicator}
                                    />
                                </TableRowColumn>
                                <TableRowColumn>{character.name}</TableRowColumn>
                                <TableRowColumn>
                                    {character.corporation.name}<br/>
                                    {character.alliance_id !== undefined ? character.alliance.name : "N/A"}
                                </TableRowColumn>
                                <TableRowColumn>
                                    {character.balance.toLocaleString(navigator.language, { minimumFractionDigits: 2 })} ISK<br/>
                                    {character.getTotalSp().toLocaleString(navigator.language, { minimumFractionDigits: 0 })} SP
                                </TableRowColumn>
                                <TableRowColumn>
                                    {character.getCurrentSkill() !== undefined ? `${character.getCurrentSkill().skill_name} ${character.getCurrentSkill().finished_level}` : "Not Training"}<br/>
                                    {character.getCurrentSkill() !== undefined ? DateTimeHelper.timeUntil(new Date(character.getCurrentSkill().finish_date)) : ""}
                                </TableRowColumn>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        );
    }
}
