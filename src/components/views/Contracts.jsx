'use strict';

import React from 'react';

import {Card, CardHeader, CardText} from 'material-ui/Card';

import ContractsTable from '../tables/ContractsTable';
import Character from '../../models/Character';

const styles = {
    card: {
        margin: 10
    }
};

export default class Contracts extends React.Component {
    render() {
        return (
            <div>
                <Card style={styles.card}>
                    <CardHeader title="Pending Contracts"/>

                    <CardText>
                        <ContractsTable contracts={Character.getAllContracts(false)}/>
                    </CardText>
                </Card>

                <Card style={styles.card}>
                    <CardHeader title="Completed Contracts"/>

                    <CardText>
                        <ContractsTable
                            contracts={Character.getAllContracts(true)}
                            complete={true}
                        />
                    </CardText>
                </Card>
            </div>
        );
    }
}
