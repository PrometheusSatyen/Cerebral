'use strict';

import React from 'react';

import { Card, Paper } from 'material-ui';

import CharacterSelector from '../skillbrowser/CharacterSelector';
import FilteredSkillList from '../skillbrowser/FilteredSkillList';
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
    }

    handleSkillListSelection(selectedType) {
        this.setState({ selectedType: selectedType });
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
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
