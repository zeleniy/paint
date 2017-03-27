/**
 * @author Zelenin Alexandr <zeleniy.spb@gmail.com>
 * @public
 * @class
 */
function StandardDiagram() {
    /*
     * Call parent class constructor.
     */
    Diagram.call(this);
    /**
     * Images urls.
     * @private
     * @member {String}
     */
    this._imagesLinks = [
        'img2/Diagram 1_no line.png',
        'img/Correct line_diagram 1.1.png'
    ];
    /*
     * Preload images.
     */
    this._preload();
}

/*
 * Inherit Diagram class.
 */
StandardDiagram.prototype = Object.create(Diagram.prototype);



/**
 * Factory method.
 * @public
 * @static
 * @param {Object} config
 * @returns {StandardDiagram}
 */
StandardDiagram.getInstance = function(config) {

    return new StandardDiagram(config);
};


/**
 * Get answer image URL.
 * @public
 * @override
 * @returns {String}
 */
StandardDiagram.prototype.getAnswerImage = function() {

    return this._imagesLinks[1];
};


/**
 * Render chart.
 * @public
 * @override
 * @param {String} selection
 * @returns {Diagram}
 */
StandardDiagram.prototype.renderTo = function(selection) {
    /*
     * Call parent method.
     */
    Diagram.prototype.renderTo.call(this, selection);
    /*
     * Enable painting.
     */
    this.enablePainting();
};