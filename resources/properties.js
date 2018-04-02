'use strict';

module.exports = {
    'eve_client_id': '537173a2901b47389695c27fbfa6f0b6',
    'eve_client_secret': 'rgGg6pJLl6khr8Dm0OSlFlqVDpi0T4KkQF08g4mI',

    'eve_sso_url': 'https://login.eveonline.com/oauth',
    'scopes': [
        {
            'name': 'esi-location.read_location.v1',
            'description': 'Location'
        },
        {
            'name': 'esi-location.read_ship_type.v1',
            'description': 'Active Ship Type'
        },
        {
            'name': 'esi-location.read_online.v1',
            'description': 'Online Status'
        },
        {
            'name': 'esi-skills.read_skills.v1',
            'description': 'Skills'
        },
        {
            'name': 'esi-skills.read_skillqueue.v1',
            'description': 'Skill Queue'
        },
        {
            'name': 'esi-clones.read_clones.v1',
            'description': 'Jump Clones'
        },
        {
            'name': 'esi-clones.read_implants.v1',
            'description': 'Active Implants'
        },
        {
            'name': 'esi-wallet.read_character_wallet.v1',
            'description': 'Wallet'
        },
        {
            'name': 'esi-mail.read_mail.v1',
            'description': 'EVE Mail'
        },
        {
            'name': 'esi-universe.read_structures.v1',
            'description': 'Dockable Structure Information'
        },
    ],

    'eve_esi_url': 'https://esi.tech.ccp.is',
    'eve_default_data_source': 'tranquility',

    'refresh_intervals': {
        'character_info': 43200,
        'portrait': 43200,
        'corporation': 43200,
        'alliance': 43200,
        'skills': 900,
        'skill_queue': 900,
        'attributes': 3600,
        'wallet': 900,
        'implants': 900,
        'clones': 900
    }
};