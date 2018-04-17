'use strict';

import React from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import {FontIcon} from 'material-ui';

import Summary from './Character/Summary';
import Skills from './Character/Skills';
import Contracts from './Character/Contracts';

const styles = {
    button: {
        marginLeft: 10,
        marginTop: 10,
        fontWeight: 'bold',
    },
    buttonDiv: {
        marginLeft: 10,
        marginTop: 10
    }
};

export default class Character extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: 'summary'
        }
    }

    switchPage(newPage) {
        this.setState({
            currentPage: newPage
        });
    }

    render() {
        const characterId = this.props.match.params.characterId;

        let component;
        switch(this.state.currentPage) {
            case 'skills':
                component = <Skills characterId={characterId}/>;
                break;
            case 'contracts':
                component = <Contracts characterId={characterId}/>;
                break;
            default:
                component = <Summary characterId={characterId}/>;
        }

        return (
            <div style={{width: '100%', overflow: 'hidden'}}>
                <div style={styles.buttonDiv}>
                    <RaisedButton label="Summary"
                                  backgroundColor="#616161"
                                  style={styles.button}
                                  icon={<FontIcon className="material-icons">assessment</FontIcon>}
                                  onClick={e => this.switchPage('summary')}/>

                    <RaisedButton label="Skills"
                                  backgroundColor="#616161"
                                  style={styles.button}
                                  icon={<FontIcon className="material-icons">library_books</FontIcon>}
                                  onClick={e => this.switchPage('skills')}/>

                    <RaisedButton label="Contracts"
                                  backgroundColor="#616161"
                                  style={styles.button}
                                  icon={<FontIcon className="material-icons">assignment</FontIcon>}
                                  onClick={e => this.switchPage('contracts')} />
                </div>

                {component}
            </div>
        );
    }
}