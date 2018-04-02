import React from 'react';
import {Redirect} from 'react-router';
import Avatar from 'material-ui/Avatar';
import {Table, TableHeader, TableHeaderColumn, TableBody, TableRow, TableRowColumn} from 'material-ui/Table';
import Character from '../../models/Character';
import FarmCharacter from '../../models/FarmCharacter';
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
                    </TableRow>
                </TableHeader>

                <TableBody displayRowCheckbox={false}>
                    {this.state.characters.map(character => {
                        return (
                            <TableRow key={character.id} selectable={false} onClick={(e) => this.handleClick(e, character.id)}>
                                <TableRowColumn style={{width: '20px'}}>
                                    <Avatar src={Character.get(character.id).portraits.px128x128} style={{marginTop: "5px"}}/>
                                </TableRowColumn>
                                <TableRowColumn style={{width: '20px'}}>
                                    <img
                                        src={
                                            Character.get(character.id).isOmega() ?
                                                './../resources/omega.png' :
                                                (Character.get(character.id).isOmega() === false ?
                                                    './../resources/alpha.png' :
                                                    '')
                                    }
                                         style={styles.alphaOmegaIndicator}
                                    />
                                </TableRowColumn>
                                <TableRowColumn>{Character.get(character.id).name}</TableRowColumn>
                                <TableRowColumn>
                                    {character.baseSp.toLocaleString(navigator.language, { minimumFractionDigits: 0 })} SP<br/>
                                    {Character.get(character.id).getTotalSp().toLocaleString(navigator.language, { minimumFractionDigits: 0 })} SP
                                </TableRowColumn>
                                <TableRowColumn>
                                    {Character.get(character.id).getInjectorsReady(character.baseSp)}<br/>
                                    {DateTimeHelper.timeUntil(Character.get(character.id).getNextInjectorDate(character.baseSp))}
                                </TableRowColumn>
                                <TableRowColumn>
                                    {Character.get(character.id).getCurrentSkill() !== undefined ? Character.get(character.id).getCurrentSpPerHour() : "Not Training"}<br/>
                                    {Character.get(character.id).getCurrentSkill() !== undefined ? DateTimeHelper.timeUntil(new Date(Character.get(character.id).getLastSkill().finish_date)) : ""}
                                </TableRowColumn>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        );
    }
}
