var qr = require('qr-image');
 
// var svg_string = qr.imageSync('I love QR!', { type: 'svg' });

function qrGenerator (serial) {
	var qr_svg = qr.image(serial, { type: 'svg' });
	qr_svg.pipe(require('fs').createWriteStream(serial +'.svg'));

}

module.exports = qrGenerator;		