/**
  * @class KannasoTimeout
  * @extends {Error}
  */
class KannasoTimeout extends Error {
    /**
     * @param time Time limit of the request
     */
    constructor(time) {
        super(`Rest request timed out. Took more than ${Math.round(time / 1000)} seconds to resolve`);
        this.name = 'KannasoTimeout';
    }
}
module.exports = KannasoTimeout;
