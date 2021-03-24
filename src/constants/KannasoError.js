/**
  * @class KannasoError
  * @extends {Error}
  */
class KannasoError extends Error {
    /**
     * @param message The error message
     */
    constructor(message) {
        super(message);
        this.name = 'KannasoError';
    }
}
module.exports = KannasoError;
