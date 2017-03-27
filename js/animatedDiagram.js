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
     * Images urls.
     * @private
     * @member {String}
     */
    this._imagesLinks = [
        'img2/Diagram 1_no line.png',
        'img2/Warped diagram 1.png',
        'img2/Warped diagram 2.png',
        'img2/Warped diagram 3.png',
        'img2/Correct line 1_Warped diagram.png',
        'img2/Faded straigth diagram-01.png'
    ];
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
    this._step = 100;
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
 * @param {Object} config
 * @returns {AnimatedDiagram}
 */
AnimatedDiagram.getInstance = function(config) {

    return new AnimatedDiagram(config);
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
     * Stash reference to this object.
     */
    var self = this;
    /*
     * Set scroll event handler.
     */
    this._svg.on('wheel', function() {
        /*
         * Calculate y offset. It should be restricted between 0 and 'step * size(this._imagesLinks)'
         */
        self._yOffset = Math.min(self._step * (self._imagesLinks.length - 3), Math.max(0, self._yOffset + d3.event.deltaY));
        /*
         * Calculate images array index.
         */
        var index = Math.max(0, Math.min(self._imagesLinks.length - 3, Math.round((self._yOffset / self._step))));
        /*
         * Check local and global indexes equality.
         */
        if (self._index < index) {
            /*
             * Update global index.
             */
            self._index = index;
            /*
             * Update background image.
             */
            self._images[0].attr('xlink:href', self._imagesLinks[index]);
            if (index == self._imagesLinks.length - 3) {
                /*
                 * Gradually show original image.
                 */
                self._images[2]
                    .style('opacity', 0)
                    .attr('xlink:href', self._imagesLinks[5])
                    .transition()
                    .duration(1500)
                    .style('opacity', 1);
                /*
                 * Enable painting.
                 */
                self.enablePainting();
            }
        }
    })
};