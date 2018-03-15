'use strict';

import FarmCharacter from '../models/FarmCharacter';

export default class FarmHelper {
    static addFarm(id, baseSp) {
        if (baseSp < 5000000) {
            baseSp = 5000000;
        }

        let character = new FarmCharacter(id, baseSp);
        character.save();
    }

    static deleteFarm(id) {
        FarmCharacter.delete(id);
    }
}