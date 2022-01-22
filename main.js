const points = [];
const pointRadius = 6;
let canvas, ctx;

function onLoad() {
	canvas = document.getElementById('canvas');
	canvas.width = 800;
	canvas.height = 800;
	ctx = canvas.getContext('2d');
}

function canvasClick(event) {
	// console.log(event);

	points.push({
		x: event.layerX,
		y: event.layerY,
	});
	paint();
}

function paint() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = '#00a';
	for (const point of points) {
		ctx.beginPath();
		ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
		ctx.fill();
	}
	if (points.length > 1) {
		const m1 = matMake(points.length, points.length);
		for (let i = 0; i < m1.length; i++) {
			for (let j = 0; j < m1.length; j++) {
				m1[i][m1.length - j - 1] = Math.pow(points[i].x, j);
			}
		}
		// console.log(m1);
		const m2 = matMake(points.length, 1);
		for (let i = 0; i < m2.length; i++) {
			m2[i][0] = points[i].y;
		}
		// console.log(m2);
		const m1Inv = matInverse(m1);
		const result = matProduct(m1Inv, m2);
		// console.log(result);

		ctx.strokeStyle = '#000';
		ctx.beginPath();
		for (let x = 0; x < canvas.width; x++) {
			let y = 0;
			for (let i = 0; i < result.length; i++) {
				y += result[i] * Math.pow(x, result.length - i - 1);
			}
			if (x == 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
			// console.log(x, y);
		}
		ctx.stroke();
	}
}
