'use strict';

import React from 'react';

import Character from '../../models/Character';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FarmHelper from '../../helpers/FarmHelper';
import FontIcon from 'material-ui/FontIcon';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

const styles = {
    addFarmButton: {
        margin: '20px 0 20px 20px'
    },
    addFarmDialog: {
        width: 350
    }
};

export default class AddFarmDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            characterValue: 0,
            baseSpValue: 5000000
        };
    }

    handleCharacterChange(e, i, v) {
        this.setState({characterValue: v});
    }

    handleBaseSpChange(e, v) {
        this.setState({baseSpValue: v});
    }

    handleOpen(e) {
        this.setState({open: true});
    };

    handleCancel(e) {
        this.setState({open: false});
    };

    handleAdd(e) {
        this.setState({open: false});

        if ((typeof this.state.characterValue !== 'string') || (this.state.characterValue === '')) {
            alert("Failed to add/update/delete farm, please ensure you filled out the form correctly and try again");
        } else {
            if ((typeof this.state.baseSpValue === 'string') && (this.state.baseSpValue === '')) {
                FarmHelper.deleteFarm(this.state.characterValue);
            } else if (typeof this.state.baseSpValue === 'string') {
                FarmHelper.addFarm(this.state.characterValue, parseInt(this.state.baseSpValue));
            } else if (typeof this.state.baseSpValue === 'number') {
                FarmHelper.addFarm(this.state.characterValue, this.state.baseSpValue);
            } else {
                alert("Failed to add/update/delete farm, please ensure you filled out the form correctly and try again");
            }
        }
    };

    render() {
        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onClick={(e) => this.handleCancel(e)}
            />,
            <FlatButton
                label="Add"
                primary={true}
                onClick={(e) => this.handleAdd(e)}
            />,
        ];

        return (
            <div>
                <RaisedButton
                    label="Add Farm"
                    secondary={true}
                    onClick={(e) => this.handleOpen(e)}
                    style={styles.addFarmButton}
                    icon={<FontIcon className="material-icons">add</FontIcon>}
                />

                <Dialog
                    title="Add Character as SP Farm"
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={(e) => this.handleCancel(e)}
                    contentStyle={styles.addFarmDialog}
                >

                    <SelectField
                        floatingLabelText="Character"
                        value={this.state.characterValue}
                        onChange={(e, i, v) => this.handleCharacterChange(e, i, v)}
                    >
                        {Object.values(Character.getAll()).sort((a, b) => b.getTotalSp() - a.getTotalSp()).map(character => {
                            return (<MenuItem key={character.id} value={character.id} primaryText={character.name} />)
                        })}
                    </SelectField>

                    <TextField
                        type="number"
                        value={this.state.baseSpValue}
                        floatingLabelText="Base Character SP"
                        onChange={(e, v) => this.handleBaseSpChange(e, v)}
                    />
                </Dialog>
            </div>
        );
    }
}