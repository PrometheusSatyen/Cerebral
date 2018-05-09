import React from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

const styles = {
    divItem: {
        all: 'initial',
        height: 20,
        minHeight: 20,
        lineHeight: 'none',
        padding: 0,
        fontSize: '16px',
        color: '#FFFFFF',
        fontFamily: 'Roboto, sans-serif',
    },
    menuItem: {
        height: 20,
        minHeight: 20,
        paddingLeft: 8,
    },
    listItem: {
        height: 22,
        minHeight: 22,
    },
    menu: {
        minHeight: 20,
    },
    popover: {
        background: '#404040',
    },
}

export default class PlanSkillToLevelPopover extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            anchorEl: undefined,
            minLevel: this.props.minLevel,
        };
        this.handleRequestClose = this.handleRequestClose.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.open !== this.props.open) {
            this.setState({ open: nextProps.open });
        }
        if (nextProps.anchorEl !== this.props.anchorEl) {
            this.setState({ anchorEl: nextProps.anchorEl });
        }
        if (nextProps.minLevel !== this.props.minLevel) {
            this.setState({ minLevel: nextProps.minLevel });
        }
    }

    handleRequestClose(level, pre) {
        this.setState({
            open: false,
        });
        this.props.onLevelSelected(level, pre);
    }

    render() {
        return (
            <Popover style={styles.popover}
                open={this.state.open}
                anchorEl={this.state.anchorEl}
                anchorOrigin={{ horizontal: 'middle', vertical: 'center' }}
                targetOrigin={{ horizontal: 'left', vertical: 'center' }}
                onRequestClose={this.handleRequestClose}
            >
                <Menu style={styles.menu} menuItemStyle={styles.menuItem} listStyle={styles.listItem}>
                    <MenuItem primaryText="Level 1" innerDivStyle={styles.divItem} onClick={() => this.handleRequestClose(1, 0)} />
                    <MenuItem primaryText="Level 2" innerDivStyle={styles.divItem} onClick={() => this.handleRequestClose(2, 0)} />
                    <MenuItem primaryText="Level 3" innerDivStyle={styles.divItem} onClick={() => this.handleRequestClose(3, 0)} />
                    <MenuItem primaryText="Level 4" innerDivStyle={styles.divItem} onClick={() => this.handleRequestClose(4, 0)} />
                    <MenuItem primaryText="Level 5" innerDivStyle={styles.divItem} onClick={() => this.handleRequestClose(5, 0)} />
                    <MenuItem primaryText="Prereqs 3" innerDivStyle={styles.divItem} onClick={() => this.handleRequestClose(0, 3)} />
                    <MenuItem primaryText="Prereqs 4" innerDivStyle={styles.divItem} onClick={() => this.handleRequestClose(0, 4)} />
                    <MenuItem primaryText="Prereqs 5" innerDivStyle={styles.divItem} onClick={() => this.handleRequestClose(0, 5)} />
                </Menu>
            </Popover>
        );
    }
}
