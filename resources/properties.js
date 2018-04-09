'use strict';

export default {
    'version': '0.4.1-dev',
    'author_email': 'prometheussatyen@gmail.com',

    'eve_client_id': '537173a2901b47389695c27fbfa6f0b6',
    'eve_client_secret': 'rgGg6pJLl6khr8Dm0OSlFlqVDpi0T4KkQF08g4mI',

    'eve_sso_url': 'https://login.eveonline.com/oauth',
    'scopes': [
        {
            'name': 'esi-location.read_location.v1',
            'description': 'Read Current Location'
        },
        {
            'name': 'esi-location.read_ship_type.v1',
            'description': 'Read Active Ship Type'
        },
        {
            'name': 'esi-location.read_online.v1',
            'description': 'Read Online Status'
        },
        {
            'name': 'esi-skills.read_skills.v1',
            'description': 'Read Skills'
        },
        {
            'name': 'esi-skills.read_skillqueue.v1',
            'description': 'Read Skill Queue'
        },
        {
            'name': 'esi-clones.read_clones.v1',
            'description': 'Read Jump Clones'
        },
        {
            'name': 'esi-clones.read_implants.v1',
            'description': 'Read Active Implants'
        },
        {
            'name': 'esi-wallet.read_character_wallet.v1',
            'description': 'Read Wallet'
        },
        {
            'name': 'esi-mail.read_mail.v1',
            'description': 'Read EVE Mail'
        },
        {
            'name': 'esi-universe.read_structures.v1',
            'description': 'Read Dockable Structure Information'
        },
        {
            'name': 'esi-characters.read_fatigue.v1',
            'description': 'Read Jump Fatigue'
        },
        {
            'name': 'esi-characters.read_loyalty.v1',
            'description': 'Read Loyalty Points'
        },
        {
            'name': 'esi-contracts.read_character_contracts.v1',
            'description': 'Read Contracts'
        },
    ],

    'eve_esi_url': 'https://esi.tech.ccp.is',
    'eve_default_data_source': 'tranquility',

    'refresh_intervals': {
        'character_info': 21600,
        'portrait': 21600,
        'corporation': 21600,
        'alliance': 21600,
        'attributes': 7200,
        'loyalty_points': 7200,
        'wallet': 900,
        'implants': 900,
        'clones': 900,
        'skills': 900,
        'skill_queue': 900,
        'contracts': 300,
        'location': 300,
        'ship': 300,
        'fatigue': 300,
    },
};