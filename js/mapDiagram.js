/**
 * @author Zelenin Alexandr <zeleniy.spb@gmail.com>
 * @public
 * @class
 * @param {String[]} imagesLinks - list of images URL's.
 * @param {Number[][]} points - list of points coordinates.
 */
function MapDiagram(imagesLinks, points) {
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
    this._pointsData = points;
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
 * @param {Integer[][]} points - list of points coordinates.
 */
MapDiagram.getInstance = function(imagesLinks, points) {

    return new MapDiagram(imagesLinks, points);
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
        return this.showButton();
    }
    /*
     * Check target achieved.
     */
    if (this._isTargetAchieved(sourcePoint)) {
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
 * @param {SVGElement} sourcePoint
 * @returns {Boolean}
 */
MapDiagram.prototype._isTargetAchieved = function(sourcePoint) {
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
     * Get opposite/target point data/coordinates.
     */
    var targetData = this._getTargetPoint(sourcePoint).data()[0];
    /*
     * Extract coordinates in separate variables.
     */
    var targetX = targetData[0];
    var targetY = targetData[1];
    /*
     * Check mouse pointer within target point.
     */
    return pointerX < targetX + radius && pointerX > targetX - radius &&
        pointerY < targetY + radius && pointerY > targetY - radius;
};


/**
 * Get target point.
 * Because user can start to draw from any point we should find opposite one.
 * @param {SVGElement} sourcePoint
 * @returns {d3.selection}
 */
MapDiagram.prototype._getTargetPoint = function(sourcePoint) {
    /*
     * Get source point data/coordinates.
     */
    sourcePointData = d3.select(sourcePoint).data();
    /*
     * Compare source point coordinates with first point from the list.
     */
    if (sourcePointData[0][0] == this._pointsData[0][0] && sourcePointData[0][1] == this._pointsData[0][1]) {
        return this._points[1];
    } else {
        return this._points[0];
    }
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
     * Populate chart with data.
     */
    this._update(true);
    /*
     * Enable painting.
     */
    this.enablePainting();
};