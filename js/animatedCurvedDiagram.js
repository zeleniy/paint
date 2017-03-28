/**
 * 
 */
function AnimatedCurvedDiagram() {
    /**
     * Images urls.
     * @protected
     * @member {String[]}
     */
    this._imagesLinks = [
        'img2/Diagram 1_no line.png',
        'img2/Warped diagram 1.png',
        'img2/Warped diagram 2.png',
        'img2/Warped diagram 3.png',
        'img2/Correct line 1_Warped diagram.png',
        'img2/Faded straigth diagram-01.png'
    ];
    /*
     * Call parent class constructor.
     */
    AnimatedDiagram.call(this);
}


/*
 * Inherit AnimatedDiagram class.
 */
AnimatedCurvedDiagram.prototype = Object.create(AnimatedDiagram.prototype);


/**
 * Factory method.
 * @public
 * @static
 * @returns {AnimatedCurvedDiagram}
 */
AnimatedCurvedDiagram.getInstance = function() {

    return new AnimatedCurvedDiagram();
}