'use strict';

import React from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import {FontIcon} from 'material-ui';

import Summary from './Character/Summary';
import Skills from './Character/Skills';
import Contracts from './Character/Contracts';
import Mails from './Character/Mails';
import Api from './Character/Api';

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
            case 'mails':
                component = <Mails characterId={characterId}/>;
                break;
            case 'api':
                component = <Api characterId={characterId}/>;
                break;
            default:
                component = <Summary characterId={characterId}/>;
        }

        return (
            <div style={{width: '100%', overflow: 'hidden'}}>
                <div style={styles.buttonDiv}>
                    <RaisedButton label="Summary"
                                  disabled={this.state.currentPage === 'summary'}
                                  backgroundColor="#616161"
                                  style={styles.button}
                                  icon={<FontIcon className="material-icons">assessment</FontIcon>}
                                  onClick={e => this.switchPage('summary')}/>

                    <RaisedButton label="Skills"
                                  disabled={this.state.currentPage === 'skills'}
                                  backgroundColor="#616161"
                                  style={styles.button}
                                  icon={<FontIcon className="material-icons">library_books</FontIcon>}
                                  onClick={e => this.switchPage('skills')}/>

                    <RaisedButton label="Mails"
                                  disabled={this.state.currentPage === 'mails'}
                                  backgroundColor="#616161"
                                  style={styles.button}
                                  icon={<FontIcon className="material-icons">mail</FontIcon>}
                                  onClick={e => this.switchPage('mails')} />

                    <RaisedButton label="Contracts"
                                  disabled={this.state.currentPage === 'contracts'}
                                  backgroundColor="#616161"
                                  style={styles.button}
                                  icon={<FontIcon className="material-icons">assignment</FontIcon>}
                                  onClick={e => this.switchPage('contracts')} />

                    <RaisedButton label="API"
                                  disabled={this.state.currentPage === 'api'}
                                  backgroundColor="#616161"
                                  style={styles.button}
                                  icon={<FontIcon className="material-icons">file_download</FontIcon>}
                                  onClick={e => this.switchPage('api')} />
                </div>

                {component}
            </div>
        );
    }
}