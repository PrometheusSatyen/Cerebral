'use strict';

import React from 'react';
import {Redirect} from 'react-router';

import Character from '../../models/Character';

import Drawer from 'material-ui/Drawer';
import Avatar from 'material-ui/Avatar';
import {List, ListItem, makeSelectable} from 'material-ui/List';

let SelectableList = makeSelectable(List);

export default class LeftNav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            characters: Object.values(Character.getAll()).sort((a, b) => b.getTotalSp() - a.getTotalSp()),
            redirectPath: undefined,
            currentSelect: 1
        };
    }

    componentDidMount() {
        this.subscriberId = Character.subscribe(this);
    }

    componentWillUnmount() {
        Character.unsubscribe(this.subscriberId);
    }

    handleClick(e, characterId) {
        let path;
        let value;
        let input = e.target.innerHTML;
        input = input.replace(/<(?:.|\n)*?>/gm, '');

        switch(input) {
            case 'Contracts':
                path = '/contracts';
                value = 3;
                break;
            case 'SP Farming':
                path = '/sp-farming';
                value = 2;
                break;
            case 'Character Overview':
                path = '/';
                value = 1;
                break;
            default:
                path = '/characters/' + characterId;
                value = characterId;
        }

        this.setState({
            redirectPath: path,
            currentSelect: value
        });
    }

    render() {
        if (this.state.redirectPath !== undefined) {
            this.setState({redirectPath: undefined});

            return <Redirect push to={this.state.redirectPath}/>;
        }

        return (
            <Drawer width={270}>
                <SelectableList value={this.state.currentSelect}>
                    <ListItem value={1} primaryText="Character Overview" onClick={(e) => this.handleClick(e)}/>
                    <ListItem value={2} primaryText="SP Farming" onClick={(e) => this.handleClick(e)}/>
                    <ListItem value={3} primaryText="Contracts" onClick={(e) => this.handleClick(e)}/>

                    <br/>

                    {this.state.characters.map(character => {
                        return (
                            <ListItem
                                value={character.id}
                                key={character.id}
                                primaryText={character.name}
                                leftAvatar={<Avatar src={character.portraits.px128x128}/>}
                                onClick={(e) => this.handleClick(e, character.id)}
                            />
                        )
                    })}
                </SelectableList>
            </Drawer>
        );
    }
}
