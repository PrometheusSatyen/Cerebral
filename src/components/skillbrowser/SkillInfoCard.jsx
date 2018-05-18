import React from 'react';

import { Card, CardHeader, CardText } from 'material-ui';
import {grey500} from 'material-ui/styles/colors';

import AllSkills from '../../../resources/all_skills';
import Character from '../../models/Character';
import DateHelper from '../../helpers/DateTimeHelper';
import PlanCharacter from '../../models/PlanCharacter';

const styles = {
    margin10: {
        margin: 10,
    },
    trainingTable: {
        borderSpacing: 0,
        color: grey500,
    },
};

const romanNumerals = {
    0: '',
    1: 'Ⅰ',
    2: 'Ⅱ',
    3: 'Ⅲ',
    4: 'Ⅳ',
    5: 'Ⅴ',
};

export default class SkillInfoCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.type = this.props.selectedType;
        this.skillName = '';
        this.skillDescription = '';
        this.skillSubTitle = '';
        this.updateTexts();

        if (this.props.characterId !== undefined && this.props.characterId !== 0) {
            this.character = Character.get(this.props.characterId);
            this.planCharacter = new PlanCharacter(this.props.characterId);
        }
    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.characterId !== this.props.characterId) {
            if (nextProps.characterId !== undefined && nextProps.characterId !== 0) {
                this.character = Character.get(nextProps.characterId);
                this.planCharacter = new PlanCharacter(nextProps.characterId);
            }
        } else if (nextProps.selectedType !== this.props.selectedType) {
            if (nextProps.selectedType !== undefined && nextProps.selectedType !== 0) {
                this.type = nextProps.selectedType;
            }
        }
    }

    updateTexts() {
        this.skillName = AllSkills.skills[this.type] !== undefined ? AllSkills.skills[this.type].name : '';
        this.skillDescription = AllSkills.skills[this.type] !== undefined ? AllSkills.skills[this.type].description : '';

        if (AllSkills.skills[this.type]) {
            const priName = AllSkills.skills[this.type].primary_attribute;
            const secName = AllSkills.skills[this.type].secondary_attribute;
            const rank = AllSkills.skills[this.type].training_time_multiplier;

            // do we have a character with loaded attributes? char might not be selected
            if (this.character !== undefined && this.character.attributes !== undefined) {
                const pri = this.character.attributes.hasOwnProperty(priName) ? this.character.attributes[priName] : 0;
                const sec = this.character.attributes.hasOwnProperty(secName) ? this.character.attributes[secName] : 0;
                const spPerHour = (pri + (sec / 2)) * 60;

                this.skillSubTitle = `${priName} / ${secName} (Rank ${rank}) @ ${spPerHour} SP/hour`;

                // plan to 0 to resolve the prerequisite skills
                this.planCharacter.planSkill([this.type], 0);
                let lastTime = this.planCharacter.time;
                this.trainingTableRows = [];

                // get the times for each level
                for (let i = 1; i <= 5; i += 1) {
                    // add next level to the plan
                    this.planCharacter.planSkill([this.type], i);

                    // do we need to train or is it already completed?
                    if ((this.planCharacter.time - lastTime) > 0) {
                        const forLevel = DateHelper.niceCountdown(this.planCharacter.time - lastTime);
                        const forPrevious = lastTime > 0 ? `(+${DateHelper.niceCountdown(lastTime)})` : '';
                        this.trainingTableRows.push(<tr key={i}><td>{romanNumerals[i]}</td><td>{forLevel}</td><td>{forPrevious}</td></tr>);
                    } else {
                        this.trainingTableRows.push(<tr key={i}><td>{romanNumerals[i]}</td><td>Already trained</td><td /></tr>);
                    }

                    lastTime = this.planCharacter.time;
                }

                this.planCharacter.reset();
                // we don't ... go without training info
            } else {
                this.skillSubTitle = `${priName} / ${secName} (Rank ${rank})`;
                this.trainingTableRows = undefined;
            }
        } else {
            this.skillSubTitle = '';
            this.trainingTableRows = undefined;
        }
    }

    render() {
        this.updateTexts();
        return (
            <Card style={styles.margin10}>
                <CardHeader
                    style={{ textTransform: 'capitalize' }}
                    title={this.skillName}
                    subtitle={this.skillSubTitle}
                />
                {this.trainingTableRows !== undefined ?
                    <CardText>
                        {this.skillDescription}
                        <table style={styles.trainingTable}>
                            <tbody>
                                {this.trainingTableRows}
                            </tbody>
                        </table>
                    </CardText>
                    :
                    <CardText>
                        {this.skillDescription}
                    </CardText>
                }
            </Card>
        );
    }
}
