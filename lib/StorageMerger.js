"use strict";

/**
 * static class, that helps with merging
 * KStorages (e.g. joining two KTables)
 */
class StorageMerger {

    /**
     * merges the content of multiple storages
     * if keys have the same name, the later storage
     * will overwrite the value
     * @param storages
     * @returns {Promise.<{State}>}
     */
    static mergeIntoState(storages){
        return Promise.all(storages
            .map(storage => storage.getState()))
            .then(states => {

                const newState = {};

                states.forEach(state => {
                    Object.keys(state).forEach(key => {
                        newState[key] = state[key];
                    });
                });

                return newState;
            });
    }

}

module.exports = StorageMerger;
