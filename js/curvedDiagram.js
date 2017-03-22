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
    /**
     * Pointer max x coordinate.
     * @private
     * @member {Number}
     */
    this._endX = 2305;
    /**
     * Pointer max y coordinate.
     * @private
     * @member {Number}
     */
    this._endY = 2005;
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


/**
 * Drag event handler.
 * @protected
 */
CurvedDiagram.prototype._dragEventHandler = function() {
    /*
     * Do nothing if user achieve right or bottom side.
     */
    if (this._imgXScale.invert(d3.event.x) >= this._endX || this._imgYScale.invert(d3.event.y) >= this._endY) {
        return this._isFinished = true;
    }
    /*
     * Update only y coordinate if user try to draw in opposite direction.
     */
    if (this._xMax >= d3.event.x && this._lineData.length) {
        this._lineData[this._lineData.length - 1].y = d3.event.y;
        return this._redrawLine();
    }
    /*
     * Update rightmost position where user was.
     */
    this._xMax = d3.event.x;
    /*
     * Add new point to the line data set.
     */
    this._lineData.push({
        x : d3.event.x,
        y : d3.event.y
    });
    /*
     * Redraw line.
     */
    this._redrawLine();
};