'use strict';

import SanitizeHtml from 'sanitize-html';
import Store from 'electron-store';


let mailbodies = undefined;
const mailbobdies = new Store({
    name: 'mailbodies-store',
});
let mailbodyLastUsed = 0;
let thingsSaveTimeout;

export default class MailBodyHelper {
    static async retrieveMailBody(id, client, clientCharacterId) { // an authenticated client needs to be passed
        clientCharacterId = clientCharacterId.toString();

        MailBodyHelper.require();

        if (
            (!mailbodies.hasOwnProperty(id)) || // if the mail body isn't cached
            (
                (mailbodies[id].hasOwnProperty('failed')) && // or the mail body is cached as FAILED
                (
                    (!mailbodies[id].characterIdsAttempted.includes(clientCharacterId)) || // and a pull hasn't been attempted with this character
                    (false) // or a pull hasn't been attempted with this character in > 30 days (TODO!)
                )
            )
        ) {
            try {
                mailbodies[id] = await client.get('characters/' + clientCharacterId + '/mail/' + id, 'v1','esi-mail.read_mail.v1');

                // remove all html tags except a and br
                let mailBody = SanitizeHtml(mailbodies[id].body, {
                    allowedTags: ['a', 'br'],
                    allowedAttributes: {
                        a: ['href'],
                      },
                });

                // replace common froms of br with newlines
                mailBody = mailBody.replace(/<br>/g, '\n');
                mailBody = mailBody.replace(/<br\/>/g, '\n');
                mailBody = mailBody.replace(/<br \/>/g, '\n');

                mailbodies[id].links = [];

                // extract links and replace a tags with text
                mailBody = mailBody.replace(/<a href="(https?:.+)">(.+)<\/a>/g, (m, m1, m2) => {
                        mailbodies[id].links.push(m1);
                        return `${m2} { ${mailbodies[id].links.length} } `;
                    });
                // clear empty a tags, leftover from showinfo links
                mailBody = mailBody.replace(/<a>/g, '');
                mailBody = mailBody.replace(/<\/a>/g, '');

                // extract non-hyperlinked links, skip the ones we already gutted
                mailBody = mailBody.replace(/(https?:\S+)\s+[^{]+/g, (m, m1) => {
                    mailbodies[id].links.push(m1);
                    return `${m1} { ${mailbodies[id].links.length} } `;
                });

                // cleanup of escaped chars commonly found in evemails
                mailBody = mailBody.replace(/&amp;/g, '&');
                mailBody = mailBody.replace(/&lt;/g, '<');
                mailBody = mailBody.replace(/&gt;/g, '>');
                mailBody = mailBody.replace(/&quot;/g, '"');

                mailbodies[id].body = mailBody;

            } catch (err) {
                if (err.statusCode === 403) {
                    if (!mailbodies.hasOwnProperty(id)) {
                        mailbodies[id] = {};
                    }
                    if (!mailbodies[id].hasOwnProperty('characterIdsAttempted')) {
                        mailbodies[id].characterIdsAttempted = [];
                    }

                    mailbodies[id].failed = true;
                    mailbodies[id].characterIdsAttempted.push(clientCharacterId);
                }
            }

            MailBodyHelper.save();
        }

        mailbodies[id].last_accessed = new Date();
        return (!mailbodies[id].hasOwnProperty('failed')) ? mailbodies[id] : undefined;
    }

    static doMaintenance() {
        if ((mailbodies !== undefined) && (mailbodyLastUsed + 10000 < new Date().getTime())) {
            for (const mail in mailbodies) {
                if (new Date(mailbodies[mail].last_accessed).value + 1000 * 60 * 60 * 24 * 7 >= new Date()) {
                    mailbodies.delete(mail);
                }
            }
            MailBodyHelper.saveImmediately();
            mailbodies = undefined;
        }
    }

    static require() {
        mailbodyLastUsed = new Date().getTime();

        if (mailbodies === undefined) {
            mailbodies = mailbobdies.get('mailbodies-store');
            if (mailbodies === undefined) {
                mailbodies = {};
            }

            for (const mailId in mailbodies) {
                if (mailbodies.hasOwnProperty(mailId)) {
                    if (mailbodies[mailId].hasOwnProperty('characterIdsAttempted')) {
                        mailbodies[mailId].characterIdsAttempted = mailbodies[mailId].characterIdsAttempted.map(
                            i => i.toString());
                    }
                }
            }
        }
    }

    static save() {
        if (mailbodies !== undefined) {
            if (thingsSaveTimeout !== undefined) {
                clearTimeout(thingsSaveTimeout);
            }

            thingsSaveTimeout = setTimeout(() => {
                mailbobdies.set('mailbodies-store', mailbodies);
            }, 10000);
        }
    }

    static saveImmediately() {
        if (mailbodies !== undefined) {
            if (thingsSaveTimeout !== undefined) {
                clearTimeout(thingsSaveTimeout);
            }

            mailbobdies.set('mailbodies-store', mailbodies);
        }
    }

    static removeCharacterIdFromAttemptedLists(characterId) {
        characterId = characterId.toString();

        MailBodyHelper.require();

        for (const mailId in mailbodies) {
            if (mailbodies.hasOwnProperty(mailId)) {
                if (mailbodies[mailId].hasOwnProperty('characterIdsAttempted')) {
                    const i = mailbodies[mailId].characterIdsAttempted.indexOf(characterId);
                    if (i !== -1) {
                        mailbodies[mailId].characterIdsAttempted.splice(i, 1);
                    }
                }
            }
        }

        MailBodyHelper.save();
    }
}

setInterval(MailBodyHelper.doMaintenance, 5000);