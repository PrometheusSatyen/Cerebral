'use strict';

import React from 'react';

import { Card, CardHeader, CardText } from 'material-ui/Card';

import CharacterModel from '../../../models/Character';

import MailTable from '../../tables/MailTable';

const styles = {
    card: {
        margin: 10
    }
};

export default class Mails extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const char = CharacterModel.get(this.props.characterId);
        const mails = char.getMails();

        return (
            <div>
                <Card style={styles.card}>
                    <CardHeader
                        title={`Last Update: ${char.getDataRefreshInfo().find(c => c.type === 'Mails').lastRefresh}`}
                    />
                    <CardText>
                        <MailTable
                            mails={mails}
                            complete={true}
                        />
                    </CardText>
                </Card>
            </div>
        );
    }
}