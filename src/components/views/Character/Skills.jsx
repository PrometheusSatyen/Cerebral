'use strict';

import React from 'react';

import {Card, CardHeader, CardText} from 'material-ui/Card';

import CharacterModel from '../../../models/Character';

const styles = {
    card: {
        margin: 10
    },
    squares: {
        marginTop: 3,
        marginLeft: 3,
        width: 9
    }
};

export default class Skills extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const char = CharacterModel.get(this.props.characterId);

        if ((char.skillTree === undefined) || (char.skillTree.length === 0)) {
            return (
                <Card style={styles.card}>
                    <CardHeader title="Skills"/>
                    <CardText>Sorry, could not find this character's skill sheet, please try again after the next skills refresh occurs (~15 minutes max).</CardText>
                </Card>
            );
        }

        return (
            <div>
                {
                    char.skillTree.map(group =>
                        <Card key={group.name} initiallyExpanded={true} style={styles.card}>
                            <CardHeader
                                title={group.name}
                                subtitle={`${group.total_sp.toLocaleString()} SP`}
                                actAsExpander={true}
                                showExpandableButton={true}
                            />

                            <CardText expandable={true}>
                                <table>
                                    <tbody>
                                        {
                                            group.skills.map(skill =>
                                                <tr key={skill.skill_id}>
                                                    <td width={300}>{skill.skill_name}</td>
                                                    <td width={120}>
                                                        {
                                                            [...Array(skill.trained_skill_level)].map((o, i) =>
                                                                <img key={i} style={styles.squares} src="./../resources/filled-square.png"/>
                                                            )
                                                        }
                                                        {
                                                            skill.half_trained ?
                                                                <img style={styles.squares} src="./../resources/half-filled-square.png"/> :
                                                                ''
                                                        }
                                                        {
                                                            [...Array(5 - skill.trained_skill_level - (skill.half_trained ? 1 : 0))].map((o, i) =>
                                                                <img key={i} style={styles.squares} src="./../resources/empty-square.png"/>
                                                            )
                                                        }
                                                    </td>
                                                    <td width={120}>
                                                        {
                                                            skill.trained_skill_level !== 0 ?
                                                                `Level ${skill.trained_skill_level}` :
                                                                'Untrained'
                                                        }
                                                    </td>
                                                    <td style={{textAlign: 'right'}}>{skill.skillpoints_in_skill.toLocaleString()} SP</td>
                                                </tr>
                                            )
                                        }
                                    </tbody>
                                </table>
                            </CardText>
                        </Card>
                    )
                }
            </div>
        );
    }
}