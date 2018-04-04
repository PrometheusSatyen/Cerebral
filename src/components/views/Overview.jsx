'use strict';

import React from 'react';

import AddCharacterButton from '../buttons/AddCharacterButton';
import RefreshButton from '../buttons/RefreshButton';
import CharactersOverviewTable from '../tables/CharactersOverviewTable';

export default class Overview extends React.Component {
    render() {
        return (
            <div>
                <AddCharacterButton/> <RefreshButton/>
                <CharactersOverviewTable/>
            </div>
        );
    }
}
