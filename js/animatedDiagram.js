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
    // this._frameNumber = 0;
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
    /*
     *
     */
    this._sliderScale = d3.scaleLinear()
        .domain([200, 800])
        .range([2, 8])
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
    const handleProtrusion = 2;
    const axisHeight = this._height * 0.85;
    const handleHeight = axisHeight * 0.08;

    this._axis
        .attr('x', this._width - 50)
        .attr('y', (this._height - axisHeight) / 2)
        .attr('width', this._sliderScale(this._width))
        .attr('height', axisHeight);
    this._axisTicks
        .attr('x1', this._width - 50 - tickProtrusion)
        .attr('y1', (d, i) => ((this._height - axisHeight) / 2) + axisHeight / 3 * i)
        .attr('x2', this._width - 50 + this._sliderScale(this._width) + tickProtrusion)
        .attr('y2', (d, i) => ((this._height - axisHeight) / 2) + axisHeight / 3 * i);
    this._axisHandle
        .attr('x', this._width - 50 - handleProtrusion)
        .attr('y', this._getHandlePosition())
        .attr('width', this._sliderScale(this._width) + handleProtrusion * 2)
        .attr('height', handleHeight);
    this._axisHandleSurface
        .attr('x', this._width - 50 - handleHeight / 2 + this._sliderScale(this._width) / 2)
        .attr('y', this._getHandlePosition())
        .attr('width', handleHeight)
        .attr('height', handleHeight)
        .call(d3.drag()
            .subject(function(d, i, nodes) {
                var handleRect = d3.select(nodes[0]);
                return {
                    x: handleRect.attr('x'),
                    y: handleRect.attr('y')
                };
            }).on('drag', function() {
               this._handleDragEventHandler()
            }.bind(this))
            .on('end', function() {
               this._handleDragEndEventHandler()
            }.bind(this))
        );
};


AnimatedDiagram.prototype._handleDragEventHandler = function() {

    this._axisHandle
        .attr('y', Math.max(Math.min(d3.event.y, this._getHandlePosition(0)), this._getHandlePosition(3)));
    this._axisHandleSurface
        .attr('y', Math.max(Math.min(d3.event.y, this._getHandlePosition(0)), this._getHandlePosition(3)));
}


AnimatedDiagram.prototype._handleDragEndEventHandler = function() {

    var y = Math.max(Math.min(d3.event.y, this._getHandlePosition(0)), this._getHandlePosition(3));

    var index = d3.range(0, 3).filter(function(d, i) {
        return y >= this._getHandlePosition(d + 1) && y <= this._getHandlePosition(d);
    }, this)[0];

    var interval = [this._getHandlePosition(index), this._getHandlePosition(index + 1)];

    var min = interval[1];
    var max = interval[0];
    var middle = min + (max - min) / 2;

    if (y > middle) {
        this._axisHandle.attr('y', max);
        this._axisHandleSurface.attr('y', max);
    } else {
        this._axisHandle.attr('y', min);
        this._axisHandleSurface.attr('y', min);
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
        // /*
        //  * Also gradually hide and then remove scroll icon.
        //  */
        // this._scrollContainer
        //     .transition()
        //     .duration(1500)
        //     .style('opacity', 0)
        //     .remove();
        /*
         * Enable painting.
         */
        this.enablePainting();
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

    const axisHeight = this._height * 0.85;
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
    this._axisHandle = this._scrollContainer
        .append('rect')
        .attr('class', 'scroll-axis-handle')
        .attr('rx', 2);
    this._axisHandleSurface = this._scrollContainer
        .append('rect')
        .attr('class', 'scroll-axis-handle-surface')
        .style('opacity', 0.5);
    /*
     * Populate chart with data.
     */
    this._update(true);
};
