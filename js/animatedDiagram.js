/**
 * @author Zelenin Alexandr <zeleniy.spb@gmail.com>
 * @public
 * @class
 */
function AnimatedDiagram() {
    /*
     * Call parent class constructor.
     */
    Diagram.call(this);
    /**
     * Pointer max x coordinate.
     * @private
     * @member {Number}
     */
    this._endX = 2990;
    /**
     * Images array current index.
     * @private
     * @member {Integer}
     */
    this._index = 0;
    /**
     * Scrolling/animation step.
     * @private
     * @member {Integer}
     */
    this._step = 80;
    this._axisHeightCoef = 0.8;
    this._surfaceSize = 40;
    /**
     * Virtual y offset.
     * @private
     * @member {Integer}
     */
    this._yOffset = 0;
    /**
     * Required images amount.
     * @protected
     * @member {Integer}
     */
    this._requiredImagesAmount = 3;
    /**
     *
     */
    this._sliderScale = d3.scaleLinear()
        .domain([200, 800])
        .range([2, 8])
        .clamp(true);
    /**
     *
     */
     this._fontScale = d3.scaleLinear()
         .domain([200, 800])
         .range([8, 14])
         .clamp(true);
    /*
     * Preload images.
     */
    this._preload();
}

/*
 * Inherit Diagram class.
 */
AnimatedDiagram.prototype = Object.create(Diagram.prototype);


/**
 * Factory method.
 * @public
 * @static
 * @returns {AnimatedDiagram}
 */
AnimatedDiagram.getInstance = function() {

    return new AnimatedDiagram();
};


/**
 * Get answer image URL.
 * @public
 * @override
 * @returns {String}
 */
AnimatedDiagram.prototype.getAnswerImage = function() {

    return this._imagesLinks[4];
};


AnimatedDiagram.prototype._update = function() {
    /*
     * Call parent method.
     */
    Diagram.prototype._update.call(this);

    const tickProtrusion = 5;
    const axisHeight = this._height * this._axisHeightCoef;
    const handleHeight = axisHeight * 0.08;
    const axisWidth = this._sliderScale(this._width);

    this._scrollText
        .attr('x', this._width - axisWidth)
        .attr('y', this._height - axisWidth)
        .style('font-size', this._fontScale(this._width) + 'px');

    const axisOffset = this._scrollText.node().getBoundingClientRect().width / 2 + axisWidth;

    this._axis
        .attr('x', this._width - axisOffset)
        .attr('y', (this._height - axisHeight) / 2)
        .attr('width', axisWidth)
        .attr('height', axisHeight);
    this._axisTicks
        .attr('x1', this._width - axisOffset - tickProtrusion)
        .attr('y1', (d, i) => ((this._height - axisHeight) / 2) + axisHeight / 3 * i)
        .attr('x2', this._width - axisOffset + axisWidth + tickProtrusion)
        .attr('y2', (d, i) => ((this._height - axisHeight) / 2) + axisHeight / 3 * i);

    const handleProtrusion = 2;
    const y = this._getHandlePosition();

    this._axisHandle
        .attr('x', this._width - axisOffset - handleProtrusion)
        .attr('y', y)
        .attr('width', axisWidth + handleProtrusion * 2)
        .attr('height', handleHeight);
    this._axisHandleSurface
        .attr('x', this._width - axisOffset - this._surfaceSize / 2 + axisWidth / 2)
        .attr('y', y - (this._surfaceSize - handleHeight) / 2)
        .attr('width', this._surfaceSize)
        .attr('height', this._surfaceSize)
        .call(d3.drag()
            .subject(function(d, i, nodes) {
                var handleRect = d3.select(nodes[0]);
                return {
                    x: handleRect.attr('x'),
                    y: handleRect.attr('y')
                };
            })
            .on('drag', function() {
               this._handleDragEventHandler()
            }.bind(this))
            .on('end', function() {
               this._handleDragEndEventHandler()
            }.bind(this))
        );
};


AnimatedDiagram.prototype._handleDragEventHandler = function() {

    const y = Math.max(Math.min(d3.event.y, this._getHandlePosition(0)), this._getHandlePosition(3));

    if (y > this._y) {
        return;
    }

    this._y = y;

    const axisHeight = this._height * this._axisHeightCoef;
    const handleHeight = axisHeight * 0.08;

    this._axisHandle.attr('y', y);
    this._axisHandleSurface.attr('y', y - (this._surfaceSize - handleHeight) / 2);

    var index = d3.range(0, 3).filter(function(d, i) {
        return y >= this._getHandlePosition(d + 1) && y <= this._getHandlePosition(d);
    }, this)[0];

    var interval = [this._getHandlePosition(index), this._getHandlePosition(index + 1)];

    var min = interval[1];
    var max = interval[0];
    var middle = min + (max - min) / 2;

    if (y > min) {
        // this._axisHandle.attr('y', max);
        // this._axisHandleSurface.attr('y', max - (this._surfaceSize - handleHeight) / 2);
    } else {
        // this._axisHandle.attr('y', min);
        // this._axisHandleSurface.attr('y', min - (this._surfaceSize - handleHeight) / 2);
        index ++;
    }
    /*
     * Update global index.
     */
    this._index = index;
    /*
     * Update background image.
     */
    this._images[0].attr('xlink:href', this._imagesLinks[index]);
}


AnimatedDiagram.prototype._handleDragEndEventHandler = function() {

    var y = Math.max(Math.min(d3.event.y, this._getHandlePosition(0)), this._getHandlePosition(3));

    if (y < this._y) {
        y = this._y;
    }

    var index = d3.range(0, 3).filter(function(d, i) {
        return y >= this._getHandlePosition(d + 1) && y <= this._getHandlePosition(d);
    }, this)[0];

    if (index <= this._index) {
        index = this._index;
    }

    var interval = [this._getHandlePosition(index), this._getHandlePosition(index + 1)];

    var min = interval[1];
    var max = interval[0];
    var middle = min + (max - min) / 2;

    const axisHeight = this._height * this._axisHeightCoef;
    const handleHeight = axisHeight * 0.08;

    if (y > middle) {
        this._axisHandle.attr('y', max);
        this._axisHandleSurface.attr('y', max - (this._surfaceSize - handleHeight) / 2);
    } else {
        this._axisHandle.attr('y', min);
        this._axisHandleSurface.attr('y', min - (this._surfaceSize - handleHeight) / 2);
        index ++;
    }
    /*
     * Update global index.
     */
    this._index = index;
    /*
     * Update background image.
     */
    this._images[0].attr('xlink:href', this._imagesLinks[index]);

    if (index == this._imagesLinks.length - 3) {
        /*
         * Gradually show original image.
         */
        this._images[2]
            .style('opacity', 0)
            .attr('xlink:href', this._imagesLinks[5])
            .transition()
            .duration(1500)
            .style('opacity', 1);
        /*
         * Enable painting.
         */
        this.enablePainting();
        /*
         * Show points.
         */
        this._startPoint.classed('start-point', true);
        this._blinkPoint.classed('blink-point', true);
    } else {
        this._images[2].style('opacity', 0);
        this.disablePainting();
    }
}


/**
 * Get handle Y position based on animation frame number.
 * @public
 * @param {Integer} [index]
 * @returns {Number}
 */
AnimatedDiagram.prototype._getHandlePosition = function(index) {

    if (index == undefined) {
        index = this._index;
    }

    const axisHeight = this._height * this._axisHeightCoef;
    const handleHeight = axisHeight * 0.08;
    const top = (this._height - axisHeight) / 2 - handleHeight / 2;

    return top + (axisHeight / 3 * (3 - index));
}


/**
 * Render chart.
 * @public
 * @override
 * @param {String} selection
 * @returns {Diagram}
 */
AnimatedDiagram.prototype.renderTo = function(selection) {
    /*
     * Call parent method.
     */
    Diagram.prototype.renderTo.call(this, selection);
    /*
     * Hide points.
     */
    this._startPoint.classed('start-point', false);
    this._blinkPoint.classed('blink-point', false);
    /*
     * Render scroll.
     */
    this._scrollContainer = this._svg
        .append('g')
        .attr('class', 'scroll-container')
        .style('opacity', 1);
    this._axis = this._scrollContainer
        .append('rect')
        .attr('class', 'scroll-axis');
    this._axisTicks = this._scrollContainer
        .selectAll('line')
        .data(d3.range(0, 4))
        .enter()
        .append('line')
        .attr('class', 'scroll-axis-tick');
    this._axisHandleSurface = this._scrollContainer
        .append('rect')
        .attr('class', 'scroll-axis-handle-surface')
        .style('opacity', 0);
    this._axisHandle = this._scrollContainer
        .append('rect')
        .attr('class', 'scroll-axis-handle')
        .attr('rx', 2);
    this._scrollText = this._scrollContainer
        .append('text')
        .attr('class', 'scroll-text')
        .text('Dra først spaken opp og bøy tidrom');
    /*
     * Populate chart with data.
     */
    this._update();
};
