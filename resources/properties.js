'use strict';

export default {
    'version': '0.8.0',
    'author_email': 'prometheussatyen@gmail.com',

    'eve_sso_url': 'https://login.eveonline.com/oauth',
    'eve_sso_url_no_oauth': 'https://login.eveonline.com',

    'eve_sso_v2_url': 'https://login.eveonline.com/v2/oauth',
    'eve_sso_url_v2_no_oauth': 'https://login.eveonline.com/v2',

    'eve_sso_client_id': 'c9fde897cdfb45208fb5254e3ee98d19',

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

    'eve_esi_url': 'https://esi.evetech.net',
    'eve_default_data_source': 'tranquility',

    'refresh_intervals': {
        'character_info': 21600,
        'portrait': 21600,
        'corporation': 21600,
        'alliance': 21600,
        'attributes': 7200,
        'loyalty_points': 3600,
        'wallet': 900,
        'implants': 900,
        'clones': 900,
        'skills': 900,
        'skill_queue': 900,
        'contracts': 300,
        'location': 300,
        'ship': 300,
        'fatigue': 300,
        'mails': 300,
        'maillabels': 900,
        'mailinglists': 900,
    },

    'contract_completed_statuses': [
        'finished_issuer',
        'finished_contractor',
        'finished',
        'cancelled',
        'rejected',
        'failed',
        'deleted',
        'reversed'
    ],

    'cache_policies': {
        'types': {
            'base': 2592000,
            'deviation': 604800,
            'invalid_before': 1524052913,
        },
    }
};