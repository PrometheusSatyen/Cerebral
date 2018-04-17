'use strict';

import React from 'react';

import CharacterHelper from '../../helpers/CharacterHelper';

import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

const styles = {
    addCharacterButton: {
        margin: '20px 0 20px 20px'
    }
};

export default class AddCharacterButton extends React.Component {
    render() {
        return (
            <RaisedButton
                label="Authorize Character"
                backgroundColor="#616161"
                onClick={CharacterHelper.addCharacter}
                style={styles.addCharacterButton}
                icon={<FontIcon className="material-icons">person_add</FontIcon>}
            />
        );
    }
}
