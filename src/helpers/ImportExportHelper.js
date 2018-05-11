import appProperties from './../../resources/properties';

const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');
const {clipboard} = require('electron');

const levelMap = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
}


export default class ImportExportHelper {

    static ExportCerebral(filePath, items) {
        if (filePath !== undefined && items !== undefined) {
            const skills = [];
            try {
                items.forEach((item) => {
                    if (item.type === 'skill') {
                        skills.push({ typeId: item.id, level: item.level });
                    }
                });

                const content = JSON.stringify({
                    formatVersion: 1,
                    source: `cerebral/${appProperties.version} ${appProperties.author_email}`,
                    created: Date.now(),
                    skills: [...skills],
                });

                fs.writeFileSync(filePath, content, 'utf8');
            } catch (e) {
                console.log(e);
            }
        }
    }

    static ExportClipboard(items) {
        if (items !== undefined) {
            let clipboardData = '';
            items.forEach((item, index) => {
                if (index <= 50) {
                    if (item.type === 'skill') {
                        clipboardData += `${item.name} ${levelMap[item.level]}\r\n`;
                    }
                }
            });
            clipboard.writeText(clipboardData);
        }
    }

    static ImportCerebral(filePath) {
        const skills = [];
        if (filePath !== undefined) {
            try {
                const content = fs.readFileSync(filePath);
                const plan = JSON.parse(content);
                if (plan !== undefined) {
                    if (plan.version === 1) {
                        plan.skills.forEach((skill) => {
                            skills.push({ typeId: skill.typeId, level: skill.level });
                        });
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
        return skills;
    }

    static ImportEVEMonXML(filePath) {
        const skills = [];
        if (filePath !== undefined) {
            const fileName = path.basename(filePath);
            const parser = new xml2js.Parser({ attrValueProcessors: [xml2js.processors.parseNumbers], preserveChildrenOrder: true });

            try {
                const content = fs.readFileSync(filePath);
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
        }
        return skills;
    }
}
