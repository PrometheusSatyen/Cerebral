'use strict';

import React from 'react';
import { Dialog, FlatButton, Slider } from 'material-ui';


const styles = {
    dialog: {
        width: 400,
    },
    row: {
        height: 48,
        margin: 10,
    },
    slider: {
        margin: 10,
        width: 200,
    },
};

export default class RemapDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            attributes: {
                perception: 17,
                memory: 17,
                willpower: 17,
                intelligence: 17,
                charisma: 17,
            },
            implants: 0,
        };

        this.handleImplants = this.handleImplants.bind(this);
        this.handleSlider = this.handleSlider.bind(this);
        this.handleUseSuggested = this.handleUseSuggested.bind(this);
        this.updateSliders = this.updateSliders.bind(this);
    }

    handleClose(e) {
        this.props.onAddRemap(undefined);
    }

    handleAdd(e) {
        this.props.onAddRemap( this.state.attributes, this.state.implants, this.props.editIndex);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.open !== this.props.open) {
            this.setState({ open: nextProps.open });
        }
        if (nextProps.attributes !== undefined && nextProps.attributes !== this.props.attributes) {
            this.setState({ attributes: nextProps.attributes });
        }
        if (nextProps.implants !== undefined && nextProps.implants !== this.props.implants) {
            this.setState({ implants: nextProps.implants });
        }
    }

    updateSliders(e) {
        const currentAttributes = this.state.attributes;
        this.setState({ attributes: currentAttributes });
    }

    handleUseSuggested(e) {
        if (this.props.editIndex !== undefined) {
            this.props.onGetOptimalAttributes(this.props.editIndex, this.state.implants);
        }
    }

    handleSlider(attribute, value) {
        const currentAttributes = this.state.attributes;
        let pool = 14 + (5 * 17);

        if (currentAttributes[attribute] > value) {
            currentAttributes[attribute] = value;
            this.setState({ attributes: currentAttributes });
        } else {
            for (const a in currentAttributes) {
                pool -= currentAttributes[a];
            }
            if (pool > 0) {
                currentAttributes[attribute] = pool + currentAttributes[attribute] <= value ? pool + currentAttributes[attribute] : value;
                this.setState({ attributes: currentAttributes });
            } else {
                this.setState({ attributes: currentAttributes });
            }
        }
    }

    handleImplants(value) {
        const implants = value;
        this.setState({ implants });
    }

    render() {
        const actions = [
            <div>
                {
                    this.props.editIndex !== undefined ?
                        <FlatButton
                            label="Use optimal"
                            primary={true}
                            onClick={e => this.handleUseSuggested(e)}
                        />
                        : ''
                }
                <FlatButton
                    label="Save"
                    primary={true}
                    onClick={e => this.handleAdd(e)}
                />

                <FlatButton
                    label="Cancel"
                    primary={true}
                    onClick={e => this.handleClose(e)}
                />
            </div>,
        ];

        return (
            <Dialog
                title={'Remap'}
                actions={actions}
                modal={false}
                open={this.state.open}
                onRequestClose={(e) => this.handleClose(e)}
                contentStyle={styles.dialog}
            >
                <table>
                    <tbody>
                        <tr style={styles.row}>
                            <td>
                                <span>Perception</span>
                            </td>
                            <td>
                                <Slider
                                    name={'Perception'}
                                    style={styles.slider}
                                    sliderStyle={styles.slider}
                                    axis="x"
                                    step={1}
                                    min={17}
                                    max={27}
                                    onDragStop={(e) => this.updateSliders(e)}
                                    onChange={(e, value) => this.handleSlider('perception', value)}
                                    value={this.state.attributes.perception}
                                />
                            </td>
                            <td>
                                <span>{this.state.attributes.perception}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span>Memory</span>
                            </td>
                            <td>
                                <Slider
                                    name={'memory'}
                                    style={styles.slider}
                                    sliderStyle={styles.slider}
                                    axis="x"
                                    step={1}
                                    min={17}
                                    max={27}
                                    onDragStop={(e) => this.updateSliders(e)}
                                    onChange={(e, value) => this.handleSlider('memory', value)}
                                    value={this.state.attributes.memory}
                                />
                            </td>
                            <td>
                                <span>{this.state.attributes.memory}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span>Willpower</span>
                            </td>
                            <td>
                                <Slider
                                    name={'willpower'}
                                    style={styles.slider}
                                    sliderStyle={styles.slider}
                                    axis="x"
                                    step={1}
                                    min={17}
                                    max={27}
                                    onDragStop={(e) => this.updateSliders(e)}
                                    onChange={(e, value) => this.handleSlider('willpower', value)}
                                    value={this.state.attributes.willpower}
                                />
                            </td>
                            <td>
                                <span>{this.state.attributes.willpower}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span>Intelligence</span>
                            </td>
                            <td>
                                <Slider
                                    name={'intelligence'}
                                    style={styles.slider}
                                    sliderStyle={styles.slider}
                                    axis="x"
                                    step={1}
                                    min={17}
                                    max={27}
                                    onDragStop={(e) => this.updateSliders(e)}
                                    onChange={(e, value) => this.handleSlider('intelligence', value)}
                                    value={this.state.attributes.intelligence}
                                />
                            </td>
                            <td>
                                <span>{this.state.attributes.intelligence}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span>Charisma</span>
                            </td>
                            <td>
                                <Slider
                                    name={'charisma'}
                                    style={styles.slider}
                                    sliderStyle={styles.slider}
                                    axis="x"
                                    step={1}
                                    min={17}
                                    max={27}
                                    onDragStop={(e) => this.updateSliders(e)}
                                    onChange={(e, value) => this.handleSlider('charisma', value)}
                                    value={this.state.attributes.charisma}
                                />
                            </td>
                            <td>
                                <span>{this.state.attributes.charisma}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span>Implants</span>
                            </td>
                            <td>
                                <Slider
                                    name={'charisma'}
                                    style={styles.slider}
                                    sliderStyle={styles.slider}
                                    axis="x"
                                    step={1}
                                    min={0}
                                    max={5}
                                    onDragStop={(e) => this.updateSliders(e)}
                                    onChange={(e, value) => this.handleImplants(value)}
                                    value={this.state.implants}
                                />
                            </td>
                            <td>
                                <span>{`+${this.state.implants}`}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Dialog>
        );
    }
}
