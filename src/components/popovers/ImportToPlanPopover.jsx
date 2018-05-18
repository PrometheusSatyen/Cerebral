import React from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import ImportExportHelper from '../../helpers/ImportExportHelper';

const path = require('path');
const { dialog } = require('electron').remote;

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
        this.handleCerebralJsonImport = this.handleCerebralJsonImport.bind(this);
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

    handleCerebralJsonImport(files) {
        if (files !== undefined) {
            const fileName = path.basename(files[0]);
            const skills = ImportExportHelper.ImportCerebral(files[0]);
            this.props.onImport(`Import of "${fileName}"`, 'Cerebral JSON', skills);
            this.setState({
                open: false,
            });
        }
    }

    handleEVEMonXmlImport(files) {
        if (files !== undefined) {
            const fileName = path.basename(files[0]);
            const skills = ImportExportHelper.ImportEVEMonXML(files[0]);
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

    handleCerebralJson() {
        dialog.showOpenDialog({
            properties: [
                'openFile',
            ],
            filters: [
                { name: 'Cerebral Skill Plans', extensions: ['cerebral_plan'] },
                { name: 'All Files', extensions: ['*'] },
            ] }, this.handleCerebralJsonImport);
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
                    <MenuItem primaryText="Cerebral Plan" onClick={() => this.handleCerebralJson()} />
                    <MenuItem primaryText="EVEMon Plan" onClick={() => this.handleEVEMonXml()} />
                    <MenuItem disabled primaryText="Fitting" onClick={() => this.handleEVEClipboard()} />
                    <MenuItem disabled primaryText="Clipboard EVE format" onClick={() => this.handleEVEClipboard()} />
                </Menu>
            </Popover>
        );
    }
}
