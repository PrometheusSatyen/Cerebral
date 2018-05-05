'use strict';

import React from 'react';

import { Card, Paper, CardHeader, CardText } from 'material-ui';
import { grey500 } from 'material-ui/styles/colors';

import CharacterSelector from '../skillbrowser/CharacterSelector';
import DateHelper from '../../helpers/DateTimeHelper';
import FilteredSkillList from '../skillbrowser/FilteredSkillList';
import PlanCharacter from '../../models/PlanCharacter';
import SkillInfoCard from '../skillbrowser/SkillInfoCard';
import SkillTree from '../skillbrowser/SkillTree';


const styles = {
    margin10: {
        margin: 10,
    },
    skillListCard: {
        margin: 10,
        width: 280,
        verticalAlign: 'top',
    },
    leftColumn: {
        verticalAlign: 'top',
        height: '100%',
    },
    rightColumn: {
        verticalAlign: 'top',
        width: '100%',
        height: '100%',
    },
};


export default class SkillBrowser extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedType: 0,
            characterId: 0,
        };

        this.handleSkillListSelection = this.handleSkillListSelection.bind(this);
        this.handleCharacterChange = this.handleCharacterChange.bind(this);
        this.queue = [];
    }

    handleSkillListSelection(selectedType) {
        this.setState({ selectedType: selectedType });
        if (this.state.characterId !== undefined && this.state.characterId !== 0) {
            this.planCharacter = new PlanCharacter(this.state.characterId);
            this.planCharacter.planSkill(selectedType, 1, 0);
            this.queue = this.planCharacter.queue;
        }
    }

    handleCharacterChange(value) {
        this.setState({ characterId: value });

    }

    render() {
        return (
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td style={styles.leftColumn}>
                                <Card style={styles.margin10}>
                                    <CharacterSelector onCharacterChange={this.handleCharacterChange} />
                                </Card>
                                <Card style={styles.skillListCard}>
                                    <FilteredSkillList style={styles.skillListCard} characterId={this.state.characterId} onSkillSelectionChange={this.handleSkillListSelection} />
                                </Card>
                            </td>
                            <td style={styles.rightColumn}>
                                <div >
                                    {this.state.selectedType !== 0 ?
                                        <SkillInfoCard style={styles.margin10} characterId={this.state.characterId} selectedType={this.state.selectedType} />
                                        : ''
                                    }
                                    <Paper style={styles.margin10} >
                                        <SkillTree characterId={this.state.characterId} selectedType={this.state.selectedType} />
                                    </Paper>
                                </div>
                                {this.queue.length > 0 ?
                                    <Card style={styles.margin10}>
                                        <CardHeader 
                                            actAsExpander
                                            style={{ textTransform: 'capitalize' }}
                                            title={'Individual skill breakdown'}
                                            showExpandableButton
                                        />
                                        <CardText style={styles.margin10} expandable>
                                            {
                                                this.queue.map((s, i) => <span key={i}>{` ${s.name} ${s.lvl}`}<span style={{ color: grey500 }}>{` ${DateHelper.niceCountdown(s.time)} `}<br /></span></span>)
                                            }
                                        </CardText>
                                    </Card>
                                    : ''
                                }
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
