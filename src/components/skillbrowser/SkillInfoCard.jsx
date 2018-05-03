import React from 'react';

import { Card, CardHeader, CardText } from 'material-ui';

import AllSkills from '../../../resources/all_skills';
import Character from '../../models/Character';
import { METHODS } from 'http';

const styles = {
    margin10: {
        margin: 10,
    },
}

export default class SkillInfoCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.type = this.props.selectedType;
        this.skillName = '';
        this.skillDescription = '';
        this.skillSubTitle = '';
        this.updateTexts();
        this.characterId = this.props.characterId;
    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.characterId !== this.props.characterId) {
            if (nextProps.characterId !== undefined && nextProps.characterId !== 0) {
                this.character = Character.get(nextProps.characterId);
                this.updateTexts();
            }
        } else if (nextProps.selectedType !== this.props.selectedType) {
            if (nextProps.selectedType !== undefined && nextProps.selectedType !== 0) {
                this.type = nextProps.selectedType;
                this.updateTexts();
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
                //
            // we don't ... go without training info
            } else {
                this.skillSubTitle = `${priName} / ${secName} (Rank ${rank})`;
            }
        } else {
            this.skillSubTitle = '';
        }
    }

    render() {
        return (
            <Card style={styles.margin10}>
                <CardHeader
                    style={{ textTransform: 'capitalize' }}
                    title={this.skillName}
                    subtitle={this.skillSubTitle}
                />
                <CardText>
                    {this.skillDescription}
                </CardText>
            </Card>
        );
    }
}
