/**
 * @author Zelenin Alexandr <zeleniy.spb@gmail.com>
 * @public
 * @class
 */
function CurvedDiagram() {
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
        'img/Correct line_diagram 1.2.png'
    ];
    /*
     * Preload images.
     */
    this._preload();
}

/*
 * Inherit Diagram class.
 */
CurvedDiagram.prototype = Object.create(Diagram.prototype);



/**
 * Factory method.
 * @public
 * @static
 * @param {Object} config
 * @returns {CurvedDiagram}
 */
CurvedDiagram.getInstance = function(config) {

    return new CurvedDiagram(config);
};


/**
 * Get answer image URL.
 * @public
 * @override
 * @returns {String}
 */
CurvedDiagram.prototype.getAnswerImage = function() {

    return this._imagesLinks[1];
};


/**
 * Render chart.
 * @public
 * @override
 * @param {String} selection
 * @returns {Diagram}
 */
CurvedDiagram.prototype.renderTo = function(selection) {
    /*
     * Call parent method.
     */
    Diagram.prototype.renderTo.call(this, selection);
    /*
     * Enable painting.
     */
    this.enablePainting();
};