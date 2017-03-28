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
 * @returns {StandardDiagram}
 */
StandardDiagram.getInstance = function() {

    return new StandardDiagram();
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
     * Populate chart with data.
     */
    this._update(true);
    /*
     * Enable painting.
     */
    this.enablePainting();
};