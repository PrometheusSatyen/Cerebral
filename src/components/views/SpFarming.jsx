'use strict';

import React from 'react';

import AddFarmDialog from '../dialogs/AddFarmDialog';
import SpFarmingTable from '../tables/SpFarmingTable';

export default class SpFarming extends React.Component {
    render() {
        return (
            <div>
                <AddFarmDialog/>
                <SpFarmingTable/>
            </div>
        );
    }
}
