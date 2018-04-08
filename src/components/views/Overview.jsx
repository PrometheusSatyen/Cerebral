'use strict';

import React from 'react';

import AddCharacterButton from '../buttons/AddCharacterButton';
import CharactersOverviewTable from '../tables/CharactersOverviewTable';

export default class Overview extends React.Component {
    render() {
        return (
            <div>
                <AddCharacterButton/>
                <CharactersOverviewTable/>
            </div>
        );
    }
}
