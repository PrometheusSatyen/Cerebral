import React from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

const path = require('path');
const { dialog } = require('electron').remote;
const fs = require('fs');
const xml2js = require('xml2js');

const styles = {
    popover: {
        background: '#404040',
    },
};

export default class ImportToPlanPopover extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            anchorEl: undefined,
        };
        this.handleRequestClose = this.handleRequestClose.bind(this);
        this.handleEVEMonXmlImport = this.handleEVEMonXmlImport.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.open !== this.props.open) {
            this.setState({ open: nextProps.open });
        }
        if (nextProps.anchorEl !== this.props.anchorEl) {
            this.setState({ anchorEl: nextProps.anchorEl });
        }
    }

    handleRequestClose() {
        this.setState({
            open: false,
        });
        this.props.onImport(undefined);
    }

    handleEVEMonXmlImport(files) {
        if (files !== undefined) {
            const fileName = path.basename(files[0]);
            const skills = [];

            const parser = new xml2js.Parser({ attrValueProcessors: [xml2js.processors.parseNumbers], preserveChildrenOrder: true });

            try {
                const content = fs.readFileSync(files[0]);
                parser.parseString(content, (err, result) => {
                    if (result !== undefined) {
                        try {
                            result.plan.entry.forEach((element) => {
                                if (element.$.hasOwnProperty('skillID') && element.$.hasOwnProperty('level')) {
                                    skills.push({ typeId: element.$.skillID, level: element.$.level });
                                }
                            });
                        } catch (e) {
                            console.log(e);
                        }
                    }
                });
            } catch (e) {
                console.log(e);
            }

            this.props.onImport(`Import of "${fileName}"`, 'EVEMon XML', skills);
            this.setState({
                open: false,
            });
        }
    }

    handleEVEMonXml() {
        dialog.showOpenDialog({
            properties: [
                'openFile',
            ],
            filters: [
                { name: 'EVEMon Skill Plans', extensions: ['xml'] },
                { name: 'All Files', extensions: ['*'] },
            ] }, this.handleEVEMonXmlImport);
    }

    render() {
        return (
            <Popover style={styles.popover}
                open={this.state.open}
                anchorEl={this.state.anchorEl}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                onRequestClose={this.handleRequestClose}
            >
                <Menu style={styles.menu} menuItemStyle={styles.menuItem} listStyle={styles.listItem}>
                    <MenuItem disabled primaryText="Cerebral Plan" onClick={() => this.handleCerebralJson()} />
                    <MenuItem primaryText="EVEMon Plan" onClick={() => this.handleEVEMonXml()} />
                    <MenuItem disabled primaryText="Fitting" onClick={() => this.handleEVEClipboard()} />
                    <MenuItem disabled primaryText="Clipboard EVE format" onClick={() => this.handleEVEClipboard()} />
                </Menu>
            </Popover>
        );
    }
}
