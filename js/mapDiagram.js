/**
 * @author Zelenin Alexandr <zeleniy.spb@gmail.com>
 * @public
 * @class
 * @param {String[]} imagesLinks - list of images URL's.
 * @param {Number[]} sourcePoint - source point.
 * @param {Number[]} targetPoint - target point.
 */
function MapDiagram(imagesLinks, sourcePoint, targetPoint) {
    /**
     * Images urls.
     * @private
     * @member {String}
     */
    this._imagesLinks = imagesLinks;
    /*
     * Call parent class constructor.
     */
    Diagram.call(this);
    /**
     * Image data.
     * @protected
     * @member {Object}
     */
    this._imageData = {
        width: 4001,
        height: 2251
    };
    /**
     * Points data.
     * @private
     * @member {Number[][]}
     */
    this._startPointData = sourcePoint;
    /**
     * Target point.
     * @private
     * @member {Number[]}
     */
    this._targetPoint = targetPoint;
    /*
     * Preload images.
     */
    this._preload();
}


/*
 * Inherit Diagram class.
 */
MapDiagram.prototype = Object.create(Diagram.prototype);


/**
 * Factory method.
 * @public
 * @static
 * @returns {MapDiagram}
 * @param {String[]} imagesLinks - list of images URL's.
 * @param {Number[]} sourcePoint - source point.
 * @param {Number[]} targetPoint - target point.
 */
MapDiagram.getInstance = function(imagesLinks, sourcePoint, targetPoint) {

    return new MapDiagram(imagesLinks, sourcePoint, targetPoint);
};


/**
 * Get answer image URL.
 * @public
 * @override
 * @returns {String}
 */
MapDiagram.prototype.getAnswerImage = function() {

    return this._imagesLinks[1];
};


/**
 * Drag event handler.
 * @protected
 * @param {SVGElement} sourcePoint
 */
MapDiagram.prototype._dragEventHandler = function(sourcePoint) {
    /*
     * Show button and quite if target achieved.
     */
    if (this._isFinished === true) {
        return this.showAnswerButton();
    }
    /*
     * Check target achieved.
     */
    if (this._isTargetAchieved()) {
        this._isFinished = true;
    }
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


/**
 * Is target achieved?
 * Method checks if user achieve final pointer position.
 * @private
 * @returns {Boolean}
 */
MapDiagram.prototype._isTargetAchieved = function() {
    /*
     * Get scailed pointer radius.
     */
    var radius = this._imgXScale.invert(this._pointRadius);
    /*
     * Get mouse pointer position.
     */
    var pointerX = this._imgXScale.invert(d3.event.x);
    var pointerY = this._imgYScale.invert(d3.event.y);
    /*
     * Extract coordinates in separate variables.
     */
    var targetX = this._targetPoint[0];
    var targetY = this._targetPoint[1];
    /*
     * Check mouse pointer within target point.
     */
    return pointerX < targetX + radius && pointerX > targetX - radius &&
        pointerY < targetY + radius && pointerY > targetY - radius;
};


/**
 * Update chart.
 * @protected
 */
MapDiagram.prototype._update = function() {
    /*
     * Call parent method.
     */
    Diagram.prototype._update.call(this);
    /*
     * Update copyright text position.
     */
    this._copyright.attr('x', this._width - 10)
        .attr('y', this._height - 10);
};


/**
 * Render chart.
 * @public
 * @override
 * @param {String} selection
 * @returns {Diagram}
 */
MapDiagram.prototype.renderTo = function(selection) {
    /*
     * Call parent method.
     */
    Diagram.prototype.renderTo.call(this, selection);
    /*
     * Append copyright.
     */
    this._copyright = this._svg.append('text')
        .attr('class', 'copyright')
        .text('By Strebe (Own work) [CC BY-SA 3.0], via Wikimedia Commons');
    /*
     * Populate chart with data.
     */
    this._update();
    /*
     * Enable painting.
     */
    this.enablePainting();
};
